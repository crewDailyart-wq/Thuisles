import "server-only";

/**
 * Beheer van de leerdoelstructuur: vak -> domein -> subdomein -> leerdoel.
 *
 * BELANGRIJK: dit is vanaf nu de enige bron. Zowel de beheeromgeving als de
 * kinderkant lezen hieruit. Anders zou een leerdoel dat je aanmaakt wel in het
 * beheer verschijnen, maar niet bij het kind.
 *
 * Wat hier automatisch gebeurt, zodat jij het niet hoeft te doen:
 *   - het stukje webadres (de "slug") wordt afgeleid uit de naam;
 *   - de leerdoelcode wordt opgebouwd uit vak, domein en subdomein plus een
 *     volgnummer;
 *   - de volgorde krijgt vanzelf het eerstvolgende nummer;
 *   - een naam die al bestaat binnen dezelfde plek wordt geweigerd, zodat er
 *     geen twee bijna-gelijke onderwerpen ontstaan.
 */

import { randomUUID } from "node:crypto";
import { verbinding } from "@/lib/db/sqlite";
import { begrensAantal } from "@/lib/data/instellingen";
import type { Domein, Groep, Leerdoel, PictogramNaam, Subdomein, Vak } from "@/lib/types";

// ---------------------------------------------------------------------------
// Hulpjes
// ---------------------------------------------------------------------------

/** "Optellen & aftrekken" -> "optellen-aftrekken" */
export function maakSlug(naam: string): string {
  return (
    naam
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "naamloos"
  );
}

