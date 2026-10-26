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

/**
 * Een gebaar bij een woord: `woord` is het hoeveelste woord (gescheiden door
 * spaties). `tempo`: 1 = gewoon, hoger = sneller, lager = rustiger.
 */
export type Gebaarmoment = { clip: string; woord: number; soort: string; tempo?: number };

type Regel = { soort: string; clips: string[]; woorden: RegExp; alleenEerste?: boolean; tempo?: number; betekenis?: boolean };

/*
  Het gebarenwoordenboek (24 oktober 2026, uitgebreid 26 oktober 2026,
  opdracht eigenaar: "zoals een juf die met haar handen uitlegt"). Volgorde =
  voorrang bij twee woorden op dezelfde plek; langere stukken (3, 2, 1
  woorden) gaan voor. Woorden zonder leestekens, kleine letters.
  `betekenis`: het gebaar laat zien wat het woord betekent (groot, erbij,
  links...); die gaan voor een gewoon vraaggebaar.
*/
const REGELS: Regel[] = [
  /*
    Zwaaien ALLEEN precies op een groetwoord aan het begin van een begroeting
    (26 oktober 2026, opdracht eigenaar): het eerste woord van de zin.
  */
  { soort: "begroeting", clips: ["zwaaien2", "zwaaien"], woorden: /^(hoi|hallo|goedemorgen|goedemiddag|goedenavond|tot morgen|tot ziens|doei)$/, alleenEerste: true },
  /* Juichen: een duim omhoog (klappen was op het woord niet goed te zien; 26 oktober 2026). */
  { soort: "juichen", clips: ["duimop"], woorden: /^(hoera|joepie|geweldig|fantastisch)$/ },
  { soort: "goed", clips: ["duimop"], woorden: /^(goed zo|goed gedaan|knap|super|top|heel goed|mooi zo|keurig|helemaal goed|allemaal goed|alles goed|wat goed)$/ },
  { soort: "ja", clips: ["knikken"], woorden: /^(ja|klopt|precies|juist|dat klopt|inderdaad)$/ },
  { soort: "troost", clips: ["geruststellen"], woorden: /^(bijna|geeft niet|niet erg|geen probleem|jammer|oeps)$/ },
  { soort: "aanmoedigen", clips: ["knikken2"], woorden: /^(probeer|probeer het|nog een keer|nog eens|jij kunt het|je kunt het|rustig aan)$/ },
  { soort: "stop", clips: ["stop"], woorden: /^(stop|wacht|wacht even|wacht maar|even wachten|halt)$/, betekenis: true },
  { soort: "snel", clips: ["snel"], woorden: /^(snel|heel snel|supersnel|vlug|snelle|sneller)$/, tempo: 1.4, betekenis: true },
  { soort: "langzaam", clips: ["langzaam"], woorden: /^(langzaam|heel langzaam|langzamer|rustig|stap voor stap|voorzichtig)$/, tempo: 0.65, betekenis: true },
  { soort: "erbij", clips: ["erbij"], woorden: /^(erbij|plus|bij elkaar|optellen|komen erbij|komt erbij|doe erbij|toevoegen)$/, betekenis: true },
  { soort: "eraf", clips: ["eraf"], woorden: /^(eraf|min|minus|weg|aftrekken|haal weg|haal eraf|gaan eraf|gaat eraf)$/, betekenis: true },
  { soort: "meer", clips: ["meer"], woorden: /^(meer|meeste|het meest|hoger|groter dan)$/, betekenis: true },
  { soort: "minder", clips: ["minder"], woorden: /^(minder|minste|het minst|lager|kleiner dan)$/, betekenis: true },
  { soort: "groot", clips: ["groot"], woorden: /^(groot|grote|groter|grootste|heel groot|enorm|reusachtig)$/, betekenis: true },
  { soort: "klein", clips: ["klein"], woorden: /^(klein|kleine|kleiner|kleinste|heel klein|een beetje|piepklein)$/, betekenis: true },
  { soort: "samen", clips: ["samen"], woorden: /^(samen|tegelijk|allebei|met elkaar)$/, betekenis: true },
  { soort: "boven", clips: ["boven"], woorden: /^(boven|bovenaan|bovenste|daarboven|omhoog)$/, betekenis: true },
  { soort: "onder", clips: ["onder"], woorden: /^(onder|onderaan|onderste|daaronder|beneden|omlaag)$/, betekenis: true },
  { soort: "links", clips: ["links"], woorden: /^(links|naar links|linkerkant|aan de linkerkant)$/, betekenis: true },
  { soort: "rechts", clips: ["rechts"], woorden: /^(rechts|naar rechts|rechterkant|aan de rechterkant)$/, betekenis: true },
  { soort: "eerst", clips: ["eerst"], woorden: /^(eerst|als eerste|begin met)$/, betekenis: true },
  { soort: "helemaal", clips: ["helemaal"], woorden: /^(helemaal|alles|allemaal|overal|heel veel)$/, betekenis: true },
  { soort: "hint", clips: ["denken"], woorden: /^(tip|hint|bedenk|nadenken|denk na|denk eens na|hmm|eens kijken|weet je nog)$/ },
  { soort: "tellen", clips: ["tellen"], woorden: /^(tel|tellen|telt|tel maar|samen tellen|één twee|een twee)$/ },
  /*
    Wijzen met de wijsvinger naar de opdracht (26 oktober 2026, opdracht
    eigenaar: "als hij zegt klik op... of kijk hiernaar, wijst hij echt met
    zijn vinger"). Het oude wijsgebaar (wijzen1, een open hand) blijft bestaan.
  */
  { soort: "wijzen", clips: ["wijsvinger"], woorden: /^(klik|klik op|klik maar|klik dan|tik|tik op|tik maar|tik dan|druk op|kies|kies maar|sleep|kijk|kijk eens|kijk maar|kijk hier|kijk daar|kijk hiernaar|kijk daarnaar|hiernaar|daarnaar|zie je|zie je dit|op het bord|op het scherm)$/ },
  /* "Hier" en "daar" alleen vooraan ("Hier zie je..."); midden in een zin ("je leert hier...") is het geen aanwijzen. Twijfel = geen gebaar. */
  { soort: "wijzen", clips: ["wijsvinger"], woorden: /^(hier|daar)$/, alleenEerste: true },
  { soort: "vraag", clips: ["openhanden"], woorden: /^(hoeveel|wat|welke|welk|waar|wie|hoe|waarom|kun|kan|weet|zie|wil)$/ },
];

