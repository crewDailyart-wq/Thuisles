import "server-only";

/**
 * Wat de openbare kant van de site nodig heeft.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit los staat van `structuur.ts`
 * ---------------------------------------------------------------------------
 * De openbare pagina's zijn de enige pagina's zonder login, en ze zijn de
 * enige die een zoekmachine mag lezen. Ze hebben daarom andere vragen dan het
 * beheer: niet "welke leerdoelen horen bij dit onderwerp" maar "welke pagina
 * hoort bij dit webadres", en "welke titel staat erboven".
 *
 * Die vragen staan hier bij elkaar, zodat aan het beheer en aan de kinderkant
 * niets verandert. Wat daar werkte, blijft precies zoals het was.
 *
 * ---------------------------------------------------------------------------
 * Het adres volgt de naam
 * ---------------------------------------------------------------------------
 * Een openbaar adres wordt gemaakt uit de naam in de database: "Tafel van 3"
 * wordt `tafel-van-3`. Verandert de naam, dan verandert het adres mee — en het
 * oude adres blijft werken doordat het in `oude_adressen` wordt bewaard en
 * doorstuurt naar het nieuwe. Zie `bewaarOudAdres`.
 *
 * Let op het verschil met de slug in `structuur.ts`: die staat vast vanaf het
 * moment dat je iets aanmaakt en verandert nooit meer. Daar hangen de
 * oefenadressen aan, en die blijven dus ook precies zoals ze waren.
 */

import { verbinding } from "@/lib/db/sqlite";
import { naarAdresdeel } from "@/lib/seo";

/** De drie niveaus die een eigen openbaar adres hebben. */
export type Adressoort = "domein" | "subdomein" | "leerdoel";

type Rij = Record<string, string | number | null>;

/** Eén openbaar onderdeel: alles wat er op zo'n pagina nodig is. */
export type OpenbaarOnderdeel = {
  id: string;
  naam: string;
  /** Het stukje webadres, gemaakt uit de naam. */
  adresdeel: string;
  omschrijving: string;
  /** Wat er in de admin is ingevuld, of null. */
  seoTitel: string | null;
  seoOmschrijving: string | null;
};

/** Een oefening op de openbare kant: een leerdoel met zijn groepsbereik. */
export type OpenbareOefening = OpenbaarOnderdeel & {
  groepVan: number;
  groepTot: number;
  bolletjes: number | null;
};

function alsOnderdeel(r: Rij): OpenbaarOnderdeel {
  const naam = String(r.naam);
  return {
    id: String(r.id),
    naam,
    adresdeel: naarAdresdeel(naam),
    omschrijving: r.omschrijving ? String(r.omschrijving) : "",
    seoTitel: r.seo_titel ? String(r.seo_titel) : null,
    seoOmschrijving: r.seo_omschrijving ? String(r.seo_omschrijving) : null,
  };
}

// ---------------------------------------------------------------------------
// Groepen
// ---------------------------------------------------------------------------

/**
 * De groepen waar openbaar iets te zien is: groep 3 tot en met 8.
 *
 * Vast en niet uit de database: de Nederlandse basisschool heeft deze groepen,
 * ook als er voor een groep nog geen oefening klaarstaat. Een lege groep laat
 * gewoon zien welke domeinen er zijn en nog geen oefeningen — dat is eerlijker
 * dan een pagina die er niet is.
 */
export const OPENBARE_GROEPEN = [3, 4, 5, 6, 7, 8];

export function isOpenbareGroep(groep: number | null): groep is number {
  return groep !== null && OPENBARE_GROEPEN.includes(groep);
}

// ---------------------------------------------------------------------------
// Domeinen
// ---------------------------------------------------------------------------

/**
 * De domeinen die openbaar meedoen: alleen zichtbare domeinen van actieve
 * vakken, in de volgorde waarin ze in het beheer staan.
 */
