/**
 * Test van de EXTRA les Plussommen (squla-plus-bakkerij-1-gouden-extra, 12 november 2026; besluit Sara 22.3).
 *
 *   node scripts/test-plussommen-extra-gouden.mjs             alle routes
 *   ROUTE=goed,fout1,allefout,stil node scripts/test-plussommen-extra-gouden.mjs
 *   FOTO=<map> node scripts/test-plussommen-extra-gouden.mjs  schermfoto's (4 schermen, een voor een bekijken)
 */
import { start, speel, rapport } from "./extra-test-hulp.mjs";

const LES = "squla-plus-bakkerij-1-gouden-extra";
const routes = (process.env.ROUTE ?? "goed,fout1,allefout,stil").split(",");
let fouten = 0;
for (const route of routes) {
  const P = await start(LES);
  const uit = await speel(P, {
    route,
    foto: (taak, z) => {
      if (route !== "goed" && route !== "allefout") return null;
      const v = taak?.vraag ?? "";
      if (v.startsWith("getal1-") && taak?.poging === 1) return `${route}-1-welk-getal`;
      if (v.startsWith("totaal1-") && taak?.poging === 1) return `${route}-2-totaal`;
      if (v.startsWith("samen7-") && taak?.poging === 1) return `${route}-3-samen7`;
      if (v.startsWith("omwisselen-") && taak?.poging === 1) return `${route}-4-omwisselen`;
      if (route === "allefout" && v.startsWith("samen10-") && taak?.soort === "tel") return `${route}-5-samen-voordoen`;
      return null;
    },
  });
  fouten += await rapport(`plussommen-extra [${route}]`, P, uit);
}
process.exit(fouten ? 1 : 0);
