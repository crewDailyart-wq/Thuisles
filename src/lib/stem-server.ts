import "server-only";

/**
 * De stem van Bliepo op de server (22 oktober 2026, opdracht eigenaar).
 *
 * Sinds 22 oktober 2026 (keuze eigenaar) praat Bliepo met de stem "Ruth" van
 * ElevenLabs, model eleven_v4 (zie `maakStukEleven`). Fish Audio met de stem
 * "Sanne" is de reserve; daaronder staat wat voor Fish Audio is gemeten.
 *
 * Fish Audio: stem "Sanne", model drama-3.
 *
 * Instellingen (gemeten op 101 zinnen, 22 oktober 2026): temperature 0,7,
 * top_p 0,7, herhalingsrem 1,2, latency normal. Met de website-instellingen
 * (temperature 1, top_p 0,95) gingen 10 van de 101 zinnen fout bij het
 * terugluisteren, hiermee 5; de stem varieert bijna even veel in toon (even
 * levendig) maar wisselt minder tussen twee opnames.
 *
 * Klank: volume 0, onbewerkt geluid (wav) van Fish Audio, daarna een
 * de-esser voor een zachtere s, alles even hard (-16 LUFS) en mp3 van
 * 192 kbps (lib/stem-klank.ts).
 *
 * Toon en tempo hangen af van de groep van het kind:
 *   - groep 1-2: rustig, langzaam en heel lief (tempo 0,85);
 *   - groep 3-5: warm, vrolijk en duidelijk (tempo 0,9);
 *   - groep 6-8: vriendelijk, niet kinderachtig (tempo 0,95).
 * De toon gaat via een aanwijzing tussen [haken] vóór de zin. Drama-3 leest
 * die niet voor en gemeten maakt hij de stem warmer, levendiger en
 * Nederlandser (zonder aanwijzing 9 fouten op 101, met 6); het tempo regelt de
 * aanwijzing niet, dat doet `prosody.speed`.
 *
 * Fish Audio heeft geen taalinstelling voor de stem zelf: het veld `language`
 * gaat alleen over het omzetten van getallen, en daar zit Nederlands niet
 * bij. Dat omzetten doen we daarom zelf (`voorStem`), en woorden die steeds
 * buitenlands klinken krijgen een andere spelling (lib/stem-uitspraak.ts).
 *
 * Geen woord overslaan, geen verkeerd woord:
 *   1. de tekst gaat eerst door `voorStem` (getallen en tekens voluit);
 *   2. hij wordt in korte zinnen geknipt; elke zin wordt los gemaakt;
 *   3. van elke zin worden 2 versies gemaakt en teruggeluisterd via Fish Audio
 *      spraak naar tekst (transcribe-1), woord voor woord vergeleken;
 *   4. de versie zonder fouten wint; hebben ze allebei fouten, dan komen er
 *      nieuwe versies bij, tot hoogstens 4;
 *   5. alleen zinnen die de controle doorstaan, worden bewaard. Lukt het niet,
 *      dan komt de zin op het lijstje op /voorbeeld-bliepo en praat Bliepo die
 *      ene keer met de oude Fish Audio-stem.
 *
 * Alle instellingen staan als variabelen in Railway (zie `instellingen`), zodat
 * er zonder nieuwe code van stem of instelling gewisseld kan worden.
 */

import { AsyncLocalStorage } from "node:async_hooks";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { knipInZinnen, vergelijkZin, voorStem } from "@/lib/stemtekst";
import { bewerkKlank, bewerkKlankMetBegin, bewerkStem, GEKOZEN_DE_ESSER, KLANK_VERSIE, leesPcm } from "@/lib/stem-klank";
import { UITSPRAAK_VERSIE, voorUitspraak } from "@/lib/stem-uitspraak";
import { elevenVoorLive } from "@/lib/tutor/gebruik";

export const MAP = path.join(path.dirname(process.env.THUISLES_DB ?? path.join(process.cwd(), "data", "thuisles.db")), "stem");
/** Langer dan dit is geen zin van Bliepo meer; dat maken we niet. */
export const MAX_LENGTE = 500;

// ---------------------------------------------------------------------------
// Instellingen (Railway-variabelen)
// ---------------------------------------------------------------------------

export type Profiel = "1-2" | "3-5" | "6-8";

const getal = (naam: string, standaard: number) => {
  const waarde = Number(process.env[naam]);
  return process.env[naam] !== undefined && process.env[naam] !== "" && Number.isFinite(waarde) ? waarde : standaard;
};
const tekst = (naam: string, standaard: string) => process.env[naam] ?? standaard;

const STANDAARD_TOON: Record<Profiel, string> = {
  "1-2": "[heel rustig, langzaam en lief, zoals een juf die met een kleuter praat]",
  "3-5": "[warm, vrolijk en duidelijk, zoals een lieve juf]",
  "6-8": "[vriendelijk en enthousiast, als een coole oudere zus, niet kinderachtig]",
};
const STANDAARD_TEMPO: Record<Profiel, number> = { "1-2": 0.85, "3-5": 0.9, "6-8": 0.95 };

export function profielVoor(groep: number): Profiel {
  if (groep <= 2) return "1-2";
  if (groep <= 5) return "3-5";
  return "6-8";
}

/**
 * Welke stemdienst Bliepo gebruikt (STEM_DIENST). Sinds 22 oktober 2026
 * ElevenLabs met de stem "Ruth" (keuze eigenaar); Fish Audio is de reserve.
 * Zonder STEM_DIENST: ElevenLabs als daar een sleutel en stem voor zijn.
 */
export type Dienst = "elevenlabs" | "fish";

export function hoofdDienst(): Dienst {
  const gekozen = process.env.STEM_DIENST;
  if (gekozen === "fish" || gekozen === "elevenlabs") return gekozen;
  return process.env.ELEVEN_API_KEY && process.env.ELEVEN_STEM_ID ? "elevenlabs" : "fish";
}

/*
  Toon per groep bij ElevenLabs (Eleven v4). V4 heeft geen tempo-instelling
  ("Style and Speed sliders are not available in Eleven v4"), dus toon én
  tempo gaan via een aanwijzing tussen [haken]. Gemeten op vier zinnen
  (22 oktober 2026): groep 1-2 duurde 12,9 s, groep 3-5 11,4 s, groep 6-8
  10,7 s, zonder aanwijzing 10,2 s; geen aanwijzing werd voorgelezen.
*/
/*
  Goedkoper (23 oktober 2026, opdracht eigenaar): de aanwijzing telt bij
  ElevenLabs mee als tekens, en bij een kort zinnetje als "Goed zo." was hij
  langer dan de zin zelf. Korte aanwijzingen, gemeten op tien zinnen met
  eleven_v4_turbo: groep 1-2 31,3 s (lang was 28,9 s: nog iets rustiger),
  groep 3-5 24,2 s, groep 6-8 24,1 s; alle tien woord voor woord verstaan.
*/
const ELEVEN_TOON: Record<Profiel, string> = {
  "1-2": "[slowly and gently]",
  "3-5": "[warm and cheerful]",
  "6-8": "[friendly and clear]",
};

