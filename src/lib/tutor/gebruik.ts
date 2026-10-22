import "server-only";

/**
 * Tellen en begrenzen voor Praten met Bliepo (22 oktober 2026).
 *
 *   - per kind: hoeveel live vragen vandaag (daglimiet van de ouder);
 *   - per dag: totalen voor de beheerpagina (zonder kind);
 *   - OpenAI-budget per maand (OPENAI_BUDGET_USD, standaard $10): bij 80% een
 *     melding op de beheerpagina, bij 100% alleen nog vooraf gemaakte hints;
 *   - ElevenLabs-tekens: er blijven er altijd minstens ELEVEN_RESERVE
 *     (standaard 10.000) over voor vaste zinnen en hints. Zijn de tekens voor
 *     live antwoorden op, dan spreekt Fish Audio (Sanne) ze uit.
 */

import { verbinding } from "@/lib/db/sqlite";

/** De datum in Nederland (een dag begint om middernacht hier, niet in Londen). */
export function vandaag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam" }).format(new Date());
}

// ---------------------------------------------------------------------------
// Per kind
// ---------------------------------------------------------------------------

export function liveVandaag(kindId: string): number {
  const rij = verbinding().prepare("select live from tutor_teller where kind_id = ? and datum = ?").get(kindId, vandaag()) as
    | { live: number }
    | undefined;
  return rij?.live ?? 0;
}

export function telLiveVraag(kindId: string): void {
  verbinding()
    .prepare(
      `insert into tutor_teller (kind_id, datum, live) values (?, ?, 1)
       on conflict (kind_id, datum) do update set live = live + 1`,
    )
    .run(kindId, vandaag());
}

// ---------------------------------------------------------------------------
// Per dag (zonder kind)
// ---------------------------------------------------------------------------

export type DagTelling = Partial<{
  vragen: number;
  hints: number;
  live: number;
  gedeeld: number;
  kosten_usd: number;
  eleven_tekens: number;
  fish_tekens: number;
}>;

export function telDag(t: DagTelling): void {
  const v = { vragen: 0, hints: 0, live: 0, gedeeld: 0, kosten_usd: 0, eleven_tekens: 0, fish_tekens: 0, ...t };
  verbinding()
    .prepare(
      `insert into tutor_dag (datum, vragen, hints, live, gedeeld, kosten_usd, eleven_tekens, fish_tekens)
       values (?, ?, ?, ?, ?, ?, ?, ?)
       on conflict (datum) do update set
         vragen = vragen + excluded.vragen,
         hints = hints + excluded.hints,
         live = live + excluded.live,
         gedeeld = gedeeld + excluded.gedeeld,
         kosten_usd = kosten_usd + excluded.kosten_usd,
         eleven_tekens = eleven_tekens + excluded.eleven_tekens,
         fish_tekens = fish_tekens + excluded.fish_tekens`,
    )
    .run(vandaag(), v.vragen, v.hints, v.live, v.gedeeld, v.kosten_usd, v.eleven_tekens, v.fish_tekens);
}

export type DagRij = {
  datum: string;
  vragen: number;
  hints: number;
  live: number;
  gedeeld: number;
  kosten_usd: number;
  eleven_tekens: number;
  fish_tekens: number;
};

export function dagen(aantal = 31): DagRij[] {
  return verbinding().prepare("select * from tutor_dag order by datum desc limit ?").all(aantal) as DagRij[];
}

// ---------------------------------------------------------------------------
// OpenAI-budget
// ---------------------------------------------------------------------------

export function budgetUsd(): number {
  const n = Number(process.env.OPENAI_BUDGET_USD);
  return Number.isFinite(n) && n > 0 ? n : 10;
}

export function kostenDezeMaand(): number {
  const maand = vandaag().slice(0, 7);
  const rij = verbinding().prepare("select coalesce(sum(kosten_usd), 0) as s from tutor_dag where datum like ?").get(`${maand}%`) as {
    s: number;
  };
  return rij.s;
}

