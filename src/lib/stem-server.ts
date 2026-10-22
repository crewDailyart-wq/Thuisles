import "server-only";

/**
 * De stem van Bliepo op de server (22 oktober 2026, opdracht eigenaar).
 *
 * Bliepo praat met de stem "Sanne" van Fish Audio, model drama-3.
 *
 * Instellingen (gemeten op 101 zinnen, 22 oktober 2026): temperature 0,7,
 * top_p 0,7, herhalingsrem 1,2, latency normal. Met de website-instellingen
 * (temperature 1, top_p 0,95) gingen 10 van de 101 zinnen fout bij het
 * terugluisteren, hiermee 5; de stem varieert bijna even veel in toon (even
 * levendig) maar wisselt minder tussen twee opnames. Volume +5.
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

import { createHash } from "node:crypto";
import { copyFile, mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { knipInZinnen, vergelijkZin, voorStem } from "@/lib/stemtekst";
import { UITSPRAAK_VERSIE, voorUitspraak } from "@/lib/stem-uitspraak";

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

/** De nieuwe stem, voor één groep. Null als er geen sleutel of stem is. */
export function instellingen(profiel: Profiel) {
  const sleutel = process.env.FISH_API_KEY;
  const stem = process.env.FISH_STEM_ID;
  if (!sleutel || !stem) return null;
  const achter = profiel.replace("-", "_");
  return {
    sleutel,
    stem,
    model: tekst("FISH_MODEL", "drama-3"),
    temperature: getal("FISH_TEMPERATURE", 0.7),
    top_p: getal("FISH_TOP_P", 0.7),
    herhaling: getal("FISH_HERHALING", 1.2),
    latency: tekst("FISH_LATENCY", "normal"),
    volume: getal("FISH_VOLUME", 5),
    tempo: getal(`FISH_TEMPO_GROEP_${achter}`, STANDAARD_TEMPO[profiel]),
    toon: tekst(`FISH_TOON_GROEP_${achter}`, STANDAARD_TOON[profiel]).trim(),
    controle: tekst("FISH_CONTROLE", "aan") !== "uit",
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
  return JSON.stringify([3, UITSPRAAK_VERSIE, s.model, s.stem, s.temperature, s.top_p, s.herhaling, s.latency, s.volume, s.tempo, s.toon]);
}

/** Het bestand van een hele zin met de nieuwe stem. */
export function zinBestand(zin: string, s: Instellingen) {
  const naam = `z-${hash(`${kenmerk(s)}\n${voorStem(zin)}`)}`;
  return { naam, bestand: path.join(MAP, `${naam}.mp3`) };
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

function maakStuk(stuk: string, s: Instellingen) {
  /* De uitspraaklijst alleen voor wat Fish Audio krijgt; de controle vergelijkt met de gewone zin. */
  const uitspraak = voorUitspraak(stuk);
  return tts(
    {
      text: s.toon ? `${s.toon} ${uitspraak}` : uitspraak,
      reference_id: s.stem,
      format: "mp3",
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
}

/** Spraak naar tekst (transcribe-1): wat zegt het geluid? Null als het niet lukte. */
async function luister(data: Buffer, sleutel: string): Promise<string | null> {
  for (let poging = 0; poging < 2; poging++) {
    const formulier = new FormData();
    formulier.append("audio", new Blob([new Uint8Array(data)], { type: "audio/mpeg" }), "zin.mp3");
    formulier.append("language", "nl");
    formulier.append("ignore_timestamps", "true");
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
const PER_RONDE = 2;
const HOOGSTENS = 4;

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
  for (let gemaakt = 0; gemaakt < HOOGSTENS; gemaakt += PER_RONDE) {
    if (gemaakt > 0) await tel("opnieuw");
    const versies = await Promise.all(Array.from({ length: PER_RONDE }, () => maakVersie(stuk, s)));
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
export function maakZin(zin: string, profiel: Profiel, opnieuw = false): Promise<ZinUitkomst> {
  const s = instellingen(profiel);
  if (!s) return Promise.resolve({ data: null, goed: false, code: 503 });
  const { naam, bestand } = zinBestand(zin, s);
  const sleutel = `${naam}${opnieuw ? ":opnieuw" : ""}`;
  const lopend = bezig.get(sleutel);
  if (lopend) return lopend;

  const klus = (async (): Promise<ZinUitkomst> => {
    if (!opnieuw) {
      const bewaard = await lees(bestand);
      if (bewaard) return { data: bewaard, goed: true };
    }
    const stukken = knipInZinnen(voorStem(zin));
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
 * De zin voor een kind: de nieuwe stem als die op tijd klaar is, anders (of
 * als hij niet lukt) de oude stem. Wat niet op tijd klaar was, wordt op de
 * achtergrond gewoon afgemaakt en bewaard, zodat het de volgende keer wel de
 * nieuwe stem is.
 */
export async function zinVoorKind(zin: string, profiel: Profiel, wachtMs: number): Promise<Buffer | number> {
  const nieuw = maakZin(zin, profiel);
  const opTijd = await Promise.race([nieuw, new Promise<null>((klaar) => setTimeout(() => klaar(null), wachtMs))]);
  if (opTijd?.goed) return opTijd.data;
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
