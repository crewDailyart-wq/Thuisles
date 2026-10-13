/**
 * De tegelkleuren van de avontuurstijl, en welke kleur elk rekendomein krijgt.
 *
 * De kleuren zelf staan in app/avontuur.css (`--av-paars`, `--av-paars-rand`,
 * enzovoort). Geel is licht: de naam op een gele tegel krijgt een donkere rand
 * om de letters, anders is wit op geel niet te lezen.
 */

export type TegelKleur = "paars" | "roze" | "oranje" | "geel" | "groen" | "lucht";

/** Vaste kleur per domein, zodat een domein overal dezelfde kleur heeft. */
const DOMEINKLEUR: Record<string, TegelKleur> = {
  getallen: "lucht",
  splitsen: "groen",
  optellen: "paars",
  aftrekken: "roze",
  tafels: "oranje",
  delen: "geel",
  verhoudingen: "groen",
  meten: "lucht",
  tijd: "oranje",
  geld: "geel",
  meetkunde: "roze",
  "tabellen-grafieken": "paars",
  verhaaltjessommen: "geel",
};

/** Voor domeinen die hierboven (nog) niet staan: om de beurt. */
const RIJ: TegelKleur[] = ["paars", "roze", "oranje", "lucht", "groen", "geel"];

export function domeinKleur(slug: string, plek: number): TegelKleur {
  return DOMEINKLEUR[slug] ?? RIJ[plek % RIJ.length];
}

/** De kleuren voor de onderwerpen binnen een domein: om de beurt, beginnend bij die van het domein. */
export function onderwerpKleur(domeinkleur: TegelKleur, plek: number): TegelKleur {
  return RIJ[(RIJ.indexOf(domeinkleur) + plek) % RIJ.length];
}

/** Een kleine scheve hoek per plek, zoals op het startscherm. */
export function scheefVoor(plek: number): string {
  return ["-2deg", "1.5deg", "-1deg", "2deg", "-1.5deg", "1deg"][plek % 6];
}

/** De CSS-waarden voor een tegel in deze kleur. */
export function tegelKleuren(kleur: TegelKleur) {
  return {
    kleur: `var(--av-${kleur})`,
    rand: `var(--av-${kleur}-rand)`,
    licht: kleur === "geel",
  };
}
