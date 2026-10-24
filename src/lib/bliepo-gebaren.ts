/**
 * Welk gebaar maakt Bliepo bij deze zin? (23 oktober 2026, opdracht eigenaar:
 * handgebaren die passen bij het moment, zoals een juf.)
 *
 * Eén gedeelde plek voor opdrachten (Maatje), lessen (Lesscherm) en de
 * testknop "Test praten" op /voorbeeld-bliepo. De namen zijn de bewegingen
 * van de 3D-Bliepo (ACTIONS in lib/zappie3d/zappie.js):
 *   - vraag: open handen naar voren, hoofd licht scheef;
 *   - uitleg: naar de opdracht wijzen, of iets laten zien met zijn handen;
 *   - hint: één hand omhoog alsof hij een idee heeft;
 *   - goed: duim omhoog, in zijn handen klappen, of juichen;
 *   - fout: bemoedigend knikken met open handen, of een vuistje;
 *   - begroeting: zwaaien.
 * Er wordt afgewisseld: zinnen na elkaar krijgen bij dezelfde soort een
 * ander gebaar, en per bericht begint de rij ergens anders.
 */

export type Zinsoort = "vraag" | "uitleg" | "hint" | "goed" | "fout" | "begroeting";

const GEBAREN: Record<Zinsoort, string[]> = {
  vraag: ["ask"],
  uitleg: ["pointTask", "explain"],
  hint: ["idea"],
  goed: ["thumbsUp", "clap", "correct"],
  fout: ["encourage", "fist", "incorrect"],
  begroeting: ["wave"],
};

/**
 * Kies een passend gebaar voor deze soort zin. `sleutel` (bijvoorbeeld het
 * bericht) en `nummer` (de hoeveelste zin) maken de keus vast voor die zin,
 * en zinnen na elkaar krijgen bij dezelfde soort een ander gebaar.
 */
export function kiesGebaar(soort: Zinsoort, sleutel: string, nummer = 0): string {
  const lijst = GEBAREN[soort];
  let h = 0;
  for (let i = 0; i < sleutel.length; i++) h = (h * 31 + sleutel.charCodeAt(i)) >>> 0;
  return lijst[(h + nummer) % lijst.length];
}

/** Een vraag of een uitleg, aan de zin zelf te zien. */
export function vraagOfUitleg(zin: string): Zinsoort {
  return /\?\s*$/.test(zin.trim()) ? "vraag" : "uitleg";
}

/*
  Echte bewegingen op de woorden (24 oktober 2026, opdracht eigenaar: "niet
  willekeurig; de handen moeten passen bij wat hij zegt").

  De echte, door mensen opgenomen bewegingen (lib/zappie3d/echte-gebaren.ts)
  worden per zin gekozen op wat hij zegt, en op het woord gezet waar ze bij
  horen: bij "Kijk, hier zie je..." wijst hij op "Kijk", bij "Tel de kralen"
  telt hij op zijn vingers bij "Tel", bij "Goed zo!" duim omhoog op "Goed".
  De 3D-Bliepo zet het hoogste punt van het gebaar op dat woord (de stem
  meldt wanneer elk woord klinkt, lib/voorlezen.ts). Een gewone uitleg zonder
  zo'n woord krijgt geen los gebaar: dan lopen de praat-bewegingen door
  (handen die meepraten, zoals een juf bij uitleg).
*/

/** Een gebaar bij een woord: `woord` is het hoeveelste woord (gescheiden door spaties). */
export type Gebaarmoment = { clip: string; woord: number; soort: string };

type Regel = { soort: string; clips: string[]; woorden: RegExp; alleenEerste?: boolean };

/* Volgorde = voorrang bij twee woorden op dezelfde plek. Woorden zonder leestekens, kleine letters. */
const REGELS: Regel[] = [
  { soort: "begroeting", clips: ["zwaaien2", "zwaaien"], woorden: /^(hoi|hallo|hey|hee|welkom|doei|daag|tot ziens|tot de volgende keer|tot straks)$/ },
  { soort: "begroeting", clips: ["zwaaien2", "zwaaien"], woorden: /^dag$/, alleenEerste: true },
  { soort: "juichen", clips: ["klappen"], woorden: /^(geweldig|fantastisch|wauw|hoera|joepie|helemaal goed|allemaal goed|alles goed|wat goed)$/ },
  { soort: "goed", clips: ["duim", "knikken"], woorden: /^(goed zo|goed gedaan|knap|super|top|prima|heel goed|netjes|mooi zo|keurig)$/ },
  { soort: "ja", clips: ["knikken"], woorden: /^(ja|klopt|precies|juist|dat klopt|inderdaad)$/ },
  { soort: "troost", clips: ["geruststellen"], woorden: /^(bijna|geeft niet|niet erg|geen probleem|jammer|oeps)$/ },
  { soort: "aanmoedigen", clips: ["knikken2"], woorden: /^(probeer|probeer het|nog een keer|nog eens|jij kunt het|je kunt het|rustig aan)$/ },
  { soort: "hint", clips: ["nadenken"], woorden: /^(tip|hint|denk|bedenk|hmm|eens kijken|weet je nog|let op)$/ },
  { soort: "tellen", clips: ["tellen"], woorden: /^(tel|tellen|telt|tel maar|samen tellen|één twee|een twee)$/ },
  { soort: "wijzen", clips: ["wijzen1", "wijzen2"], woorden: /^(kijk|hier|daar|zie je|deze|op het bord|op het scherm|bovenaan|onderaan)$/ },
  { soort: "vraag", clips: ["vraag1", "vraag3", "vraag2"], woorden: /^(hoeveel|wat|welke|welk|waar|wie|hoe|waarom|kun|kan|weet|zie|wil)$/ },
];

