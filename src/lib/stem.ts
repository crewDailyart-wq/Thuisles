/**
 * De stem van Vos.
 *
 * Eén plek voor alles wat met praten te maken heeft. De rest van de app roept
 * alleen `zeg()` aan en weet niet wáár het geluid vandaan komt.
 *
 * Nu: de stem die in de browser zit (gratis, werkt overal, geen verbinding
 * nodig). Van de beschikbare Nederlandse stemmen wordt automatisch de beste
 * vrouwelijke gekozen — mannelijke en vlakke stemmen worden vermeden. Heeft
 * het apparaat geen Nederlandse stem, dan praat er niemand en staat alleen het
 * tekstwolkje in beeld (keuze van de eigenaar: geen betaalde stemdienst).
 *
 * Later: een echte stemdienst met een vrolijke kinderstem. Die schakelaar
 * staat hieronder al klaar (`BRON`). De opzet is dan: elke unieke zin wordt
 * één keer op de server gemaakt en bewaard, en het apparaat van het kind haalt
 * alleen dat bewaarde geluid op. Zo praat het kind nooit rechtstreeks met die
 * dienst en betalen we per zin maar één keer.
 */

import { koppelBliepoGeluid } from "@/lib/bliepo-geluid";

// ---------------------------------------------------------------------------
// Welke bron gebruiken we?
// ---------------------------------------------------------------------------

type Bron = "browser" | "server";

/*
  Sinds 21 oktober 2026 praat Bliepo met de stem die de eigenaar op Fish Audio
  heeft gekozen (app/api/stem/route.ts). Lukt dat niet — geen tegoed, geen
  verbinding, de zin duurt te lang — dan praat hij met de browserstem zoals
  hiervoor. Terug naar alleen de browserstem: zet dit op "browser".
*/
const BRON: Bron = "server";

/** Waar de vooraf gemaakte zinnen straks vandaan komen. */
const SERVER_PAD = "/api/stem";

// ---------------------------------------------------------------------------
// De beste Nederlandse vrouwenstem kiezen
// ---------------------------------------------------------------------------

/** Stemmen die we herkennen als vrouwelijk en prettig voor kinderen. */
const VROUWELIJK = [
  "claire", "ellen", "fenna", "colette", "saskia", "lotte", "femke", "hanna",
  "laura", "anna", "marieke", "nicky", "google nederlands",
];

/** Stemmen die we liever niet gebruiken. */
const MANNELIJK = ["xander", "maarten", "frank", "ruben", "daan", "bart"];

/** Woorden die op een betere, natuurlijker klinkende variant wijzen. */
const BETER = ["enhanced", "premium", "natural", "neural", "wavenet", "network"];

export type Stemkeuze = {
  stem: SpeechSynthesisVoice | null;
  score: number;
  reden: string;
};

function beoordeel(stem: SpeechSynthesisVoice): { score: number; reden: string[] } {
  const naam = stem.name.toLowerCase();
  const uri = (stem.voiceURI ?? "").toLowerCase();
  const redenen: string[] = [];
  let score = 0;

  if (VROUWELIJK.some((n) => naam.includes(n))) {
    score += 100;
    redenen.push("vrouwelijke stem");
  }
  if (MANNELIJK.some((n) => naam.includes(n))) {
    score -= 120;
    redenen.push("mannelijke stem");
  }
  if (BETER.some((w) => naam.includes(w) || uri.includes(w))) {
    score += 45;
    redenen.push("betere variant");
  }
  if (stem.lang.toLowerCase() === "nl-nl") {
    score += 25;
    redenen.push("Nederlands (NL)");
  } else if (stem.lang.toLowerCase().startsWith("nl")) {
    score += 12;
    redenen.push("Nederlands (BE)");
  }
  if (!stem.localService) {
    score += 8;
    redenen.push("netwerkstem");
  }

  return { score, reden: redenen };
}

/** Alle Nederlandse stemmen op dit apparaat, met hun beoordeling. */
export function beoordeelStemmen(): { stem: SpeechSynthesisVoice; score: number; reden: string }[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];

  return window.speechSynthesis
    .getVoices()
    .filter((s) => s.lang.toLowerCase().startsWith("nl"))
    .map((stem) => {
      const { score, reden } = beoordeel(stem);
      return { stem, score, reden: reden.join(", ") || "geen kenmerken herkend" };
    })
    .sort((a, b) => b.score - a.score);
}

