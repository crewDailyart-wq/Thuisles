/**
 * Alle gegevens van dit gezin als bestand.
 *
 * De ouder is beheerder van de kindgegevens en moet ze ook kunnen meenemen.
 * Dit eindpunt wordt behandeld als openbaar: er gaat nooit iets uit zonder dat
 * hier opnieuw is vastgesteld wie er is ingelogd.
 */

import { huidigeOuder } from "@/lib/auth/sessie";
import { exporteerGegevens } from "@/lib/data/ouders";

export async function GET() {
  const ouder = await huidigeOuder();
  if (!ouder) {
    return new Response("Niet ingelogd.", { status: 401 });
  }

  const gegevens = exporteerGegevens(ouder.id);
  const datum = new Date().toISOString().slice(0, 10);

  return new Response(JSON.stringify(gegevens, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="thuisles-gegevens-${datum}.json"`,
      // Nooit onderweg bewaren: dit is persoonsgegeven.
      "cache-control": "no-store",
    },
  });
}