/* Zonder trefwoord: een gebaar per soort zin (van buitenaf), op het eerste woord. */
const PER_SOORT: Record<Zinsoort, string | null> = {
  vraag: "vraag",
  uitleg: null,
  hint: "hint",
  goed: "goed",
  fout: "troost",
  begroeting: "begroeting",
};

const kaal = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Bij dezelfde soort na elkaar steeds een andere uitvoering (vast per zin, niet willekeurig). */
const vorige = new Map<string, string>();
function uitvoering(regel: Regel, zin: string) {
  if (regel.clips.length === 1) return regel.clips[0];
  let h = 0;
  for (let i = 0; i < zin.length; i++) h = (h * 31 + zin.charCodeAt(i)) >>> 0;
  let clip = regel.clips[h % regel.clips.length];
  if (vorige.get(regel.soort) === clip) clip = regel.clips[(h + 1) % regel.clips.length];
  vorige.set(regel.soort, clip);
  return clip;
}

/**
 * Welke echte bewegingen bij deze zin horen, en op welk woord.
 * `soort` (als die bekend is: goed antwoord, fout, groet...) gaat voor; een
 * vraag krijgt een vraaggebaar op het vraagwoord. Hoogstens twee gebaren per
 * zin, en alleen als er genoeg woorden tussen zitten.
 */
export function gebarenBijZin(zin: string, soort?: Zinsoort | null): Gebaarmoment[] {
  const woorden = zin.trim().split(/\s+/).filter(Boolean).map(kaal);
  const isVraag = /\?\s*$/.test(zin.trim());
  const treffers: Gebaarmoment[] = [];
  for (let i = 0; i < woorden.length; i++) {
    for (const lengte of [3, 2, 1]) {
      const stuk = woorden.slice(i, i + lengte).join(" ");
      if (!stuk) continue;
      const regel = REGELS.find((r) => r.woorden.test(stuk) && (!r.alleenEerste || i === 0) && (r.soort !== "vraag" || isVraag));
      if (regel) {
        treffers.push({ clip: "", woord: i, soort: regel.soort });
        i += lengte - 1;
        break;
      }
    }
  }
  /* De soort van buitenaf gaat voor: zit er geen passend woord in, dan op het eerste woord. */
  const gewenst = soort ? PER_SOORT[soort] : isVraag ? "vraag" : null;
  const plan: Gebaarmoment[] = [];
  const familie: Record<string, string[]> = { goed: ["goed", "juichen", "ja"], troost: ["troost", "aanmoedigen"], vraag: ["vraag"], hint: ["hint"], begroeting: ["begroeting"] };
  if (gewenst) {
    const eigen = treffers.find((t) => familie[gewenst]?.includes(t.soort));
    plan.push(eigen ?? { clip: "", woord: 0, soort: gewenst });
  }
  /* Een vraag krijgt het vraaggebaar pas als er geen wijs-, tel- of hintwoord in zit (dat zegt meer). */
  const rest = treffers.filter((t) => !plan.includes(t) && !(plan.length && t.soort === "vraag"));
  const beste = rest.find((t) => t.soort !== "vraag") ?? rest[0];
  if (beste && (!plan.length || Math.abs(beste.woord - plan[0].woord) >= 5)) plan.push(beste);
  if (plan.length === 2 && plan[0].soort === "vraag" && plan[1].soort !== "vraag") plan.shift();
  plan.sort((a, b) => a.woord - b.woord);
  return plan.slice(0, 2).map((m) => {
    const regel = REGELS.find((r) => r.soort === m.soort)!;
    return { ...m, clip: uitvoering(regel, zin) };
  });
}

/** Het gebaar dat een opdracht of les meegeeft (de oude namen uit zappie.js), terug naar de soort zin. */
export function soortVanGebaar(naam: string | undefined): Zinsoort | null {
  for (const [soort, namen] of Object.entries(GEBAREN) as [Zinsoort, string[]][]) if (namen.includes(naam ?? "")) return soort;
  if (naam === "greet") return "begroeting";
  return null;
}
