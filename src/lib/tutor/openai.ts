import "server-only";

/**
 * OpenAI voor Praten met Bliepo (22 oktober 2026): luisteren (spraak naar
 * tekst), nadenken (een klein, snel model) en de veiligheidscontrole
 * (moderation, gratis).
 *
 * Privacy:
 *   - de stem gaat alleen naar OpenAI om hem om te zetten in tekst, en wordt
 *     nergens bewaard (niet bij ons, en `store: false` bij OpenAI);
 *   - er gaat nooit een naam of ander persoonsgegeven mee: alleen de vraag,
 *     de opgave, de groep en het leerdoel. Noemt het kind zelf zijn naam, dan
 *     haalt `zonderNamen` hem weg voordat de tekst verder gaat.
 *
 * Modellen zijn in te stellen met OPENAI_MODEL_LUISTEREN en OPENAI_MODEL_DENKEN.
 */

import { kostenMinuten, kostenTokens } from "@/lib/tutor/gebruik";

const SLEUTEL = () => process.env.OPENAI_API_KEY ?? "";
export const MODEL_LUISTEREN = () => process.env.OPENAI_MODEL_LUISTEREN ?? "gpt-4o-mini-transcribe";
export const MODEL_DENKEN = () => process.env.OPENAI_MODEL_DENKEN ?? "gpt-4.1-mini";

export const openaiAan = () => Boolean(SLEUTEL());

export type Uitkomst<T> = { ok: true; waarde: T; kosten: number } | { ok: false; code: number; kosten: number };

/** Spraak naar tekst. `seconden` is de lengte van de opname (voor de kosten). */
export async function luisterNaarKind(audio: Blob, seconden: number): Promise<Uitkomst<string>> {
  const formulier = new FormData();
  formulier.append("file", audio, audio.type.includes("mp4") ? "vraag.mp4" : audio.type.includes("ogg") ? "vraag.ogg" : "vraag.webm");
  formulier.append("model", MODEL_LUISTEREN());
  formulier.append("language", "nl");
  /* Een paar woorden die vaak voorkomen, zodat ze goed gespeld worden. */
  formulier.append("prompt", "Een kind van de basisschool stelt een vraag aan Bliepo over een rekensom: plus, min, keer, gedeeld door, tientallen, eenheden, breuken.");
  const antwoord = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${SLEUTEL()}` },
    body: formulier,
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  const kosten = kostenMinuten(MODEL_LUISTEREN(), Math.max(1, seconden));
  if (!antwoord?.ok) {
    if (antwoord) console.error(`[tutor] luisteren: ${antwoord.status} ${(await antwoord.text().catch(() => "")).slice(0, 200)}`);
    return { ok: false, code: antwoord?.status ?? 504, kosten: 0 };
  }
  const j = (await antwoord.json().catch(() => null)) as { text?: string } | null;
  return { ok: true, waarde: (j?.text ?? "").trim(), kosten };
}

export type Context = {
  opgave: string;
  groep: number;
  leerdoel: string;
  /** Eerdere vragen en antwoorden bij deze opgave (hooguit een paar). */
  gesprek: { vraag: string; antwoord: string }[];
};

function systeemtekst(groep: number) {
  const toon =
    groep <= 2
      ? "Het kind zit in groep 1 of 2 (4-6 jaar). Gebruik heel korte, eenvoudige zinnen en heel makkelijke woorden. Wees rustig en lief."
      : groep <= 5
        ? "Het kind zit in groep 3, 4 of 5 (6-9 jaar). Gebruik korte, duidelijke zinnen. Wees warm en vrolijk, zoals een lieve juf."
        : "Het kind zit in groep 6, 7 of 8 (9-12 jaar). Wees vriendelijk en enthousiast, maar niet kinderachtig: praat zoals een coole oudere broer of zus.";
  return [
    "Je bent Bliepo, een vriendelijke rekenhulp op een Nederlandse oefenwebsite voor kinderen van de basisschool.",
    toon,
    "Regels:",
    "- Antwoord in het Nederlands, in hooguit 2 korte zinnen (samen hooguit 30 woorden).",
    "- Zeg NOOIT het antwoord van de opgave, ook niet als het kind erom vraagt. Geef een hint, of stel een wedervraag die het kind op weg helpt.",
    "- Zeg nooit of het antwoord van het kind goed of fout is; dat doet de knop Controleer.",
    "- Praat alleen over de opgave, de les en schoolvragen. Vraagt het kind iets anders, breng het dan vriendelijk terug naar de som.",
    "- Altijd vriendelijk en bemoedigend. Nooit iets engs, gemeens of ongepasts. Geen links, geen emoji.",
    "- Gebruik nooit een naam. Vraag nooit naar persoonlijke dingen.",
    "- Schrijf getallen gewoon in cijfers; sommen als 7 + 8.",
  ].join("\n");
}

/** Nadenken: een kort antwoord van Bliepo op een vrije vraag. */
export async function bedenkAntwoord(vraag: string, c: Context): Promise<Uitkomst<string>> {
  const berichten = [
    { role: "system", content: systeemtekst(c.groep) },
    {
      role: "system",
      content: `De opgave op het scherm: ${c.opgave || "(onbekend)"}\nHet leerdoel: ${c.leerdoel || "(onbekend)"}\nGroep: ${c.groep}`,
    },
    ...c.gesprek.slice(-3).flatMap((g) => [
      { role: "user", content: g.vraag },
      { role: "assistant", content: g.antwoord },
    ]),
    { role: "user", content: vraag },
  ];
  const model = MODEL_DENKEN();
  const reden = /^gpt-5|^o\d/.test(model);
  const antwoord = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${SLEUTEL()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: berichten,
      store: false,
      ...(reden ? { reasoning_effort: "minimal", max_completion_tokens: 400 } : { max_tokens: 120, temperature: 0.5 }),
    }),
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (!antwoord?.ok) {
    if (antwoord) console.error(`[tutor] denken: ${antwoord.status} ${(await antwoord.text().catch(() => "")).slice(0, 200)}`);
    return { ok: false, code: antwoord?.status ?? 504, kosten: 0 };
  }
  const j = (await antwoord.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  } | null;
  const tekst = (j?.choices?.[0]?.message?.content ?? "").trim();
  const kosten = kostenTokens(model, j?.usage?.prompt_tokens ?? 0, j?.usage?.completion_tokens ?? 0);
  if (!tekst) return { ok: false, code: 502, kosten };
  return { ok: true, waarde: kortAf(tekst), kosten };
}

/** Hooguit 2 zinnen, zonder opmaak. */
export function kortAf(tekst: string): string {
  const schoon = tekst.replace(/[*_#`>]/g, "").replace(/\s+/g, " ").trim();
  const zinnen = schoon.match(/[^.!?]+[.!?]+/g) ?? [schoon];
  return zinnen.slice(0, 2).join(" ").trim();
}

