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

import { haalGebarenPlan } from "@/lib/gebaren-plan";
import { bliepoGeluidKlaar, koppelBliepoGeluid, speelBliepoData } from "@/lib/bliepo-geluid";
import { meldKomendeZin, meldVoorlezen, spraakGrenzen, stopVoorlezen } from "@/lib/voorlezen";

// ---------------------------------------------------------------------------
// Welke bron gebruiken we?
// ---------------------------------------------------------------------------

type Bron = "browser" | "server";

/*
  Sinds 22 oktober 2026 praat Bliepo overal met de ElevenLabs-stem Ruth
  (app/api/stem/route.ts), met toon en tempo per groep. Lukt Ruth niet, dan
  geeft de server Fish Audio (Sanne), en daarna de oude Fish Audio-stem.
  Sinds 23 oktober 2026 (opdracht eigenaar) komt de browserstem alleen nog als
  de server helemaal niet te bereiken is (geen verbinding, server kapot). Duurt
  een zin te lang, of mag de browser nog geen geluid maken omdat er nog niet
  getikt is, dan blijft Bliepo stil en staat de tekst in zijn wolkje.
  Terug naar alleen de browserstem: zet dit op "browser".
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
    speelVanServer(zin, mijnBeurt, () => meld(false), (kapot, browser) => {
      if ((kapot || browser) && mijnBeurt === beurt) zegMetBrowser(zin, mijnBeurt);
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
  stopServerGeluid?.();
  stopServerGeluid = null;
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

    uiting.onstart = () => {
      meldVoorlezen(zin, browserGrenzen(zin));
      meld(true);
    };
    uiting.onend = () => {
      stopVoorlezen();
      meld(false);
    };
    uiting.onerror = () => {
      stopVoorlezen();
      meld(false);
    };

    window.speechSynthesis.speak(uiting);
  });
}

/*
  Hoe lang de browserstem ongeveer over een zin doet, voor het meelezen en de
  gebaren (de woorden lichten op in dit tempo). Geschat op het aantal letters
  en het tempo; de browser vertelt het niet vooraf.
*/
function browserGrenzen(zin: string): { begin: number; eind: number } {
  return { begin: 0.05, eind: Math.max(0.6, (zin.length * 0.066) / TEMPO) };
}

/**
 * Eén zin met de browserstem, met meelezen en het lijntje; daarna `klaar`
 * (ook als de browser geen einde meldt: dan na een ruime schatting).
 */
