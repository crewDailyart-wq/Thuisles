/**
 * De bekende methode van één school, voor het schoolpaneel op de scholenkaart.
 *
 * Alleen wat er in de database staat: geverifieerd, opgegeven door ouders of
 * nog onbekend. Nooit geraden (zie src/lib/data/scholen.ts). Zonder database,
 * zoals op het Vercel-voorbeeld, is het antwoord gewoon "onbekend".
 */

import { verbinding } from "@/lib/db/sqlite";
import { methodestatus } from "@/lib/data/scholen";
import { nietVerbondenZin } from "@/lib/data/methodes";

const VESTIGINGSCODE = /^[0-9A-Z]{4}[0-9]{2}$/;

export async function GET(verzoek: Request) {
  const id = new URL(verzoek.url).searchParams.get("id") ?? "";
  if (!VESTIGINGSCODE.test(id)) return Response.json({ fout: "onbekende school" }, { status: 400 });

  try {
    const rij = verbinding().prepare("select id from scholen where vestigingscode = ?").get(id) as
      | { id: string }
      | undefined;
    if (!rij) return Response.json({ herkomst: "onbekend", methode: null, aantalOpgaven: 0, zin: nietVerbondenZin(null) });
    const s = methodestatus(String(rij.id));
    return Response.json({
      herkomst: s.herkomst,
      methode: s.methode ? { naam: s.methode.naam, uitgever: s.methode.uitgever } : null,
      aantalOpgaven: s.aantalOpgaven,
      zin: nietVerbondenZin(s.methode),
    });
  } catch {
    return Response.json({ herkomst: "onbekend", methode: null, aantalOpgaven: 0, zin: nietVerbondenZin(null) });
  }
}
