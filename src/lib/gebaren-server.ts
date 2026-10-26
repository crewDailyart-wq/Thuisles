import "server-only";

/**
 * Welke gebaren bij een zin horen, één keer uitgezocht en bewaard (26 oktober
 * 2026, opdracht eigenaar: "analyseer elke nieuwe zin één keer en bewaar dit
 * samen met de stem, zodat het daarna niets meer kost").
 *
 *   1. Eerst het gebarenwoordenboek (lib/bliepo-gebaren.ts): kost niets.
 *   2. Vindt dat niets en is de zin lang genoeg, dan een goedkoop AI-model
 *      (OPENAI_MODEL_GEBAREN, standaard gpt-5-nano): dat mag alleen kiezen
 *      uit de gebaren die er zijn, hooguit twee, en bij twijfel geen.
 *   3. De uitkomst staat naast de stem (stem/gebaren/<sleutel>.json, ook online
 *      op het volume); daarna wordt hij alleen nog gelezen.
 *
 * Er gaat alleen de zin zelf naar het model (een zin die Bliepo zegt), geen
 * naam of iets anders van een kind. Lukt het model niet (geen sleutel, budget
 * op, storing), dan het woordenboek, en wordt het later nog eens geprobeerd.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { gebarenBijZin, type Gebaarmoment } from "@/lib/bliepo-gebaren";
import { MAP } from "@/lib/stem-server";
import { budget, kostenTokens, telDag } from "@/lib/tutor/gebruik";

const GEBAREN_MAP = path.join(MAP, "gebaren");
const MODEL = () => process.env.OPENAI_MODEL_GEBAREN ?? "gpt-5-nano";
const sleutel = (zin: string) => createHash("sha256").update(zin.trim()).digest("hex").slice(0, 32);

/** De gebaren die het model mag kiezen, met wat ze laten zien. */
const KEUZES: Record<string, string> = {
  wijzen1: "naar de opdracht op het scherm wijzen (bij kijk, hier, deze)",
  vraag1: "open handen, een vraag stellen",
  denken: "hand bij de borst, hoofd scheef: nadenken",
  geruststellen: "geruststellen: geeft niet",
  knikken2: "aanmoedigen",
  groot: "handen ver uit elkaar: groot, veel",
  klein: "handen dicht bij elkaar: klein, een beetje",
  erbij: "iets naar zich toe halen: erbij, plus",
  eraf: "iets wegvegen: eraf, min, weg",
  meer: "hand omhoog: meer, hoger",
  minder: "hand omlaag: minder, lager",
  stop: "hand vooruit: stop, wacht",
  samen: "handen naar elkaar: samen",
  helemaal: "brede armbeweging: helemaal, alles",
  openhand: "open hand, uitnodigend",
  snel: "snelle korte bewegingen",
  langzaam: "rustige trage beweging",
};

async function leesBewaard(zin: string): Promise<Gebaarmoment[] | null> {
  try {
    const j = JSON.parse(await readFile(path.join(GEBAREN_MAP, `${sleutel(zin)}.json`), "utf8")) as { zin: string; gebaren: Gebaarmoment[] };
    return j.zin === zin.trim() && Array.isArray(j.gebaren) ? j.gebaren : null;
  } catch {
    return null;
  }
}

async function bewaar(zin: string, gebaren: Gebaarmoment[], bron: string) {
  await mkdir(GEBAREN_MAP, { recursive: true });
  await writeFile(path.join(GEBAREN_MAP, `${sleutel(zin)}.json`), JSON.stringify({ zin: zin.trim(), bron, gebaren }));
}

/** Het goedkope model: hooguit twee gebaren uit de lijst, op een woord, met een tempo. Bij twijfel geen. */
/* Geen tegoed of een storing: dan een kwartier niet meer proberen (anders bij elke nieuwe zin opnieuw). */
let pauzeTot = 0;

