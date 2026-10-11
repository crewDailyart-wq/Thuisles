/**
 * Voorkeuren voor de uitleglessen (oktober 2026), ingesteld in de les
 * "Jouw instellingen" (naar Synthesis "Getting Started · Customizing the
 * Tutor") en "Zo werkt het".
 *
 * Alleen per apparaat bewaard, in localStorage onder één sleutel
 * (`thuisles-les-voorkeuren`). Niet in de database. Lukt lezen of schrijven
 * niet (privévenster, geblokkeerde opslag), dan gelden de standaardwaarden en
 * werkt alles gewoon door.
 *
 * - `oplichten`: de woorden lichten op terwijl de mascotte voorleest.
 * - `letters`: gewone of grote letters in de tekst van de mascotte.
 * - `uitspraak`: per naam hoe de stem die naam moet uitspreken (een
 *   schrijfwijze die de stem goed leest, bijvoorbeeld "Saara" voor "Sara").
 *   Per naam, zodat broertjes en zusjes op één apparaat elk hun eigen naam
 *   houden.
 * - `tempo`: of het kind liever snel of langzaam leert ("Zo werkt het").
 * - `keuzesVoorlezen`: of de mascotte de keuzeknoppen voorleest ("Zo werkt het").
 */

export type Lesvoorkeuren = {
  oplichten: boolean;
  letters: "gewoon" | "groot";
  uitspraak: Record<string, string>;
  tempo: "snel" | "langzaam";
  keuzesVoorlezen: boolean;
};

export const VOORKEUREN_SLEUTEL = "thuisles-les-voorkeuren";

export const STANDAARD_VOORKEUREN: Lesvoorkeuren = {
  oplichten: true,
  letters: "gewoon",
  uitspraak: {},
  tempo: "snel",
  keuzesVoorlezen: false,
};

/** Alles wat er bewaard staat, aangevuld met de standaard voor wat ontbreekt of niet klopt. */
export function leesVoorkeuren(): Lesvoorkeuren {
  try {
    const ruw = window.localStorage.getItem(VOORKEUREN_SLEUTEL);
    if (!ruw) return { ...STANDAARD_VOORKEUREN, uitspraak: {} };
    const v = JSON.parse(ruw) as Partial<Record<keyof Lesvoorkeuren, unknown>>;
    const uitspraak: Record<string, string> = {};
    if (v.uitspraak && typeof v.uitspraak === "object") {
      for (const [k, w] of Object.entries(v.uitspraak as Record<string, unknown>)) {
        if (typeof w === "string" && w.trim()) uitspraak[k] = w.trim();
      }
    }
    return {
      oplichten: typeof v.oplichten === "boolean" ? v.oplichten : STANDAARD_VOORKEUREN.oplichten,
      letters: v.letters === "groot" ? "groot" : "gewoon",
      uitspraak,
      tempo: v.tempo === "langzaam" ? "langzaam" : "snel",
      keuzesVoorlezen: typeof v.keuzesVoorlezen === "boolean" ? v.keuzesVoorlezen : STANDAARD_VOORKEUREN.keuzesVoorlezen,
    };
  } catch {
    return { ...STANDAARD_VOORKEUREN, uitspraak: {} };
  }
}

/** Een deel van de voorkeuren bewaren; de rest blijft zoals hij was. Geeft het geheel terug. */
export function bewaarVoorkeuren(deel: Partial<Lesvoorkeuren>): Lesvoorkeuren {
  const nieuw = { ...leesVoorkeuren(), ...deel };
  try {
    window.localStorage.setItem(VOORKEUREN_SLEUTEL, JSON.stringify(nieuw));
  } catch {
    /* Geen opslag: de keuze geldt dan alleen tot de pagina sluit. */
  }
  return nieuw;
}

/** Hoe de stem deze naam uitspreekt: de bewaarde schrijfwijze, of de naam zelf. */
export function uitspraakVan(naam: string, v: Lesvoorkeuren = leesVoorkeuren()): string {
  return v.uitspraak[naam] ?? naam;
}

/** De uitspraak van één naam bewaren; `null` haalt hem weg (dan leest de stem de naam gewoon). */
export function bewaarUitspraak(naam: string, uitspraak: string | null): Lesvoorkeuren {
  const nu = leesVoorkeuren();
  const lijst = { ...nu.uitspraak };
  if (uitspraak && uitspraak.trim() && uitspraak.trim() !== naam) lijst[naam] = uitspraak.trim();
  else delete lijst[naam];
  return bewaarVoorkeuren({ uitspraak: lijst });
}

/**
 * Een zin klaarmaken voor de stem: elke keer dat de naam als los woord in de
 * zin staat, komt de bewaarde uitspraak ervoor in de plaats. De tekst op het
 * scherm blijft de echte naam; dit is alleen voor wat de stem zegt.
 */
export function metUitspraak(zin: string, naam: string, v: Lesvoorkeuren = leesVoorkeuren()): string {
  const u = naam ? v.uitspraak[naam] : undefined;
  if (!u) return zin;
  const veilig = naam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return zin.replace(new RegExp(`(^|[^\\p{L}])${veilig}(?=$|[^\\p{L}])`, "gu"), (_, voor: string) => `${voor}${u}`);
}

/**
 * Een paar andere schrijfwijzen van een naam die de stem anders laat klinken,
 * om uit te kiezen als de naam niet goed klinkt. De naam zelf staat vooraan.
 */
export function uitspraakVarianten(naam: string): string[] {
  const n = naam.trim();
  if (!n) return [];
  const uit = new Set<string>([n]);
  const klein = n.toLowerCase();
  const hoofd = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  /* De eerste klinker lang: Sara → Saara, Noa → Nooa. */
  const lang = klein.replace(/^([^aeiou]*)([aeiou])(?=[^aeiou][aeiou])/, (_, v: string, k: string) => `${v}${k}${k}`);
  if (lang !== klein) uit.add(hoofd(lang));

  /* De eerste klinker kort: Sara → Sarra. */
  const kort = klein.replace(/^([^aeiou]*[aeiou])([^aeiouy])(?=[aeiou])/, (_, v: string, m: string) => `${v}${m}${m}`);
  if (kort !== klein) uit.add(hoofd(kort));

  /* Klanken die de Nederlandse stem vaak anders leest. */
  const klanken: [RegExp, string][] = [
    [/^j/, "dj"],
    [/y/g, "ie"],
    [/ch/g, "sj"],
    [/ou/g, "oe"],
    [/ee/g, "ie"],
    [/u/g, "oe"],
    [/e$/, "ee"],
    [/a$/, "ah"],
  ];
  for (const [re, door] of klanken) {
    const w = klein.replace(re, door);
    if (w !== klein) uit.add(hoofd(w));
    if (uit.size >= 5) break;
  }

  /* In stukjes: Sa-ra, langzamer gelezen. */
  const stukjes = klein.replace(/([aeiouy]+)(?=[^aeiouy][aeiouy])/g, "$1-");
  if (stukjes !== klein) uit.add(hoofd(stukjes));

  return [...uit].slice(0, 5);
}
