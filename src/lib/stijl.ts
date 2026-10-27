/**
 * De stijl van de hele kinderkant (stijlkiezer op /admin/stijl; 24 oktober
 * 2026, uitgebreid 26 oktober 2026 op verzoek van de eigenaar): lettertypes
 * voor titels en leestekst, lettergrootte, hoofdkleur, accentkleur, de kleur
 * bij goed en fout, de knoppen, de praatknop en de grootte van Bliepo.
 *
 * Eén bron voor alles: `stijlCss` maakt van een stijl de centrale
 * stijlvariabelen (--stijl-…) plus de paar regels die niet met één variabele
 * kunnen (knopstijl, lettertypes). Die CSS komt op elke pagina van de
 * kinderkant (components/StijlVariabelen) en in het voorbeeld van de
 * stijlkiezer. Bij de standaardstijl komt er niets op de pagina: elk onderdeel
 * valt dan terug op zijn eigen standaard, het goedgekeurde ontwerp.
 *
 * Gedeeld door server en browser.
 */

/**
 * De lettertypes. `familie` is de naam waaronder next/font het lettertype
 * laadt (lib/lettertypen-kind.ts). `school`: de a en de g hebben de
 * schoolvorm (de ronde a en de g met open staart), zoals kinderen ze leren
 * schrijven; per lettertype nagekeken op 26 oktober 2026.
 */
export const LETTERTYPES = {
  grandstander: { naam: "Grandstander", familie: "'Grandstander', 'Grandstander Fallback'", school: false, uitleg: "speels, nu in gebruik voor titels" },
  fredoka: { naam: "Fredoka", familie: "'Fredoka', 'Fredoka Fallback'", school: true, uitleg: "rond en vriendelijk" },
  lexend: { naam: "Lexend", familie: "'Lexend', 'Lexend Fallback'", school: false, uitleg: "rustig, gemaakt om vlot te lezen; nu in gebruik voor tekst" },
  andika: { naam: "Andika", familie: "'Andika', 'Andika Fallback'", school: true, uitleg: "gemaakt voor kinderen die leren lezen" },
  playpen: { naam: "Playpen Sans", familie: "'Playpen Sans', 'Playpen Sans Fallback'", school: true, uitleg: "zoals met de hand geschreven" },
  quicksand: { naam: "Quicksand", familie: "'Quicksand', 'Quicksand Fallback'", school: true, uitleg: "licht en rond" },
  comic: { naam: "Comic Neue", familie: "'Comic Neue', 'Comic Neue Fallback'", school: true, uitleg: "stripletter, net als Comic Sans" },
  sourgummy: { naam: "Sour Gummy", familie: "'Sour Gummy', 'Sour Gummy Fallback'", school: true, uitleg: "dik en zacht" },
  mali: { naam: "Mali", familie: "'Mali', 'Mali Fallback'", school: true, uitleg: "handschrift van een kind" },
  nunito: { naam: "Nunito", familie: "'Nunito', 'Nunito Fallback'", school: false, uitleg: "rond en duidelijk" },
  baloo: { naam: "Baloo 2", familie: "'Baloo 2', 'Baloo 2 Fallback'", school: false, uitleg: "vrolijk en stevig" },
  atkinson: { naam: "Atkinson Hyperlegible", familie: "'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible Next Fallback'", school: false, uitleg: "extra duidelijk, ook bij slecht zien" },
} as const;
export type Lettertype = keyof typeof LETTERTYPES;

/** Het label in de keuzelijst, met "schoolletter a en g" waar dat klopt. */
export function letterLabel(l: Lettertype): string {
  const t = LETTERTYPES[l];
  return `${t.naam}${t.school ? " · schoolletter a en g" : ""}`;
}

export const GROOTTES = {
  klein: { label: "Klein", factor: 0.9 },
  normaal: { label: "Normaal", factor: 1 },
  groot: { label: "Groot", factor: 1.12 },
  extra: { label: "Extra groot", factor: 1.25 },
} as const;
export type Grootte = keyof typeof GROOTTES;

export const KNOPVORMEN = {
  rond: { label: "Rond", css: "999px" },
  zacht: { label: "Zacht afgerond", css: "18px" },
  hoekig: { label: "Hoekig", css: "8px" },
} as const;
export type Knopvorm = keyof typeof KNOPVORMEN;

export const KNOPSTIJLEN = {
  "3d": { label: "3D-schaduw", uitleg: "vol, met een stevige schaduw eronder (nu in gebruik)" },
  vol: { label: "Vol", uitleg: "één vlakke kleur, zonder schaduw" },
  rand: { label: "Rand", uitleg: "alleen een gekleurde rand" },
  glas: { label: "Glas", uitleg: "licht doorzichtig, zoals het bord" },
} as const;
export type Knopstijl = keyof typeof KNOPSTIJLEN;