export function haalOpenbareDomeinen(): OpenbaarOnderdeel[] {
  return (
    verbinding()
      .prepare(
        `select d.id, d.naam, d.omschrijving, d.seo_titel, d.seo_omschrijving
           from domeinen d
           join vakken v on v.id = d.vak_id
          where d.actief = 1 and v.actief = 1
          order by v.volgorde, v.naam, d.volgorde, d.naam`,
      )
      .all() as Rij[]
  ).map(alsOnderdeel);
}

/**
 * Het domein bij een stukje adres.
 *
 * Eerst op de naam van nu, en anders op een adres van eerder. Staan er twee
 * domeinen met dezelfde naam onder verschillende vakken, dan wint het vak dat
 * in het beheer vooraan staat; dat is dezelfde volgorde als op de
 * overzichtspagina, zodat de link daar altijd op de juiste pagina uitkomt.
 */
export function zoekOpenbaarDomein(adresdeel: string): OpenbaarOnderdeel | null {
  const alle = haalOpenbareDomeinen();
  const nu = alle.find((d) => d.adresdeel === adresdeel);
  if (nu) return nu;

  const eerder = zoekOudAdres("domein", adresdeel);
  return eerder ? (alle.find((d) => d.id === eerder) ?? null) : null;
}

// ---------------------------------------------------------------------------
// Onderwerpen
// ---------------------------------------------------------------------------

export function haalOpenbareOnderwerpen(domeinId: string): OpenbaarOnderdeel[] {
  return (
    verbinding()
      .prepare(
        `select id, naam, omschrijving, seo_titel, seo_omschrijving
           from subdomeinen where domein_id = ? order by volgorde, naam`,
      )
      .all(domeinId) as Rij[]
  ).map(alsOnderdeel);
}

export function zoekOpenbaarOnderwerp(
  domeinId: string,
  adresdeel: string,
): OpenbaarOnderdeel | null {
  const alle = haalOpenbareOnderwerpen(domeinId);
  const nu = alle.find((s) => s.adresdeel === adresdeel);
  if (nu) return nu;

  const eerder = zoekOudAdres("subdomein", adresdeel);
  return eerder ? (alle.find((s) => s.id === eerder) ?? null) : null;
}

// ---------------------------------------------------------------------------
// Oefeningen
// ---------------------------------------------------------------------------

/**
 * De oefeningen van een domein die bij deze groep horen.
 *
 * Een leerdoel hoort bij een bereik van groepen; het hoort dus bij elke groep
 * daarbinnen. Zo staat "Tafels van 1 tot en met 5" zowel op de pagina van
 * groep 4 als op die van groep 5, als het voor allebei bedoeld is.
 *
 * Alleen oefeningen met gepubliceerde vragen doen mee. Een pagina over een
 * oefening die nog nergens open gaat, hoort niet in Google: dan belooft het
 * zoekresultaat iets wat er nog niet is.
 */
export function haalOpenbareOefeningen(domeinId: string, groep: number): OpenbareOefening[] {
  return (
    verbinding()
      .prepare(
        `select l.id, l.titel as naam, l.groep_van, l.groep_tot, l.moeilijkheid,
                l.seo_titel, l.seo_omschrijving, s.naam as onderwerp
           from leerdoelen l
           join subdomeinen s on s.id = l.subdomein_id
          where s.domein_id = ? and l.groep_van <= ? and l.groep_tot >= ?
            and exists (
              select 1 from vragen q
               where q.leerdoel_id = l.id and q.status = 'gepubliceerd'
            )
          order by s.volgorde, s.naam, l.volgorde, l.titel`,
      )
      .all(domeinId, groep, groep) as Rij[]
  ).map((r) => ({
    ...alsOnderdeel({ ...r, omschrijving: r.onderwerp }),
    groepVan: Number(r.groep_van),
    groepTot: Number(r.groep_tot),
    bolletjes:
      r.moeilijkheid === null || r.moeilijkheid === undefined ? null : Number(r.moeilijkheid),
  }));
}