let gekozen: SpeechSynthesisVoice | null = null;

export function kiesStem(): Stemkeuze {
  const lijst = beoordeelStemmen();
  if (lijst.length === 0) return { stem: null, score: 0, reden: "geen Nederlandse stem gevonden" };
  gekozen = lijst[0].stem;
  return { stem: lijst[0].stem, score: lijst[0].score, reden: lijst[0].reden };
}

// ---------------------------------------------------------------------------
// Wachten tot de browser zijn stemmen heeft geladen
// ---------------------------------------------------------------------------

/**
 * `getVoices()` is in elke browser ASYNCHROON.
 *
 * Bij de eerste aanroep geeft hij vaak een lege lijst terug; pas even later
 * staan de stemmen erin en vuurt de browser `voiceschanged`. Dat is precies wat
 * er misging: de eerste zin werd uitgesproken vóórdat er een stem gekozen kón
 * worden, dus zonder `voice`. De browser koos dan zelf — op macOS meestal
 * Xander, een mannenstem. Zodra de lijst geladen was, pakte de volgende zin wél
 * de vrouwenstem, en dus wisselde de stem middenin de uitleg.
 *
 * Hieronder wordt daarom op de lijst gewacht voordat er iets gezegd wordt. Eén
 * keer per sessie; daarna staat de keuze vast in `gekozen`.
 */

/** Wachtenden die nog aan het praten toe moeten komen. */
let wachtOpStemmen: Promise<void> | null = null;

function stemmenGereed(): Promise<void> {
  if (gekozen) return Promise.resolve();
  if (kiesStem().stem) return Promise.resolve();
  if (wachtOpStemmen) return wachtOpStemmen;

  wachtOpStemmen = new Promise<void>((klaar) => {
    let afgerond = false;
    const rond = () => {
      if (afgerond) return;
      afgerond = true;
      window.speechSynthesis.removeEventListener("voiceschanged", opGeladen);
      clearTimeout(afkap);
      kiesStem();
      klaar();
    };
    const opGeladen = () => rond();

    window.speechSynthesis.addEventListener("voiceschanged", opGeladen);
    /*
      Vangnet: op sommige apparaten komt `voiceschanged` nooit. Na een seconde
      gaan we gewoon praten met wat er dan is — liever een stem die niet de
      mooiste is dan een kind dat op stilte zit te wachten.
    */
    const afkap = setTimeout(rond, 1000);
  });

  return wachtOpStemmen;
}

// ---------------------------------------------------------------------------
// Praten
// ---------------------------------------------------------------------------

/**
 * Iets langzamer en warmer dan standaard, met een licht hogere toon. Dat
 * klinkt vriendelijker en geduldiger voor jonge kinderen.
 */
const TEMPO = 0.88;
const TOONHOOGTE = 1.2;

const luisteraars = new Set<() => void>();
let praatNu = false;
/** Volgnummer van de laatste `zeg`-aanroep; zie de uitleg daar. */
let beurt = 0;

function meld(bezig: boolean) {
  praatNu = bezig;
  for (const f of luisteraars) f();
}

/** Praat Vos op dit moment? Hiermee beweegt de mond mee. */
export function praatVos(): boolean {
  return praatNu;
}

export function praatOpServer(): boolean {
  return false;
}

export function abonneerPraten(herteken: () => void): () => void {
  luisteraars.add(herteken);
  return () => {
    luisteraars.delete(herteken);
  };
}

/**
 * Laat Vos een zin zeggen.
 *
 * Bij de browserstem regelt `speechSynthesis` het geluid. Bij een stemdienst
 * wordt straks een vooraf gemaakt geluidsbestand afgespeeld; de rest van de
 * app merkt daar niets van.
 */
export function zeg(zin: string): void {
  if (typeof window === "undefined") return;

  if (serverBruikbaar()) {
    window.speechSynthesis?.cancel();
    beurt += 1;
    const mijnBeurt = beurt;
    speelVanServer(zin, mijnBeurt, () => meld(false), () => {
      if (mijnBeurt === beurt) zegMetBrowser(zin, mijnBeurt);
    });
    return;
  }

  /*
    Elke aanroep krijgt een nummer. Komt er tijdens het wachten op de
    stemmenlijst alweer een nieuwe zin binnen, dan laat de oude zichzelf vallen
    — anders zouden er twee tegelijk gaan praten.
  */
  beurt += 1;
  zegMetBrowser(zin, beurt);
}

