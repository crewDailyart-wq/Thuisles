/**
 * Laadt de Squla-lessen (src/components/les/lessen/squla-*.tsx) in Node, om te
 * zien welke les welke voorwerpen gebruikt. Stijlbestanden, plaatjes en
 * lettertypen worden daarbij vervangen door lege stand-ins; er wordt niets
 * getekend of gespeeld.
 */
import { registerHooks } from "node:module";
import { readdirSync } from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const WORTEL = path.resolve(import.meta.dirname, "../..");
registerHooks({
  load(url, ctx, next) {
    if (/\.(css|svg|png|webp|jpg)(\?|$)/.test(url)) return { format: "module", source: "export default new Proxy({}, { get: (_, k) => String(k) });", shortCircuit: true };
    return next(url, ctx);
  },
});
globalThis.window ??= globalThis;
globalThis.document ??= { createElement: () => ({ getContext: () => null, style: {} }), documentElement: { style: {} } };

const STUB = path.join(import.meta.dirname, "font-stub.cjs");
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(WORTEL, "src"), "next/font/google": STUB, "next/font/local": STUB }, jsx: true, tryNative: false });

/** Alle Squla-lessen: { id, titel, voorwerpen }. */
export async function squlaLessen() {
  const map = path.join(WORTEL, "src/components/les/lessen");
  const lessen = [];
  for (const f of readdirSync(map).filter((f) => /^squla-.*\.tsx$/.test(f)).sort()) {
    let m;
    try {
      m = await jiti.import(path.join(map, f));
    } catch (e) {
      /* een bouwer is er misschien net mee bezig: overslaan en melden, niet stoppen */
      console.warn(`let op: ${f} laadt nu niet (${String(e.message).split("\n")[0]}); overgeslagen`);
      continue;
    }
    for (const v of Object.values(m)) if (Array.isArray(v)) for (const l of v) if (l && typeof l.id === "string" && typeof l.speel === "function") lessen.push({ id: l.id, titel: l.titel, voorwerpen: l.voorwerpen ?? [], bestand: f });
  }
  return lessen;
}

/** De lijst met voorwerpen en groepen (src/lib/voorwerpen). */
export async function voorwerpenLijst() {
  return jiti.import(path.join(WORTEL, "src/lib/voorwerpen/index.ts"));
}