/* Getallen die hij op zijn vingers laat zien (Bliepo heeft drie vingers en een duim: tot 4). */
const GETAL: Record<string, number> = { een: 1, één: 1, twee: 2, drie: 3, vier: 4, "1": 1, "2": 2, "3": 3, "4": 4 };
/*
  Een los getal alleen als het duidelijk om een hoeveelheid gaat (twijfel =
  geen gebaar): twee tot vier als woord, met "er" ervoor ("er komen er drie
  bij", "haal er twee weg") of een ding erachter ("drie appels"). Niet bij een
  tijd ("kwart over drie", "om vier uur") of een cijfer op de klok ("op de 3").
*/
const HOEVEELHEID = /^(twee|drie|vier)$/;
const TELLEN_LOS = false;
const GEEN_DING = /^(uur|uren|minuten|over|voor|keer|en|of)$/;
function isHoeveelheid(woorden: string[], i: number) {
  if (!HOEVEELHEID.test(woorden[i])) return false;
  if (/^(over|voor|half|kwart|om|de|het)$/.test(woorden[i - 1] ?? "")) return false;
  const na = woorden[i + 1] ?? "";
  return woorden[i - 1] === "er" || (/(en|s)$/.test(na) && !GEEN_DING.test(na));
}

/* Zonder trefwoord: een gebaar per soort zin (van buitenaf), op het eerste woord. */
/*
  Sinds 26 oktober 2026 (opdracht eigenaar: "een groot gebaar alleen als een
  woord erom vraagt") komt er geen gebaar meer alleen omdat de zin een vraag,
  hint of goed antwoord is: alleen op een woord dat erbij past. De soort zin
  bepaalt nog wel welk gebaar voorgaat als er meer passen.
*/
const PER_SOORT: Record<Zinsoort, string | null> = {
  vraag: "vraag",
  uitleg: null,
  hint: "hint",
  goed: "goed",
  fout: "troost",
  begroeting: "begroeting",
};
const ZONDER_WOORD = false;

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