export const PRAATKNOPPEN = {
  wit: { label: "Wit met microfoon", uitleg: "rustig, de microfoon in de kleur hieronder (nu in gebruik)" },
  hoofdkleur: { label: "In de hoofdkleur", uitleg: "gekleurd, met een witte microfoon" },
  accent: { label: "In de accentkleur", uitleg: "valt meer op" },
  glas: { label: "Glas", uitleg: "licht doorzichtig met een witte rand" },
} as const;
export type Praatknop = keyof typeof PRAATKNOPPEN;

export const BLIEPO_MATEN = {
  klein: { label: "Klein", factor: 0.85 },
  normaal: { label: "Normaal", factor: 1 },
  groot: { label: "Groot", factor: 1.15 },
} as const;
export type BliepoMaat = keyof typeof BLIEPO_MATEN;

/** "Aantal zinnen zichtbaar" boven Bliepo (26 oktober 2026): 1 tot 6. */
export const ZINNEN = { "1": { label: "1" }, "2": { label: "2" }, "3": { label: "3" }, "4": { label: "4" }, "5": { label: "5" }, "6": { label: "6" } } as const;
export const STANDAARD_ZINNEN = 3;

export type Stijl = {
  /** Titels, koppen en knoppen. */
  titelLetter: Lettertype;
  /** Leestekst: wat Bliepo zegt en de gewone tekst. "standaard" = zoals nu (Lexend, Bliepo in het titellettertype). */
  leesLetter: Lettertype | "standaard";
  grootte: Grootte;
  /** De hoofdkleur: bovenbalk, achtergrond van de ruimte en het profielscherm. */
  hoofd: string;
  /** De accentkleur: knop Controleer, het woord van nu, de grote startknop. */
  accent: string;
  goed: string;
  fout: string;
  /** Tekst van Bliepo (en wat hij al gezegd heeft). */
  tekst: string;
  /** Wat hij nog niet gezegd heeft (wordt half doorzichtig getoond). */
  gedimd: string;
  /** Antwoordknoppen: achtergrond en tekst. */
  knop: string;
  knoptekst: string;
  knopvorm: Knopvorm;
  knopstijl: Knopstijl;
  praatknop: Praatknop;
  /** Het microfoontje op de witte praatknop. */
  microfoon: string;
  bliepo: BliepoMaat;
  /** Hoeveel zinnen van Bliepo er onder elkaar te zien zijn (1 tot 6). */
  zinnen: number;
  /**
   * Hoe sterk de gloed rond de hologrammen in de lessen is (27 oktober 2026,
   * opdracht eigenaar: subtiel; ONTWERPREGELS.md "Gloed"). 0 = geen gloed,
   * 1 = de sterke gloed van de eerste voorbeeldles. Standaard 0,5: een zacht,
   * smal randje licht. Later in de stijlkiezer aan te passen; de lessen lezen
   * hem uit de variabele --stijl-gloed (lib/phaser/gloed.ts).
   */
  gloed: number;
};

export const STANDAARD_STIJL: Stijl = {
  titelLetter: "grandstander",
  leesLetter: "standaard",
  grootte: "normaal",
  hoofd: "#1f56e8",
  accent: "#ffb21e",
  goed: "#6dffa8",
  fout: "#ffb36b",
  tekst: "#ffffff",
  gedimd: "#d6e0f2",
  knop: "#ffffff",
  knoptekst: "#0d2a6b",
  knopvorm: "rond",
  knopstijl: "3d",
  praatknop: "wit",
  microfoon: "#1f63e0",
  bliepo: "normaal",
  zinnen: STANDAARD_ZINNEN,
  gloed: 0.5,
};

const KLEUR = /^#[0-9a-f]{6}$/i;
const kleur = (v: unknown, s: string) => (typeof v === "string" && KLEUR.test(v) ? v.toLowerCase() : s);
const uit = <T extends string>(v: unknown, lijst: Record<string, unknown>, s: T): T => (typeof v === "string" && v in lijst ? (v as T) : s);

