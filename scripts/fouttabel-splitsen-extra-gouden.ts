/**
 * Maakt FOUTTABEL-squla-splits-splitsen1-1-gouden-extra.md uit de code (squla-splitsen-extra-zinnen.ts), zodat de tabel
 * altijd klopt met de les.
 *   npx tsx scripts/fouttabel-splitsen-extra-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { AANMOEDIG_TIKKEN, NIEUWKEUZES, SOMKEUZES, SPLITSREACTIE, TOTAAL5, TOTAAL7, TUSSENKEUZES, ZIN, foutenNieuw, foutenSom, foutenTotaal, splitsFout, tussenFout, type FoutV } from "../src/components/les/lessen/squla-splitsen-extra-zinnen";
import { controleer, kaal, schrijf, tabel, type Rij } from "./fouttabel-extra-hulp";
import { maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";

const rijen: Rij[] = [];
for (const [x, f] of Object.entries(foutenTotaal())) rijen.push({ vraag: `Stap 7: wat staat er in het totaal? (goed: ${TOTAAL5}; delen 3 en 2)`, antwoord: x, f, opties: ["3", "2", "5"], goed: "5" });
for (const [x, f] of Object.entries(foutenSom())) rijen.push({ vraag: "Stap 9: welke som heb je gemaakt? (goed: 3 + 2 = 5)", antwoord: x, f, opties: SOMKEUZES, goed: SOMKEUZES[0] });
for (const x of TUSSENKEUZES.filter((k) => k !== "5")) rijen.push({ vraag: "Stap 9, tussenvraag na een fout: wat is 3 + 2? (1 poging; daarna zegt Bliepo het)", antwoord: x, f: tussenFout(x), opties: TUSSENKEUZES, goed: "5" });
for (const [x, f] of Object.entries(foutenNieuw())) rijen.push({ vraag: `Stap 11: nieuw totaal, welk getal? (goed: ${TOTAAL7})`, antwoord: x, f, opties: NIEUWKEUZES, goed: String(TOTAAL7) });
const standen: [number, number, number][] = [[3, 3, 7], [4, 4, 7], [1, 3, 7], [6, 2, 7], [7, 7, 7], [0, 7, 7], [0, 0, 7], [4, 3, 8], [5, 4, 8], [4, 5, 10], [6, 6, 10], [0, 10, 10]];
for (const [a, b, t] of standen) rijen.push({ vraag: `Stap 12, 14, 15: zoek 2 delen die samen ${t} maken (totaal ${t})`, antwoord: `${a} + ${b}`, f: splitsFout(a, b, t, 0) });

const { beweringen } = controleer(rijen);

/*
 * 18 november 2026: ALLE varianten nalopen (niet alleen de vaste van de tabel). Elke combinatie van eerste zin en hint gaat
 * door dezelfde controle (verklappen 15.17, geen opdracht bij de 2e fout), plus: nooit het woord "fout", genoeg varianten,
 * elke bewering waar (te veel / te weinig, de som van de delen), en de kiezer 20.000 keer nagespeeld.
 */