type Treffer = { woord: number; soort: string; clip?: string; tempo?: number; betekenis?: boolean; groep?: number };

/** Alle woorden in de zin die een gebaar hebben (nog zonder te kiezen). */
export function treffersInZin(zin: string): Treffer[] {
  const woorden = zin.trim().split(/\s+/).filter(Boolean).map(kaal);
  const isVraag = /\?\s*$/.test(zin.trim());
  const treffers: Treffer[] = [];
  let groep = 0;
  for (let i = 0; i < woorden.length; i++) {
    /* Tellen op de vingers: "een, twee, drie" (een telrij) of een losse hoeveelheid ("er komen er drie bij"). */
    const n = GETAL[woorden[i]];
    if (n) {
      const naVorige = i > 0 && GETAL[woorden[i - 1]] === n - 1;
      const inRij = naVorige || GETAL[woorden[i + 1]] === n + 1;
      /*
        Alleen in een telrij ("een, twee, drie"). Een los getal ("er komen er
        drie bij") krijgt geen vingers meer (26 oktober 2026): met drie vingers
        en een duim leek "drie" te veel op een open hand, en twijfel = geen gebaar.
      */
      if (inRij || (TELLEN_LOS && isHoeveelheid(woorden, i))) {
        if (!naVorige) groep += 1;
        treffers.push({ woord: i, soort: "vingers", clip: `vingers${n}`, betekenis: true, groep });
        continue;
      }
    }
    for (const lengte of [3, 2, 1]) {
      const stuk = woorden.slice(i, i + lengte).join(" ");
      if (!stuk) continue;
      let regel = REGELS.find((r) => r.woorden.test(stuk) && (!r.alleenEerste || i === 0) && (r.soort !== "vraag" || isVraag));
      /* "Er komen er drie bij": "bij" aan het eind van de zin is erbij. */
      if (!regel && stuk === "bij" && i === woorden.length - 1) regel = REGELS.find((r) => r.soort === "erbij");
      /* "dan" alleen na "eerst" (anders: "groter dan", "wat dan"). */
      if (!regel && /^(dan|daarna|en dan)$/.test(stuk) && treffers.some((t) => t.soort === "eerst")) {
        treffers.push({ woord: i, soort: "dan", clip: "dan", betekenis: true });
        i += lengte - 1;
        break;
      }
      /* Twijfel = geen gebaar (26 oktober 2026): "de grote wijzer" is een naam, geen grootte; "eerst" zonder "dan" erna is geen volgorde. */
      if (regel && (regel.soort === "groot" || regel.soort === "klein") && /^wijzers?$/.test(woorden[i + lengte] ?? "")) regel = undefined;
      if (regel?.soort === "eerst" && !woorden.slice(i + 1).some((w) => /^(dan|daarna)$/.test(w))) regel = undefined;
      if (regel) {
        /* "heel langzaam", "heel groot": het gebaar hoort bij het tweede woord. */
        const kern = lengte > 1 && /^heel /.test(stuk) ? i + 1 : i;
        treffers.push({ woord: kern, soort: regel.soort, tempo: regel.tempo, betekenis: regel.betekenis });
        i += lengte - 1;
        break;
      }
    }
  }
  return treffers;
}

/**
 * Welke bewegingen bij deze zin horen, en op welk woord (het gebarenwoordenboek).
 * `soort` (als die bekend is: goed antwoord, fout, groet...) gaat voor; een
 * gebaar dat laat zien wat een woord betekent (groot, erbij, links, tellen)
 * gaat voor een gewoon vraaggebaar. Hoogstens twee gebaren per zin (een telrij
 * "een, twee, drie" telt als één), met minstens twee woorden ertussen. Een
 * gewone uitleg zonder zo'n woord krijgt geen los gebaar: dan lopen de
 * rustige praatbewegingen door.
 */