/** Een (bewaarde of ingestuurde) stijl, met de standaard voor alles wat ontbreekt of niet klopt. */
export function maakStijl(ruw: unknown): Stijl {
  const r = (ruw && typeof ruw === "object" ? ruw : {}) as Record<string, unknown>;
  const s = STANDAARD_STIJL;
  /* De eerste versie (24 okt) had één "lettertype": dat was het lettertype van Bliepo's tekst, nu de leestekst. */
  const oudLees = typeof r.lettertype === "string" && r.lettertype !== "grandstander" ? r.lettertype : undefined;
  return {
    titelLetter: uit(r.titelLetter, LETTERTYPES, s.titelLetter),
    leesLetter: r.leesLetter === "standaard" ? "standaard" : uit<Lettertype | "standaard">(r.leesLetter ?? oudLees, LETTERTYPES, s.leesLetter),
    grootte: uit(r.grootte, GROOTTES, s.grootte),
    hoofd: kleur(r.hoofd, s.hoofd),
    /* De eerste versie had als accent #ffb547 (alleen het woord van nu); dat telt als de standaard. */
    accent: r.accent === "#ffb547" ? s.accent : kleur(r.accent, s.accent),
    goed: kleur(r.goed, s.goed),
    fout: kleur(r.fout, s.fout),
    tekst: kleur(r.tekst, s.tekst),
    gedimd: kleur(r.gedimd, s.gedimd),
    knop: kleur(r.knop, s.knop),
    knoptekst: kleur(r.knoptekst, s.knoptekst),
    knopvorm: uit(r.knopvorm, KNOPVORMEN, s.knopvorm),
    knopstijl: uit(r.knopstijl, KNOPSTIJLEN, s.knopstijl),
    praatknop: uit(r.praatknop, PRAATKNOPPEN, s.praatknop),
    microfoon: kleur(r.microfoon, s.microfoon),
    bliepo: uit(r.bliepo, BLIEPO_MATEN, s.bliepo),
    zinnen: typeof r.zinnen === "number" && Number.isInteger(r.zinnen) && r.zinnen >= 1 && r.zinnen <= 6 ? r.zinnen : s.zinnen,
    gloed: typeof r.gloed === "number" && r.gloed >= 0 && r.gloed <= 1 ? Math.round(r.gloed * 100) / 100 : s.gloed,
  };
}

/** Is dit precies de standaard? (Dan hoeft er niets op de pagina.) */
export function isStandaard(s: Stijl): boolean {
  return (Object.keys(STANDAARD_STIJL) as (keyof Stijl)[]).every((k) => s[k] === STANDAARD_STIJL[k]);
}

export function zelfdeStijl(a: Stijl, b: Stijl): boolean {
  return (Object.keys(STANDAARD_STIJL) as (keyof Stijl)[]).every((k) => a[k] === b[k]);
}

const familie = (l: Lettertype) => `${LETTERTYPES[l].familie}, system-ui, sans-serif`;
const donkerder = (k: string, pct: number) => `color-mix(in srgb, ${k} ${100 - pct}%, #000)`;

/**
 * De knoppen van de kinderkant die de knopstijl volgen. Elk zet zelf
 * --k-vul (de kleur van de knop) en --k-tekst; de knopstijl bepaalt wat
 * daarmee gebeurt.
 */
const KNOPPEN = [
  ".gs-knop",
  ".opdracht-nieuw [data-controleer]:not(:disabled)",
  ".zp-knop:not(.zp-knop-glas)",
  ".zp-wie-verder",
  ".zp-vk-start",
  ".kind-knop",
].join(", ");

/**
 * Alleen wat afwijkt van de standaard. `waar` is de selector waar de
 * variabelen op komen: `html:root` op de pagina's (sterker dan de klassen van
 * next/font op <html>, zodat ook de lettertypes zelf om te zetten zijn).
 */