/** Voor het vergelijken van namen: hoofdletters en spaties tellen niet mee. */
function sleutel(naam: string): string {
  return naam.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Eerste drie letters, voor in de leerdoelcode. */
function afkorting(naam: string): string {
  const letters = naam.toUpperCase().replace(/[^A-Z]/g, "");
  return (letters + "XXX").slice(0, 3);
}

function vrijeSlug(bestaande: string[], gewenst: string): string {
  if (!bestaande.includes(gewenst)) return gewenst;
  for (let n = 2; n < 200; n++) {
    if (!bestaande.includes(`${gewenst}-${n}`)) return `${gewenst}-${n}`;
  }
  return `${gewenst}-${Date.now()}`;
}

const PICTOGRAMMEN: PictogramNaam[] = [
  "vak-rekenen", "vak-taal", "vak-spelling", "vak-lezen", "vak-engels",
  "tellen", "getalbegrip", "grote-getallen", "breuken", "kommagetallen",
  "schrijven", "vergelijken", "even-oneven",
  "optellen", "aftrekken", "tafels", "vermenigvuldigen", "delen", "handig",
  "dorp", "bos", "meer", "berg", "kust", "meten", "tijd", "geld", "meetkunde",
  "grafiek", "vos",
];

export const KEUZE_PICTOGRAMMEN = PICTOGRAMMEN;

function alsPictogram(waarde: unknown, terugval: PictogramNaam): PictogramNaam {
  return PICTOGRAMMEN.includes(waarde as PictogramNaam)
    ? (waarde as PictogramNaam)
    : terugval;
}

type Rij = Record<string, string | number | null>;

// ---------------------------------------------------------------------------
// Lezen
// ---------------------------------------------------------------------------

export function haalVakken(): Vak[] {
  return (
    verbinding().prepare("select * from vakken order by volgorde, naam").all() as Rij[]
  ).map((r) => ({
    id: String(r.id),
    slug: String(r.slug),
    naam: String(r.naam),
    omschrijving: r.omschrijving ? String(r.omschrijving) : "",
    icoon: alsPictogram(r.icoon, "vak-rekenen"),
    actief: Number(r.actief) === 1,
    volgorde: Number(r.volgorde),
  }));
}

export function haalVak(slug: string): Vak | null {
  return haalVakken().find((v) => v.slug === slug) ?? null;
}

export function maakVak(invoer: {
  naam: string;
  omschrijving: string;
  icoon: string;
  actief: boolean;
}): Uitslag<Vak> {
  const naam = invoer.naam.trim();
  if (naam.length < 2) return { ok: false, fout: "Vul een naam in." };

  const bestaande = haalVakken();
  if (bestaande.some((v) => sleutel(v.naam) === sleutel(naam))) {
    return { ok: false, fout: `Er bestaat al een vak "${naam}".` };
  }

  const id = randomUUID();
  const slug = vrijeSlug(bestaande.map((v) => v.slug), maakSlug(naam));
  const volgorde =
    Math.max(0, ...bestaande.map((v) => v.volgorde)) + 1;

  verbinding()
    .prepare(
      `insert into vakken (id, slug, naam, omschrijving, icoon, actief, volgorde)
       values (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, slug, naam, invoer.omschrijving.trim(), invoer.icoon, invoer.actief ? 1 : 0, volgorde);

  return { ok: true, waarde: haalVakken().find((v) => v.id === id)! };
}

export function wijzigVak(
  id: string,
  invoer: { naam: string; omschrijving: string; icoon: string; actief: boolean },
): Uitslag<true> {
  const naam = invoer.naam.trim();
  if (naam.length < 2) return { ok: false, fout: "Vul een naam in." };

  const anderen = haalVakken().filter((v) => v.id !== id);
  if (anderen.some((v) => sleutel(v.naam) === sleutel(naam))) {
    return { ok: false, fout: `Er bestaat al een vak "${naam}".` };
  }

  verbinding()
    .prepare("update vakken set naam = ?, omschrijving = ?, icoon = ?, actief = ? where id = ?")
    .run(naam, invoer.omschrijving.trim(), invoer.icoon, invoer.actief ? 1 : 0, id);

  return { ok: true, waarde: true };
}

export function verwijderVak(id: string): Uitslag<true> {
  const domeinen = haalDomeinen(id);
  if (domeinen.length > 0) {
    return {
      ok: false,
      fout: `Dit vak heeft nog ${domeinen.length} ${domeinen.length === 1 ? "domein" : "domeinen"}. Verwijder die eerst.`,
    };
  }
  verbinding().prepare("delete from vakken where id = ?").run(id);
  return { ok: true, waarde: true };
}

// --- Opzoeken via het webadres, voor de detailschermen --------------------

export function zoekDomein(vakId: string, slug: string): Domein | null {
  return haalDomeinen(vakId).find((d) => d.slug === slug) ?? null;
}

export function zoekSubdomein(domeinId: string, slug: string): Subdomein | null {
  return haalSubdomeinen(domeinId).find((s) => s.slug === slug) ?? null;
}

export function zoekLeerdoel(id: string): Leerdoel | null {
  return haalLeerdoelen().find((l) => l.id === id) ?? null;
}

export function haalDomeinen(vakId?: string): Domein[] {
  const db = verbinding();
  const rijen = (
    vakId
      ? db.prepare("select * from domeinen where vak_id = ? order by volgorde, naam").all(vakId)
      : db.prepare("select * from domeinen order by volgorde, naam").all()
  ) as Rij[];

  return rijen.map((r) => ({
    id: String(r.id),
    vakId: String(r.vak_id),
    slug: String(r.slug),
    naam: String(r.naam),
    omschrijving: r.omschrijving ? String(r.omschrijving) : "",
    icoon: alsPictogram(r.icoon, "getalbegrip"),
    actief: Number(r.actief) === 1,
    volgorde: Number(r.volgorde),
  }));
}

export function haalSubdomeinen(domeinId?: string): Subdomein[] {
  const db = verbinding();
  const rijen = (
    domeinId
      ? db.prepare("select * from subdomeinen where domein_id = ? order by volgorde, naam").all(domeinId)
      : db.prepare("select * from subdomeinen order by volgorde, naam").all()
  ) as Rij[];

  return rijen.map((r) => ({
    id: String(r.id),
    domeinId: String(r.domein_id),
    slug: String(r.slug),
    naam: String(r.naam),
    omschrijving: r.omschrijving ? String(r.omschrijving) : "",
    icoon: alsPictogram(r.icoon, "tafels"),
    volgorde: Number(r.volgorde),
  }));
}

export function haalLeerdoelen(subdomeinId?: string): Leerdoel[] {
  const db = verbinding();
  const rijen = (
    subdomeinId
      ? db.prepare("select * from leerdoelen where subdomein_id = ? order by volgorde, titel").all(subdomeinId)
      : db.prepare("select * from leerdoelen order by volgorde, titel").all()
  ) as Rij[];

  return rijen.map((r) => ({
    id: String(r.id),
    subdomeinId: String(r.subdomein_id),
    code: String(r.code),
    titel: String(r.titel),
    groepVan: Number(r.groep_van) as Groep,
    groepTot: Number(r.groep_tot) as Groep,
    uitlegvorm: r.uitlegvorm ? (String(r.uitlegvorm) as "34" | "56" | "78") : null,
    vragenPerSessie:
      r.vragen_per_sessie === null || r.vragen_per_sessie === undefined
        ? null
        : Number(r.vragen_per_sessie),
    volgorde: Number(r.volgorde),
  }));
}

// ---------------------------------------------------------------------------
// Schrijven
// ---------------------------------------------------------------------------

export type Uitslag<T> = { ok: true; waarde: T } | { ok: false; fout: string };

function volgendeVolgorde(tabel: string, kolom: string, ouderId: string): number {
  const r = verbinding()
    .prepare(`select coalesce(max(volgorde), 0) + 1 as n from ${tabel} where ${kolom} = ?`)
    .get(ouderId) as { n: number };
  return Number(r.n);
}

// --- Domein ---------------------------------------------------------------

export function maakDomein(invoer: {
  vakId: string;
  naam: string;
  omschrijving: string;
  icoon: string;
  actief: boolean;
}): Uitslag<Domein> {
  const naam = invoer.naam.trim();
  if (naam.length < 2) return { ok: false, fout: "Vul een naam in." };

  const bestaande = haalDomeinen(invoer.vakId);
  if (bestaande.some((d) => sleutel(d.naam) === sleutel(naam))) {
    return { ok: false, fout: `Er bestaat al een domein "${naam}" binnen dit vak.` };
  }

  const id = randomUUID();
  const slug = vrijeSlug(bestaande.map((d) => d.slug), maakSlug(naam));

  verbinding()
    .prepare(
      `insert into domeinen (id, vak_id, slug, naam, omschrijving, icoon, actief, volgorde)
       values (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id, invoer.vakId, slug, naam, invoer.omschrijving.trim(),
      invoer.icoon, invoer.actief ? 1 : 0,
      volgendeVolgorde("domeinen", "vak_id", invoer.vakId),
    );

  return { ok: true, waarde: haalDomeinen(invoer.vakId).find((d) => d.id === id)! };
}

export function wijzigDomein(
  id: string,
  invoer: { naam: string; omschrijving: string; icoon: string; actief: boolean },
): Uitslag<true> {
  const naam = invoer.naam.trim();
  if (naam.length < 2) return { ok: false, fout: "Vul een naam in." };

  const db = verbinding();
  const huidig = db.prepare("select vak_id from domeinen where id = ?").get(id) as
    | { vak_id: string }
    | undefined;
  if (!huidig) return { ok: false, fout: "Dit domein bestaat niet meer." };

  const broers = haalDomeinen(String(huidig.vak_id)).filter((d) => d.id !== id);
  if (broers.some((d) => sleutel(d.naam) === sleutel(naam))) {
    return { ok: false, fout: `Er bestaat al een domein "${naam}" binnen dit vak.` };
  }

  db.prepare(
    "update domeinen set naam = ?, omschrijving = ?, icoon = ?, actief = ? where id = ?",
  ).run(naam, invoer.omschrijving.trim(), invoer.icoon, invoer.actief ? 1 : 0, id);

  return { ok: true, waarde: true };
}

export function verwijderDomein(id: string): Uitslag<true> {
  const subs = haalSubdomeinen(id);
  if (subs.length > 0) {
    return {
      ok: false,
      fout: `Dit domein heeft nog ${subs.length} ${subs.length === 1 ? "onderwerp" : "onderwerpen"}. Verwijder die eerst.`,
    };
  }
  verbinding().prepare("delete from domeinen where id = ?").run(id);
  return { ok: true, waarde: true };
}

// --- Subdomein ------------------------------------------------------------

export function maakSubdomein(invoer: {
  domeinId: string;
  naam: string;
  omschrijving: string;
  icoon: string;
}): Uitslag<Subdomein> {
  const naam = invoer.naam.trim();
  if (naam.length < 2) return { ok: false, fout: "Vul een naam in." };

  const bestaande = haalSubdomeinen(invoer.domeinId);
  if (bestaande.some((s) => sleutel(s.naam) === sleutel(naam))) {
    return { ok: false, fout: `Er bestaat al een onderwerp "${naam}" binnen dit domein.` };
  }

  const id = randomUUID();
  const slug = vrijeSlug(bestaande.map((s) => s.slug), maakSlug(naam));

  verbinding()
    .prepare(
      `insert into subdomeinen (id, domein_id, slug, naam, omschrijving, icoon, volgorde)
       values (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id, invoer.domeinId, slug, naam, invoer.omschrijving.trim(), invoer.icoon,
      volgendeVolgorde("subdomeinen", "domein_id", invoer.domeinId),
    );

  return { ok: true, waarde: haalSubdomeinen(invoer.domeinId).find((s) => s.id === id)! };
}

export function wijzigSubdomein(
  id: string,
  invoer: { naam: string; omschrijving: string; icoon: string },
): Uitslag<true> {
  const naam = invoer.naam.trim();
  if (naam.length < 2) return { ok: false, fout: "Vul een naam in." };

  const db = verbinding();
  const huidig = db.prepare("select domein_id from subdomeinen where id = ?").get(id) as
    | { domein_id: string }
    | undefined;
  if (!huidig) return { ok: false, fout: "Dit onderwerp bestaat niet meer." };

  const broers = haalSubdomeinen(String(huidig.domein_id)).filter((s) => s.id !== id);
  if (broers.some((s) => sleutel(s.naam) === sleutel(naam))) {
    return { ok: false, fout: `Er bestaat al een onderwerp "${naam}" binnen dit domein.` };
  }

  db.prepare("update subdomeinen set naam = ?, omschrijving = ?, icoon = ? where id = ?").run(
    naam, invoer.omschrijving.trim(), invoer.icoon, id,
  );
  return { ok: true, waarde: true };
}

export function verwijderSubdomein(id: string): Uitslag<true> {
  const doelen = haalLeerdoelen(id);
  if (doelen.length > 0) {
    return {
      ok: false,
      fout: `Dit onderwerp heeft nog ${doelen.length} ${doelen.length === 1 ? "leerdoel" : "leerdoelen"}. Verwijder die eerst.`,
    };
  }
  verbinding().prepare("delete from subdomeinen where id = ?").run(id);
  return { ok: true, waarde: true };
}

// --- Leerdoel -------------------------------------------------------------

/** Bouwt een code als REK-BEW-TAF-03 en zorgt dat die nog vrij is. */
function maakCode(subdomeinId: string): string {
  const db = verbinding();
  const r = db
    .prepare(
      `select v.naam as vak, d.naam as domein, s.naam as sub
       from subdomeinen s
       join domeinen d on d.id = s.domein_id
       join vakken   v on v.id = d.vak_id
       where s.id = ?`,
    )
    .get(subdomeinId) as { vak: string; domein: string; sub: string } | undefined;

  const basis = r
    ? `${afkorting(r.vak)}-${afkorting(r.domein)}-${afkorting(r.sub)}`
    : "NIEUW-NIEUW-NIEUW";

  for (let n = 1; n < 1000; n++) {
    const kandidaat = `${basis}-${String(n).padStart(2, "0")}`;
    const bezet = db.prepare("select 1 from leerdoelen where code = ?").get(kandidaat);
    if (!bezet) return kandidaat;
  }
  return `${basis}-${Date.now()}`;
}

export type NieuwLeerdoel = {
  subdomeinId: string;
  titel: string;
  groepVan: number;
  groepTot: number;
};

function controleerLeerdoel(invoer: NieuwLeerdoel, negeerId?: string): string | null {
  const titel = invoer.titel.trim();
  if (titel.length < 3) return "De titel is te kort.";

  if (
    !Number.isInteger(invoer.groepVan) || !Number.isInteger(invoer.groepTot) ||
    invoer.groepVan < 3 || invoer.groepTot > 8
  ) {
    return "De groep moet tussen 3 en 8 liggen.";
  }
  if (invoer.groepVan > invoer.groepTot) {
    return "De laagste groep mag niet hoger zijn dan de hoogste.";
  }

  const broers = haalLeerdoelen(invoer.subdomeinId).filter((l) => l.id !== negeerId);
  if (broers.some((l) => sleutel(l.titel) === sleutel(titel))) {
    return `Er bestaat al een leerdoel "${titel}" binnen dit onderwerp.`;
  }
  return null;
}

export function maakLeerdoel(invoer: NieuwLeerdoel): Uitslag<Leerdoel> {
  const fout = controleerLeerdoel(invoer);
  if (fout) return { ok: false, fout };

  const id = randomUUID();
  verbinding()
    .prepare(
      `insert into leerdoelen (id, subdomein_id, code, titel, groep_van, groep_tot, volgorde)
       values (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id, invoer.subdomeinId, maakCode(invoer.subdomeinId), invoer.titel.trim(),
      invoer.groepVan, invoer.groepTot,
      volgendeVolgorde("leerdoelen", "subdomein_id", invoer.subdomeinId),
    );

  return { ok: true, waarde: haalLeerdoelen(invoer.subdomeinId).find((l) => l.id === id)! };
}

export type RegelUitslag = { regel: string; gelukt: boolean; fout?: string; code?: string };

/**
 * Meerdere leerdoelen in één keer, uit een lijstje.
 *
 * Elke regel is één leerdoel. Achter een liggend streepje mag een groepsrange
 * staan: "Tafels van 3, 4 en 6 | 4-6". Staat die er niet, dan geldt de
 * standaardrange die erboven is ingesteld.
 *
 * Elke regel wordt apart beoordeeld: één foute regel laat de rest gewoon door.
 */
export function maakLeerdoelenUitLijst(
  subdomeinId: string,
  tekst: string,
  standaardVan: number,
  standaardTot: number,
): RegelUitslag[] {
  const regels = tekst
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r !== "" && !r.startsWith("#"));

  return regels.map((regel) => {
    const [ruweTitel, ruweRange] = regel.split("|").map((d) => d.trim());

    let van = standaardVan;
    let tot = standaardTot;

    if (ruweRange) {
      const getallen = ruweRange.match(/\d/g)?.map(Number) ?? [];
      if (getallen.length === 1) {
        van = tot = getallen[0];
      } else if (getallen.length >= 2) {
        van = getallen[0];
        tot = getallen[1];
      } else {
        return { regel, gelukt: false, fout: `"${ruweRange}" is geen groep of groepsrange.` };
      }
    }

    const uitslag = maakLeerdoel({ subdomeinId, titel: ruweTitel, groepVan: van, groepTot: tot });
    return uitslag.ok
      ? { regel, gelukt: true, code: uitslag.waarde.code }
      : { regel, gelukt: false, fout: uitslag.fout };
  });
}

/** De uitlegvorm van een leerdoel: leeg betekent "volg de groep van het kind". */
export function zetUitlegvorm(id: string, vorm: string): Uitslag<true> {
  const toegestaan = ["", "34", "56", "78"];
  if (!toegestaan.includes(vorm)) return { ok: false, fout: "Onbekende uitlegvorm." };
  verbinding().prepare("update leerdoelen set uitlegvorm = ? where id = ?").run(vorm || null, id);
  return { ok: true, waarde: true };
}

export function wijzigLeerdoel(
  id: string,
  invoer: {
    titel: string;
    groepVan: number;
    groepTot: number;
    /** Leeg of null betekent: volg de algemene standaard. */
    vragenPerSessie?: number | null;
  },
): Uitslag<true> {
  const db = verbinding();
  const huidig = db.prepare("select subdomein_id from leerdoelen where id = ?").get(id) as
    | { subdomein_id: string }
    | undefined;
  if (!huidig) return { ok: false, fout: "Dit leerdoel bestaat niet meer." };

  const fout = controleerLeerdoel(
    { subdomeinId: String(huidig.subdomein_id), ...invoer },
    id,
  );
  if (fout) return { ok: false, fout };

  db.prepare("update leerdoelen set titel = ?, groep_van = ?, groep_tot = ? where id = ?").run(
    invoer.titel.trim(), invoer.groepVan, invoer.groepTot, id,
  );

  /*
    Alleen aanraken als het veld is meegestuurd. Zo kan een scherm dat er niets
    van weet het leerdoel gewoon bijwerken zonder de instelling te wissen.
  */
  if (invoer.vragenPerSessie !== undefined) {
    const waarde =
      invoer.vragenPerSessie === null ? null : begrensAantal(invoer.vragenPerSessie);
    db.prepare("update leerdoelen set vragen_per_sessie = ? where id = ?").run(waarde, id);
  }

  return { ok: true, waarde: true };
}

export function verwijderLeerdoel(id: string): Uitslag<true> {
  const db = verbinding();
  const r = db.prepare("select count(*) as n from vragen where leerdoel_id = ?").get(id) as
    | { n: number }
    | undefined;

  if (r && Number(r.n) > 0) {
    return {
      ok: false,
      fout: `Aan dit leerdoel hangen nog ${r.n} ${Number(r.n) === 1 ? "vraag" : "vragen"}. Verwijder die eerst.`,
    };
  }
  db.prepare("delete from leerdoelen where id = ?").run(id);
  return { ok: true, waarde: true };
}

/** Een leerdoel kopiëren als startpunt voor een nieuwe. */
export function dupliceerLeerdoel(id: string): Uitslag<Leerdoel> {
  const bron = haalLeerdoelen().find((l) => l.id === id);
  if (!bron) return { ok: false, fout: "Dit leerdoel bestaat niet meer." };

  // Een oplopend achtervoegsel, zodat de kopie geen dubbele naam krijgt.
  for (let n = 2; n < 50; n++) {
    const titel = `${bron.titel} (${n})`;
    const uitslag = maakLeerdoel({
      subdomeinId: bron.subdomeinId,
      titel,
      groepVan: bron.groepVan,
      groepTot: bron.groepTot,
    });
    if (uitslag.ok) return uitslag;
  }
  return { ok: false, fout: "Kon geen vrije naam voor de kopie vinden." };
}
