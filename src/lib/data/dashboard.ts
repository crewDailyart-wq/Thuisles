import "server-only";

/**
 * Alles wat het ouderdashboard laat zien.
 *
 * Uitgangspunt uit de opdracht: geen kale percentages. Een ouder moet begrijpen
 * wat er goed gaat, wat aandacht vraagt, waarom, en wat hij thuis kan doen.
 *
 * Nergens een vergelijking met andere kinderen, nergens een ranglijst, en nooit
 * een medische of diagnostische term. Waar we iets niet zeker weten, zeggen we
 * dat gewoon.
 */

import { randomUUID } from "node:crypto";
import { verbinding } from "@/lib/db/sqlite";
import { alleGeneratoren } from "@/lib/generatoren";
import type { Foutpatroon } from "@/lib/generatoren/foutpatroon";
import { haalBlokken } from "@/lib/data/methodes";
import { haalKindschool } from "@/lib/data/kindschool";
import {
  haalDomeinen,
  haalLeerdoelen,
  haalSubdomeinen,
} from "@/lib/data/structuur";
import { haalVoortgang } from "@/lib/data/voortgang";
import type { Domein, Leerdoel, MasteryStatus, Subdomein } from "@/lib/types";

type Rij = Record<string, string | number | null>;

/** Hoeveel dagen "deze week" beslaat. */
const WEEK = 7;

function sinds(dagen: number): string {
  return new Date(Date.now() - dagen * 24 * 60 * 60 * 1000).toISOString();
}

// ---------------------------------------------------------------------------
// De structuur eromheen
// ---------------------------------------------------------------------------

export type Leerdoelplek = {
  leerdoel: Leerdoel;
  subdomein: Subdomein;
  domein: Domein;
};

/** Waar hangt elk leerdoel? Eén keer opzoeken, daarna overal hergebruiken. */
export function leerdoelenVanGroep(groep: number): Leerdoelplek[] {
  const domeinen = haalDomeinen();
  const subdomeinen = haalSubdomeinen();

  return haalLeerdoelen()
    .filter((ld) => ld.groepVan <= groep && groep <= ld.groepTot)
    .map((leerdoel) => {
      const subdomein = subdomeinen.find((s) => s.id === leerdoel.subdomeinId);
      const domein = domeinen.find((d) => d.id === subdomein?.domeinId);
      return subdomein && domein ? { leerdoel, subdomein, domein } : null;
    })
    .filter((x): x is Leerdoelplek => x !== null);
}

// ---------------------------------------------------------------------------
// C2 — Sterk / Aandacht / Aanbevolen
// ---------------------------------------------------------------------------

export type Weekregel = {
  leerdoelId: string;
  titel: string;
  subdomein: string;
  domeinSlug: string;
  code: string;
  /** In gewone taal: waarom staat dit hier? */
  reden: string;
};

export type Weekstatus = {
  sterk: Weekregel[];
  aandacht: Weekregel[];
  aanbevolen: Weekregel[];
};

/**
 * De weekstatus, met een regel die in één zin uit te leggen is:
 *
 *   Sterk      — deze week geoefend, en het gaat goed (beheerst of bijna).
 *   Aandacht   — twee of meer keer dezelfde denkfout, of het kind gaf zelf aan
 *                het niet te snappen.
 *   Aanbevolen — hooguit twee korte herhalingen: eerst wat aandacht vraagt,
 *                daarna wat bijna af is.
 *
 * Er zit geen AI in en er wordt niets voorspeld.
 */