/** De zin met de stem uit de browser (zoals Bliepo vóór Fish Audio praatte). */
function zegMetBrowser(zin: string, mijnBeurt: number): void {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  void stemmenGereed().then(() => {
    if (mijnBeurt !== beurt) return;
    /*
      Geen Nederlandse stem op dit apparaat: dan zwijgen. Anders kiest de
      browser zelf een stem, vaak een Engelse, en die maakt van een Nederlandse
      zin onzin. Het tekstwolkje blijft gewoon staan.
    */
    if (!gekozen) return;

    const uiting = new SpeechSynthesisUtterance(zin);
    /*
      De taal van de gekozen stem zelf overnemen. Zet je hier "nl-NL" terwijl de
      stem "nl-BE" is, dan gaan sommige browsers alsnog zelf een passende stem
      zoeken — en ben je de gekozen stem weer kwijt.
    */
    uiting.lang = gekozen?.lang ?? "nl-NL";
    uiting.rate = TEMPO;
    uiting.pitch = TOONHOOGTE;
    if (gekozen) uiting.voice = gekozen;

    uiting.onstart = () => meld(true);
    uiting.onend = () => meld(false);
    uiting.onerror = () => meld(false);

    window.speechSynthesis.speak(uiting);
  });
}

/**
 * Een paar zinnen na elkaar, voor het maatje.
 *
 * `bijZin` hoort bij elke zin die begint, zodat het wolkje en het plaatje met
 * de stem meelopen: terwijl het maatje "Maak eerst de 10 vol" zegt, vult de
 * bovenste rij zich. `klaar` komt na de laatste zin. Een nieuwe aanroep (of
 * `zeg`, of `stopPraten`) breekt een reeks die nog loopt af.
 *
 * Zonder stem in deze browser loopt de reeks op de klok, met ongeveer de tijd
 * die het voorlezen zou kosten. Zo verschijnen de zinnen ook zonder geluid
 * één voor één.
 */
export function zegNaElkaar(
  zinnen: string[],
  bijZin: (index: number) => void,
  klaar: () => void,
  metGeluid: boolean,
): () => void {
  beurt += 1;
  const mijnBeurt = beurt;
  let gestopt = false;
  let klok: ReturnType<typeof setTimeout> | undefined;
  const stop = () => {
    gestopt = true;
    clearTimeout(klok);
  };

  const opDeKlok = (i: number) => {
    if (gestopt || mijnBeurt !== beurt) return;
    if (i >= zinnen.length) {
      klaar();
      return;
    }
    bijZin(i);
    klok = setTimeout(() => opDeKlok(i + 1), 900 + zinnen[i].length * 55);
  };

  if (metGeluid && serverBruikbaar()) {
    window.speechSynthesis?.cancel();
    /* Alvast de volgende zinnen ophalen, zodat er tussen de zinnen geen gat valt. */
    zinnen.slice(1).forEach(haalAlvast);
    let gestart = false;
    const volgende = (i: number) => {
      if (gestopt || mijnBeurt !== beurt) return;
      if (i >= zinnen.length) {
        meld(false);
        klaar();
        return;
      }
      bijZin(i);
      speelVanServer(
        zinnen[i],
        mijnBeurt,
        () => volgende(i + 1),
        () => {
          if (gestopt || mijnBeurt !== beurt) return;
          /* Lukt de eerste zin al niet, dan alles met de browserstem; halverwege gewoon door op de klok. */
          if (!gestart) browserReeks();
          else klok = setTimeout(() => opDeKlok(i + 1), 900 + zinnen[i].length * 55);
        },
        () => {
          gestart = true;
        },
      );
    };
    volgende(0);
    return stop;
  }

  browserReeks();
  return stop;

  function browserReeks() {
  const kanPraten = typeof window !== "undefined" && !!window.speechSynthesis;
  if (!metGeluid || !kanPraten) {
    klok = setTimeout(() => opDeKlok(0), 0);
    return;
  }

  window.speechSynthesis.cancel();
  void stemmenGereed().then(() => {
    if (gestopt || mijnBeurt !== beurt) return;
    /* Geen Nederlandse stem: de zinnen lopen zonder geluid, op de klok. */
    if (!gekozen) {
      opDeKlok(0);
      return;
    }
    const volgende = (i: number) => {
      if (gestopt || mijnBeurt !== beurt) return;
      if (i >= zinnen.length) {
        meld(false);
        klaar();
        return;
      }
      const uiting = new SpeechSynthesisUtterance(zinnen[i]);
      uiting.lang = gekozen?.lang ?? "nl-NL";
      uiting.rate = TEMPO;
      uiting.pitch = TOONHOOGTE;
      if (gekozen) uiting.voice = gekozen;
      let door = false;
      const verder = () => {
        if (door) return;
        door = true;
        clearTimeout(klok);
        volgende(i + 1);
      };
      uiting.onstart = () => meld(true);
      bijZin(i);
      uiting.onend = verder;
      uiting.onerror = verder;
      /* Vangnet: komt er nooit een einde (dat gebeurt op sommige tablets), dan toch door. */
      klok = setTimeout(verder, 2500 + zinnen[i].length * 120);
      window.speechSynthesis.speak(uiting);
    };
    volgende(0);
  });
  }
}

