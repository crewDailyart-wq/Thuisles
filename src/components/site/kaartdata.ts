/**
 * De gegevens achter de scholenkaart, gedeeld door de kleine kaart op de
 * homepagina en de grote kaart op /scholen.
 *
 * Komt uit public/scholenkaart (gemaakt door scripts/maak-scholenkaart.mjs, uit
 * open data van DUO, PDOK en CBS). Eén keer laden per bezoek.
 */

export type Uitslag = [percentageMinstens1F: number, percentageStreef: number, ongeveer: 0 | 1];

export type KaartSchool = {
  id: string;
  naam: string;
  adres: string;
  postcode: string;
  plaats: string;
  gemeente: string;
  provincie: string;
  denominatie: string;
  website: string;
  x: number;
  y: number;
  toets: string | null;
  rekenen: Uitslag | null;
  lezen: Uitslag | null;
  taalverzorging: Uitslag | null;
  /** Kleine letters zonder tekens, om in te zoeken. */
  zoek: string;
};

export type Kaartdata = {
  scholen: KaartSchool[];
  toetsen: Record<string, string>;
  landelijk: Record<"rekenen" | "lezen" | "taalverzorging", [number, number]>;
  peiljaar: number;
  provincies: { naam: string; ringen: number[][] }[];
};

/** Eén kleur per doorstroomtoets, in de kleuren van Zappie. */
export const TOETSKLEUR: Record<string, string> = {
  "0013": "#52d9ff",
  "0018": "#ffcf4d",
  "0012": "#9b7bff",
  "0014": "#4fdc9b",
  "0016": "#ff7eb6",
};
export const OVERIGE_KLEUR = "#7f9cc8";

export const kleurVan = (toets: string | null) => (toets && TOETSKLEUR[toets]) || OVERIGE_KLEUR;

/** De groepen in de legenda en de filter, in deze volgorde. */
export const TOETSGROEPEN: { sleutel: string; naam: string; codes: string[] }[] = [
  { sleutel: "iep", naam: "IEP", codes: ["0013"] },
  { sleutel: "lib", naam: "Leerling in Beeld (Cito)", codes: ["0018"] },
  { sleutel: "route8", naam: "ROUTE 8", codes: ["0012"] },
  { sleutel: "dia", naam: "DIA", codes: ["0014"] },
  { sleutel: "amn", naam: "AMN", codes: ["0016"] },
  { sleutel: "overig", naam: "Anders of onbekend", codes: ["0011", "0015", "0017", ""] },
];

export function zoekvorm(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

let laden: Promise<Kaartdata> | null = null;

export function laadKaart(): Promise<Kaartdata> {
  laden ??= (async () => {
    const [s, n] = await Promise.all([
      fetch("/scholenkaart/scholen.json").then((r) => r.json()),
      fetch("/scholenkaart/nederland.json").then((r) => r.json()),
    ]);
    const v: string[] = s.velden;
    const i = (naam: string) => v.indexOf(naam);
    const scholen: KaartSchool[] = (s.scholen as unknown[][]).map((r) => {
      const school = {
        id: r[i("id")] as string,
        naam: r[i("naam")] as string,
        adres: r[i("adres")] as string,
        postcode: r[i("postcode")] as string,
        plaats: r[i("plaats")] as string,
        gemeente: r[i("gemeente")] as string,
        provincie: r[i("provincie")] as string,
        denominatie: r[i("denominatie")] as string,
        website: r[i("website")] as string,
        x: r[i("x")] as number,
        y: r[i("y")] as number,
        toets: (r[i("toets")] as string | null) ?? null,
        rekenen: (r[i("rekenen")] as Uitslag | null) ?? null,
        lezen: (r[i("lezen")] as Uitslag | null) ?? null,
        taalverzorging: (r[i("taalverzorging")] as Uitslag | null) ?? null,
        zoek: "",
      };
      school.zoek = zoekvorm(`${school.naam} ${school.plaats} ${school.postcode} ${school.postcode.replace(" ", "")}`);
      return school;
    });
    return { scholen, toetsen: s.toetsen, landelijk: s.landelijk, peiljaar: s.peiljaar, provincies: n.provincies };
  })();
  return laden;
}

/** De grenzen van Nederland in RD-meters, met wat ruimte eromheen. */
export const NL = { minX: 0, maxX: 290000, minY: 295000, maxY: 630000 };
