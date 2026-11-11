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
import { GOOGLE_NL, meldKomendeZin, meldVoorlezen, meldWoordgrens, modelSpraakduur, spraakGrenzen, stopVoorlezen, vergelijkbaar, woordtijdenMetModel } from "@/lib/voorlezen";

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
  /* Keuze eigenaar (30 oktober 2026): zonder Ruth-geluid praat Bliepo met de Google-stem, als het apparaat die heeft (Chrome). */
  if (naam.includes("google")) {
    score += 300;
    redenen.push("Google-stem (keuze eigenaar)");
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

/*
  OPTIE PER LES "heel uitpraten" (10 november 2026, besluit Sara; nu alleen AAN in de gouden klokles, via zetLesStem).
  Standaard UIT: dan doet alles hieronder precies wat het altijd deed.
  Met de optie AAN:
    1. Bliepo's eigen zin wordt niet meer afgebroken als hij begint te praten (meld(true) -> stopKeuzeStem() deed
       speechSynthesis.cancel() en brak zo zijn eigen zin 1–3 ms na de start af). Alleen een keuze die de browser op dat
       moment echt voorleest, mag nog worden afgebroken.
    2. Een zin telt pas als klaar als hij echt is uitgesproken. Spreekt de browserstem niets uit (fout, "not-allowed",
       geen stem), dan telt de zin als klaar na de leestijd (900 ms + 55 ms per teken, dezelfde schatting als zonder stem).
       Voor een geluidsbestand van Ruth geldt hetzelfde: klaar = het einde van het bestand (speelVanServer -> eindigt);
       lukt afspelen niet, dan valt de zin terug op de browserstem of op de leestijd, zoals hierboven.
    3. Heeft het kind nog nergens getikt (Chrome laat dan geen geluid toe), dan wacht de zin tot de eerste tik of toets
       van het kind en wordt hij dán uitgesproken (geen startknop; de tekst staat er al). Lukt het daarna nog steeds niet,
       dan de leestijd.
*/
let heelUitpraten = false;
/** Staat de optie "heel uitpraten" aan in de les van nu? (BliepoTekst: een zin die al wit is, blijft wit; F7, 11 nov 2026.) */
export const praatHeelUit = (): boolean => heelUitpraten;
/** Leest de browser nu een keuze voor (alleen bijgehouden voor de optie hierboven)? */
let keuzeBrowserBezig = false;
const leestijd = (zin: string) => 900 + zin.length * 55;
/** Heeft het kind op deze pagina nog nergens getikt? Dan laat Chrome geen geluid toe. */
const geenGebaar = () => typeof navigator !== "undefined" && !!navigator.userActivation && !navigator.userActivation.hasBeenActive;
/** Eén keer iets doen bij de eerste tik of toets van het kind (alleen met de optie heel uitpraten). */
function naEersteGebaar(f: () => void): void {
  const soorten = ["pointerdown", "keydown", "touchend"] as const;
  const op = () => {
    for (const t of soorten) window.removeEventListener(t, op, true);
    /* Even later: was de tik een antwoord (bijvoorbeeld Ja of Nee), dan is de les intussen verder en zegt Bliepo het oude stuk niet meer. */
    setTimeout(f, 150);
  };
  for (const t of soorten) window.addEventListener(t, op, true);
}

function meld(bezig: boolean) {
  /* De stem begint: de zin is niet meer onderweg (stemOnderweg hieronder). Een fout of einde wist het niet: dat kan nog
     van de vorige zin zijn terwijl de volgende al onderweg is; de foutwegen wissen het zelf. */
  if (bezig) onderweg = null;
  praatNu = bezig;
  if (bezig) stopKeuzeStem();
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
      if ((kapot || browser) && mijnBeurt === beurt && !alleenServerStem) zegMetBrowser(zin, mijnBeurt);
    });
    return;
  }
  if (alleenServerStem) return;

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
    koppelWoorden(uiting, zin);

    uiting.onstart = () => {
      meldBrowserZin(zin);
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
  Met de optie woordenMee (per les, 10 november 2026, BOUWREGELS 3.7) wordt het tempo geleerd: na elke helemaal
  uitgesproken zin weet de les hoeveel ms per letter deze stem echt nodig had (een lopend gemiddelde), en de volgende
  zin wordt daarmee geschat. Zonder de optie verandert er niets.
*/
function browserGrenzen(zin: string): { begin: number; eind: number } {
  if (woordenMee && geleerdMsPerTeken) return { begin: 0.02, eind: Math.max(0.5, (zin.length * geleerdMsPerTeken) / 1000) };
  return { begin: 0.05, eind: Math.max(0.6, (zin.length * 0.066) / TEMPO) };
}

/*
  WOORDEN MEE MET DE STEM (opt-in per les: Lesdraaiboek.woordenMeeMetStem; 10 november 2026, eis Sara: elk woord licht
  op op het moment dat Bliepo het zegt, BOUWREGELS 3.7). Twee dingen, allebei alleen met de optie:
    1. De browser meldt bij sommige stemmen elk woord (onboundary, name "word"). Komt die melding, dan schuift het
       oplichten precies naar dat woord (lib/voorlezen.ts meldWoordgrens) en worden de woorden erna in hetzelfde tempo
       opnieuw geschat.
    2. Komt er geen melding (de Google-stem in Chrome meldt niets), dan komen de tijden per woord uit het spreekmodel
       (lib/voorlezen.ts GOOGLE_NL, meldBrowserZin hieronder; 11 november 2026, F10): een vast stukje per woord, een stukje
       per klank, een pauze na een punt, vraagteken of komma, en de stilte voor en na de zin apart. Het tempo wordt geleerd
       uit de zinnen die al klonken (modelTempo). Eerst (10 november) werd de duur van de hele zin, met de stilte aan het
       eind erbij, over de letters verdeeld; daardoor lichtten de woorden gemiddeld ± 0,3 s te laat op (tot 1,2 s).
    3. Zolang de stem nog onderweg is (stemOnderweg), blijft de zin gedimd; hij wordt pas wit als Bliepo de woorden zegt.
  Een geluidsbestand van Ruth levert later echte woordtijden (ElevenLabs); die gaan al via meldVoorlezen(…, tijden).
*/
let woordenMee = false;
/*
  Welke zin is onderweg naar de stem: opgehaald bij de server, of in de wachtrij van de browserstem, maar hij klinkt nog
  niet (11 november 2026, F10). De Google-stem in Chrome doet er soms 2 tot 3 seconden over voor hij begint; BliepoTekst
  maakte de zin na 2,5 tel dan al helemaal wit ("stem uit"), en bij de optie heel uitpraten bleef hij wit. Dan zag Sara
  de hele zin tegelijk wit worden en liep er alleen nog een oranje woord overheen: "het licht op per zin". Met de optie
  woordenMee wacht de zin daarom gedimd zolang de stem echt onderweg is (hooguit 10 tel). Zonder de optie: altijd false.
*/
let onderweg: { zin: string; sinds: number } | null = null;
function zetOnderweg(zin: string | null): void {
  if (!woordenMee) return;
  onderweg = zin ? { zin: vergelijkbaar(zin), sinds: performance.now() } : null;
}
/** De les gaat deze zin zo zeggen (Lesscherm, vóór het wachten op Bliepo in beeld). Zonder woordenMee: niets. */
export function meldStemOnderweg(zin: string): void {
  zetOnderweg(zin);
}
/** Is deze zin nog onderweg naar de stem (hij komt zo)? Alleen in lessen met de optie woordenMeeMetStem. */
export function stemOnderweg(zin: string): boolean {
  if (!woordenMee || !onderweg) return false;
  if (performance.now() - onderweg.sinds > 10_000) return false;
  return onderweg.zin === vergelijkbaar(zin);
}
/** Geleerd tempo van de browserstem in ms per letter (null = nog niets geleerd). */
let geleerdMsPerTeken: number | null = null;
/**
 * Geleerd tempo voor het spreekmodel (lib/voorlezen.ts GOOGLE_NL; 11 november 2026, F10): 1 = zoals gemeten met de
 * Google-stem; groter = deze stem praat trager. Bijgesteld na elke helemaal uitgesproken zin.
 */
let modelTempo = 1;
/** De browserstem begint aan een zin: het oplichten start. Met woordenMee de woordtijden uit het spreekmodel. */
function meldBrowserZin(zin: string): void {
  if (!woordenMee) return meldVoorlezen(zin, browserGrenzen(zin));
  const tijden = woordtijdenMetModel(zin, GOOGLE_NL, modelTempo);
  meldVoorlezen(zin, { begin: GOOGLE_NL.voor, eind: tijden.at(-1)?.eind ?? 0.5 }, tijden);
}
/** Hoeveel woordmeldingen (onboundary) de browser deze les gaf (voor de test: window.__woordgrenzen). */
let woordMeldingen = 0;
function koppelWoorden(uiting: SpeechSynthesisUtterance, zin: string): void {
  if (!woordenMee) return;
  let start = 0;
  let afgebroken = false;
  uiting.addEventListener("start", () => {
    start = performance.now();
  });
  uiting.addEventListener("boundary", (e) => {
    if (e.name !== "word") return;
    woordMeldingen++;
    if (typeof window !== "undefined") (window as unknown as { __woordgrenzen?: number }).__woordgrenzen = woordMeldingen;
    meldWoordgrens(zin, e.charIndex);
  });
  uiting.addEventListener("error", () => {
    afgebroken = true;
  });
  uiting.addEventListener("end", () => {
    if (afgebroken || !start || zin.length < 12) return;
    /* Het tempo voor het spreekmodel: hoe lang deze zin echt duurde tegenover het model (alleen redelijke metingen). */
    const spraak = modelSpraakduur(zin, GOOGLE_NL);
    const verhouding = ((performance.now() - start) / 1000 - GOOGLE_NL.voor - GOOGLE_NL.na) / spraak;
    if (spraak > 0.3 && verhouding > 0.5 && verhouding < 2) modelTempo = modelTempo * 0.6 + verhouding * 0.4;
    const ms = (performance.now() - start) / zin.length;
    /* Alleen redelijke metingen (een afgebroken of haperende zin telt niet mee). */
    if (ms < 30 || ms > 160) return;
    geleerdMsPerTeken = geleerdMsPerTeken ? geleerdMsPerTeken * 0.6 + ms * 0.4 : ms;
  });
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
    zetOnderweg(null);
    meldVoorlezen(zin, browserGrenzen(zin));
    vangnet = setTimeout(verder, 900 + zin.length * 55);
  };
  if (!window.speechSynthesis) return zonderStem();
  void stemmenGereed().then(() => {
    if (!magNog()) return;
    if (!gekozen) return zonderStem();
    const stem = gekozen;
    let begin = 0;
    let opnieuw = false;
    /* Heel uitpraten: een fout is niet "klaar". Nog geen tik gehad: bij de eerste tik opnieuw; anders de leestijd. */
    const naFout = () => {
      if (door) return;
      clearTimeout(vangnet);
      if (!magNog()) return verder();
      zetOnderweg(null);
      if (!opnieuw && geenGebaar()) {
        opnieuw = true;
        naEersteGebaar(() => {
          if (!door && magNog()) spreek();
          else verder();
        });
        return;
      }
      vangnet = setTimeout(verder, Math.max(0, leestijd(zin) - (performance.now() - begin)));
    };
    const spreek = () => {
      begin = performance.now();
      zetOnderweg(zin);
      const uiting = new SpeechSynthesisUtterance(zin);
      uiting.lang = stem.lang ?? "nl-NL";
      uiting.rate = TEMPO;
      uiting.pitch = TOONHOOGTE;
      uiting.voice = stem;
      koppelWoorden(uiting, zin);
      uiting.onstart = () => {
        meldBrowserZin(zin);
        meld(true);
      };
      uiting.onend = verder;
      uiting.onerror = heelUitpraten ? naFout : verder;
      vangnet = setTimeout(verder, 2500 + zin.length * 120);
      window.speechSynthesis.speak(uiting);
    };
    spreek();
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
      zetOnderweg(zinnen[i]);
      bijZin(i);
      speelVanServer(
        zinnen[i],
        mijnBeurt,
        () => volgende(i + 1),
        (kapot, browser) => {
          if (gestopt || mijnBeurt !== beurt) return;
          /* Nog niet bewaard: deze ene zin met de browserstem, daarna gewoon verder (27 oktober 2026). */
          if (alleenServerStem) {
            /* Geen browserstem in deze les: deze zin stil (de tekst staat er), daarna weer met Ruth verder. */
            zetOnderweg(null);
            gestart = true;
            klok = setTimeout(() => volgende(i + 1), 900 + zinnen[i].length * 55);
            return;
          }
          if (browser) {
            gestart = true;
            spreekMetBrowser(zinnen[i], () => mijnBeurt === beurt && !gestopt, () => volgende(i + 1));
            return;
          }
          /* Heel uitpraten: nog geen tik gehad (geen geluid toegestaan), dan deze zin bij de eerste tik opnieuw. */
          if (heelUitpraten && !kapot && geenGebaar()) {
            zetOnderweg(null);
            naEersteGebaar(() => volgende(i));
            return;
          }
          /* Is de server kapot bij de eerste zin, dan alles met de browserstem; anders gewoon door op de klok. */
          if (!gestart && kapot) browserReeks();
          else {
            zetOnderweg(null);
            klok = setTimeout(() => opDeKlok(i + 1), 900 + zinnen[i].length * 55);
          }
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
  if (alleenServerStem) {
    zetOnderweg(null);
    klok = setTimeout(() => opDeKlok(0), 0);
    return;
  }
  const kanPraten = typeof window !== "undefined" && !!window.speechSynthesis;
  if (!metGeluid || !kanPraten) {
    zetOnderweg(null);
    klok = setTimeout(() => opDeKlok(0), 0);
    return;
  }

  window.speechSynthesis.cancel();
  void stemmenGereed().then(() => {
    if (gestopt || mijnBeurt !== beurt) return;
    /* Geen Nederlandse stem: de zinnen lopen zonder geluid, op de klok. */
    if (!gekozen) {
      zetOnderweg(null);
      opDeKlok(0);
      return;
    }
    const opnieuwGehad = new Set<number>();
    const volgende = (i: number) => {
      if (gestopt || mijnBeurt !== beurt) return;
      if (i >= zinnen.length) {
        meld(false);
        klaar();
        return;
      }
      const begin = performance.now();
      zetOnderweg(zinnen[i]);
      const uiting = new SpeechSynthesisUtterance(zinnen[i]);
      uiting.lang = gekozen?.lang ?? "nl-NL";
      uiting.rate = TEMPO;
      uiting.pitch = TOONHOOGTE;
      if (gekozen) uiting.voice = gekozen;
      koppelWoorden(uiting, zinnen[i]);
      let door = false;
      const verder = () => {
        if (door) return;
        door = true;
        clearTimeout(klok);
        volgende(i + 1);
      };
      uiting.onstart = () => {
        meldBrowserZin(zinnen[i]);
        meld(true);
      };
      bijZin(i);
      uiting.onend = () => {
        stopVoorlezen();
        verder();
      };
      /* Heel uitpraten: een fout is niet "klaar". Nog geen tik gehad: bij de eerste tik opnieuw; anders de leestijd. */
      uiting.onerror = heelUitpraten
        ? () => {
            if (door || gestopt || mijnBeurt !== beurt) return;
            zetOnderweg(null);
            clearTimeout(klok);
            if (!opnieuwGehad.has(i) && geenGebaar()) {
              opnieuwGehad.add(i);
              door = true;
              naEersteGebaar(() => volgende(i));
              return;
            }
            klok = setTimeout(verder, Math.max(0, leestijd(zinnen[i]) - (performance.now() - begin)));
          }
        : verder;
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
  onderweg = null;
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

/*
  De nagebouwde lessen (28 oktober 2026, besluit eigenaar): alleen de bewaarde stem
  van Ruth, nooit de browserstem. Ontbreekt een zin, dan blijft het stil en loopt de
  tekst gewoon door (scripts/stemlessen.mjs zorgt dat alles er is). De naam van het
  kind gaat mee, zodat de server de zin zonder naam + het naamfragment kan geven.
*/
/*
  30 oktober 2026 (besluit eigenaar): eerst stond hier true (nergens de browserstem).
  Maar in de 49 lessen die niet in Synthesis-stijl zijn, hebben nog ongeveer 2.400
  zinnen geen stem van Ruth; die bleven stil en de les sprong door. Daarom TIJDELIJK
  weer false: alleen voor een zin zonder Ruth-bestand leest de browser hem voor.
  De 10 lessen in Synthesis-stijl zetten zelf alleenServer (zetLesStem): daar nooit
  de browserstem. Zodra alle zinnen een Ruth-bestand hebben, weer op true.
*/
export const NOOIT_BROWSERSTEM = false;
let alleenServerStem = NOOIT_BROWSERSTEM;
let stemNaam = "";
export function zetLesStem(o: { alleenServer: boolean; naam?: string; heelUitpraten?: boolean; woordenMee?: boolean }): void {
  alleenServerStem = NOOIT_BROWSERSTEM || o.alleenServer;
  stemNaam = (o.naam ?? "").trim();
  heelUitpraten = o.heelUitpraten === true;
  woordenMee = o.woordenMee === true;
}

const adres = (zin: string) => `${SERVER_PAD}?zin=${encodeURIComponent(zin)}${stemNaam ? `&naam=${encodeURIComponent(stemNaam)}` : ""}`;

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

// ---------------------------------------------------------------------------
// Antwoordkeuzes voorlezen (30 oktober 2026, opdracht eigenaar)
// ---------------------------------------------------------------------------

/*
  Bliepo leest de keuzes niet vooraf voor, alleen de vraag. Een keuze klinkt pas
  als het kind erom vraagt: muis erop (300 ms), lang indrukken (tablet, telefoon),
  toetsenbordfocus of het luidsprekertje (components/les/keuzestem.tsx). Altijd de
  stem van Ruth (een hele keuze als bestand, of anders losse stukjes zoals "7",
  "plus", "is"; zie app/api/stem/route.ts). Nooit de browserstem: ontbreekt het
  bestand, dan blijft het stil.

  Bliepo praat nooit door een keuze heen: praat hij nog, dan klinkt de keuze niet.
  Begint hij te praten, dan stopt de keuze. Een nieuwe keuze stopt de vorige.
*/
let keuzeGeluid: HTMLAudioElement | null = null;
let keuzeReeks = 0;
const keuzeBuffer = new Map<string, Promise<Blob | null>>();

function haalKeuze(tekst: string): Promise<Blob | null> {
  let p = keuzeBuffer.get(tekst);
  if (!p) {
    p = fetch(`${adres(tekst)}&keuze=1`)
      .then((r) => (r.ok ? r.blob() : null))
      .catch(() => null);
    keuzeBuffer.set(tekst, p);
    void p.then((b) => {
      if (!b) keuzeBuffer.delete(tekst);
    });
  }
  return p;
}

export function stopKeuzeStem(): void {
  keuzeReeks += 1;
  /* Met de optie heel uitpraten alleen afbreken als de browser echt een keuze voorleest (niet Bliepo's eigen zin). */
  if (!alleenServerStem && typeof window !== "undefined" && (!heelUitpraten || keuzeBrowserBezig)) window.speechSynthesis?.cancel();
  keuzeBrowserBezig = false;
  keuzeGeluid?.pause();
  keuzeGeluid = null;
}

function speelKeuze(tekst: string, reeks: number): Promise<void> {
  return haalKeuze(tekst).then(
    (blob) =>
      new Promise<void>((klaar) => {
        if (reeks !== keuzeReeks || praatNu) return klaar();
        /*
          Nog geen Ruth-bestand voor deze keuze: in lessen waar de browserstem mag
          (de nieuwe Squla-lessen, en voorlopig de lessen buiten Synthesis-stijl)
          leest de browser hem voor. Anders blijft het stil.
        */
        if (!blob) {
          if (alleenServerStem || typeof window === "undefined" || !window.speechSynthesis) return klaar();
          void stemmenGereed().then(() => {
            if (reeks !== keuzeReeks || praatNu || !gekozen) return klaar();
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(tekst);
            u.lang = gekozen.lang ?? "nl-NL";
            u.voice = gekozen;
            u.rate = TEMPO;
            u.pitch = TOONHOOGTE;
            u.onend = u.onerror = () => {
              keuzeBrowserBezig = false;
              klaar();
            };
            if (heelUitpraten) keuzeBrowserBezig = true;
            window.speechSynthesis.speak(u);
          });
          return;
        }
        const url = URL.createObjectURL(blob);
        const geluid = new Audio(url);
        keuzeGeluid = geluid;
        geluid.onended = geluid.onerror = () => {
          URL.revokeObjectURL(url);
          if (keuzeGeluid === geluid) keuzeGeluid = null;
          klaar();
        };
        void geluid.play().catch(() => klaar());
      }),
  );
}

/** Eén keuze voorlezen (stopt de vorige). Praat Bliepo nog, dan niets. */
export function zegKeuze(tekst: string): void {
  if (typeof window === "undefined" || praatNu || !tekst.trim()) return;
  stopKeuzeStem();
  void speelKeuze(tekst.trim(), keuzeReeks);
}

/** Alle keuzes één voor één (het luidsprekertje). */
export async function zegKeuzesNaElkaar(teksten: string[]): Promise<void> {
  if (typeof window === "undefined" || praatNu) return;
  stopKeuzeStem();
  const reeks = keuzeReeks;
  teksten.forEach((t) => void haalKeuze(t.trim()));
  for (const t of teksten) {
    if (reeks !== keuzeReeks || praatNu) return;
    await speelKeuze(t.trim(), reeks);
    await new Promise((r) => setTimeout(r, 350));
  }
}

/** Alvast ophalen, zodat de keuze meteen klinkt als het kind erom vraagt. */
export function haalKeuzesAlvast(teksten: string[]): void {
  if (typeof window === "undefined") return;
  for (const t of teksten) if (t.trim()) void haalKeuze(t.trim());
}
