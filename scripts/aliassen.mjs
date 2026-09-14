/**
 * Laat Node de app-code importeren zoals Next dat doet.
 *
 * Twee dingen staan dat in de weg:
 *
 *   `@/lib/...`   Next kent dat pad uit `tsconfig.json`; Node niet. Hier wordt
 *                 het naar `src/` vertaald, inclusief het raden van de extensie.
 *   `server-only` Een markeerpakket dat een foutmelding gooit zodra het buiten
 *                 een servercomponent wordt geladen. In een controlescript is
 *                 dat precies wat we doen, dus wordt het een leeg bestand.
 *
 * Alleen voor de scripts in deze map. De app zelf gebruikt dit niet.
 */

import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";

const WORTEL = path.resolve(import.meta.dirname, "..");
const LEEG = pathToFileURL(path.join(WORTEL, "scripts", "leeg.mjs")).href;

export function resolve(spec, context, next) {
  if (spec === "server-only" || spec === "client-only") {
    return { url: LEEG, shortCircuit: true, format: "module" };
  }

  if (spec.startsWith("@/")) {
    const basis = path.join(WORTEL, "src", spec.slice(2));
    for (const eind of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
      if (existsSync(basis + eind) && !existsSync(path.join(basis + eind, "."))) {
        return next(pathToFileURL(basis + eind).href, context);
      }
    }
    for (const eind of [".ts", ".tsx", "/index.ts", "/index.tsx"]) {
      if (existsSync(basis + eind)) return next(pathToFileURL(basis + eind).href, context);
    }
    return next(pathToFileURL(basis).href, context);
  }

  return next(spec, context);
}