export function zoekOpenbareOefening(
  domeinId: string,
  groep: number,
  adresdeel: string,
): OpenbareOefening | null {
  const alle = haalOpenbareOefeningen(domeinId, groep);
  const nu = alle.find((l) => l.adresdeel === adresdeel);
  if (nu) return nu;

  const eerder = zoekOudAdres("leerdoel", adresdeel);
  return eerder ? (alle.find((l) => l.id === eerder) ?? null) : null;
}

// ---------------------------------------------------------------------------
// Oude adressen
// ---------------------------------------------------------------------------

/**
 * Bewaart het adres zoals het wás, zodat een oude link blijft werken.
 *
 * Wordt aangeroepen vóór een naamswijziging. Was het adres al bekend, dan
 * wordt het naar het nieuwe doel gezet: twee onderwerpen die na elkaar
 * dezelfde naam hebben gehad, sturen allebei door naar waar die naam nu zit.
 *
 * Een adres dat gelijk is aan het nieuwe adres wordt niet bewaard; dat zou een
 * pagina naar zichzelf laten doorsturen.
 */
export function bewaarOudAdres(soort: Adressoort, oudeNaam: string, nieuweNaam: string, id: string) {
  const oud = naarAdresdeel(oudeNaam);
  if (oud === naarAdresdeel(nieuweNaam)) return;

  verbinding()
    .prepare(
      `insert into oude_adressen (soort, adresdeel, doel_id, aangemaakt_op)
            values (?, ?, ?, ?)
       on conflict (soort, adresdeel) do update set doel_id = excluded.doel_id`,
    )
    .run(soort, oud, id, new Date().toISOString());
}

/** Waar een oud adres naartoe wijst, of null als het nooit bestaan heeft. */
export function zoekOudAdres(soort: Adressoort, adresdeel: string): string | null {
  const rij = verbinding()
    .prepare("select doel_id from oude_adressen where soort = ? and adresdeel = ?")
    .get(soort, adresdeel) as { doel_id: string } | undefined;
  return rij ? String(rij.doel_id) : null;
}

// ---------------------------------------------------------------------------
// De SEO-teksten in het beheer
// ---------------------------------------------------------------------------

/** In welke tabel een soort staat. Eén plek, zodat er geen naam kan afwijken. */
const TABEL: Record<Adressoort, string> = {
  domein: "domeinen",
  subdomein: "subdomeinen",
  leerdoel: "leerdoelen",
};

export type Seoteksten = { titel: string; omschrijving: string };

export function haalSeoteksten(soort: Adressoort, id: string): Seoteksten {
  const rij = verbinding()
    .prepare(`select seo_titel, seo_omschrijving from ${TABEL[soort]} where id = ?`)
    .get(id) as Rij | undefined;
  return {
    titel: rij?.seo_titel ? String(rij.seo_titel) : "",
    omschrijving: rij?.seo_omschrijving ? String(rij.seo_omschrijving) : "",
  };
}

/**
 * De twee SEO-velden opslaan.
 *
 * Leeg betekent hier "zet terug op de standaard die het systeem zelf maakt", en
 * dat is ook wat het veld in de admin erbij vertelt. Dat mag, want dit
 * formulier gaat over niets anders dan deze twee velden — er is geen ander
 * formulier dat ze meestuurt en dus ook niets dat ze per ongeluk kan wissen.
 * Zie HARDE REGEL 1 in CLAUDE.md en `bewaarSjabloon` in `sjablonen.ts` voor
 * het verschil tussen "leeg = standaard" en "leeg = niet aanraken".
 */
export function zetSeoteksten(soort: Adressoort, id: string, invoer: Seoteksten) {
  verbinding()
    .prepare(`update ${TABEL[soort]} set seo_titel = ?, seo_omschrijving = ? where id = ?`)
    .run(invoer.titel.trim() || null, invoer.omschrijving.trim() || null, id);
}