const problemen: string[] = [];
const alleRijen: Rij[] = [];
for (const r of rijen) {
  const v = (r.f as FoutV).v;
  if (!v) continue;
  for (const eerste of v.eerste) for (const hint of v.hint) for (const uitleg of v.uitleg) alleRijen.push({ ...r, f: { ...r.f, eerste, hint, uitleg, weer: [] } });
  for (const w of v.weerEerste) for (const u of v.weerUitleg) alleRijen.push({ ...r, f: { ...r.f, weer: [w, u] } });
  const waar = `${r.vraag} ${r.antwoord}`;
  if (v.eerste.length < 3) problemen.push(`${waar}: maar ${v.eerste.length} variant(en) van de eerste zin`);
  if (v.hint.length < 2 || v.uitleg.length < 2) problemen.push(`${waar}: minder dan 2 varianten van hint of uitleg`);
  if (v.weerEerste.length < 3) problemen.push(`${waar}: minder dan 3 varianten van "weer"`);
  for (const z of [...v.eerste, ...v.hint, ...v.uitleg, ...v.weerEerste, ...v.weerUitleg]) if (/\bfout/i.test(z)) problemen.push(`${waar}: het woord "fout" in "${kaal(z)}"`);
  /* Waarheid bij de splitsopdrachten: de getallen in de eerste zin zijn de delen van het kind en hun som; de richting klopt. */
  const m = /^(\d+) \+ (\d+)$/.exec(r.antwoord);
  const t = Number(/totaal (\d+)/.exec(r.vraag)?.[1]);
  if (m && t) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    for (const z of [...v.eerste, ...v.hint, ...v.weerEerste].map(kaal)) {
      if (/te weinig|stippen bij/.test(z) && !(a + b < t)) problemen.push(`${waar}: niet waar (te weinig): "${z}"`);
      if (/te veel|stippen af/.test(z) && !(a + b > t)) problemen.push(`${waar}: niet waar (te veel): "${z}"`);
      if (/leeg|geen stippen|zonder stippen/.test(z) && a !== 0 && b !== 0) problemen.push(`${waar}: niet waar (leeg): "${z}"`);
    }
    if (a && b) for (const z of v.eerste.map(kaal)) if ((z.match(/\d+/g) ?? []).join() !== `${a},${b},${a + b}`) problemen.push(`${waar}: de getallen kloppen niet: "${z}"`);
  }
}
controleer(alleRijen);
{
  const vorm = maakVorm();
  const K = maakKiezer();
  const laatste = new Map<string, string>();
  let dubbel = 0;
  let keer = 0;
  const neem = (sleutel: string, zinnen: string[]) => {
    const z = K.kies(sleutel, zinnen);
    keer++;
    if (laatste.get(sleutel) === vorm(z) && new Set(zinnen.map(vorm)).size > 1) dubbel++;
    laatste.set(sleutel, vorm(z));
  };
  const metV = rijen.filter((r) => (r.f as FoutV).v);
  for (let i = 0; i < 20000; i++) {
    const v = (metV[Math.floor(Math.random() * metV.length)].f as FoutV).v!;
    neem("eerste", v.eerste);
    neem("hint", v.hint);
    if (Math.random() < 0.5) {
      neem("weer", v.weerEerste);
      neem("uitleg", v.weerUitleg);
    } else neem("uitleg", v.uitleg);
    neem("samenZet", ZIN.samenZet(3));
    neem("samenKlaar", ZIN.samenKlaar(3, 7));
    neem("aanmoedigTikken", AANMOEDIG_TIKKEN);
    neem("tikPlus", ZIN.tikPlus);
    neem("plusMin", ZIN.plusMin);
    neem("goedSplits", ZIN.goedSplits(3, 4, 7));
    neem("reactie", SPLITSREACTIE(3, 4, 7).zinnen);
  }
  console.log(`Nooit 2 keer hetzelfde: ${keer} keer gekozen, ${dubbel} keer 2 keer achter elkaar dezelfde zin (moet 0).`);
  if (dubbel) problemen.push(`de kiezer gaf ${dubbel} keer 2 keer achter elkaar dezelfde zin`);
}
const VERLOOP: [string, string[], number][] = [
  ["Begin van de les", ZIN.begin, 2],
  ["Hulphandje: aanmoediging", AANMOEDIG_TIKKEN, 3],
  ["Hulphandje bij een plus", ZIN.tikPlus, 2],
  ["Hulphandje bij een splitsopdracht", ZIN.plusMin, 2],
  ["Goed gesplitst (zoek 2 delen)", ZIN.goedSplits(3, 4, 7), 3],
  ["Zin met de som na lof", SPLITSREACTIE(3, 4, 7).zinnen, 5],
  ["Al gevonden (telt niet als mis)", ZIN.alGevonden(3, 4, 7), 2],
  ["Omgedraaid bij 7, 8 en 10 (telt niet als mis)", ZIN.omgedraaid, 2],
  ["Samen: Bliepo zet het deel links", ZIN.samenZet(3), 3],
  ["Samen: klaar", ZIN.samenKlaar(3, 7), 3],
  ["Samen: Bliepo zoekt het andere deel zelf", ZIN.samenZelf(3, 7), 2],
  ["Slot", ZIN.slot, 2],
  ["Tik op de kaart", ZIN.kaartTik, 3],
];
for (const [naam, zinnen, min] of VERLOOP) {
  if (new Set(zinnen).size < min) problemen.push(`${naam}: maar ${new Set(zinnen).size} variant(en), moet minstens ${min}`);
  for (const z of zinnen) if (/\bfout/i.test(z)) problemen.push(`${naam}: het woord "fout" in "${kaal(z)}"`);
}
for (const z of ZIN.samenZelf(3, 7)) if (!/^Kijk, /.test(z)) problemen.push(`vangnet: begint niet met "Kijk, ": "${kaal(z)}"`);
/* De vaste zinnen: nooit "fout", geen "een voor een" (cijferafspraak), geen som 2 keer in 1 zin. */
const VAST = [ZIN.beginKijk, ZIN.a1, ZIN.a1Klaar, ZIN.a2, ZIN.a2Hand, ...ZIN.a2Klaar, ZIN.a3, ZIN.vraagTotaal, ZIN.totaalGoed, ZIN.totaalUitleg, ZIN.totaalTel(5), ...ZIN.vraagSom, ZIN.somGoed, ZIN.somUitleg, ZIN.tussen, ZIN.tussenGoed, ZIN.tussenFout("32"), ZIN.tussenFout("4"), ...ZIN.anders, ZIN.omgedraaid5, ...ZIN.nieuwTotaal, ZIN.nieuwGoed, ZIN.nieuwHint, ZIN.nieuwUitleg, ZIN.nieuwTel, ZIN.zoekOpdracht, ZIN.nogOpdracht, ...ZIN.keuzeVraag, ZIN.keuzeReactie, ZIN.keuzeOpdracht(8), ZIN.keuzeNog(3, 5, 8), ZIN.keuzeNogOpdracht(8)];
for (const z of VAST.map(kaal)) {
  if (/\bfout|een voor een/i.test(z)) problemen.push(`vaste zin: "fout" of "een voor een" in "${z}"`);
  if ((z.match(/3 \+ 2 = 5/g) ?? []).length > 1) problemen.push(`vaste zin: de som staat 2 keer in "${z}"`);
  for (const deel of z.split(/(?<=[.!?]) /)) if (deel.split(/\s+/).length > 14) problemen.push(`vaste zin langer dan 14 woorden: "${deel}"`);
}
if (problemen.length) {
  console.error("PROBLEMEN:\n" + problemen.join("\n"));
  process.exit(1);
}
console.log(`Alle varianten: ${alleRijen.length} combinaties nagelopen (verklappen, geen opdracht bij de 2e fout, waarheid, nooit "fout").`);
console.log(`Controle: ${rijen.length} rijen; ${beweringen} keuzes nagelopen (geen hint verklapt het antwoord); geen opdracht in de zinnen bij de 2e fout.`);