/* De aanwijzingen en het model tot 23 oktober 2026: zinnen die daarmee al gemaakt zijn, blijven bruikbaar. */
const ELEVEN_TOON_VORIG: Record<Profiel, string> = {
  "1-2": "[slowly, softly and very kindly, like a gentle kindergarten teacher]",
  "3-5": "[warm and cheerful, like a kind teacher]",
  "6-8": "[friendly and clear, natural pace, not childish]",
};

/*
  Model (23 oktober 2026): eleven_v4_turbo kost de helft van de tekens van
  eleven_v4 (character_cost_multiplier 0,5) en is ruim twee keer zo snel.
  Gemeten met Ruth op tien zinnen: allebei 10 van 10 woord voor woord
  verstaan, en precies even lang (25,0 s), dus dezelfde toon en hetzelfde
  tempo. Het duurdere model is daarom nergens meer nodig; ELEVEN_MODEL kan
  het terugzetten.
*/
const ELEVEN_MODEL = "eleven_v4_turbo";

/** Hoeveel tekens een model per teken rekent. */
const tekenPrijs = (model: string) => (/turbo|flash|conversational/.test(model) ? 0.5 : 1);

/** De stem voor één groep, bij één dienst. Null als er geen sleutel of stem is. */
export function instellingen(profiel: Profiel, dienst: Dienst = hoofdDienst()) {
  const achter = profiel.replace("-", "_");
  /* Spraak naar tekst (de controle) loopt altijd via Fish Audio. */
  const sleutel = process.env.FISH_API_KEY ?? "";
  const controle = tekst("FISH_CONTROLE", "aan") !== "uit" && Boolean(sleutel);
  if (dienst === "elevenlabs") {
    const elevenSleutel = process.env.ELEVEN_API_KEY;
    const stem = process.env.ELEVEN_STEM_ID;
    if (!elevenSleutel || !stem) return null;
    return {
      dienst,
      sleutel,
      elevenSleutel,
      stem,
      model: tekst("ELEVEN_MODEL", ELEVEN_MODEL),
      stabiliteit: getal("ELEVEN_STABILITEIT", 0.5),
      gelijkenis: getal("ELEVEN_GELIJKENIS", 0.75),
      formaat: tekst("ELEVEN_FORMAAT", "pcm_24000"),
      temperature: 0,
      top_p: 0,
      herhaling: 0,
      latency: "",
      volume: 0,
      tempo: 1,
      deEsser: tekst("ELEVEN_DE_ESSER", "aan") !== "uit",
      toon: tekst(`ELEVEN_TOON_GROEP_${achter}`, ELEVEN_TOON[profiel]).trim(),
      controle,
    };
  }
  const stem = process.env.FISH_STEM_ID;
  if (!sleutel || !stem) return null;
  return {
    dienst,
    sleutel,
    elevenSleutel: "",
    stem,
    model: tekst("FISH_MODEL", "drama-3"),
    stabiliteit: 0,
    gelijkenis: 0,
    formaat: "wav",
    temperature: getal("FISH_TEMPERATURE", 0.7),
    top_p: getal("FISH_TOP_P", 0.7),
    herhaling: getal("FISH_HERHALING", 1.2),
    latency: tekst("FISH_LATENCY", "normal"),
    volume: getal("FISH_VOLUME", 0),
    deEsser: tekst("FISH_DE_ESSER", "aan") !== "uit",
    tempo: getal(`FISH_TEMPO_GROEP_${achter}`, STANDAARD_TEMPO[profiel]),
    toon: tekst(`FISH_TOON_GROEP_${achter}`, STANDAARD_TOON[profiel]).trim(),
    controle,
  };
}

export type Instellingen = NonNullable<ReturnType<typeof instellingen>>;

/**
 * De oude stem (tot 22 oktober 2026): de terugval als de nieuwe een keer niet
 * lukt. Zelfde instellingen als toen, zodat de zinnen die toen zijn gemaakt
 * hier gewoon weer gevonden worden.
 */
function oudeStem() {
  const sleutel = process.env.FISH_API_KEY;
  const stem = process.env.FISH_OUD_STEM_ID;
  if (!sleutel || !stem) return null;
  return { sleutel, stem, model: tekst("FISH_OUD_MODEL", "s2-pro"), snelheid: getal("FISH_OUD_SNELHEID", 0.88) || 1 };
}

// ---------------------------------------------------------------------------
// Bestanden
// ---------------------------------------------------------------------------

const hash = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 32);

/** Alles wat het geluid bepaalt, zodat een andere instelling een ander bestand geeft. */
function kenmerk(s: Instellingen) {
  if (s.dienst === "elevenlabs") {
    return JSON.stringify([5, "elevenlabs", KLANK_VERSIE, s.deEsser, s.model, s.stem, s.stabiliteit, s.gelijkenis, s.formaat, s.toon]);
  }
  return JSON.stringify([4, UITSPRAAK_VERSIE, KLANK_VERSIE, s.deEsser, s.model, s.stem, s.temperature, s.top_p, s.herhaling, s.latency, s.volume, s.tempo, s.toon]);
}

/** Het bestand van een hele zin met de nieuwe stem. */
export function zinBestand(zin: string, s: Instellingen) {
  const naam = `z-${hash(`${kenmerk(s)}\n${voorStem(zin)}`)}`;
  return { naam, bestand: path.join(MAP, `${naam}.mp3`) };
}

/**
 * Dezelfde zin, gemaakt met Ruth vóór 23 oktober 2026 (eleven_v4, lange
 * aanwijzing). Die is al betaald en goedgekeurd: nooit opnieuw maken wat al
 * bestaat en goed is.
 */
function vorigBestand(zin: string, s: Instellingen) {
  if (s.dienst !== "elevenlabs") return null;
  const profiel = (Object.keys(ELEVEN_TOON) as Profiel[]).find((p) => ELEVEN_TOON[p] === s.toon || ELEVEN_TOON_VORIG[p] === s.toon);
  if (!profiel) return null;
  const vorig = { ...s, model: "eleven_v4", toon: ELEVEN_TOON_VORIG[profiel] };
  if (vorig.model === s.model && vorig.toon === s.toon) return null;
  return zinBestand(zin, vorig).bestand;
}

function stukBestand(stuk: string, s: Instellingen) {
  const naam = `s-${hash(`${kenmerk(s)}\n${stuk}`)}`;
  return { naam, bestand: path.join(MAP, "stukken", `${naam}.mp3`) };
}

