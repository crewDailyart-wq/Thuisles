/**
 * Test van de EXTRA les Tellen (squla-tellen-fruit-1-gouden-extra, 12 november 2026; besluit Sara 20.3).
 *
 *   node scripts/test-tellen-extra-gouden.mjs                 alle routes
 *   ROUTE=goed,fout1,allefout,stil node scripts/test-tellen-extra-gouden.mjs
 *   FOTO=<map> node scripts/test-tellen-extra-gouden.mjs      schermfoto's (4 schermen, een voor een bekijken)
 *
 * Speelt de les in Chrome (scripts/extra-test-hulp.mjs), tikt nooit op de pijl, en controleert: tot de eindkaart zonder
 * vast te lopen, geen hulphandje bij een keuzevraag, het hulphandje vanzelf bij een opdracht, elke fout en elke uitkomst
 * vastgelegd, niets in de database, geen uiting 2 keer.
 */
import { start, speel, rapport } from "./extra-test-hulp.mjs";

const LES = "squla-tellen-fruit-1-gouden-extra";
const routes = (process.env.ROUTE ?? "goed,fout1,allefout,stil").split(",");
let fouten = 0;
for (const route of routes) {
  const P = await start(LES);
  const uit = await speel(P, {
    route,
    foto: (taak, z) => {
      if (route !== "goed" && route !== "allefout") return null;
      const v = taak?.vraag ?? "";
      if (taak?.soort === "kies" && v.startsWith("soort1") && taak.poging === 1) return `${route}-1-begin`;
      if (z.pijl && /Klopt|Ja, je telde|Het zijn|precies|nagekeken/.test(z.tekst.join(" ")) && !z.taak) return `${route}-2-na-goed`;
      if (v.startsWith("maak") && z.controleer && !z.antwoord) return `${route}-3-maak-klaar`;
      if (v.startsWith("lijstje") && z.controleer && !z.antwoord) return `${route}-4-lijstje-klaar`;
      if (route === "allefout" && taak?.soort === "tel" && z.hand) return `${route}-5-samen-hand`;
      return null;
    },
  });
  fouten += await rapport(`tellen-extra [${route}]`, P, uit);
}
process.exit(fouten ? 1 : 0);