export function stijlVariabelen(s: Stijl): Record<string, string> {
  const d = STANDAARD_STIJL;
  const v: Record<string, string> = {};
  if (s.titelLetter !== d.titelLetter) {
    /* Alle titels en knoppen van de kinderkant gebruiken --font-grandstander met --font-fredoka als reserve. */
    v["--font-grandstander"] = LETTERTYPES[s.titelLetter].familie;
    v["--font-fredoka"] = LETTERTYPES[s.titelLetter].familie;
    v["--stijl-titel"] = familie(s.titelLetter);
  }
  if (s.leesLetter !== "standaard") {
    /* De gewone tekst gebruikt --font-lexend; Bliepo's tekst en het gesprek --stijl-lettertype. */
    v["--font-lexend"] = LETTERTYPES[s.leesLetter].familie;
    v["--stijl-lettertype"] = familie(s.leesLetter);
  }
  if (s.grootte !== d.grootte) v["--stijl-schaal"] = String(GROOTTES[s.grootte].factor);
  if (s.gloed !== d.gloed) v["--stijl-gloed"] = String(s.gloed);
  if (s.hoofd !== d.hoofd) {
    v["--stijl-hoofd"] = s.hoofd;
    v["--stijl-hoofd-licht"] = `color-mix(in srgb, ${s.hoofd} 70%, #fff)`;
    v["--stijl-hoofd-midden"] = donkerder(s.hoofd, 12);
    v["--stijl-hoofd-onder"] = donkerder(s.hoofd, 24);
    v["--stijl-hoofd-diep"] = donkerder(s.hoofd, 45);
  }
  if (s.accent !== d.accent) {
    v["--stijl-accent"] = s.accent;
    v["--stijl-accent-licht"] = `color-mix(in srgb, ${s.accent} 80%, #fff)`;
    v["--stijl-accent-diep"] = donkerder(s.accent, 25);
    v["--stijl-accent-verloop"] = `linear-gradient(180deg, color-mix(in srgb, ${s.accent} 60%, #fff) 0%, ${s.accent} 45%, ${donkerder(s.accent, 8)} 100%)`;
    /* De oudere schermen (Tailwind): oranje knoppen en accenten. */
    v["--color-huisstijl"] = s.accent;
    v["--color-huisstijl-diep"] = donkerder(s.accent, 25);
    v["--color-huisstijl-donker"] = donkerder(s.accent, 40);
    v["--color-oranje"] = s.accent;
    v["--color-oranje-diep"] = donkerder(s.accent, 20);
  }
  if (s.goed !== d.goed) {
    v["--stijl-goed"] = s.goed;
    v["--color-groen"] = s.goed;
  }
  if (s.fout !== d.fout) {
    v["--stijl-fout"] = s.fout;
    v["--color-fout"] = s.fout;
  }
  if (s.tekst !== d.tekst) v["--stijl-tekst"] = s.tekst;
  if (s.gedimd !== d.gedimd) v["--stijl-gedimd"] = `color-mix(in srgb, ${s.gedimd} 45%, transparent)`;
  if (s.knop !== d.knop) v["--stijl-knop"] = s.knop;
  if (s.knoptekst !== d.knoptekst) v["--stijl-knoptekst"] = s.knoptekst;
  if (s.knopvorm !== d.knopvorm) v["--stijl-knopvorm"] = KNOPVORMEN[s.knopvorm].css;
  if (s.microfoon !== d.microfoon) v["--stijl-microfoon"] = s.microfoon;
  if (s.bliepo !== d.bliepo) v["--stijl-bliepo"] = String(BLIEPO_MATEN[s.bliepo].factor);
  return v;
}

/** De regels voor de knopstijl (die kunnen niet met één variabele). */
function knopRegels(s: Stijl, waar: string): string {
  const k = `${waar} :is(${KNOPPEN})`;
  switch (s.knopstijl) {
    case "vol":
      return `${k}{background:var(--k-vul);color:var(--k-tekst);border:0;box-shadow:none}`;
    case "rand":
      return `${k}{background:transparent;color:var(--k-vul);border:3px solid var(--k-vul);box-shadow:none;text-shadow:0 1px 4px rgba(0,20,80,.45)}`;
    case "glas":
      return `${k}{background:color-mix(in srgb,var(--k-vul) 22%,transparent);color:#fff;border:2px solid color-mix(in srgb,var(--k-vul) 70%,transparent);box-shadow:0 0 18px rgba(90,190,255,.3);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);text-shadow:0 1px 4px rgba(0,20,80,.5)}`;
    default:
      return "";
  }
}

function praatRegels(s: Stijl, waar: string): string {
  const p = `${waar} .gs-praatknop`;
  switch (s.praatknop) {
    case "hoofdkleur":
      return `${p}{background:var(--stijl-hoofd,#1f56e8);color:#fff}`;
    case "accent":
      return `${p}{background:var(--stijl-accent,#ffb21e);color:#10306f}`;
    case "glas":
      return `${p}{background:rgba(255,255,255,.16);color:#fff;border:2px solid rgba(255,255,255,.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}`;
    default:
      return "";
  }
}

/** Het aantal zinnen boven Bliepo (de standaard, 3, staat in opdracht-nieuw.css). */
function zinRegels(s: Stijl, waar: string): string {
  if (s.zinnen === STANDAARD_ZINNEN) return "";
  const z = `${waar} .bliepo-zinnen > .bliepo-zin`;
  return `${z}{display:block}${z}:nth-last-child(n + ${s.zinnen + 1}){display:none}`;
}

/** De hele CSS voor deze stijl; leeg bij de standaard. */
export function stijlCss(s: Stijl, waar = "html:root"): string {
  const v = Object.entries(stijlVariabelen(s))
    .map(([k, w]) => `${k}:${w};`)
    .join("");
  const schaal = s.grootte !== STANDAARD_STIJL.grootte ? `font-size:${GROOTTES[s.grootte].factor * 100}%;` : "";
  return [v || schaal ? `${waar}{${v}${schaal}}` : "", knopRegels(s, waar), praatRegels(s, waar), zinRegels(s, waar)].join("");
}