export function stopPraten(): void {
  if (typeof window === "undefined") return;
  beurt += 1;
  window.speechSynthesis?.cancel();
  huidigGeluid?.pause();
  huidigGeluid = null;
  meld(false);
}

// ---------------------------------------------------------------------------
// Geluid van de server: de stem van Fish Audio (app/api/stem/route.ts)
// ---------------------------------------------------------------------------

let huidigGeluid: HTMLAudioElement | null = null;
/**
 * Werkt de stem van de server in dit bezoek? Na één mislukte zin (geen
 * tegoed, geen verbinding) niet meer proberen, zodat het kind niet bij elke
 * zin op stilte wacht; dan praat Bliepo de rest van het bezoek met de
 * browserstem.
 */
let serverWerkt = true;
/** Zo lang mag het maken van een nieuwe zin duren; daarna de browserstem. */
const GEDULD_MS = 7000;

function serverBruikbaar(): boolean {
  return BRON === "server" && serverWerkt && typeof Audio !== "undefined";
}

const adres = (zin: string) => `${SERVER_PAD}?zin=${encodeURIComponent(zin)}`;

/** Een zin alvast laten maken en in de browser zetten. */
function haalAlvast(zin: string): void {
  void fetch(adres(zin)).catch(() => {});
}

/**
 * Speelt één zin met de stem van de server. `klaar` als hij is uitgesproken,
 * `mislukt` als het niet lukte (dan praat de browserstem verder).
 */
function speelVanServer(zin: string, mijnBeurt: number, klaar: () => void, mislukt: () => void, gestart?: () => void): void {
  huidigGeluid?.pause();

  /* Via de geluidsmeter van Bliepo, zodat het lijntje op zijn scherm meebeweegt (lib/bliepo-geluid.ts). */
  const geluid = koppelBliepoGeluid(new Audio(adres(zin)));
  huidigGeluid = geluid;
  let afgerond = false;
  const wachter = setTimeout(() => faal(true), GEDULD_MS);
  function faal(teLang: boolean) {
    if (afgerond) return;
    afgerond = true;
    clearTimeout(wachter);
    geluid.pause();
    if (huidigGeluid === geluid) huidigGeluid = null;
    /* Te lang wachten: alleen deze zin met de browser (de volgende keer staat hij wel klaar). Echt kapot: de rest van het bezoek. */
    if (!teLang) serverWerkt = false;
    meld(false);
    if (mijnBeurt === beurt) mislukt();
  }
  geluid.onplaying = () => {
    clearTimeout(wachter);
    if (mijnBeurt !== beurt) {
      geluid.pause();
      return;
    }
    gestart?.();
    meld(true);
  };
  geluid.onended = () => {
    if (afgerond) return;
    afgerond = true;
    if (huidigGeluid === geluid) huidigGeluid = null;
    meld(false);
    if (mijnBeurt === beurt) klaar();
  };
  geluid.onerror = () => faal(false);
  void geluid.play().catch((fout: unknown) => {
    /* Geen tik gehad (autoplay): dat is geen kapotte stem, de browserstem mag het ook niet; gewoon stil. */
    if (fout instanceof DOMException && fout.name === "NotAllowedError") {
      afgerond = true;
      clearTimeout(wachter);
      meld(false);
      return;
    }
    faal(false);
  });
}
