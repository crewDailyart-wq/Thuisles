// Controle van de voorbeeldpagina: bewaart niets behalve voor Testkind (Sara, 12 november 2026).
// Draai: npx tsx scripts/test-voorbeeld-bewaren.ts   (raakt de database niet aan)
import { voorbeeldMagBewaren as m } from "../src/lib/data/lesuitkomsten-voorbeeld";

const B = "http://localhost:3000";
const gevallen: [string | null, string, boolean][] = [
  [`${B}/voorbeeld/les/squla-geld-geldmachine-1-gouden?naam=Anna`, "Testkind", false],
  [`${B}/voorbeeld/les/squla-geld-geldmachine-1-gouden?naam=Anna`, "Anna", false],
  [`${B}/voorbeeld/les/squla-geld-geldmachine-1-gouden`, "Testkind", false],
  [`${B}/voorbeeld/les/x?naam=testkind`, "Testkind", false],
  [`${B}/voorbeeld/les/x?naam=Testkind`, "Anna", false],
  [`${B}/voorbeeld/les/x?naam=Testkind`, "Testkind", true],
  [`${B}/oefenen/rekenen/abc`, "Anna", true],
  [null, "Anna", true],
];
let ok = true;
for (const [r, k, v] of gevallen) {
  if (m(r, k) !== v) {
    ok = false;
    console.log("FOUT", r, k);
  }
}
console.log(ok ? "alles goed" : "mislukt");
if (!ok) process.exit(1);
