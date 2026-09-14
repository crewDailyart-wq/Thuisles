import "server-only";

/**
 * Opslag van sjablonen en het omzetten van gegenereerde sommen naar vragen.
 *
 * Een gegenereerde som is een doodgewone vraag: hij komt in dezelfde tabel als
 * een handgemaakte vraag, met dezelfde velden. Het enige verschil is een
 * verwijzing naar het sjabloon waar hij uit voortkwam. De kinderkant merkt er
 * dus niets van.
 */

import { randomUUID } from "node:crypto";
import { verbinding } from "@/lib/db/sqlite";
import { zoekGenerator } from "@/lib/generatoren";
import { begrensAantal } from "@/lib/data/instellingen";
import {
  bepaalVraagtekst,
  type Gegenereerd,
  type Instellingen,
} from "@/lib/generatoren/soort";
import type { Somgegevens } from "@/lib/generatoren/foutpatroon";

export type Sjabloon = {
  id: string;
  leerdoelId: string;
  naam: string;
  soort: string;
  instellingen: Instellingen;
  hint: string;
  groep: number;
  aangemaaktOp: string;
};

export type SjabloonInContext = Sjabloon & {
  leerdoelCode: string;
  leerdoelTitel: string;
  subdomeinNaam: string;
  subdomeinSlug: string;
  domeinNaam: string;
  domeinSlug: string;
  vakSlug: string;
  /* De groepsrange van het leerdoel: waarop de beheerfilter werkt. */
  groepVan: number;
  groepTot: number;
  /**
   * Vragen per oefensessie. Staat op het LEERDOEL, niet op het sjabloon: de
   * oefensessie hoort bij het leerdoel, ook als er meerdere sjablonen onder
   * hangen. Hier meegegeven zodat je het op één plek kunt instellen.
   * `null` = volg de algemene standaard.
   */
  vragenPerSessie: number | null;
  aantalVragen: number;
  aantalConcept: number;
};

type Rij = Record<string, string | number | null>;

function naarSjabloon(r: Rij): SjabloonInContext {
  return {
    id: String(r.id),
    leerdoelId: String(r.leerdoel_id),
    naam: String(r.naam),
    soort: String(r.soort),
    instellingen: JSON.parse(String(r.instellingen)) as Instellingen,
    hint: r.hint ? String(r.hint) : "",
    groep: Number(r.groep),
    aangemaaktOp: String(r.aangemaakt_op),
    leerdoelCode: String(r.code),
    leerdoelTitel: String(r.titel),
    subdomeinNaam: String(r.subdomein_naam),
    subdomeinSlug: String(r.subdomein_slug),
    domeinNaam: String(r.domein_naam),
    domeinSlug: String(r.domein_slug),
    vakSlug: String(r.vak_slug),
    groepVan: Number(r.groep_van),
    groepTot: Number(r.groep_tot),
    vragenPerSessie:
      r.vragen_per_sessie === null || r.vragen_per_sessie === undefined
        ? null
        : Number(r.vragen_per_sessie),
    aantalVragen: Number(r.aantal ?? 0),
    aantalConcept: Number(r.concept ?? 0),
  };
}

const KETEN = `
  from sjablonen sj
  join leerdoelen  ld on ld.id = sj.leerdoel_id
  join subdomeinen s  on s.id = ld.subdomein_id
  join domeinen    d  on d.id = s.domein_id
  join vakken      v  on v.id = d.vak_id
`;

const VELDEN = `
  sj.*, ld.code, ld.titel,
  ld.groep_van, ld.groep_tot, ld.vragen_per_sessie,
  s.naam as subdomein_naam, s.slug as subdomein_slug,
  d.naam as domein_naam, d.slug as domein_slug,
  v.slug as vak_slug,
  (select count(*) from vragen q where q.sjabloon_id = sj.id) as aantal,
  (select count(*) from vragen q where q.sjabloon_id = sj.id and q.status = 'concept') as concept
`;

export function haalSjablonen(vakSlug: string): SjabloonInContext[] {
  return (
    verbinding()
      .prepare(`select ${VELDEN} ${KETEN} where v.slug = ? order by sj.aangemaakt_op desc`)
      .all(vakSlug) as Rij[]
  ).map(naarSjabloon);
}

export function haalSjabloon(id: string): SjabloonInContext | null {
  const r = verbinding()
    .prepare(`select ${VELDEN} ${KETEN} where sj.id = ?`)
    .get(id) as Rij | undefined;
  return r ? naarSjabloon(r) : null;
}