/** Precies zoals tot 22 oktober 2026, zodat de bewaarde zinnen van de oude stem blijven horen bij hun zin. */
function oudBestand(zin: string, o: NonNullable<ReturnType<typeof oudeStem>>) {
  const tempo = o.snelheid !== 1 ? `\nsnelheid ${o.snelheid}` : "";
  const naam = hash(`${o.model}\n${o.stem}\n${zin}${tempo}`);
  return { naam, bestand: path.join(MAP, `${naam}.mp3`) };
}

async function bewaar(bestand: string, data: Buffer) {
  await mkdir(path.dirname(bestand), { recursive: true });
  const tijdelijk = `${bestand}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tijdelijk, data);
  await rename(tijdelijk, bestand);
}

const lees = (bestand: string) => readFile(bestand).catch(() => null);

// ---------------------------------------------------------------------------
// Fish Audio
// ---------------------------------------------------------------------------

/** Maakt één stuk geluid. Geeft het geluid of een foutcode. */
async function tts(body: Record<string, unknown>, sleutel: string, model: string): Promise<Buffer | number> {
  /* Voor nu geen betaalde stem voor nieuwe zinnen (27 oktober 2026, STEM_NIEUWE_ZINNEN); 409 = "doe het met de browser". */
  if (nieuweZinnenMetBrowser()) return 409;
  const antwoord = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: { Authorization: `Bearer ${sleutel}`, "Content-Type": "application/json", model },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
  }).catch(() => null);
  if (!antwoord) return 504;
  if (!antwoord.ok) {
    console.error(`[stem] Fish Audio gaf ${antwoord.status}: ${(await antwoord.text().catch(() => "")).slice(0, 200)}`);
    return antwoord.status;
  }
  return Buffer.from(await antwoord.arrayBuffer());
}

/**
 * Maakt één stuk. Fish Audio levert onbewerkt geluid (wav, 44,1 kHz); daarna
 * gaat het door de de-esser (zachtere s), wordt het even hard gemaakt en als
 * mp3 van 192 kbps bewaard (lib/stem-klank.ts). De controle luistert naar dit
 * eindresultaat.
 */
async function maakStuk(stuk: string, s: Instellingen): Promise<Buffer | number> {
  if (s.dienst === "elevenlabs") return maakStukEleven(stuk, s);
  /* De uitspraaklijst alleen voor wat Fish Audio krijgt; de controle vergelijkt met de gewone zin. */
  const uitspraak = voorUitspraak(stuk);
  const wav = await tts(
    {
      text: s.toon ? `${s.toon} ${uitspraak}` : uitspraak,
      reference_id: s.stem,
      format: "wav",
      sample_rate: 44100,
      latency: s.latency,
      temperature: s.temperature,
      top_p: s.top_p,
      repetition_penalty: s.herhaling,
      normalize: false,
      prosody: { speed: s.tempo, volume: s.volume },
    },
    s.sleutel,
    s.model,
  );
  if (typeof wav === "number") return wav;
  try {
    return bewerkStem(wav, s.deEsser ? GEKOZEN_DE_ESSER : null);
  } catch (fout) {
    console.error("[stem] bewerken lukte niet:", fout);
    return 500;
  }
}

/**
 * Eén stuk bij ElevenLabs: model, stem, stabiliteit en gelijkenis precies
 * zoals in de proef van de eigenaar (geschiedenis-ID UKoJSen5xE2ujUjW2Mtg:
 * eleven_v4, stabiliteit 0,5, gelijkenis 0,75). Taal Nederlands. Ruw geluid
 * (pcm 24 kHz; 44,1 kHz kan pas vanaf het Pro-abonnement), daarna dezelfde
 * de-esser en even hard als bij Fish Audio. Geen uitspraaklijst: die is
 * gemeten voor Fish Audio.
 */
/*
  Het Starter-abonnement van ElevenLabs staat hooguit 3 verzoeken tegelijk toe
  (gemeten 23 oktober 2026: het vierde gaf 429). Zinnen die vooraf of voor het
  eerst gemaakt worden, gaan daarom met hooguit 2 tegelijk, zodat er altijd
  plek blijft voor een live antwoord; bij 429 even wachten en opnieuw.
*/
let elevenBezig = 0;
const elevenRij: (() => void)[] = [];
async function elevenBeurt<T>(klus: () => Promise<T>, live: boolean): Promise<T> {
  if (!live) {
    while (elevenBezig >= 2) await new Promise<void>((r) => elevenRij.push(r));
    elevenBezig++;
  }
  try {
    return await klus();
  } finally {
    if (!live) {
      elevenBezig--;
      elevenRij.shift()?.();
    }
  }
}

async function maakStukEleven(stuk: string, s: Instellingen, model = s.model, live = false): Promise<Buffer | number> {
  for (let poging = 0; ; poging++) {
    const uit = await elevenBeurt(() => maakStukElevenEenKeer(stuk, s, model), live);
    if (uit !== 429 || poging >= 3) return uit;
    await new Promise((r) => setTimeout(r, 800 * (poging + 1)));
  }
}

async function maakStukElevenEenKeer(stuk: string, s: Instellingen, model: string): Promise<Buffer | number> {
  /* Voor nu geen betaalde stem voor nieuwe zinnen (27 oktober 2026, STEM_NIEUWE_ZINNEN); 409 = "doe het met de browser". */
  if (nieuweZinnenMetBrowser()) return 409;
  const sr = Number(s.formaat.split("_")[1]) || 24000;
  const antwoord = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${s.stem}?output_format=${s.formaat}`, {
    method: "POST",
    headers: { "xi-api-key": s.elevenSleutel, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: s.toon ? `${s.toon} ${stuk}` : stuk,
      model_id: model,
      language_code: "nl",
      voice_settings: { stability: s.stabiliteit, similarity_boost: s.gelijkenis },
    }),
    signal: AbortSignal.timeout(45000),
  }).catch(() => null);
  if (!antwoord) return 504;
  if (!antwoord.ok) {
    console.error(`[stem] ElevenLabs gaf ${antwoord.status}: ${(await antwoord.text().catch(() => "")).slice(0, 200)}`);
    return antwoord.status;
  }
  try {
    return bewerkKlank(leesPcm(Buffer.from(await antwoord.arrayBuffer()), sr), s.deEsser ? GEKOZEN_DE_ESSER : null);
  } catch (fout) {
    console.error("[stem] bewerken lukte niet:", fout);
    return 500;
  }
}