/** Veiligheidscontrole (moderation). Alleen een antwoord dat hier doorheen komt, spreekt Bliepo uit. */
export async function isVeilig(tekst: string): Promise<boolean> {
  const antwoord = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: { Authorization: `Bearer ${SLEUTEL()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "omni-moderation-latest", input: tekst }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!antwoord?.ok) return false;
  const j = (await antwoord.json().catch(() => null)) as { results?: { flagged?: boolean }[] } | null;
  return j?.results?.[0]?.flagged === false;
}

/** Vingerafdruk van een vraag (embedding), om dezelfde soort vraag bij dezelfde opgave te herkennen. */
export async function vingerafdruk(tekst: string): Promise<Uitkomst<number[]>> {
  const antwoord = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${SLEUTEL()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "text-embedding-3-small", input: tekst, dimensions: 256 }),
    signal: AbortSignal.timeout(6000),
  }).catch(() => null);
  if (!antwoord?.ok) return { ok: false, code: antwoord?.status ?? 504, kosten: 0 };
  const j = (await antwoord.json().catch(() => null)) as { data?: { embedding?: number[] }[]; usage?: { prompt_tokens?: number } } | null;
  const v = j?.data?.[0]?.embedding;
  if (!v) return { ok: false, code: 502, kosten: 0 };
  return { ok: true, waarde: v, kosten: kostenTokens("text-embedding-3-small", j?.usage?.prompt_tokens ?? 0, 0) };
}

export function lijkt(a: number[], b: number[]): number {
  let s = 0, na = 0, nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    s += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return s / (Math.sqrt(na * nb) || 1);
}

/** Haalt namen weg die het kind zelf zei ("ik ben Fenna"), voordat de vraag verder gaat. */
export function zonderNamen(tekst: string, namen: string[]): string {
  let uit = tekst;
  for (const naam of namen.filter((n) => n && n.length > 1)) {
    uit = uit.replace(new RegExp(`\\b${naam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"), "{naam}");
  }
  return uit;
}