// ---------------------------------------------------------------------------
// Opslaan en verwijderen
// ---------------------------------------------------------------------------

export type Uitslag<T> = { ok: true; waarde: T } | { ok: false; fout: string };

export function bewaarSjabloon(invoer: {
  leerdoelId: string;
  naam: string;
  soort: string;
  instellingen: Instellingen;
  hint: string;
  groep: number;
}): Uitslag<string> {
  if (!zoekGenerator(invoer.soort)) {
    return { ok: false, fout: "Onbekend soort sjabloon." };
  }
  if (invoer.naam.trim().length < 2) {
    return { ok: false, fout: "Geef het sjabloon een naam." };
  }

  const db = verbinding();
  const leerdoel = db
    .prepare("select groep_van, groep_tot from leerdoelen where id = ?")
    .get(invoer.leerdoelId) as { groep_van: number; groep_tot: number } | undefined;

  if (!leerdoel) return { ok: false, fout: "Het leerdoel bestaat niet." };
  if (invoer.groep < leerdoel.groep_van || invoer.groep > leerdoel.groep_tot) {
    return {
      ok: false,
      fout: `Groep ${invoer.groep} valt buiten dit leerdoel (groep ${leerdoel.groep_van} tot en met ${leerdoel.groep_tot}).`,
    };
  }

  const id = randomUUID();
  db.prepare(
    `insert into sjablonen (id, leerdoel_id, naam, soort, instellingen, hint, groep, aangemaakt_op)
     values (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    invoer.leerdoelId,
    invoer.naam.trim(),
    invoer.soort,
    JSON.stringify(invoer.instellingen),
    invoer.hint.trim() || null,
    invoer.groep,
    new Date().toISOString(),
  );

  return { ok: true, waarde: id };
}

export function wijzigSjabloon(
  id: string,
  invoer: {
    naam: string;
    instellingen: Instellingen;
    hint: string;
    /**
     * Vragen per oefensessie. Wordt op het LEERDOEL opgeslagen, want daar
     * hoort de oefensessie bij. `null` = volg de algemene standaard;
     * `undefined` = niet aanraken.
     */
    vragenPerSessie?: number | null;
  },
): Uitslag<true> {
  if (invoer.naam.trim().length < 2) {
    return { ok: false, fout: "Geef het sjabloon een naam." };
  }

  const db = verbinding();
  db.prepare("update sjablonen set naam = ?, instellingen = ?, hint = ? where id = ?")
    .run(invoer.naam.trim(), JSON.stringify(invoer.instellingen), invoer.hint.trim() || null, id);

  if (invoer.vragenPerSessie !== undefined) {
    const waarde =
      invoer.vragenPerSessie === null ? null : begrensAantal(invoer.vragenPerSessie);
    db.prepare(
      `update leerdoelen set vragen_per_sessie = ?
       where id = (select leerdoel_id from sjablonen where id = ?)`,
    ).run(waarde, id);
  }

  return { ok: true, waarde: true };
}

/** Verwijdert het sjabloon én alle sommen die eruit zijn gekomen. */
export function verwijderSjabloon(id: string): Uitslag<number> {
  const db = verbinding();
  const r = db.prepare("select count(*) as n from vragen where sjabloon_id = ?").get(id) as
    | { n: number }
    | undefined;
  db.prepare("delete from vragen where sjabloon_id = ?").run(id);
  db.prepare("delete from sjablonen where id = ?").run(id);
  return { ok: true, waarde: Number(r?.n ?? 0) };
}

// ---------------------------------------------------------------------------
// Genereren
// ---------------------------------------------------------------------------

/** Alle handtekeningen die al bij dit leerdoel bestaan, om dubbele te weren. */
function bestaandeHandtekeningen(leerdoelId: string): Set<string> {
  const rijen = verbinding()
    .prepare("select handtekening from vragen where leerdoel_id = ? and handtekening is not null")
    .all(leerdoelId) as { handtekening: string }[];
  return new Set(rijen.map((r) => String(r.handtekening)));
}

/**
 * Laat de generator sommen maken zonder ze op te slaan.
 * Wordt gebruikt voor het voorbeeld in het beheerscherm.
 */
export function proefdraaien(
  soort: string,
  instellingen: Instellingen,
  aantal: number,
  leerdoelId?: string,
  groep = 5,
): Gegenereerd[] {
  const generator = zoekGenerator(soort);
  if (!generator) return [];
  const bezet = leerdoelId ? bestaandeHandtekeningen(leerdoelId) : new Set<string>();
  return generator.maak(instellingen, aantal, bezet, Date.now() % 100000, groep);
}

export type GenereerUitslag = {
  gemaakt: number;
  gevraagd: number;
  overgeslagen: number;
};

export function genereerUitSjabloon(sjabloonId: string, aantal: number): Uitslag<GenereerUitslag> {
  const sjabloon = haalSjabloon(sjabloonId);
  if (!sjabloon) return { ok: false, fout: "Het sjabloon bestaat niet meer." };

  const generator = zoekGenerator(sjabloon.soort);
  if (!generator) return { ok: false, fout: "Dit soort sjabloon bestaat niet meer." };

  const gevraagd = Math.max(1, Math.min(500, Math.floor(aantal)));
  const bezet = bestaandeHandtekeningen(sjabloon.leerdoelId);
  const sommen = generator.maak(sjabloon.instellingen, gevraagd, bezet, Date.now() % 1000000, sjabloon.groep);

  const db = verbinding();
  const invoegen = db.prepare(
    `insert into vragen
       (id, leerdoel_id, groep, vorm, vraagtekst, opties, antwoord, hint, afbeelding,
        status, aangemaakt_op, sjabloon_id, figuur, handtekening, somgegevens)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, 'concept', ?, ?, ?, ?, ?)`,
  );

  const nu = new Date().toISOString();
  for (const som of sommen) {
    invoegen.run(
      randomUUID(),
      sjabloon.leerdoelId,
      sjabloon.groep,
      som.vorm,
      som.vraagtekst,
      som.opties ? JSON.stringify(som.opties) : null,
      som.antwoord,
      sjabloon.hint || null,
      null,
      nu,
      sjabloon.id,
      som.figuur ? JSON.stringify(som.figuur) : null,
      som.handtekening,
      JSON.stringify(som.somgegevens),
    );
  }

  return {
    ok: true,
    waarde: {
      gemaakt: sommen.length,
      gevraagd,
      overgeslagen: gevraagd - sommen.length,
    },
  };
}

/** Alle concept-sommen van dit sjabloon in één keer publiceren. */
export function publiceerSjabloon(sjabloonId: string): Uitslag<number> {
  const db = verbinding();
  const r = db
    .prepare("select count(*) as n from vragen where sjabloon_id = ? and status = 'concept'")
    .get(sjabloonId) as { n: number } | undefined;
  db.prepare("update vragen set status = 'gepubliceerd' where sjabloon_id = ?").run(sjabloonId);
  return { ok: true, waarde: Number(r?.n ?? 0) };
}


/**
 * De vraagtekst van alle bestaande sommen van dit sjabloon opnieuw opbouwen.
 *
 * Nodig omdat de vraagtekst bij het genereren één keer wordt vastgelegd. Pas
 * je hem daarna aan in de instellingen, dan geldt dat vanzelf alleen voor
 * nieuwe sommen — dit is de knop waarmee je zegt: doe het ook bij de sommen
 * die er al staan.
 *
 * Bewust een aparte handeling en geen automatisme: er kunnen gepubliceerde
 * vragen tussen zitten die kinderen al gezien hebben, en dat verander je niet
 * ongevraagd.
 *
 * Geeft terug hoeveel vragen er echt zijn veranderd.
 */
export function werkVraagtekstenBij(sjabloonId: string): Uitslag<number> {
  const sjabloon = haalSjabloon(sjabloonId);
  if (!sjabloon) return { ok: false, fout: "Het sjabloon bestaat niet meer." };

  const generator = zoekGenerator(sjabloon.soort);
  if (!generator) return { ok: false, fout: "Dit soort sjabloon bestaat niet meer." };

  const db = verbinding();
  const rijen = db
    .prepare("select id, vraagtekst, somgegevens from vragen where sjabloon_id = ?")
    .all(sjabloonId) as { id: string; vraagtekst: string; somgegevens: string | null }[];

  const zetten = db.prepare("update vragen set vraagtekst = ? where id = ?");

  let veranderd = 0;
  for (const rij of rijen) {
    if (!rij.somgegevens) continue;

    let som: Somgegevens;
    try {
      som = JSON.parse(rij.somgegevens) as Somgegevens;
    } catch {
      continue;
    }

    const nieuw = bepaalVraagtekst(generator, sjabloon.instellingen, sjabloon.groep, som);
    if (!nieuw || nieuw === rij.vraagtekst) continue;

    zetten.run(nieuw, rij.id);
    veranderd++;
  }

  return { ok: true, waarde: veranderd };
}