export function haalWeekstatus(kindId: string, groep: number): Weekstatus {
  const plekken = leerdoelenVanGroep(groep);
  const voortgang = new Map(haalVoortgang(kindId).map((v) => [v.leerdoelId, v]));
  const grens = sinds(WEEK);

  const sterk: Weekregel[] = [];
  const aandacht: Weekregel[] = [];

  for (const plek of plekken) {
    const v = voortgang.get(plek.leerdoel.id);
    if (!v) continue;

    const regel: Weekregel = {
      leerdoelId: plek.leerdoel.id,
      titel: plek.leerdoel.titel,
      subdomein: plek.subdomein.naam,
      domeinSlug: plek.domein.slug,
      code: plek.leerdoel.code,
      reden: "",
    };

    if (v.aandacht || v.zelfLastig) {
      aandacht.push({
        ...regel,
        reden: v.zelfLastig
          ? "Je kind gaf zelf aan dit nog niet te snappen."
          : "Dezelfde denkfout kwam meer dan eens terug.",
      });
      continue;
    }

    const dezeWeek = (v.laatstGeoefendOp ?? "") >= grens;
    if (dezeWeek && (v.status === "beheerst" || v.status === "bijna_beheerst")) {
      sterk.push({
        ...regel,
        reden:
          v.status === "beheerst"
            ? "Gaat goed, ook zonder hulp."
            : "Bijna helemaal onder de knie.",
      });
    }
  }

  /*
    Aanbevolen: hooguit twee korte herhalingen deze week. Eerst wat aandacht
    vraagt — daar helpt oefenen het meest. Blijft er ruimte over, dan wat bijna
    af is: dat is de kortste weg naar een succeservaring.
  */
  const bijnaAf = plekken
    .filter((p) => {
      const v = voortgang.get(p.leerdoel.id);
      return v?.status === "bijna_beheerst" && !v.aandacht && !v.zelfLastig;
    })
    .map((p) => ({
      leerdoelId: p.leerdoel.id,
      titel: p.leerdoel.titel,
      subdomein: p.subdomein.naam,
      domeinSlug: p.domein.slug,
      code: p.leerdoel.code,
      reden: "Bijna af — een korte herhaling maakt het rond.",
    }));

  const aanbevolen = [
    ...aandacht.map((a) => ({
      ...a,
      reden: "Een korte herhaling helpt hier het meest.",
    })),
    ...bijnaAf,
  ].slice(0, 2);

  return { sterk, aandacht, aanbevolen };
}

// ---------------------------------------------------------------------------
// C3 — Wat ging er mis
// ---------------------------------------------------------------------------

/**
 * Het foutpatroon opzoeken bij een antwoord.
 *
 * De naam van een patroon (bijvoorbeeld "telfout") komt bij meerdere soorten
 * sommen voor. Daarom wordt eerst gekeken uit welk soort som de vraag kwam;
 * pas daarbinnen wordt het patroon gezocht. Zo krijgt een ouder nooit de
 * uitleg van een ander soort som.
 */
function zoekPatroon(soort: string | null, patroonId: string): Foutpatroon | null {
  if (!soort) return null;
  const generator = alleGeneratoren.find((g) => g.id === soort);
  return generator?.foutpatronen.find((p) => p.id === patroonId) ?? null;
}

export type Foutregel = {
  antwoordId: string;
  leerdoelId: string;
  leerdoelTitel: string;
  domeinSlug: string;
  code: string;
  /** De som zoals het kind hem zag. Leeg als de vraag inmiddels weg is. */
  vraagtekst: string;
  gemaaktOp: string;
  /** Alleen gevuld als er een denkfout is herkend. */
  patroon: {
    naam: string;
    uitleg: string;
    zinnen: string[];
    schoolwoord: string;
  } | null;
};

/**
 * De sommen die het kind fout had, met de oudertekst van de herkende denkfout.
 *
 * Is er geen denkfout herkend, dan zeggen we dat gewoon. We verzinnen nooit een
 * verklaring voor iets wat we niet weten.
 */
export function haalFouten(
  kindId: string,
  groep: number,
  dagen = WEEK,
  maximaal = 10,
): Foutregel[] {
  const plekken = new Map(
    leerdoelenVanGroep(groep).map((p) => [p.leerdoel.id, p]),
  );

  const rijen = verbinding()
    .prepare(
      `select a.id, a.leerdoel_id, a.foutpatroon, a.gemaakt_op,
              v.vraagtekst, v.somgegevens
       from antwoorden a
       left join vragen v on v.id = a.vraag_id
       where a.kind_id = ? and a.goed = 0 and a.gemaakt_op >= ?
       order by a.gemaakt_op desc
       limit ?`,
    )
    .all(kindId, sinds(dagen), maximaal) as Rij[];

  return rijen
    .map((r) => {
      const plek = plekken.get(String(r.leerdoel_id));
      if (!plek) return null;

      let soort: string | null = null;
      if (r.somgegevens) {
        try {
          soort = JSON.parse(String(r.somgegevens))?.soort ?? null;
        } catch {
          soort = null;
        }
      }

      const patroon = r.foutpatroon
        ? zoekPatroon(soort, String(r.foutpatroon))
        : null;

      return {
        antwoordId: String(r.id),
        leerdoelId: plek.leerdoel.id,
        leerdoelTitel: plek.leerdoel.titel,
        domeinSlug: plek.domein.slug,
        code: plek.leerdoel.code,
        vraagtekst: r.vraagtekst ? String(r.vraagtekst) : "",
        gemaaktOp: String(r.gemaakt_op),
        patroon: patroon
          ? {
              naam: patroon.naam,
              uitleg: patroon.ouder.uitleg,
              zinnen: patroon.ouder.zinnen,
              schoolwoord: patroon.ouder.schoolwoord,
            }
          : null,
      };
    })
    .filter((x): x is Foutregel => x !== null);
}

