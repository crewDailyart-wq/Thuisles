/**
 * De stijl van de nieuwe onderdelen (24 oktober 2026, stijlkiezer op
 * /admin/stijl): lettertype, kleuren en knopvorm van het gesprek met Bliepo,
 * het meelezen, de antwoordknoppen en de praatknop. De eigenaar kiest; zonder
 * keuze gelden de standaardwaarden hieronder (het goedgekeurde ontwerp).
 *
 * De keuze komt als CSS-variabelen --stijl-… op de pagina
 * (components/StijlVariabelen); de onderdelen vallen terug op dezelfde
 * standaard als een variabele ontbreekt. Gedeeld door server en browser.
 */

export const LETTERTYPES = {
  grandstander: { label: "Grandstander (speels, nu in gebruik)", css: "var(--font-grandstander), var(--font-fredoka), system-ui, sans-serif" },
  fredoka: { label: "Fredoka (rond)", css: "var(--font-fredoka), system-ui, sans-serif" },
  lexend: { label: "Lexend (rustig, goed leesbaar)", css: "var(--font-lexend), system-ui, sans-serif" },
} as const;
export type Lettertype = keyof typeof LETTERTYPES;

export const KNOPVORMEN = {
  rond: { label: "Rond", css: "999px" },
  zacht: { label: "Zacht afgerond", css: "18px" },
  hoekig: { label: "Hoekig", css: "8px" },
} as const;
export type Knopvorm = keyof typeof KNOPVORMEN;

export type Stijl = {
  lettertype: Lettertype;
  /** Tekst van Bliepo (en wat hij al gezegd heeft). */
  tekst: string;
  /** Wat hij nog niet gezegd heeft (wordt half doorzichtig getoond). */
  gedimd: string;
  /** Het woord dat hij nu zegt. */
  accent: string;
  /** Antwoordknoppen: achtergrond en tekst. */
  knop: string;
  knoptekst: string;
  knopvorm: Knopvorm;
  /** Het microfoontje op de praatknop. */
  microfoon: string;
};

export const STANDAARD_STIJL: Stijl = {
  lettertype: "grandstander",
  tekst: "#ffffff",
  gedimd: "#d6e0f2",
  accent: "#ffb547",
  knop: "#ffffff",
  knoptekst: "#0d2a6b",
  knopvorm: "rond",
  microfoon: "#1f63e0",
};

const KLEUR = /^#[0-9a-f]{6}$/i;
const kleur = (v: unknown, s: string) => (typeof v === "string" && KLEUR.test(v) ? v.toLowerCase() : s);

/** Een (bewaarde of ingestuurde) stijl, met de standaard voor alles wat ontbreekt of niet klopt. */
export function maakStijl(ruw: unknown): Stijl {
  const r = (ruw && typeof ruw === "object" ? ruw : {}) as Partial<Record<keyof Stijl, unknown>>;
  const s = STANDAARD_STIJL;
  return {
    lettertype: typeof r.lettertype === "string" && r.lettertype in LETTERTYPES ? (r.lettertype as Lettertype) : s.lettertype,
    tekst: kleur(r.tekst, s.tekst),
    gedimd: kleur(r.gedimd, s.gedimd),
    accent: kleur(r.accent, s.accent),
    knop: kleur(r.knop, s.knop),
    knoptekst: kleur(r.knoptekst, s.knoptekst),
    knopvorm: typeof r.knopvorm === "string" && r.knopvorm in KNOPVORMEN ? (r.knopvorm as Knopvorm) : s.knopvorm,
    microfoon: kleur(r.microfoon, s.microfoon),
  };
}

/** De CSS-variabelen voor deze stijl. */
export function stijlVariabelen(s: Stijl): Record<string, string> {
  return {
    "--stijl-lettertype": LETTERTYPES[s.lettertype].css,
    "--stijl-tekst": s.tekst,
    "--stijl-gedimd": `color-mix(in srgb, ${s.gedimd} 45%, transparent)`,
    "--stijl-accent": s.accent,
    "--stijl-knop": s.knop,
    "--stijl-knoptekst": s.knoptekst,
    "--stijl-knopvorm": KNOPVORMEN[s.knopvorm].css,
    "--stijl-microfoon": s.microfoon,
  };
}

/** Is dit precies de standaard? (Dan hoeft er niets op de pagina.) */
export function isStandaard(s: Stijl): boolean {
  return (Object.keys(STANDAARD_STIJL) as (keyof Stijl)[]).every((k) => s[k] === STANDAARD_STIJL[k]);
}
