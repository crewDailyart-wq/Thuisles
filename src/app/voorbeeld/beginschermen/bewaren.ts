import "server-only";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { leesbareLesTekst, metBestaandeOpmaak } from "@/lib/lessen/tekstbewerking";
import { cijfersInTekst } from "@/lib/lessen/cijfertaal";

type Zinnen = Record<string, { zin1: string; zin2: string }>;
type Wensen = Record<string, { tekst: string; bijgewerkt: string; bijZin?: string }>;
const zinnenPad = path.join(process.cwd(), "src/lib/lessen/beginzinnen.json");
const map = path.join(process.cwd(), "output/lescontrole");
const wensenPad = path.join(map, "leswensen.json");
const tekstenPad = path.join(process.cwd(), "src/lib/lessen/tekstwijzigingen.json");

export function leesControle() {
  if (process.env.NODE_ENV === "production") throw new Error("Alleen beschikbaar in de lokale controlepagina.");
  return {
    zinnen: JSON.parse(readFileSync(zinnenPad, "utf8")) as Zinnen,
    wensen: existsSync(wensenPad) ? JSON.parse(readFileSync(wensenPad, "utf8")) as Wensen : {},
    teksten: existsSync(tekstenPad) ? JSON.parse(readFileSync(tekstenPad, "utf8")) as Record<string, Record<string, string>> : {},
  };
}

export function bewaarLeszin(id: string, bron: string, tekst: string, verwacht: string) {
  const { zinnen, teksten } = leesControle();
  if (!id.startsWith("squla-") || !Object.hasOwn(zinnen, id)) throw new Error("Onbekende les.");
  const regels = Object.hasOwn(teksten, id) ? teksten[id] : {};
  const oud = Object.hasOwn(regels, bron) ? regels[bron] : bron;
  if (cijfersInTekst(leesbareLesTekst(oud)) !== cijfersInTekst(verwacht)) return "conflict";
  tekst = metBestaandeOpmaak(cijfersInTekst(tekst), bron);
  if (oud === tekst) return "opgeslagen";
  mkdirSync(map, { recursive: true });
  appendFileSync(path.join(map, "wijzigingen.jsonl"), JSON.stringify({ tijd: new Date().toISOString(), id, veld: "lestekst", bron, oud, nieuw: tekst }) + "\n");
  teksten[id] = { ...regels, [bron]: tekst };
  // Een teruggezette zin heeft geen aparte correctie meer nodig.
  if (tekst === bron) delete teksten[id][bron];
  if (!Object.keys(teksten[id]).length) delete teksten[id];
  writeFileSync(`${tekstenPad}.tmp`, JSON.stringify(teksten, null, 2) + "\n");
  renameSync(`${tekstenPad}.tmp`, tekstenPad);
  return "opgeslagen";
}

/** Synchroon lezen en schrijven voorkomt dat gelijktijdige edits andere lessen overschrijven. */
export function bewaarControle(id: string, veld: "zin1" | "zin2" | "wens", tekst: string, verwacht: string, bijZin?: string) {
  const { zinnen, wensen } = leesControle();
  if (!id.startsWith("squla-") || !Object.hasOwn(zinnen, id)) throw new Error("Onbekende les.");
  const oud = veld === "wens" ? wensen[id]?.tekst ?? "" : zinnen[id][veld];
  if ((veld === "wens" ? oud !== verwacht : cijfersInTekst(oud) !== cijfersInTekst(verwacht))) return "conflict";
  if (veld !== "wens") tekst = cijfersInTekst(tekst);
  if (oud === tekst) return "opgeslagen";
  mkdirSync(map, { recursive: true });
  appendFileSync(path.join(map, "wijzigingen.jsonl"), JSON.stringify({ tijd: new Date().toISOString(), id, veld, oud, nieuw: tekst }) + "\n");
  const bestand = veld === "wens" ? wensenPad : zinnenPad;
  if (veld === "wens") wensen[id] = { tekst, bijgewerkt: new Date().toISOString(), ...(bijZin ? { bijZin } : {}) };
  else zinnen[id][veld] = tekst;
  const tijdelijk = `${bestand}.tmp`;
  writeFileSync(tijdelijk, JSON.stringify(veld === "wens" ? wensen : zinnen, null, 2) + "\n");
  renameSync(tijdelijk, bestand);
  return "opgeslagen";
}