/** Spraak naar tekst (transcribe-1): wat zegt het geluid? Null als het niet lukte. */
async function luister(data: Buffer, sleutel: string): Promise<string | null> {
  for (let poging = 0; poging < 2; poging++) {
    const formulier = new FormData();
    formulier.append("audio", new Blob([new Uint8Array(data)], { type: "audio/mpeg" }), "zin.mp3");
    formulier.append("language", "nl");
    formulier.append("ignore_timestamps", "true");
    if (nieuweZinnenMetBrowser()) return null;
    const antwoord = await fetch("https://api.fish.audio/v1/asr", {
      method: "POST",
      headers: { Authorization: `Bearer ${sleutel}`, model: "transcribe-1" },
      body: formulier,
      signal: AbortSignal.timeout(20000),
    }).catch(() => null);
    if (antwoord?.ok) {
      const json = (await antwoord.json().catch(() => null)) as { text?: string } | null;
      if (typeof json?.text === "string") return json.text;
    }
    if (antwoord && antwoord.status < 500 && antwoord.status !== 429) return null;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Lijstje en teller (voor /voorbeeld-bliepo en het rapport)
// ---------------------------------------------------------------------------

export type Mislukt = { zin: string; stuk: string; groep: Profiel; gehoord: string; mist: string[]; tijd: string };
type Teller = { gemaakt: number; opnieuw: number; mislukt: number; sinds: string };

const LIJST = () => path.join(MAP, "mislukt.json");
const TELLER = () => path.join(MAP, "teller.json");

let schrijfrij: Promise<unknown> = Promise.resolve();
/** Eén schrijver tegelijk voor de kleine JSON-bestanden. */
function opDeRij<T>(klus: () => Promise<T>): Promise<T> {
  const volgende = schrijfrij.then(klus, klus);
  schrijfrij = volgende.catch(() => {});
  return volgende;
}

export async function leesMislukt(): Promise<Mislukt[]> {
  const ruw = await readFile(LIJST(), "utf8").catch(() => "[]");
  try {
    return JSON.parse(ruw) as Mislukt[];
  } catch {
    return [];
  }
}

function zetMislukt(zin: string, groep: Profiel, regel: Mislukt | null) {
  return opDeRij(async () => {
    const lijst = (await leesMislukt()).filter((m) => !(m.zin === zin && m.groep === groep));
    if (regel) lijst.unshift(regel);
    await bewaar(LIJST(), Buffer.from(JSON.stringify(lijst.slice(0, 200), null, 1)));
  });
}

export async function leesTeller(): Promise<Teller> {
  const ruw = await readFile(TELLER(), "utf8").catch(() => "");
  try {
    return JSON.parse(ruw) as Teller;
  } catch {
    return { gemaakt: 0, opnieuw: 0, mislukt: 0, sinds: new Date().toISOString() };
  }
}

function tel(veld: "gemaakt" | "opnieuw" | "mislukt", aantal = 1) {
  return opDeRij(async () => {
    const t = await leesTeller();
    t[veld] += aantal;
    await bewaar(TELLER(), Buffer.from(JSON.stringify(t)));
  });
}

// ---------------------------------------------------------------------------
// Een zin maken: knippen, maken, controleren, bewaren
// ---------------------------------------------------------------------------

/**
 * Elke zin wordt in twee versies tegelijk gemaakt; beide worden
 * teruggeluisterd en de versie zonder fouten wint. Hebben ze allebei fouten,
 * dan komen er nieuwe versies bij, tot hoogstens 4 in totaal.
 */
const HOOGSTENS = 4;
/*
  Bij ElevenLabs één versie per ronde: het tegoed is per teken (Starter:
  40.000 per maand) en Ruth haalde de controle in de proef meteen. Bij Fish
  Audio twee tegelijk (gemeten nodig, en goedkoop).
*/
const perRonde = (s: Instellingen) => (s.dienst === "elevenlabs" ? 1 : 2);

type StukUitkomst = { data: Buffer; goed: true } | { data: Buffer | null; goed: false; code?: number; gehoord?: string; mist?: string[] };
/**
 * Eén versie van een stuk, met twee controles:
 *   - `streng`: alleen de versie zelf teruggeluisterd. Klinkt een woord
 *     Engels of Duits ("Hoi" als "Hej"), dan hoort de luisteraar dat.
 *   - `metDrager`: met een vaste Nederlandse zin ervoor. Bij een heel kort
 *     zinnetje ("Bijna.") weet de luisteraar anders niet dat het Nederlands is
 *     en schrijft hij onzin op ("beina"), ook als het goed klonk (gemeten
 *     22 oktober 2026: 21 van de 39 korte zinnetjes "fout" zonder drager, 0 met).
 */
type Versie = { data: Buffer; gehoord: string | null; streng: boolean; metDrager: boolean; mist: string[]; extra: string[] } | { code: number };

/** De vaste Nederlandse zin die bij de tweede controle voor een kort zinnetje gaat. */
const DRAGER = "Luister goed, dit is de volgende zin.";
let drager: Promise<Buffer | null> | null = null;

/** De dragerzin één keer maken en bewaren (alleen als hij zelf goed is teruggehoord). */
function haalDrager(s: Instellingen): Promise<Buffer | null> {
  drager ??= (async () => {
    const bestand = path.join(MAP, "drager.mp3");
    const bewaard = await lees(bestand);
    if (bewaard) return bewaard;
    for (let poging = 0; poging < 3; poging++) {
      const data = await maakStuk(DRAGER, s);
      if (typeof data === "number") return null;
      const gehoord = await luister(data, s.sleutel);
      if (gehoord !== null && vergelijkZin(DRAGER, gehoord).goed) {
        await bewaar(bestand, data);
        return data;
      }
    }
    return null;
  })().then((d) => {
    if (!d) drager = null;
    return d;
  });
  return drager;
}

async function maakVersie(stuk: string, s: Instellingen): Promise<Versie> {
  const data = await maakStuk(stuk, s);
  if (typeof data === "number") return { code: data };
  await tel("gemaakt");
  if (!s.controle) return { data, gehoord: null, streng: true, metDrager: true, mist: [], extra: [] };
  const gehoord = await luister(data, s.sleutel);
  if (gehoord === null) return { data, gehoord: null, streng: false, metDrager: false, mist: [], extra: [] };
  const uitslag = vergelijkZin(stuk, gehoord);
  if (uitslag.goed) return { data, gehoord, streng: true, metDrager: true, mist: [], extra: [] };
  /* Streng niet goed: nog eens luisteren met de Nederlandse dragerzin ervoor. */
  const d = await haalDrager(s);
  const metDrager = d ? await luister(Buffer.concat([d, data]), s.sleutel) : null;
  const tweede = metDrager !== null && vergelijkZin(`${DRAGER} ${stuk}`, metDrager).goed;
  console.warn(`[stem] streng fout: "${stuk}" → "${gehoord}"${tweede ? " (met drager wel goed)" : ""}`);
  return { data, gehoord, streng: false, metDrager: tweede, mist: uitslag.mist, extra: uitslag.extra };
}

/**
 * Eén stuk: twee versies tegelijk. Een versie die de strenge controle haalt,
 * wint meteen. Anders komen er nog twee bij (hoogstens 4). Haalt geen enkele
 * versie de strenge controle, dan telt een versie die met de dragerzin wel
 * helemaal goed is; is die er ook niet, dan is de zin mislukt.
 */
async function maakGecontroleerdStuk(stuk: string, s: Instellingen, opnieuw: boolean): Promise<StukUitkomst> {
  const { bestand } = stukBestand(stuk, s);
  if (!opnieuw) {
    const bewaard = await lees(bestand);
    if (bewaard) return { data: bewaard, goed: true };
  }
  const alle: Exclude<Versie, { code: number }>[] = [];
  for (let gemaakt = 0; gemaakt < HOOGSTENS; gemaakt += perRonde(s)) {
    if (gemaakt > 0) await tel("opnieuw");
    const versies = await Promise.all(Array.from({ length: perRonde(s) }, () => maakVersie(stuk, s)));
    const kapot = versies.find((v): v is { code: number } => "code" in v);
    if (kapot && versies.every((v) => "code" in v)) return { data: null, goed: false, code: kapot.code };
    for (const v of versies) if (!("code" in v)) alle.push(v);
    const streng = alle.find((v) => v.streng);
    if (streng) {
      await bewaar(bestand, streng.data);
      return { data: streng.data, goed: true };
    }
    /* De controle zelf lukte niet: niet blijven proberen. */
    if (alle.length && alle.every((v) => v.gehoord === null)) break;
  }
  const metDrager = alle.find((v) => v.metDrager);
  if (metDrager) {
    await bewaar(bestand, metDrager.data);
    return { data: metDrager.data, goed: true };
  }
  const beste = [...alle].sort((a, b) => a.mist.length + a.extra.length - (b.mist.length + b.extra.length))[0];
  if (!beste) return { data: null, goed: false };
  return {
    data: beste.data,
    goed: false,
    gehoord: beste.gehoord ?? "(controle lukte niet)",
    mist: beste.mist.length ? beste.mist : beste.extra.map((w) => `+${w}`),
  };
}

export type ZinUitkomst = { data: Buffer; goed: true } | { data: null; goed: false; code?: number };

/** Zinnen die nu gemaakt worden, zodat twee gelijke verzoeken maar één keer betalen. */
const bezig = new Map<string, Promise<ZinUitkomst>>();

/**
 * Een hele zin met de nieuwe stem: uit de bewaarde bestanden, of nieuw gemaakt
 * en gecontroleerd. `opnieuw` maakt alles opnieuw (knop "Opnieuw maken").
 */
export function maakZin(zin: string, profiel: Profiel, opnieuw = false, dienst: Dienst = hoofdDienst()): Promise<ZinUitkomst> {
  const s = instellingen(profiel, dienst);
  if (!s) return Promise.resolve({ data: null, goed: false, code: 503 });
  const { naam, bestand } = zinBestand(zin, s);
  const sleutel = `${naam}${opnieuw ? ":opnieuw" : ""}`;
  const lopend = bezig.get(sleutel);
  if (lopend) return lopend;

  const klus = (async (): Promise<ZinUitkomst> => {
    if (!opnieuw) {
      const bewaard = await lees(bestand);
      if (bewaard) return { data: bewaard, goed: true };
      const vorig = vorigBestand(zin, s);
      const eerder = vorig ? await lees(vorig) : null;
      if (eerder) return { data: eerder, goed: true };
    }
    const stukken = knipInZinnen(voorStem(zin));
    /* Altijd minstens ELEVEN_RESERVE tekens overhouden; anders Fish Audio (zinVoorKind). */
    if (s.dienst === "elevenlabs") {
      const nodig = Math.ceil(stukken.reduce((n, st) => n + st.length + s.toon.length + 1, 0) * tekenPrijs(s.model));
      if (!(await elevenVoorLive(nodig))) return { data: null, goed: false, code: 402 };
    }
    const uitkomsten = await Promise.all(stukken.map((stuk) => maakGecontroleerdStuk(stuk, s, opnieuw)));
    const fout = uitkomsten.findIndex((u) => !u.goed);
    if (fout >= 0) {
      const u = uitkomsten[fout];
      if (!u.goed && u.code) return { data: null, goed: false, code: u.code };
      if (!u.goed) {
        await tel("mislukt");
        await zetMislukt(zin, profiel, {
          zin,
          stuk: stukken[fout],
          groep: profiel,
          gehoord: u.gehoord ?? "",
          mist: u.mist ?? [],
          tijd: new Date().toISOString(),
        });
      }
      return { data: null, goed: false };
    }
    /* MP3 mag je achter elkaar plakken: elk stukje is een reeks losse frames. */
    const data = Buffer.concat(uitkomsten.map((u) => u.data as Buffer));
    await bewaar(bestand, data);
    await writeFile(path.join(MAP, `${naam}.txt`), `${zin}\n`).catch(() => {});
    await zetMislukt(zin, profiel, null);
    return { data, goed: true };
  })().finally(() => bezig.delete(sleutel));

  bezig.set(sleutel, klus);
  return klus;
}

/**
 * Welke stem maakt NIEUWE zinnen? (27 oktober 2026, opdracht eigenaar: voor nu
 * geen tegoed meer bij ElevenLabs of Fish Audio.)
 *
 *   STEM_NIEUWE_ZINNEN=browser  (standaard) nieuwe zinnen niet maken: de
 *                               browser leest ze voor met zijn eigen
 *                               Nederlandse stem; wat al met Ruth bewaard is,
 *                               klinkt gewoon met Ruth.
 *   STEM_NIEUWE_ZINNEN=dienst   zoals tot 27 oktober: nieuwe zinnen maken
 *                               met de gekozen stemdienst (STEM_DIENST).
 *
 * Wisselen naar een andere stem is dus alleen deze instelling (in Railway of
 * .env.local). Welke zinnen nog gemaakt moeten worden, staat in
 * STEMZINNEN.md (`npm run stemzinnen`) en in stem/nieuwe-zinnen.txt.
 */
export function nieuweZinnenMetBrowser(): boolean {
  /* Een vaste zin of een naamfragment die bewust gemaakt wordt (maakVast): dan wel met de stemdienst. */
  if (vastToegestaan.getStore()) return false;
  return (process.env.STEM_NIEUWE_ZINNEN ?? "browser") !== "dienst";
}

/*
  Vaste zinnen van de nagebouwde lessen (28 oktober 2026, opdracht eigenaar):
  elke zin één keer met Ruth maken en bewaren (bestandsnaam = hash van de zin),
  daarna kost afspelen niets. Alleen binnen `maakVast` mag de stemdienst nieuwe
  zinnen maken; een kind dat ergens anders een nieuwe zin hoort, start niets.
*/
const vastToegestaan = new AsyncLocalStorage<boolean>();

/** Een vaste zin maken (of de bewaarde teruggeven). Kost alleen tekens als hij er nog niet is. */
export function maakVast(zin: string, profiel: Profiel): Promise<ZinUitkomst> {
  return vastToegestaan.run(true, () => maakZin(zin, profiel));
}

/**
 * De naam van een kind als los stemfragment (28 oktober 2026). Eén keer per kind
 * gemaakt als de ouder het kind toevoegt of de naam verandert, daarna bewaard.
 * PRIVACY REVIEW REQUIRED: de voornaam van een kind gaat naar ElevenLabs (alleen
 * de voornaam, geen andere gegevens).
 */
export const naamZin = (naam: string) => `${naam.trim()}!`;

export function maakNaamFragment(naam: string, profiel: Profiel): Promise<ZinUitkomst> {
  return maakVast(naamZin(naam), profiel);
}

/** Haalt de naam uit een zin: "Knap gedaan, Sara." → "Knap gedaan." (null als de naam er niet in staat). */
export function zonderNaam(zin: string, naam: string): string | null {
  const n = naam.trim();
  if (!n) return null;
  const veilig = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^\\p{L}])${veilig}(?=$|[^\\p{L}])`, "u");
  if (!re.test(zin)) return null;
  return zin
    .replace(new RegExp(`,\\s*${veilig}(?=[.!?,])`, "u"), "")
    .replace(new RegExp(`^${veilig},?\\s*`, "u"), "")
    .replace(new RegExp(`\\s*${veilig}(?=[.!?,])`, "u"), "")
    .replace(/\s+([.!?,])/g, "$1")
    .replace(/^\s*(\p{Ll})/u, (_m, x: string) => x.toUpperCase())
    .trim();
}

/*
  De audio in de site zelf (30 oktober 2026, opdracht eigenaar): public/stem, met
  de site meegebouwd, zodat de online opslagschijf niet voller wordt. Naam = hash
  van groepsprofiel + zin. scripts/stem-naar-site.mjs vult de map; staat een zin
  daar niet, dan wordt nog op de schijf (data/stem) gekeken.
*/
const SITE_MAP = path.join(process.cwd(), "public", "stem");
export const siteNaam = (zin: string, profiel: Profiel) => createHash("sha256").update(`${profiel}\n${zin}`).digest("hex").slice(0, 32);

/** De zin zoals hij al met de hoofdstem (Ruth) bewaard is, of null. Maakt niets nieuws. */
export async function bewaardeZin(zin: string, profiel: Profiel): Promise<Buffer | null> {
  const inSite = await lees(path.join(SITE_MAP, `${siteNaam(zin, profiel)}.mp3`));
  if (inSite) return inSite;
  const s = instellingen(profiel);
  if (!s) return null;
  const bewaard = await lees(zinBestand(zin, s).bestand);
  if (bewaard) return bewaard;
  const vorig = vorigBestand(zin, s);
  return vorig ? await lees(vorig) : null;
}

/** Een zin die nog met de gekozen stem gemaakt moet worden, één keer onthouden (stem/nieuwe-zinnen.txt). */
const alGenoteerd = new Set<string>();
export async function noteerNieuweZin(zin: string): Promise<void> {
  if (alGenoteerd.has(zin)) return;
  alGenoteerd.add(zin);
  const bestand = path.join(MAP, "nieuwe-zinnen.txt");
  const huidig = (await readFile(bestand, "utf8").catch(() => "")).split("\n");
  if (huidig.includes(zin)) return;
  await mkdir(MAP, { recursive: true }).catch(() => {});
  await writeFile(bestand, `${zin}\n`, { flag: "a" }).catch(() => {});
}

/** De zin met de oude stem: bewaard, of nieuw gemaakt (en dan ook bewaard). */
export async function oudeZin(zin: string): Promise<Buffer | number> {
  const o = oudeStem();
  if (!o) return 503;
  const { naam, bestand } = oudBestand(zin, o);
  const bewaard = await lees(bestand);
  if (bewaard) return bewaard;
  const data = await tts(
    { text: voorStem(zin), reference_id: o.stem, format: "mp3", latency: "normal", ...(o.snelheid !== 1 && { prosody: { speed: o.snelheid } }) },
    o.sleutel,
    o.model,
  );
  if (typeof data === "number") return data;
  await bewaar(bestand, data);
  await writeFile(path.join(MAP, `${naam}.txt`), `${zin}\n`).catch(() => {});
  return data;
}

/**
 * De zin voor een kind: de hoofdstem als die op tijd klaar is, anders (of
 * als hij niet lukt) Fish Audio en daarna de oude stem. Wat niet op tijd klaar was, wordt op de
 * achtergrond gewoon afgemaakt en bewaard, zodat het de volgende keer wel de
 * nieuwe stem is.
 */
export async function zinVoorKind(zin: string, profiel: Profiel, wachtMs: number): Promise<Buffer | number> {
  const wacht = <T,>(p: Promise<T>, ms: number) => Promise.race([p, new Promise<null>((klaar) => setTimeout(() => klaar(null), ms))]);
  const dienst = hoofdDienst();
  const nieuw = maakZin(zin, profiel, false, dienst);
  const opTijd = await wacht(nieuw, wachtMs);
  if (opTijd?.goed) return opTijd.data;
  /* De reserve: is de hoofdstem ElevenLabs, dan eerst Fish Audio (Sanne), daarna de oude stem. */
  if (dienst === "elevenlabs" && instellingen(profiel, "fish")) {
    const reserve = await wacht(maakZin(zin, profiel, false, "fish"), wachtMs);
    if (reserve?.goed) return reserve.data;
  }
  const oud = await oudeZin(zin);
  if (typeof oud !== "number") return oud;
  /* Ook de oude stem lukt niet: dan nog even op de nieuwe wachten. */
  const toch = await nieuw;
  if (toch.goed) return toch.data;
  return toch.code ?? oud;
}

// ---------------------------------------------------------------------------
// Alles opnieuw maken met de nieuwe stem
// ---------------------------------------------------------------------------

export type Voortgang = { bezig: boolean; klaar: number; totaal: number; mislukt: number; begonnen: string | null; map: string | null };
const voortgang: Voortgang = { bezig: false, klaar: 0, totaal: 0, mislukt: 0, begonnen: null, map: null };
export const leesVoortgang = () => ({ ...voortgang });

/**
 * Is dit een antwoordkeuze (een knop) in plaats van een zin? Knoppen hebben
 * geen punt, vraagteken of uitroepteken en zijn hooguit vier woorden: "12",
 * "elf", "Snel", "Ja, graag". Alles wat Bliepo zelf zegt, eindigt met een
 * leesteken. Sinds 22 oktober 2026 leest Bliepo de keuzes niet meer voor
 * (opdracht eigenaar).
 */
export function isAntwoordkeuze(zin: string): boolean {
  const z = zin.trim();
  return !/[.!?…]$/.test(z) && z.split(/\s+/).length <= 4;
}

/** Alle zinnen die ooit zijn bewaard (de .txt naast elk geluid), met hun bestandsnaam. */
async function bewaardeZinnen(): Promise<{ naam: string; zin: string }[]> {
  const namen = await readdir(MAP).catch(() => [] as string[]);
  const uit: { naam: string; zin: string }[] = [];
  for (const naam of namen) {
    if (!naam.endsWith(".txt")) continue;
    const zin = (await readFile(path.join(MAP, naam), "utf8").catch(() => "")).trim();
    if (zin && zin.length <= MAX_LENGTE) uit.push({ naam: naam.slice(0, -4), zin });
  }
  return uit;
}

/**
 * Kopieert eerst alle bewaarde zinnen naar een aparte map in `oud` (niets
 * weggooien; de originelen blijven staan voor de terugval), zet het geluid
 * van antwoordkeuzes apart in `oud/antwoordkeuzes`, en maakt daarna alle
 * zinnen opnieuw met de nieuwe aanpak, voor de groepen van de kinderen.
 */
export function maakAllesOpnieuw(vasteZinnen: string[], profielen: Profiel[]): Voortgang {
  if (voortgang.bezig) return leesVoortgang();
  voortgang.bezig = true;
  voortgang.klaar = 0;
  voortgang.mislukt = 0;
  voortgang.begonnen = new Date().toISOString();

  void (async () => {
    try {
      /* 1. Alles wat er nu is, kopiëren naar een aparte map (de originelen blijven staan voor de terugval). */
      const naar = path.join(MAP, "oud", `voor-${new Date().toISOString().replace(/[:.]/g, "-")}`);
      await mkdir(path.join(naar, "stukken"), { recursive: true });
      for (const naam of await readdir(MAP).catch(() => [] as string[])) {
        if (/^(z-)?[0-9a-f]{32}\.(mp3|txt)$/.test(naam)) await copyFile(path.join(MAP, naam), path.join(naar, naam)).catch(() => {});
      }
      for (const naam of await readdir(path.join(MAP, "stukken")).catch(() => [] as string[])) {
        if (naam.endsWith(".mp3")) await copyFile(path.join(MAP, "stukken", naam), path.join(naar, "stukken", naam)).catch(() => {});
      }
      voortgang.map = naar;

      /* 2. Antwoordkeuzes worden niet meer voorgelezen: hun geluid gaat naar oud/antwoordkeuzes (niet weggooien). */
      const bewaard = await bewaardeZinnen();
      const keuzeMap = path.join(MAP, "oud", "antwoordkeuzes");
      await mkdir(keuzeMap, { recursive: true });
      for (const { naam, zin } of bewaard) {
        if (!isAntwoordkeuze(zin)) continue;
        for (const ext of [".mp3", ".txt"]) await rename(path.join(MAP, naam + ext), path.join(keuzeMap, naam + ext)).catch(() => {});
      }

      /* 3. Alle zinnen (behalve antwoordkeuzes) en de vaste zinnen opnieuw, met controle. */
      const zinnen = [...new Set([...vasteZinnen, ...bewaard.map((b) => b.zin)])].filter((z) => !isAntwoordkeuze(z));
      const klussen = profielen.flatMap((p) => zinnen.map((zin) => ({ zin, p })));
      voortgang.totaal = klussen.length;
      /* Drie tegelijk: snel genoeg, en Fish Audio krijgt geen stormloop. */
      let volgende = 0;
      await Promise.all(
        Array.from({ length: 3 }, async () => {
          while (volgende < klussen.length) {
            const { zin, p } = klussen[volgende++];
            const uitkomst = await maakZin(zin, p).catch(() => ({ goed: false }) as ZinUitkomst);
            if (!uitkomst.goed) voortgang.mislukt++;
            voortgang.klaar++;
          }
        }),
      );
    } finally {
      voortgang.bezig = false;
    }
  })();
  return leesVoortgang();
}

/**
 * Alleen wat vooraf klaar moet staan (23 oktober 2026, opdracht eigenaar):
 * de vaste zinnen, de begroetingen en de hints, voor de groepen van de
 * kinderen. Wat al bestaat en goed is (ook van vóór het goedkopere model),
 * wordt niet opnieuw gemaakt. Alle andere zinnen worden pas gemaakt als een
 * kind ze voor het eerst nodig heeft, en daarna bewaard voor iedereen.
 */
export function maakVooraf(zinnen: string[], profielen: Profiel[]): Voortgang {
  if (voortgang.bezig) return leesVoortgang();
  voortgang.bezig = true;
  voortgang.klaar = 0;
  voortgang.mislukt = 0;
  voortgang.map = null;
  voortgang.begonnen = new Date().toISOString();
  const klussen = profielen.flatMap((p) => [...new Set(zinnen)].map((zin) => ({ zin, p })));
  voortgang.totaal = klussen.length;
  void (async () => {
    try {
      let volgende = 0;
      await Promise.all(
        Array.from({ length: 3 }, async () => {
          while (volgende < klussen.length) {
            const { zin, p } = klussen[volgende++];
            const uitkomst = await maakZin(zin, p).catch(() => ({ goed: false }) as ZinUitkomst);
            if (!uitkomst.goed) voortgang.mislukt++;
            voortgang.klaar++;
          }
        }),
      );
    } finally {
      voortgang.bezig = false;
    }
  })();
  return leesVoortgang();
}

// ---------------------------------------------------------------------------
// Live antwoorden (Praten met Bliepo, 22 oktober 2026)
// ---------------------------------------------------------------------------

/**
 * Eén live antwoord uitspreken, zo snel mogelijk. Ruth met het snelle model
 * eleven_v4_turbo (zelfde stem en model-familie; gemeten 0,65 s voor twee
 * zinnen, tegen 1,65 s met eleven_v4), zelfde toon per groep, de-esser en even
 * hard. Mag ElevenLabs niet (tekens voor live op, of een fout), dan Fish Audio
 * (Sanne). De controle met spraak naar tekst gebeurt hier niet (dat kost
 * tijd); `controleerLive` doet hem achteraf, voordat het antwoord gedeeld wordt.
 */
export async function spreekLive(
  tekst: string,
  profiel: Profiel,
  elevenMag: boolean,
): Promise<{ data: Buffer; dienst: Dienst; tekens: number } | null> {
  const eleven = elevenMag ? instellingen(profiel, "elevenlabs") : null;
  if (eleven) {
    const model = process.env.ELEVEN_MODEL_LIVE ?? "eleven_v4_turbo";
    const data = await maakStukEleven(voorStem(tekst), eleven, model, true);
    if (typeof data !== "number") return { data, dienst: "elevenlabs", tekens: Math.ceil((tekst.length + eleven.toon.length + 1) * tekenPrijs(model)) };
  }
  const fish = instellingen(profiel, "fish");
  if (!fish) return null;
  const data = await maakStuk(voorStem(tekst), fish);
  return typeof data === "number" ? null : { data, dienst: "fish", tekens: tekst.length };
}

/** Achteraf: klopt het uitgesproken antwoord woord voor woord? Alleen dan wordt het gedeeld. */
export async function controleerLive(tekst: string, data: Buffer): Promise<boolean> {
  const sleutel = process.env.FISH_API_KEY;
  if (!sleutel) return false;
  const gehoord = await luister(data, sleutel);
  return gehoord !== null && vergelijkZin(voorStem(tekst), gehoord).goed;
}

/** Waar de gedeelde live antwoorden staan. */
export const TUTOR_MAP = path.join(MAP, "tutor");

export async function bewaarTutorGeluid(naam: string, data: Buffer) {
  await bewaar(path.join(TUTOR_MAP, naam), data);
}

export async function leesTutorGeluid(naam: string): Promise<Buffer | null> {
  if (!/^[a-z0-9-]+\.mp3$/.test(naam)) return null;
  return lees(path.join(TUTOR_MAP, naam));
}


// ---------------------------------------------------------------------------
// Voorlezen met de tijd per woord (voorbeeld "Tekst boven Bliepo", 23 oktober 2026)
// ---------------------------------------------------------------------------

export type Woordtijd = { woord: string; begin: number; eind: number };

/**
 * Een zin met Ruth, samen met de tijd per woord (ElevenLabs "with
 * timestamps"), zodat elk woord kan oplichten op het moment dat Bliepo het
 * zegt. Eén keer gemaakt en bewaard in stem/karaoke (geluid en tijden horen
 * bij elkaar). De tijden zijn in seconden vanaf het begin van het bewaarde
 * geluid (de weggeknipte stilte is er al af).
 */
/**
 * Waar een zin met tijden per woord bewaard wordt (mp3 en json), of null als
 * ElevenLabs niet is ingesteld. Ook om een online gemaakte zin hier neer te
 * zetten, zodat hij maar één keer betaald wordt (24 oktober 2026).
 */
export function karaokeBestanden(zin: string, profiel: Profiel): { mp3: string; json: string } | null {
  const s = instellingen(profiel, "elevenlabs");
  if (!s) return null;
  const naam = `k-${hash(`${kenmerk(s)}\n${voorStem(zin)}`)}`;
  const map = path.join(MAP, "karaoke");
  return { mp3: path.join(map, `${naam}.mp3`), json: path.join(map, `${naam}.json`) };
}

export async function zinMetTijden(zin: string, profiel: Profiel): Promise<{ data: Buffer; woorden: Woordtijd[] } | number> {
  const s = instellingen(profiel, "elevenlabs");
  if (!s) return 503;
  const naam = `k-${hash(`${kenmerk(s)}\n${voorStem(zin)}`)}`;
  const map = path.join(MAP, "karaoke");
  const bewaard = await lees(path.join(map, `${naam}.mp3`));
  const tijden = await readFile(path.join(map, `${naam}.json`), "utf8").catch(() => null);
  if (bewaard && tijden) return { data: bewaard, woorden: JSON.parse(tijden) as Woordtijd[] };

  const gesproken = voorStem(zin);
  const tekst = s.toon ? `${s.toon} ${gesproken}` : gesproken;
  const nodig = Math.ceil(tekst.length * tekenPrijs(s.model));
  if (!(await elevenVoorLive(nodig))) return 402;
  const sr = Number(s.formaat.split("_")[1]) || 24000;
  if (nieuweZinnenMetBrowser()) return 409;
  const antwoord = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${s.stem}/with-timestamps?output_format=${s.formaat}`, {
    method: "POST",
    headers: { "xi-api-key": s.elevenSleutel, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: tekst,
      model_id: s.model,
      language_code: "nl",
      voice_settings: { stability: s.stabiliteit, similarity_boost: s.gelijkenis },
    }),
    signal: AbortSignal.timeout(45000),
  }).catch(() => null);
  if (!antwoord) return 504;
  if (!antwoord.ok) return antwoord.status;
  const j = (await antwoord.json().catch(() => null)) as {
    audio_base64?: string;
    alignment?: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
  } | null;
  if (!j?.audio_base64 || !j.alignment) return 502;
  const { mp3, begin } = bewerkKlankMetBegin(leesPcm(Buffer.from(j.audio_base64, "base64"), sr), s.deEsser ? GEKOZEN_DE_ESSER : null);

  /* De woorden van het gesproken deel (na de toonaanwijzing), met hun eerste en laatste letter. */
  const a = j.alignment;
  const vanaf = tekst.length - gesproken.length;
  const woorden: Woordtijd[] = [];
  let huidig: Woordtijd | null = null;
  for (let i = vanaf; i < a.characters.length; i++) {
    const c = a.characters[i];
    if (/\s/.test(c)) {
      huidig = null;
      continue;
    }
    const b = Math.max(0, a.character_start_times_seconds[i] - begin);
    const e = Math.max(0, a.character_end_times_seconds[i] - begin);
    if (!huidig) {
      huidig = { woord: c, begin: b, eind: e };
      woorden.push(huidig);
    } else {
      huidig.woord += c;
      huidig.eind = e;
    }
  }
  await bewaar(path.join(map, `${naam}.mp3`), mp3);
  await bewaar(path.join(map, `${naam}.json`), Buffer.from(JSON.stringify(woorden)));
  return { data: mp3, woorden };
}

/**
 * Een antwoordkeuze (30 oktober 2026): de hele keuze als hij bewaard is
 * ("kwart over 3"), anders achter elkaar de losse stukjes ("7", "plus", "2",
 * "is", "9"). Ontbreekt er één stukje, dan null (en blijft het stil).
 */
/* Een getal dat de terugluistercontrole als cijfer niet haalde, staat als woord bewaard. */
const ALS_WOORD: Record<string, string> = { "0": "nul" };
const stukGeluid = async (t: string, profiel: Profiel) => (await bewaardeZin(t, profiel)) ?? (ALS_WOORD[t] ? await bewaardeZin(ALS_WOORD[t], profiel) : null);

export async function keuzeUitStukjes(tekst: string, profiel: Profiel): Promise<Buffer | null> {
  const heel = await stukGeluid(tekst, profiel);
  if (heel) return heel;
  const stukjes = tekst.split(/\s+/).filter(Boolean);
  if (stukjes.length < 2) return null;
  const delen: Buffer[] = [];
  for (const stukje of stukjes) {
    const deel = await stukGeluid(stukje, profiel);
    if (!deel) return null;
    delen.push(deel);
  }
  return Buffer.concat(delen);
}