const tekst = `# FOUTTABEL — extra les Splitsen (squla-splits-splitsen1-1-gouden-extra, "Splitsen, extra")

Gemaakt op 12 november 2026, bijgewerkt op 18 november 2026 (warmere zinnen in varianten, zelfde aanpak als de proefles Tellen; oud naast nieuw in WIJZIGINGEN-ZINNEN-SPLITSEN.md), **uit de code** met \`npx tsx scripts/fouttabel-splitsen-extra-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-splitsen-extra-zinnen.ts\` en draai het script opnieuw. Besluit Sara 12 november 2026 (21.7): de Synthesis-opdrachten uit het draaiboek Splitsen die niet in de Squla-les zitten, als EXTRA les naast de gouden les.

**EIGEN INVULLING, NIET VAN SYNTHESIS.** De getallen zijn die van het draaiboek (5, 7, 8); het getal 12 uit "Larger" is 10 geworden, omdat Squla Splitsen tot 10 gaat. Het draaiboek rekent bij een foute splitsing de gekozen delen voor (§3 F.2) en noemt bij het totaal "dat is een van de delen" (§3 B.2); Bliepo doet dat ook, met de denkfout erbij (BOUWREGELS 15.9). Niet gebouwd: de woorden "samenstellen" en "ontleden", de piano, "weet je nog hoe dat heet?" en de tegel van 5 (Engels of niet Squla-stof, draaiboek §10).

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **Keuzevragen (stap 7, 9 en 11):** 1e fout = scherm 1,5 s rood (geen fout-geluidje), Bliepo noemt wat het kind koos en de denkfout; dan komen de knoppen terug met de hint. 2e fout = uitleg (zonder het antwoord) en samen voordoen: bij het totaal telt Bliepo de stippen bovenaan, bij de som komt de tussenvraag "wat is 3 + 2?" (1 poging; daarna zegt Bliepo het), bij een nieuw totaal telt Bliepo de stippen. De les gaat door. Elk vervolg gaat vanzelf (15.27).
- **Splitsopdrachten (stap 10, 12, 14, 15):** het kind maakt 2 delen met de plus en de min en tikt het vinkje (bij 5 wordt vanzelf nagekeken, na 0,7 s rust; draaiboek stap 10). 1e fout = Bliepo rekent de gekozen delen voor ("Je hebt 3 en 3. Samen is dat 6. Dat is te weinig.") of zegt dat een deel leeg is; de delen blijven staan; het kind mag verder. 2e fout = uitleg, en Bliepo zet het linkerdeel (draaiboek §3 F.6): het kind zoekt het andere deel, de stippen tellen mee, Bliepo zegt wat er gemaakt is. "Al gevonden" en (bij 7 en 8 en 10) "omgedraaid" tellen NIET als fout: Bliepo zegt het en het kind probeert opnieuw (draaiboek §3 F.4 en F.5). Bij 5 telt omgedraaid wel goed (§3 F.5).
- **Hulphandje (15.19):** komt vanzelf na ± 6 s stilte bij een opdracht, wijst naar een plus; nooit bij een keuzevraag, nooit een knop. **Heel snel antwoorden:** Bliepo zegt niets (draaiboek §3 B.7, F.8).
- **Verklappen (15.17):** het script controleert dat er na de eerste zin en de hint minstens 2 keuzes overblijven, voor ELKE combinatie van varianten.
- **Varianten (18 november 2026):** elke zin bij een fout bestaat in varianten (§4). De les kiest willekeurig, maar nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen (gedeelde kiezer \`nooit-dubbel.ts\`). In §2 staat per fout antwoord 1 vaste variant als voorbeeld.
- Elke fout wordt met de naam van de denkfout bewaard (tabel \`les_uitkomsten\`, kolom denkfout; \`onduidelijk\` wordt \`onbekend\`), elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`deel-ipv-totaal\` | koos een deel in plaats van het totaal | draaiboek §3 B.2 (gezien, R1) |
| \`andere-getallen-gekozen\` | koos een som met getallen die niet in de machine staan | eigen invulling (draaiboek §3 C: "4 + 2 = 6") |
| \`deel-en-totaal-opgeteld\` | gebruikte het totaal als een van de delen | eigen invulling |
| \`cijfers-naast-elkaar\` | zette de cijfers naast elkaar (3 en 2 werd 32) | draaiboek §3 C.2 (gezien, P-8nov) |
| \`som-te-weinig\` | rekende de som 1 te weinig uit | draaiboek §3 C.2 (gezien, R1: 4) |
| \`totaal-een-te-veel\` / \`totaal-een-te-weinig\` | telde 1 stip te veel of te weinig | draaiboek §3 B.2 (gezien, R1: 8 bij 7) |
| \`delen-samen-te-weinig\` / \`delen-samen-te-veel\` | de 2 delen samen zijn te weinig of te veel | draaiboek §3 F.2 (gezien, 6× R1) |
| \`een-deel-leeg\` | liet een deel leeg (of 0) | draaiboek §3 F.3 (gezien, R1) |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen | BOUWREGELS 15.9 |

## 2. Per vraag: elk fout antwoord (${rijen.length} rijen)

${tabel(rijen)}

## 3. Goed

- **Goed in één keer:** scherm 1 s groen, een lofzin uit het rijtje (BLIEPO-KARAKTER.md §3) en de som of het aantal (${SPLITSREACTIE(4, 3, 7).zinnen.map((z) => `"${kaal(z)}"`).join(" / ")}). Een gevonden som komt in het lijstje rechtsboven (draaiboek §3 F.1).
- **Goed na een fout:** alleen een korte bevestiging (BLIEPO-KARAKTER.md §3.4); vanzelf door.
- **Bij 5 omgedraaid (3 + 2 wordt 2 + 3):** "${ZIN.omgedraaid5}" (draaiboek §3 F.5).

## 4. Alle varianten (18 november 2026)

De les kiest uit elk rijtje steeds een andere zin dan de vorige keer.

### Bij een fout

| Vraag en antwoord | Eerste zin | Hint | Uitleg bij de 2e keer | "Weer" (2 keer dezelfde denkfout of hetzelfde antwoord) |
|---|---|---|---|---|
${rijen.filter((r) => (r.f as FoutV).v).map((r) => { const v = (r.f as FoutV).v!; return `| ${r.vraag.split(":")[0]}: ${r.antwoord} | ${v.eerste.map(kaal).join(" / ")} | ${v.hint.map(kaal).join(" / ")} | ${v.uitleg.map(kaal).join(" / ")} | ${v.weerEerste.map(kaal).join(" / ")} |`; }).join("\n")}

### Het verloop

| Situatie | Varianten |
|---|---|
${VERLOOP.map(([naam, z]) => `| ${naam} | ${z.map(kaal).join(" / ")} |`).join("\n")}
`;
schrijf("FOUTTABEL-squla-splits-splitsen1-1-gouden-extra.md", tekst);