// ---------------------------------------------------------------------------
// C6 — Signalen van je kind
// ---------------------------------------------------------------------------

export type Signaal = {
  soort: "zelf_lastig" | "comeback";
  leerdoelTitel: string;
  domeinSlug: string;
  code: string;
  gemaaktOp: string;
};

export function haalSignalen(
  kindId: string,
  groep: number,
  dagen = 30,
  maximaal = 12,
): Signaal[] {
  const plekken = new Map(
    leerdoelenVanGroep(groep).map((p) => [p.leerdoel.id, p]),
  );

  const rijen = verbinding()
    .prepare(
      `select soort, leerdoel_id, gemaakt_op from kind_signalen
       where kind_id = ? and gemaakt_op >= ?
       order by gemaakt_op desc limit ?`,
    )
    .all(kindId, sinds(dagen), maximaal) as Rij[];

  return rijen
    .map((r) => {
      const plek = plekken.get(String(r.leerdoel_id));
      if (!plek) return null;
      return {
        soort: String(r.soort) as Signaal["soort"],
        leerdoelTitel: plek.leerdoel.titel,
        domeinSlug: plek.domein.slug,
        code: plek.leerdoel.code,
        gemaaktOp: String(r.gemaakt_op),
      };
    })
    .filter((x): x is Signaal => x !== null);
}

// ---------------------------------------------------------------------------
// C7 — Oefenritme
// ---------------------------------------------------------------------------

export type Oefenritme = {
  dagenDezeWeek: number;
  minutenDezeWeek: number;
  aantalSommen: number;
  /** De laatste zeven dagen, oudste eerst. Voor een rustig staafje. */
  perDag: { datum: string; minuten: number }[];
};

/**
 * Hoe vaak en hoe lang er is geoefend.
 *
 * Bewust zonder oordeel en zonder vergelijking: er staat geen doel bij, geen
 * streak en geen "je loopt achter". Alleen wat er is gebeurd.
 */
export function haalOefenritme(kindId: string): Oefenritme {
  const rijen = verbinding()
    .prepare(
      `select substr(gemaakt_op, 1, 10) as dag,
              sum(coalesce(seconden, 0)) as seconden,
              count(*) as aantal
       from antwoorden
       where kind_id = ? and gemaakt_op >= ?
       group by dag`,
    )
    .all(kindId, sinds(WEEK)) as Rij[];

  const perDagKaart = new Map(
    rijen.map((r) => [String(r.dag), Math.round(Number(r.seconden) / 60)]),
  );

  const perDag: { datum: string; minuten: number }[] = [];
  for (let i = WEEK - 1; i >= 0; i--) {
    const datum = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    perDag.push({ datum, minuten: perDagKaart.get(datum) ?? 0 });
  }

  return {
    dagenDezeWeek: rijen.length,
    minutenDezeWeek: perDag.reduce((n, d) => n + d.minuten, 0),
    aantalSommen: rijen.reduce((n, r) => n + Number(r.aantal), 0),
    perDag,
  };
}

// ---------------------------------------------------------------------------
// C1 — De vaardigheidskaart
// ---------------------------------------------------------------------------

export type Vaardigheid = {
  leerdoelId: string;
  titel: string;
  code: string;
  domeinSlug: string;
  status: MasteryStatus;
  aandacht: boolean;
};

export type Kaartgroep = {
  /** "Blok 2 — Tafels herhalen" of "Bewerkingen". */
  titel: string;
  /** Alleen bij methodeblokken: waar de klas nu zit. */
  huidig: boolean;
  vaardigheden: Vaardigheid[];
};

export type Vaardigheidskaart = {
  /** Volgt de kaart de blokken van een methode, of de domeinen? */
  volgtMethode: boolean;
  methodenaam: string | null;
  groepen: Kaartgroep[];
};

/**
 * Alle leerdoelen van de groep van het kind, met hun stand.
 *
 * Is er een methode gekozen, dan staan ze in de volgorde van de methodeblokken
 * en is het huidige blok gemarkeerd. Zo ziet een ouder in één blik waar zijn
 * kind staat ten opzichte van wat de klas doet. Zonder methode is de indeling
 * gewoon per domein.
 */