async function vraagModel(zin: string): Promise<Gebaarmoment[] | null> {
  const sleutelAi = process.env.OPENAI_API_KEY;
  if (!sleutelAi || budget().op || Date.now() < pauzeTot) return null;
  const woorden = zin.trim().split(/\s+/);
  const lijst = Object.entries(KEUZES)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  const antwoord = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${sleutelAi}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL(),
      store: false,
      /* De gpt-5-modellen denken eerst na: zo kort mogelijk (goedkoop). */
      ...(/^gpt-5|^o\d/.test(MODEL()) ? { reasoning_effort: "minimal", max_completion_tokens: 300 } : { temperature: 0, max_tokens: 120 }),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Je kiest handgebaren voor een robot-juf die een zin zegt tegen een kind van 6-8 jaar. " +
            'Antwoord alleen met JSON: {"gebaren":[{"woord":<index vanaf 0>,"gebaar":"<naam>","tempo":<0.6-1.4>}]}. ' +
            "Hooguit 2 gebaren, alleen bij een woord waarvan de betekenis echt bij het gebaar past; tussen de gebaren minstens 2 woorden. " +
            "Twijfel je, geef dan een lege lijst: dan praat de robot met rustige handen. Tempo 1 = gewoon, lager = rustig, hoger = snel.\n" +
            `Gebaren:\n${lijst}`,
        },
        { role: "user", content: `Zin: ${zin}\nWoorden: ${woorden.map((w, i) => `${i}=${w}`).join(" ")}` },
      ],
    }),
    signal: AbortSignal.timeout(6000),
  }).catch(() => null);
  if (!antwoord?.ok) {
    if (antwoord) console.warn(`[gebaren] model: ${antwoord.status} ${(await antwoord.text().catch(() => "")).slice(0, 160)}`);
    pauzeTot = Date.now() + 15 * 60 * 1000;
    return null;
  }
  const j = (await antwoord.json().catch(() => null)) as { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } } | null;
  telDag({ kosten_usd: kostenTokens(MODEL(), j?.usage?.prompt_tokens ?? 0, j?.usage?.completion_tokens ?? 0) });
  let ruw: { gebaren?: { woord?: unknown; gebaar?: unknown; tempo?: unknown }[] } | null = null;
  try {
    ruw = JSON.parse(j?.choices?.[0]?.message?.content ?? "");
  } catch {
    return null;
  }
  const uit: Gebaarmoment[] = [];
  for (const g of ruw?.gebaren ?? []) {
    const woord = Number(g.woord);
    const clip = String(g.gebaar ?? "");
    if (!Number.isInteger(woord) || woord < 0 || woord >= woorden.length || !(clip in KEUZES)) continue;
    if (uit.some((u) => Math.abs(u.woord - woord) < 2)) continue;
    const tempo = Math.max(0.6, Math.min(1.4, Number(g.tempo) || 1));
    uit.push({ clip, woord, soort: "ai", ...(Math.abs(tempo - 1) > 0.05 ? { tempo } : {}) });
    if (uit.length === 2) break;
  }
  return uit.sort((a, b) => a.woord - b.woord);
}

/** Het gebarenplan van een zin: bewaard, of nu één keer uitgezocht. */
export async function gebarenPlan(zin: string): Promise<Gebaarmoment[]> {
  const schoon = zin.trim();
  if (!schoon) return [];
  const bewaard = await leesBewaard(schoon);
  if (bewaard) return bewaard;
  const woordenboek = gebarenBijZin(schoon);
  if (woordenboek.length || schoon.split(/\s+/).length < 5) {
    await bewaar(schoon, woordenboek, "woordenboek").catch(() => {});
    return woordenboek;
  }
  const ai = await vraagModel(schoon);
  if (ai) {
    await bewaar(schoon, ai, MODEL()).catch(() => {});
    return ai;
  }
  /* Het model lukte niet: nu het woordenboek (leeg), niet bewaren, later nog eens. */
  return woordenboek;
}