export function gebarenBijZin(zin: string, soort?: Zinsoort | null): Gebaarmoment[] {
  const isVraag = /\?\s*$/.test(zin.trim());
  const treffers = treffersInZin(zin);
  const gewenst = soort ? PER_SOORT[soort] : isVraag ? "vraag" : null;
  const familie: Record<string, string[]> = { goed: ["goed", "juichen", "ja"], troost: ["troost", "aanmoedigen"], vraag: ["vraag"], hint: ["hint"], begroeting: ["begroeting"] };
  /* Groepen: een telrij is één gebaar; de rest elk apart. */
  type Keuze = { leden: Treffer[]; soort: string; woord: number; betekenis: boolean };
  const keuzes: Keuze[] = [];
  for (const t of treffers) {
    const vorigeKeuze = keuzes[keuzes.length - 1];
    if (t.groep && vorigeKeuze?.leden[0].groep === t.groep) vorigeKeuze.leden.push(t);
    else keuzes.push({ leden: [t], soort: t.soort, woord: t.woord, betekenis: Boolean(t.betekenis) });
  }
  /* Een telrij laat het tellen al zien: dan geen apart telgebaar. */
  if (keuzes.some((k) => k.soort === "vingers" && k.leden.length > 1)) keuzes.splice(0, keuzes.length, ...keuzes.filter((k) => k.soort !== "tellen"));
  const plan: Keuze[] = [];
  if (gewenst) {
    const eigen = keuzes.find((k) => familie[gewenst]?.includes(k.soort));
    /* Bij een vraag gaat een betekenisgebaar voor het vraaggebaar. */
    if (!(gewenst === "vraag" && keuzes.some((k) => k.betekenis))) {
      if (eigen) plan.push(eigen);
      else if (ZONDER_WOORD) plan.push({ leden: [{ woord: 0, soort: gewenst }], soort: gewenst, woord: 0, betekenis: false });
    }
  }
  const rest = keuzes
    .filter((k) => !plan.includes(k) && !(k.soort === "vraag" && (plan.length || keuzes.some((x) => x.betekenis))))
    /* Eerst de betekenisgebaren, dan wijzen/tellen/hint, als laatste een vraag. */
    .sort((a, b) => Number(b.betekenis) - Number(a.betekenis) || (a.soort === "vraag" ? 1 : 0) - (b.soort === "vraag" ? 1 : 0) || a.woord - b.woord);
  for (const k of rest) {
    if (plan.length >= 2) break;
    const laatsteWoord = (x: Keuze) => x.leden[x.leden.length - 1].woord;
    const ver = plan.every((p) => k.woord - laatsteWoord(p) >= 2 || p.woord - laatsteWoord(k) >= 2);
    /* Horen samen: eerst/dan, en een getal met erbij of eraf ("er komen er drie bij"). */
    const paar = (a: string, b: string) => (a === "eerst" && b === "dan") || (a === "vingers" && (b === "erbij" || b === "eraf")) || (b === "vingers" && (a === "erbij" || a === "eraf"));
    /* Twee keer hetzelfde soort gebaar in één zin is te druk. */
    if (plan.some((p) => p.soort === k.soort)) continue;
    if (ver || plan.some((p) => paar(p.soort, k.soort))) plan.push(k);
  }
  /* Zegt een ander gebaar al wat er bedoeld wordt (tellen, wijzen, meer...), dan geen vraaggebaar erbij: liever te weinig dan te druk. */
  if (plan.length === 2 && plan.some((p) => p.soort === "vraag") && plan.some((p) => p.soort !== "vraag")) plan.splice(plan.findIndex((p) => p.soort === "vraag"), 1);
  plan.sort((a, b) => a.woord - b.woord);
  return plan.flatMap((k) =>
    k.leden.map((t) => {
      const regel = REGELS.find((r) => r.soort === t.soort);
      return { clip: t.clip ?? (regel ? uitvoering(regel, zin) : ""), woord: t.woord, soort: t.soort, ...(t.tempo ? { tempo: t.tempo } : {}) };
    }),
  ).filter((m) => m.clip);
}

/** Het gebaar dat een opdracht of les meegeeft (de oude namen uit zappie.js), terug naar de soort zin. */
export function soortVanGebaar(naam: string | undefined): Zinsoort | null {
  for (const [soort, namen] of Object.entries(GEBAREN) as [Zinsoort, string[]][]) if (namen.includes(naam ?? "")) return soort;
  if (naam === "greet") return "begroeting";
  return null;
}