function spreekMetBrowser(zin: string, magNog: () => boolean, klaar: () => void): void {
  stopServerGeluid?.();
  stopServerGeluid = null;
  let door = false;
  let vangnet: ReturnType<typeof setTimeout> | undefined;
  const verder = () => {
    if (door) return;
    door = true;
    clearTimeout(vangnet);
    stopVoorlezen();
    meld(false);
    if (magNog()) klaar();
  };
  /* Geen stem op dit apparaat: de woorden lichten toch op in het tempo van voorlezen, en de les loopt door. */
  const zonderStem = () => {
    meldVoorlezen(zin, browserGrenzen(zin));
    vangnet = setTimeout(verder, 900 + zin.length * 55);
  };
  if (!window.speechSynthesis) return zonderStem();
  void stemmenGereed().then(() => {
    if (!magNog()) return;
    if (!gekozen) return zonderStem();
    const uiting = new SpeechSynthesisUtterance(zin);
    uiting.lang = gekozen.lang ?? "nl-NL";
    uiting.rate = TEMPO;
    uiting.pitch = TOONHOOGTE;
    uiting.voice = gekozen;
    uiting.onstart = () => {
      meldVoorlezen(zin, browserGrenzen(zin));
      meld(true);
    };
    uiting.onend = verder;
    uiting.onerror = verder;
    vangnet = setTimeout(verder, 2500 + zin.length * 120);
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
        (kapot, browser) => {
          if (gestopt || mijnBeurt !== beurt) return;
          /* Nog niet bewaard: deze ene zin met de browserstem, daarna gewoon verder (27 oktober 2026). */
          if (browser) {
            gestart = true;
            spreekMetBrowser(zinnen[i], () => mijnBeurt === beurt && !gestopt, () => volgende(i + 1));
            return;
          }
          /* Is de server kapot bij de eerste zin, dan alles met de browserstem; anders gewoon door op de klok. */
          if (!gestart && kapot) browserReeks();
          else klok = setTimeout(() => opDeKlok(i + 1), 900 + zinnen[i].length * 55);
        },
        () => {
          gestart = true;
        },
        /* Alleen de eerste zin krijgt 0,2 s stilte ervoor; daarna loopt het door, zonder rare pauze. */
        gestart ? 0.03 : 0.2,
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
      uiting.onstart = () => {
        meldVoorlezen(zinnen[i], browserGrenzen(zinnen[i]));
        meld(true);
      };
      bijZin(i);
      uiting.onend = () => {
        stopVoorlezen();
        verder();
      };
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
  stopVoorlezen();
  beurt += 1;
  window.speechSynthesis?.cancel();
  huidigGeluid?.pause();
  huidigGeluid = null;
  stopServerGeluid?.();
  stopServerGeluid = null;
  meld(false);
}

// ---------------------------------------------------------------------------
// Geluid van de server: de stem van Fish Audio (app/api/stem/route.ts)
// ---------------------------------------------------------------------------

let huidigGeluid: HTMLAudioElement | null = null;
/** De server heeft deze zin nog niet met de gekozen stem: dan de browserstem (alleen voor deze zin). */
class NietBewaard extends Error {}
/**
 * Werkt de stem van de server in dit bezoek? Na één mislukte zin (geen
 * tegoed, geen verbinding) niet meer proberen, zodat het kind niet bij elke
 * zin op stilte wacht; dan praat Bliepo de rest van het bezoek met de
 * browserstem.
 */
let serverWerkt = true;
/**
 * Zo lang mag het maken van een nieuwe zin duren; daarna de browserstem.
 * De server wacht zelf 6 seconden op de nieuwe stem en geeft daarna de oude
 * Fish Audio-stem (22 oktober 2026); die moet hier nog binnen passen.
 */
const GEDULD_MS = 15000;

function serverBruikbaar(): boolean {
  return BRON === "server" && serverWerkt && typeof Audio !== "undefined";
}

const adres = (zin: string) => `${SERVER_PAD}?zin=${encodeURIComponent(zin)}`;

/** Een zin alvast laten maken en in de browser zetten. */
function haalAlvast(zin: string): void {
  haalGebarenPlan(zin);
  meldKomendeZin(zin);
  void fetch(adres(zin)).catch(() => {});
}

/** Stopt wat er nu van de server klinkt (Web Audio); null als er niets klinkt. */
let stopServerGeluid: (() => void) | null = null;

/**
 * Speelt één zin met de stem van de server. `klaar` als hij is uitgesproken,
 * `mislukt` als het niet lukte (dan praat de browserstem verder).
 *
 * Het eerste woordje viel soms weg (21 oktober 2026). Oorzaak: het geluid
 * begon al terwijl de geluidsmeter van het lijntje (een AudioContext) nog aan
 * het opstarten was, en het werd afgespeeld terwijl het nog binnenkwam. Nu:
 *   1. de zin wordt eerst helemaal opgehaald;
 *   2. de geluidsmeter wordt aangezet en we wachten tot hij echt draait;
 *   3. de zin begint na een stilte van 0,2 seconde.
 */
function speelVanServer(
  zin: string,
  mijnBeurt: number,
  klaar: () => void,
  mislukt: (kapot: boolean, browser?: boolean) => void,
  gestart?: () => void,
  stilte = 0.2,
): void {
  stopServerGeluid?.();
  stopServerGeluid = null;
  huidigGeluid?.pause();
  huidigGeluid = null;

  let afgerond = false;
  /* Waar de spraak in het geluid zit, voor het oplichten van de woorden (lib/voorlezen.ts). */
  let grenzen: { begin: number; eind: number } | null = null;
  const nogAanDeBeurt = () => !afgerond && mijnBeurt === beurt;
  const faal = (kapot: boolean, browser = false) => {
    if (afgerond) return;
    afgerond = true;
    /* Te lang wachten of geen tik gehad: alleen deze zin met de browser. Echt kapot: de rest van het bezoek. */
    if (kapot) serverWerkt = false;
    meld(false);
    if (mijnBeurt === beurt) mislukt(kapot, browser);
  };
  const begint = () => {
    if (mijnBeurt !== beurt) return;
    meldVoorlezen(zin, grenzen ?? { begin: 0.05, eind: Math.max(0.5, (huidigGeluid?.duration || 2) - 0.2) });
    gestart?.();
    meld(true);
  };
  const eindigt = () => {
    if (afgerond) return;
    afgerond = true;
    stopVoorlezen();
    meld(false);
    if (mijnBeurt === beurt) klaar();
  };

  /* Tegelijk het gebarenplan van deze zin (lib/gebaren-plan.ts). */
  haalGebarenPlan(zin);
  meldKomendeZin(zin);
  const wacht = new AbortController();
  const wachter = setTimeout(() => wacht.abort(), GEDULD_MS);
  void fetch(adres(zin), { signal: wacht.signal })
    .then(async (antwoord) => {
      /* 404 = deze zin is nog niet met de gekozen stem gemaakt: de browser leest hem voor (27 oktober 2026). */
      if (antwoord.status === 404) throw new NietBewaard();
      if (!antwoord.ok) throw new Error(String(antwoord.status));
      return antwoord.arrayBuffer();
    })
    .then(async (data) => {
      clearTimeout(wachter);
      if (!nogAanDeBeurt()) return;
      const stop = await speelBliepoData(data.slice(0), {
        stilte,
        gestart: begint,
        klaar: eindigt,
        metGeluid: (b) => (grenzen = spraakGrenzen(b.getChannelData(0), b.sampleRate)),
      });
      if (stop) {
        if (!nogAanDeBeurt()) stop();
        else stopServerGeluid = stop;
        return;
      }
      /* Zonder Web Audio (of de browser wil nog niet): de gewone speler, met het al geladen geluid. */
      if (!nogAanDeBeurt()) return;
      if (!(await bliepoGeluidKlaar()) && navigator.userActivation && !navigator.userActivation.hasBeenActive) {
        faal(false);
        return;
      }
      const url = URL.createObjectURL(new Blob([data], { type: "audio/mpeg" }));
      const geluid = koppelBliepoGeluid(new Audio(url));
      huidigGeluid = geluid;
      geluid.onplaying = begint;
      geluid.onended = () => {
        URL.revokeObjectURL(url);
        if (huidigGeluid === geluid) huidigGeluid = null;
        eindigt();
      };
      geluid.onerror = () => faal(true);
      void geluid.play().catch(() => faal(false));
    })
    .catch((fout: unknown) => {
      clearTimeout(wachter);
      if (fout instanceof NietBewaard) {
        faal(false, true);
        return;
      }
      /* 503 = geen enkele stem lukte op de server; geen antwoord = geen verbinding. Allebei "kapot". */
      faal(!(fout instanceof DOMException && fout.name === "AbortError"));
    });
}

/**
 * Een kant-en-klaar antwoord van Bliepo afspelen (Praten met Bliepo,
 * 22 oktober 2026): het mp3-geluid dat de server al meestuurde. Zelfde weg als
 * de andere zinnen: eerst helemaal geladen, 0,2 s stilte, de mond en het
 * lijntje bewegen mee, en `stopPraten` of een nieuwe zin breekt hem af.
 * Geeft een belofte die klaar is als Bliepo uitgepraat is (of werd gestopt).
 */
export function speelAntwoord(
  data: ArrayBuffer,
  /*
    Optioneel (24 oktober 2026, voorbeeld "Gesprek met Bliepo"): `gestart` op
    het moment dat het geluid echt begint, `metGeluid` met het uitgepakte
    geluid (om te meten waar de spraak zit). Zonder: zoals altijd.
  */
  opties: { gestart?: () => void; metGeluid?: (buffer: AudioBuffer) => void } = {},
): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  window.speechSynthesis?.cancel();
  beurt += 1;
  const mijnBeurt = beurt;
  stopServerGeluid?.();
  stopServerGeluid = null;
  huidigGeluid?.pause();
  huidigGeluid = null;
  return new Promise((klaar) => {
    let afgerond = false;
    const einde = () => {
      if (afgerond) return;
      afgerond = true;
      meld(false);
      klaar();
    };
    void speelBliepoData(data.slice(0), {
      stilte: 0.2,
      gestart: () => {
        if (mijnBeurt === beurt) {
          meld(true);
          opties.gestart?.();
        }
      },
      klaar: einde,
      metGeluid: opties.metGeluid,
    }).then((stop) => {
      if (stop) {
        if (mijnBeurt !== beurt) stop();
        else
          stopServerGeluid = () => {
            stop();
            einde();
          };
        return;
      }
      /* Zonder Web Audio: de gewone speler. */
      const url = URL.createObjectURL(new Blob([data], { type: "audio/mpeg" }));
      const geluid = koppelBliepoGeluid(new Audio(url));
      huidigGeluid = geluid;
      geluid.onplaying = () => meld(true);
      geluid.onended = geluid.onerror = () => {
        URL.revokeObjectURL(url);
        einde();
      };
      void geluid.play().catch(einde);
    });
  });
}

/** Mag de browser al geluid maken (heeft het kind al ergens op getikt)? */
export function magGeluid(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.userActivation ? navigator.userActivation.hasBeenActive : true;
}

/** Zinnen met de gewone stem na elkaar, als belofte (voor de hints van Praten met Bliepo). */
export function zegEnWacht(zinnen: string[]): Promise<void> {
  return new Promise((klaar) => {
    zegNaElkaar(zinnen, () => {}, klaar, true);
  });
}
