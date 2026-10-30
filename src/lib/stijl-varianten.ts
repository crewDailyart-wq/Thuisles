/**
 * Kant-en-klare varianten voor de lessen (30 oktober 2026, opdracht eigenaar):
 * op /admin/kies-stijl kiest Sara voor de tekst boven Bliepo per onderdeel een
 * letter (A, B, C, D). De
 * keuze is een deel van de gewone stijl (lib/stijl.ts, tabel app_instellingen,
 * sleutel "stijl"), dus er is maar één stijlsysteem. A is steeds het huidige
 * ontwerp: daarvoor komt er geen CSS op de pagina.
 *
 * Alles is CSS: de stijl komt één keer bij het openen van een pagina mee
 * (components/StijlVariabelen), er draait niets extra per vraag (regel 7).
 *
 * Gedeeld door server en browser.
 */

/* Dezelfde namen als LETTERTYPES in lib/stijl.ts (hier los, zodat de twee bestanden elkaar niet nodig hebben). */
const FAMILIES = {
  andika: "'Andika', 'Andika Fallback'",
  fredoka: "'Fredoka', 'Fredoka Fallback'",
  lexend: "'Lexend', 'Lexend Fallback'",
  atkinson: "'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible Next Fallback'",
} as const;

export type Letter = "A" | "B" | "C" | "D";
export type Variant = { naam: string; uitleg: string };

const fam = (l: keyof typeof FAMILIES) => `${FAMILIES[l]}, system-ui, sans-serif`;

/** 1. Lettertype en kleur van de tekst bij Bliepo (.bliepo-tekst). */
export const BLIEPO_TEKST: Record<Letter, Variant & { css: string }> = {
  A: { naam: "Zoals nu", uitleg: "Grandstander, wit, extra dik", css: "" },
  B: { naam: "Schoolletter", uitleg: "Andika (a en g zoals op school), wit", css: `font-family:${fam("andika")};font-weight:700;color:#fff;` },
  C: { naam: "Rond en warm", uitleg: "Fredoka, zacht crèmewit", css: `font-family:${fam("fredoka")};font-weight:600;color:#fff4d6;` },
  D: { naam: "Rustig lezen", uitleg: "Lexend, wit met een donkerblauw randje", css: `font-family:${fam("lexend")};font-weight:700;color:#fff;-webkit-text-stroke:1px rgba(8,30,90,.55);` },
};

/** 2. Hoe de tekst boven Bliepo oplicht bij voorlezen en bij aantikken (kleur en effect). */
export const OPLICHTEN: Record<Letter, Variant & { css: string }> = {
  A: { naam: "Zoals nu", uitleg: "warme oranjegele kleur met een zachte gloed", css: "" },
  B: { naam: "Groene gloed", uitleg: "lichtgroen met een gloed eromheen", css: "color:#8dffb8;text-shadow:0 0 14px rgba(120,255,180,.75),0 2px 0 rgba(0,25,90,.55);" },
  C: { naam: "Markeerstift", uitleg: "geel vlak achter het woord, donkere letters", css: "color:#10306f;background:#ffe46b;border-radius:8px;box-shadow:0 0 0 3px #ffe46b;text-shadow:none;" },
  D: { naam: "Onderstreept", uitleg: "dikke gele streep onder het woord", css: "color:#fff;text-decoration:underline;text-decoration-color:#ffd23f;text-decoration-thickness:5px;text-underline-offset:6px;" },
};

/** 3. Hoeveel tekst er tegelijk oplicht boven Bliepo terwijl hij praat. */
export const HOEVEEL: Record<"A" | "B" | "C", Variant> = {
  A: { naam: "Elk woord apart", uitleg: "het woord dat Bliepo nu zegt (zoals nu)" },
  B: { naam: "De hele zin", uitleg: "de hele zin die hij voorleest" },
  C: { naam: "Niets", uitleg: "de tekst blijft gewoon wit" },
};

export type Varianten = { bliepoTekst: Letter; oplichten: Letter; hoeveel: "A" | "B" | "C" };
export const STANDAARD_VARIANTEN: Varianten = { bliepoTekst: "A", oplichten: "A", hoeveel: "A" };

const letter = (v: unknown): Letter => (v === "B" || v === "C" || v === "D" ? v : "A");
export function maakVarianten(r: Record<string, unknown>): Varianten {
  return {
    bliepoTekst: letter(r.bliepoTekst),
    oplichten: letter(r.oplichten),
    hoeveel: r.hoeveel === "B" || r.hoeveel === "C" ? r.hoeveel : "A",
  };
}

/** De CSS van de gekozen varianten; leeg als alles A is. `waar`: de selector waarbinnen het geldt. */
export function variantCss(v: Varianten, waar: string): string {
  const uit: string[] = [];
  if (BLIEPO_TEKST[v.bliepoTekst].css) uit.push(`${waar} .bliepo-tekst{${BLIEPO_TEKST[v.bliepoTekst].css}}`);
  /* Oplichten: welk stuk (5) krijgt welke kleur en welk effect (3). */
  const effect = OPLICHTEN[v.oplichten].css || "color:var(--stijl-accent,#ffb547);text-shadow:0 0 14px color-mix(in srgb,var(--stijl-accent,#ffb547) 55%,transparent),0 2px 0 rgba(0,25,90,.55);";
  if (v.hoeveel === "C") {
    uit.push(`${waar} .bliepo-tekst .bliepo-tekst-woord{color:var(--stijl-tekst,#fff);text-shadow:inherit;background:none;text-decoration:none;opacity:1}`);
  } else if (v.hoeveel === "B") {
    uit.push(`${waar} .bliepo-tekst.bliepo-tekst-leest .bliepo-tekst-woord{${effect}}`);
    uit.push(`${waar} .bliepo-tekst.bliepo-tekst-leest .bliepo-tekst-nog [style*="color"]{opacity:1}`);
  } else if (OPLICHTEN[v.oplichten].css) {
    uit.push(`${waar} .bliepo-tekst .bliepo-tekst-nu{${effect}}`);
  }
  return uit.join("");
}
