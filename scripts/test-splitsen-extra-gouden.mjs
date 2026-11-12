/**
 * Test van de EXTRA les Splitsen (squla-splits-splitsen1-1-gouden-extra, 12 november 2026; besluit Sara 21.7).
 *
 *   node scripts/test-splitsen-extra-gouden.mjs               alle routes
 *   ROUTE=goed,fout1,allefout,stil node scripts/test-splitsen-extra-gouden.mjs
 *   FOTO=<map> node scripts/test-splitsen-extra-gouden.mjs    schermfoto's (4 schermen, een voor een bekijken)
 */
import { start, speel, rapport } from "./extra-test-hulp.mjs";

const LES = "squla-splits-splitsen1-1-gouden-extra";
const routes = (process.env.ROUTE ?? "goed,fout1,allefout,stil").split(",");
let fouten = 0;
for (const route of routes) {
  const P = await start(LES);
  const uit = await speel(P, {
    route,
    foto: (taak, z) => {
      if (route !== "goed" && route !== "allefout") return null;
      const v = taak?.vraag ?? "";
      if (v === "machine-plus-4" && z.antwoord) return `${route}-1-machine`;
      if (v === "totaal-5" && taak?.poging === 1) return `${route}-2-totaal-vraag`;
      if (v === "som-3-2-5" && taak?.poging === 1) return `${route}-3-som-vraag`;
      if (v === "zoek-7" && z.controleer && !z.antwoord) return `${route}-4-zoek-7-klaar`;
      if (route === "allefout" && taak?.soort === "tel" && z.hand && v === "zoek-7") return `${route}-5-samen-hand`;
      return null;
    },
  });
  fouten += await rapport(`splitsen-extra [${route}]`, P, uit);
}
process.exit(fouten ? 1 : 0);
