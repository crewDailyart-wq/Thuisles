// Controle van de voorbeeldpagina: bewaart niets behalve voor Testkind (Sara, 12 november 2026).
// Draai: npx tsx scripts/test-voorbeeld-bewaren.ts   (raakt de database niet aan)
import { voorbeeldMagBewaren as m } from "../src/lib/data/lesuitkomsten-voorbeeld";

const B = "http://localhost:3000";
/* De routeboom die Next.js bij een serveractie meestuurt (kop next-router-state-tree), zoals de browser hem stuurt. */
const boom = (...seg: unknown[]) => {
  let k: unknown = ["__PAGE__", {}];
  for (const s of [...seg].reverse()) k = [s, { children: k }];
  return encodeURIComponent(JSON.stringify(["", { children: k }]));
};
const VOORBEELD = boom("voorbeeld", "les", ["les", "squla-tellen-fruit-1-gouden", "d", null]);
const KINDERKANT = boom("oefenen", "rekenen", ["id", "abc", "d", null]);
const gevallen: [string | null, string, boolean, string?][] = [
  [`${B}/voorbeeld/les/squla-geld-geldmachine-1-gouden?naam=Anna`, "Testkind", false],
  [`${B}/voorbeeld/les/squla-geld-geldmachine-1-gouden?naam=Anna`, "Anna", false],
  [`${B}/voorbeeld/les/squla-geld-geldmachine-1-gouden`, "Testkind", false],
  [`${B}/voorbeeld/les/x?naam=testkind`, "Testkind", false],
  [`${B}/voorbeeld/les/x?naam=Testkind`, "Anna", false],
  [`${B}/voorbeeld/les/x?naam=Testkind`, "Testkind", true],
  [`${B}/oefenen/rekenen/abc`, "Anna", true],
  [`${B}/oefenen/rekenen/abc`, "Anna", true, KINDERKANT],
  /* 19 nov 2026 (B5, PRIVACY.md C): zonder Referer was dit "true" (bewaren); nu niet meer bij een echt kind. */
  [null, "Anna", false],
  [null, "Testkind", true],
  /* Zonder Referer, met de routeboom: */
  [null, "Anna", false, VOORBEELD],
  [null, "Testkind", true, VOORBEELD],
  [null, "Anna", true, KINDERKANT],
  [null, "Anna", false, "kapot%"],
  /* Referer zegt kinderkant, routeboom zegt voorbeeld: voor de zekerheid alleen Testkind. */
  [`${B}/oefenen/rekenen/abc`, "Anna", false, VOORBEELD],
];
let ok = true;
for (const [r, k, v, b] of gevallen) {
  if (m(r, k, b ?? null) !== v) {
    ok = false;
    console.log("FOUT", r, k, b);
  }
}
console.log(ok ? "alles goed" : "mislukt");
if (!ok) process.exit(1);