export type Budget = { kosten: number; budget: number; procent: number; waarschuwing: boolean; op: boolean };

export function budget(): Budget {
  const kosten = kostenDezeMaand();
  const b = budgetUsd();
  const procent = Math.round((kosten / b) * 100);
  return { kosten, budget: b, procent, waarschuwing: procent >= 80, op: procent >= 100 };
}

/*
  Prijzen per miljoen tokens in dollars (OpenAI, opgehaald 22 oktober 2026; te
  overschrijven met OPENAI_PRIJZEN als JSON). Spraak naar tekst rekent per
  minuut geluid.
*/
const PRIJZEN: Record<string, { in: number; uit: number }> = {
  "gpt-5.4-nano": { in: 0.2, uit: 1.25 },
  "gpt-5.4-mini": { in: 0.75, uit: 4.5 },
  "gpt-5-nano": { in: 0.05, uit: 0.4 },
  "gpt-5-mini": { in: 0.25, uit: 2 },
  "gpt-4.1-nano": { in: 0.1, uit: 0.4 },
  "gpt-4.1-mini": { in: 0.4, uit: 1.6 },
  "gpt-4o-mini": { in: 0.15, uit: 0.6 },
  "text-embedding-3-small": { in: 0.02, uit: 0 },
};
const PER_MINUUT: Record<string, number> = { "gpt-4o-mini-transcribe": 0.003, "gpt-4o-transcribe": 0.006, "whisper-1": 0.006 };

function prijzen() {
  try {
    return { ...PRIJZEN, ...(JSON.parse(process.env.OPENAI_PRIJZEN ?? "{}") as typeof PRIJZEN) };
  } catch {
    return PRIJZEN;
  }
}

export function kostenTokens(model: string, tokensIn: number, tokensUit: number): number {
  const p = prijzen()[model] ?? prijzen()[model.replace(/-\d{4}-\d{2}-\d{2}$/, "")] ?? { in: 1, uit: 4 };
  return (tokensIn * p.in + tokensUit * p.uit) / 1_000_000;
}

export function kostenMinuten(model: string, seconden: number): number {
  return ((PER_MINUUT[model] ?? 0.006) * seconden) / 60;
}

// ---------------------------------------------------------------------------
// ElevenLabs-tekens
// ---------------------------------------------------------------------------

type Tekens = { gebruikt: number; limiet: number; opgehaald: number };
let tekens: Tekens | null = null;

/** Hoeveel tekens er deze maand bij ElevenLabs gebruikt zijn (hooguit 5 minuten oud). */
export async function elevenTekens(): Promise<Tekens | null> {
  if (tekens && Date.now() - tekens.opgehaald < 5 * 60_000) return tekens;
  const sleutel = process.env.ELEVEN_API_KEY;
  if (!sleutel) return null;
  const antwoord = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
    headers: { "xi-api-key": sleutel },
    signal: AbortSignal.timeout(4000),
  }).catch(() => null);
  if (!antwoord?.ok) return tekens;
  const j = (await antwoord.json().catch(() => null)) as { character_count?: number; character_limit?: number } | null;
  if (typeof j?.character_count !== "number" || typeof j.character_limit !== "number") return tekens;
  tekens = { gebruikt: j.character_count, limiet: j.character_limit, opgehaald: Date.now() };
  return tekens;
}

export function elevenReserve(): number {
  const n = Number(process.env.ELEVEN_RESERVE);
  return Number.isFinite(n) && n >= 0 ? n : 10_000;
}

/** Mag een live antwoord nog met ElevenLabs? Anders Fish Audio. */
export async function elevenVoorLive(nodig: number): Promise<boolean> {
  const t = await elevenTekens();
  if (!t) return false;
  const ok = t.limiet - t.gebruikt - nodig >= elevenReserve();
  /* Schatting bijhouden tot de volgende echte stand, zodat het niet 5 minuten doortelt. */
  if (ok) t.gebruikt += nodig;
  return ok;
}
