import "server-only";

/**
 * Iets onleesbaar opslaan.
 *
 * Nu alleen in gebruik voor de KINDCODE: die wordt niet bewaard, alleen het
 * resultaat van scrypt — een bewerking die expres traag is, zodat raden duur
 * wordt. Elke code krijgt zijn eigen zout, zodat twee gelijke codes toch
 * verschillende regels in de database opleveren.
 *
 * Het ouderwachtwoord is er tijdelijk uit; zie `src/lib/auth/sessie.ts`. Komt
 * dat terug, dan gebeurt dat via Supabase Auth en niet hier.
 *
 * scrypt zit in Node zelf, dus er is geen extra pakket nodig.
 */

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const ZOUTLENGTE = 16;
const SLEUTELLENGTE = 64;

/** Maakt de opslagvorm: scrypt$<zout>$<sleutel>, allebei hexadecimaal. */
export function maakHash(geheim: string): string {
  const zout = randomBytes(ZOUTLENGTE);
  const sleutel = scryptSync(geheim.normalize("NFKC"), zout, SLEUTELLENGTE);
  return `scrypt$${zout.toString("hex")}$${sleutel.toString("hex")}`;
}

/**
 * Controleert een code tegen de opgeslagen vorm.
 *
 * De vergelijking gebeurt met `timingSafeEqual`: die doet er altijd even lang
 * over, zodat er niet uit de reactietijd valt af te leiden hoeveel tekens er
 * klopten.
 */
export function klopt(geheim: string, opgeslagen: string | null): boolean {
  if (!opgeslagen) return false;

  const [soort, zoutHex, sleutelHex] = opgeslagen.split("$");
  if (soort !== "scrypt" || !zoutHex || !sleutelHex) return false;

  const verwacht = Buffer.from(sleutelHex, "hex");
  if (verwacht.length === 0) return false;

  const gegeven = scryptSync(
    geheim.normalize("NFKC"),
    Buffer.from(zoutHex, "hex"),
    verwacht.length,
  );
  return timingSafeEqual(verwacht, gegeven);
}