export function haalVaardigheidskaart(
  kindId: string,
  groep: number,
): Vaardigheidskaart {
  const plekken = leerdoelenVanGroep(groep);
  const voortgang = new Map(haalVoortgang(kindId).map((v) => [v.leerdoelId, v]));

  const maak = (plek: Leerdoelplek): Vaardigheid => {
    const v = voortgang.get(plek.leerdoel.id);
    return {
      leerdoelId: plek.leerdoel.id,
      titel: plek.leerdoel.titel,
      code: plek.leerdoel.code,
      domeinSlug: plek.domein.slug,
      status: v?.status ?? "nog_niet_gestart",
      aandacht: Boolean(v?.aandacht || v?.zelfLastig),
    };
  };

  const ks = haalKindschool(kindId);

  if (ks.methode && ks.volgMethode) {
    const blokken = haalBlokken(ks.methode.id, groep);
    if (blokken.length > 0) {
      const huidigIndex = ks.huidigBlokId
        ? blokken.findIndex((b) => b.id === ks.huidigBlokId)
        : 0;
      const gebruikt = new Set<string>();

      const groepen: Kaartgroep[] = blokken.map((blok, i) => {
        const vaardigheden = blok.leerdoelIds
          .map((id) => plekken.find((p) => p.leerdoel.id === id))
          .filter((p): p is Leerdoelplek => p !== undefined)
          .map((p) => {
            gebruikt.add(p.leerdoel.id);
            return maak(p);
          });

        return {
          titel: `Blok ${blok.nummer} — ${blok.titel}`,
          huidig: i === (huidigIndex >= 0 ? huidigIndex : 0),
          vaardigheden,
        };
      });

      // Wat nergens aan een blok hangt, mag niet zomaar verdwijnen.
      const rest = plekken.filter((p) => !gebruikt.has(p.leerdoel.id)).map(maak);
      if (rest.length > 0) {
        groepen.push({
          titel: "Verder in groep " + groep,
          huidig: false,
          vaardigheden: rest,
        });
      }

      /*
        Blokken zonder gekoppelde leerdoelen blijven staan. Een ouder moet de
        hele volgorde van de klas kunnen zien, ook waar Thuisles nog niets bij
        heeft; het scherm zegt er dan gewoon bij dat er nog niets is.
      */
      return {
        volgtMethode: true,
        methodenaam: ks.methode.naam,
        groepen,
      };
    }
  }

  // Geen methode: gewoon per domein, in de vaste volgorde van de structuur.
  const perDomein = new Map<string, Kaartgroep>();
  for (const plek of plekken) {
    const bestaand = perDomein.get(plek.domein.id);
    if (bestaand) bestaand.vaardigheden.push(maak(plek));
    else
      perDomein.set(plek.domein.id, {
        titel: plek.domein.naam,
        huidig: false,
        vaardigheden: [maak(plek)],
      });
  }

  return {
    volgtMethode: false,
    methodenaam: ks.methode?.naam ?? null,
    groepen: [...perDomein.values()],
  };
}

// ---------------------------------------------------------------------------
// Oefeningen klaarzetten voor "Voor jou"
// ---------------------------------------------------------------------------

export type Klaargezet = {
  id: string;
  leerdoelId: string;
  reden: string;
  klaargezetOp: string;
};

export function zetKlaar(kindId: string, leerdoelId: string, reden: string): void {
  const db = verbinding();
  // Twee keer hetzelfde klaarzetten heeft geen zin; de laatste reden telt.
  db.prepare(
    "delete from klaargezet where kind_id = ? and leerdoel_id = ? and gedaan_op is null",
  ).run(kindId, leerdoelId);

  db.prepare(
    `insert into klaargezet (id, kind_id, leerdoel_id, reden, klaargezet_op)
     values (?, ?, ?, ?, ?)`,
  ).run(randomUUID(), kindId, leerdoelId, reden, new Date().toISOString());
}

export function haalKlaargezet(kindId: string): Klaargezet[] {
  const rijen = verbinding()
    .prepare(
      `select id, leerdoel_id, reden, klaargezet_op from klaargezet
       where kind_id = ? and gedaan_op is null
       order by klaargezet_op`,
    )
    .all(kindId) as Rij[];

  return rijen.map((r) => ({
    id: String(r.id),
    leerdoelId: String(r.leerdoel_id),
    reden: String(r.reden),
    klaargezetOp: String(r.klaargezet_op),
  }));
}

/** Het kind heeft dit gedaan; het hoeft niet meer in "Voor jou" te staan. */
export function markeerKlaargezetGedaan(kindId: string, leerdoelId: string): void {
  verbinding()
    .prepare(
      "update klaargezet set gedaan_op = ? where kind_id = ? and leerdoel_id = ? and gedaan_op is null",
    )
    .run(new Date().toISOString(), kindId, leerdoelId);
}

export function haalKlaarWeg(kindId: string, klaargezetId: string): void {
  verbinding()
    .prepare("delete from klaargezet where id = ? and kind_id = ?")
    .run(klaargezetId, kindId);
}
