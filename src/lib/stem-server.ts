import "server-only";

/**
 * De stem van Bliepo op de server (22 oktober 2026, opdracht eigenaar).
 *
 * Bliepo praat met de stem "Sanne" van Fish Audio, model drama-3, met de
 * instellingen die de Fish Audio-website gebruikt (gelezen uit de code van de
 * website: temperature 1, top_p 0,95, herhalingsrem 1, geen normalisatie,
 * latency balanced). Volume +5 en tempo 1 staan zo in de proef van de eigenaar.
 *
 * Toon en tempo hangen af van de groep van het kind:
 *   - groep 1-2: extra rustig, langzaam en lief (tempo 0,9);
 *   - groep 3-5: warm, vrolijk en duidelijk (tempo 0,95);
 *   - groep 6-8: vriendelijk en enthousiast, niet kinderachtig (tempo 1).
 * De toon gaat via een aanwijzing tussen [haken] vóór de zin. Drama-3 leest
 * die niet voor (gecontroleerd met spraak naar tekst) en gemeten wordt de stem
 * er warmer en levendiger van; het tempo regelt de aanwijzing niet, dat doet
 * `prosody.speed`.
 *
 * Geen woord overslaan:
 *   1. de tekst gaat eerst door `voorStem` (getallen en tekens voluit);
 *   2. hij wordt in korte zinnen geknipt; elke zin wordt los gemaakt;
 *   3. elke nieuwe zin gaat terug naar tekst via Fish Audio spraak naar tekst
 *      (transcribe-1) en wordt vergeleken met wat er moest staan;
 *   4. mist er een woord, dan wordt hij opnieuw gemaakt, hoogstens 3 keer;
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
const STANDAARD_TEMPO: Record<Profiel, number> = { "1-2": 0.9, "3-5": 0.95, "6-8": 1 };

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
    temperature: getal("FISH_TEMPERATURE", 1),
    top_p: getal("FISH_TOP_P", 0.95),
    herhaling: getal("FISH_HERHALING", 1),
    latency: tekst("FISH_LATENCY", "balanced"),
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
  return JSON.stringify([2, s.model, s.stem, s.temperature, s.top_p, s.herhaling, s.latency, s.volume, s.tempo, s.toon]);
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
  return tts(
    {
      text: s.toon ? `${s.toon} ${stuk}` : stuk,
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

/** Zo vaak mag een zin opnieuw als er een woord mist. */
const OPNIEUW = 3;

type StukUitkomst = { data: Buffer; goed: true } | { data: Buffer | null; goed: false; code?: number; gehoord?: string; mist?: string[] };

/** Eén stuk: maken en controleren, tot hij klopt (hoogstens 1 + 3 keer). */
async function maakGecontroleerdStuk(stuk: string, s: Instellingen, opnieuw: boolean): Promise<StukUitkomst> {
  const { bestand } = stukBestand(stuk, s);
  if (!opnieuw) {
    const bewaard = await lees(bestand);
    if (bewaard) return { data: bewaard, goed: true };
  }
  let laatste: StukUitkomst = { data: null, goed: false };
  for (let poging = 0; poging <= OPNIEUW; poging++) {
    if (poging > 0) await tel("opnieuw");
    const data = await maakStuk(stuk, s);
    if (typeof data === "number") return { data: null, goed: false, code: data };
    await tel("gemaakt");
    if (!s.controle) {
      await bewaar(bestand, data);
      return { data, goed: true };
    }
    const gehoord = await luister(data, s.sleutel);
    if (gehoord === null) {
      /* De controle zelf lukte niet: niet bewaren, wel deze ene keer laten horen. */
      laatste = { data, goed: false, gehoord: "(controle lukte niet)", mist: [] };
      break;
    }
    const uitslag = vergelijkZin(stuk, gehoord);
    if (uitslag.goed) {
      await bewaar(bestand, data);
      return { data, goed: true };
    }
    console.warn(`[stem] woord gemist (poging ${poging + 1}): "${stuk}" → "${gehoord}" (mist: ${uitslag.mist.join(" ")}, extra: ${uitslag.extra.join(" ")})`);
    laatste = { data, goed: false, gehoord, mist: uitslag.mist.length ? uitslag.mist : uitslag.extra.map((w) => `+${w}`) };
  }
  return laatste;
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

/** Alle zinnen die ooit zijn bewaard (de .txt naast elk geluid). */
async function bewaardeZinnen(): Promise<string[]> {
  const namen = await readdir(MAP).catch(() => [] as string[]);
  const zinnen = new Set<string>();
  for (const naam of namen) {
    if (!naam.endsWith(".txt")) continue;
    const zin = (await readFile(path.join(MAP, naam), "utf8").catch(() => "")).trim();
    if (zin && zin.length <= MAX_LENGTE) zinnen.add(zin);
  }
  return [...zinnen];
}

/**
 * Kopieert eerst alle zinnen van de oude stem naar een aparte map (niets
 * weggooien; de originelen blijven staan voor de terugval), en maakt daarna
 * alle zinnen opnieuw met de nieuwe stem, voor de groepen van de kinderen.
 */
export function maakAllesOpnieuw(vasteZinnen: string[], profielen: Profiel[]): Voortgang {
  if (voortgang.bezig) return leesVoortgang();
  voortgang.bezig = true;
  voortgang.klaar = 0;
  voortgang.mislukt = 0;
  voortgang.begonnen = new Date().toISOString();

  void (async () => {
    try {
      const naar = path.join(MAP, "oud", `oude-stem-${new Date().toISOString().slice(0, 10)}`);
      await mkdir(naar, { recursive: true });
      for (const naam of await readdir(MAP).catch(() => [] as string[])) {
        if (/^[0-9a-f]{32}\.(mp3|txt)$/.test(naam)) await copyFile(path.join(MAP, naam), path.join(naar, naam)).catch(() => {});
      }
      voortgang.map = naar;

      const zinnen = [...new Set([...vasteZinnen, ...(await bewaardeZinnen())])];
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
