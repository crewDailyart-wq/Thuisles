/**
 * Maakt FOUTTABEL-squla-plus-bakkerij-1-gouden-extra.md uit de code (squla-plussommen-extra-zinnen.ts), zodat de tabel
 * altijd klopt met de les.
 *   npx tsx scripts/fouttabel-plussommen-extra-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { SOMREACTIE, ZIN, aanvulFout, dichtbij, getalFout, maakFoutKiezer, omwisselFout, somFout, somKeuzes, totaalFout, zelfdeKern, type FoutV } from "../src/components/les/lessen/squla-plussommen-extra-zinnen";
import { maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";
import { controleer, kaal, schrijf, tabel, type Rij } from "./fouttabel-extra-hulp";

const rijen: Rij[] = [];
/* Stap 2: welk getal? Alle tegels 1 t/m 9 die het kind kan kiezen. */
for (let n = 1; n <= 9; n++) {
  const opties = dichtbij(n, 9);
  for (const x of opties.filter((k) => k !== n)) rijen.push({ vraag: `Stap 2: welk getal is dit? (tegel ${n}; keuzes ${opties.join(" / ")})`, antwoord: String(x), f: getalFout(x, n, opties, n), opties: opties.map(String), goed: String(n) });
}
/* Stap 4 en 6: het totaal van 2 tegels (een paar echte voorbeelden). */
for (const [a, b] of [[2, 3], [3, 4], [4, 5], [1, 1]] as [number, number][]) {
  const opties = dichtbij(a + b, 18);
  for (const x of opties.filter((k) => k !== a + b)) rijen.push({ vraag: `Stap 4 en 6: totaal van ${a} en ${b} (keuzes ${opties.join(" / ")})`, antwoord: String(x), f: totaalFout(x, a, b, opties, a), opties: opties.map(String), goed: String(a + b) });
}
/* Stap 7, 8 en 12: de tegel zoeken die er samen met de gekozen tegel `doel` van maakt. */
for (const [gekozen, doel, k] of [[6, 7, 2], [6, 7, 1 + 6], [3, 7, 1], [3, 10, 4], [4, 10, 8], [5, 10, 4]] as [number, number, number][]) rijen.push({ vraag: `Stap 7, 8, 12: maak samen ${doel} met de ${gekozen}`, antwoord: `tegel ${k}`, f: aanvulFout(gekozen, k, doel) });
/* Stap 9: de som kiezen. */
for (const [p, q] of [[3, 7], [4, 6]] as [number, number][]) for (const x of somKeuzes(p, q).slice(1)) rijen.push({ vraag: `Stap 9: welke som hoort bij ${p} en ${q}? (goed: ${somKeuzes(p, q)[0]})`, antwoord: x, f: somFout(x, p, q), opties: somKeuzes(p, q), goed: somKeuzes(p, q)[0] });
/* Stap 11: omwisselen. */
for (const x of [9, 11]) rijen.push({ vraag: "Stap 11: omwisselen, wat is het totaal nu? (goed: 10; keuzes 10 / 9 / 11)", antwoord: String(x), f: omwisselFout(x), opties: ["10", "9", "11"], goed: "10" });

const { beweringen } = controleer(rijen);
console.log(`Controle: ${rijen.length} rijen; ${beweringen} keuzes nagelopen (geen hint verklapt het antwoord); geen opdracht in de zinnen bij de 2e fout.`);

/*
 * STRENGER (Sara, 18 november 2026, zoals de proefles Tellen): dezelfde controles voor ALLE varianten van elke rij.
 * Verklappen (15.17): na elke eerste zin met elke hint blijven er minstens 2 keuzes over en valt het goede antwoord niet
 * af; een zin met een richting heeft de goede richting; noemt Bliepo de richting niet, dan geeft geen enkele variant er
 * een. Verder: nooit het woord "fout", geen getal 2 keer in 1 zin, geen opdracht in de zinnen bij de 2e fout, genoeg
 * varianten, en de kiezer geeft nooit 2 keer achter elkaar dezelfde zin (20.000 keer nagespeeld).
 */
const problemen: string[] = [];
const ZEGT_MEER = /te weinig|meer vakjes|ik tel er meer|samen zijn het er meer|iets meer dan|nog meer/i;
const ZEGT_MINDER = /te veel|ik tel er minder|minder vakjes|samen zijn het er minder|iets minder dan|zo veel vakjes heeft de tegel niet/i;
const RICHTING = /te weinig|te veel|\bmeer\b|\bminder\b|zo veel|overgeslagen|niet meegeteld|2 keer|maar 1 keer|alle vakjes/i;
const BIJNA = /dichtbij|bijna|scheelt|net niet|\bnet\b|iets te/i;
const OPDRACHT = /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Sla|Leg|Sleep|Schuif|Pak|Zoek|Tik|Zet|Kies|Maak|Verander|Lees|Probeer)\b/;
let combinaties = 0;
for (const r of rijen) {
  const f = r.f as FoutV;
  const waar = `${r.vraag} ${r.antwoord}`;
  if (f.code === "onduidelijk") continue;
  const v = f.v;
  if (!v) {
    problemen.push(`${waar}: geen varianten`);
    continue;
  }
  if (v.eerste.length < 3) problemen.push(`${waar}: maar ${v.eerste.length} varianten van de eerste zin (moet minstens 3)`);
  if (v.hint.length < 2) problemen.push(`${waar}: maar ${v.hint.length} varianten van de hint (moet minstens 2)`);
  if (v.uitleg.length < 2) problemen.push(`${waar}: maar ${v.uitleg.length} varianten van de uitleg (moet minstens 2)`);
  if (!v.eerste.includes(f.eerste) || !v.hint.includes(f.hint) || !v.uitleg.includes(f.uitleg)) problemen.push(`${waar}: de vaste variant staat niet in de varianten`);
  const isAanvul = r.antwoord.startsWith("tegel ");
  for (const z of [...v.eerste, ...v.hint, ...v.uitleg, ...v.weerEerste, ...v.weerUitleg]) {
    if (/\bfout/i.test(z)) problemen.push(`${waar}: het woord "fout" in "${kaal(z)}"`);
    /* Geen getal 2 keer in 1 variant. Bij het aanvullen mag de tegel 2 keer als het kind dezelfde tegel erbij legt (3 en 3). */
    const g2 = kaal(z).match(/\d+/g) ?? [];
    if (!isAanvul && new Set(g2).size !== g2.length) problemen.push(`${waar}: een getal staat 2 keer in "${kaal(z)}"`);
  }
  for (const z of [...v.uitleg, ...v.weerEerste, ...v.weerUitleg, ...v.eerste]) if (OPDRACHT.test(kaal(z))) problemen.push(`${waar}: opdracht in een zin die bij de 2e fout kan komen: "${kaal(z)}"`);
  if (v.weerEerste.length && f.noot) problemen.push(`${waar}: "weer" terwijl Bliepo de richting de 1e keer niet noemde`);
  for (const e of v.eerste)
    for (const h of v.hint) {
      combinaties++;
      const tekst = kaal(`${e} ${h}`);
      if (f.noot && RICHTING.test(tekst)) problemen.push(`${waar}: richting niet genoemd, maar de zin geeft er toch een: "${tekst}"`);
      if (!r.opties || !r.goed) continue;
      const getallen = r.opties.every((o) => /^\d+$/.test(o));
      if (!getallen) {
        /* Sommen: de hint mag de goede som niet als enige overlaten. "Plus" laat er 2 over (de goede en de getallen naast elkaar). */
        const over = r.opties.filter((o) => o !== r.antwoord && (/een plus/.test(tekst) ? o.includes("+") : true));
        if (over.length <= 1) problemen.push(`${waar}: na "${tekst}" blijft alleen ${over.join("")} over`);
        continue;
      }
      const x = Number(r.antwoord);
      const goed = Number(r.goed);
      const meer = ZEGT_MEER.test(tekst);
      const minder = ZEGT_MINDER.test(tekst);
      const bijna = BIJNA.test(tekst);
      if (meer && minder) problemen.push(`${waar}: "${tekst}" zegt meer en minder tegelijk`);
      if ((meer && goed < x) || (minder && goed > x)) problemen.push(`${waar}: verkeerde richting in "${tekst}"`);
      if (bijna && Math.abs(goed - x) > 2) problemen.push(`${waar}: "bijna", maar het scheelt meer dan 2: "${tekst}"`);
      if (!f.noot && !ZEGT_MEER.test(kaal(e)) && !ZEGT_MINDER.test(kaal(e))) problemen.push(`${waar}: eerste zin zonder richting terwijl "weer" daarop rekent: "${kaal(e)}"`);
      const over = r.opties.map(Number).filter((k) => k !== x && (meer ? k > x : true) && (minder ? k < x : true) && (bijna ? Math.abs(k - x) <= 2 : true));
      if (!over.includes(goed)) problemen.push(`${waar}: na "${tekst}" valt het goede antwoord af`);
      if (over.length <= 1) problemen.push(`${waar}: na "${tekst}" blijft alleen ${over.join("")} over (verklapt het antwoord, 15.17)`);
    }
  /* Waarheid: "1 vakje" alleen als het er precies 1 scheelt, "een paar" alleen als het er meer zijn. */
  if (r.opties && r.goed && /^\d+$/.test(r.goed)) {
    const verschil = Math.abs(Number(r.goed) - Number(r.antwoord));
    for (const z of v.uitleg.map(kaal)) {
      if (/\b1 vakje\b/.test(z) && verschil !== 1) problemen.push(`${waar}: "1 vakje", maar het scheelt ${verschil}: "${z}"`);
      if (/een paar vakjes/.test(z) && verschil < 2) problemen.push(`${waar}: "een paar vakjes", maar het scheelt 1: "${z}"`);
    }
  }
}
/*
 * F16 (Sara, 18 november 2026; BOUWREGELS 15.37): wacht de les op het kind, dan staat er een vraag of een opdracht in
 * beeld. Na de 1e fout staat alleen de hint in beeld, dus ELKE hint heeft een vraagteken of een opdracht die zegt wat het
 * kind doet ("Tel …", "Begin …", "Kies …"). "Kijk …" en "Probeer het nog eens." tellen niet. Zelfde regel als de meter in
 * scripts/vraag-aanwezig-controle.mjs.
 */
const F16_WERKWOORD = "tik|kies|sleep|tel|zet|leg|maak|typ|vul|zoek|wijs|druk|klik|pak|schuif|draai|geef|kleur|verdeel|splits|bouw|meet|weeg|noem|schrijf|trek|hang|ruim|vink|verplaats|breng|plak|knip|reken|vergelijk|verbind|stapel|spring|loop|tril|schud|gooi|sorteer|begin";
const F16_BEGIN = new RegExp(`^(?:(?:nu|en|dan|maar|oké|ok|kom|toe maar|eerst|daarna|ja|nee)[,:]?\\s+)*(?:${F16_WERKWOORD})\\b`, "i");
const F16_MIDDEN = new RegExp(`(?:\\ben|\\bdan|\\bof|,|:)\\s+(?:${F16_WERKWOORD})\\b`, "i");
const heeftOpdracht = (tekst: string) => /\?/.test(tekst) || tekst.split(/(?<=[.!:;])\s+/).some((z) => F16_BEGIN.test(z.replace(/^[^A-Za-zÀ-ɏ0-9]+/, "")) || F16_MIDDEN.test(z));
for (const r of rijen) for (const h of (r.f as FoutV).v?.hint ?? [r.f.hint]) if (!heeftOpdracht(kaal(h))) problemen.push(`${r.vraag} ${r.antwoord}: F16: de hint heeft geen vraag of opdracht: "${kaal(h)}"`);
/* Nooit 2 keer hetzelfde: de kiezer van de les (maakFoutKiezer), 20.000 keer met willekeurige rijen. */
{
  const vorm = maakVorm();
  const K0 = maakKiezer();
  const laatste = new Map<string, string>();
  let dubbel = 0;
  let keer = 0;
  let zelfdeInReactie = 0;
  const K = {
    kies(sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) {
      const z = K0.kies(sleutel, zinnen, mag);
      keer++;
      if (laatste.get(sleutel) === vorm(z) && new Set(zinnen.map(vorm)).size > 1) {
        dubbel++;
        if (dubbel <= 5) console.error(`   dubbel bij "${sleutel}": ${kaal(z)}`);
      }
      laatste.set(sleutel, vorm(z));
      return z;
    },
  };
  const perVraag = new Map<string, Rij[]>();
  for (const r of rijen) perVraag.set(r.vraag, [...(perVraag.get(r.vraag) ?? []), r]);
  const vragen = [...perVraag.values()];
  for (let i = 0; i < 20000; i++) {
    const groep = vragen[Math.floor(Math.random() * vragen.length)];
    const kies = maakFoutKiezer(K, (x) => ZIN.weerGekozen(x));
    const r1 = groep[Math.floor(Math.random() * groep.length)];
    const f1 = kies(r1.antwoord, r1.f as FoutV);
    if (f1.eerste && f1.eerste === f1.hint) zelfdeInReactie++;
    if (Math.random() < 0.5) continue;
    const r2 = groep[Math.floor(Math.random() * groep.length)];
    const f2 = kies(r2.antwoord, r2.f as FoutV);
    if (f2.eerste && (f2.eerste === f2.uitleg || f2.eerste === f1.eerste)) zelfdeInReactie++;
    if (f1.eerste && f2.eerste && r1.antwoord !== r2.antwoord && zelfdeKern(f1.eerste, f2.eerste) && ((r2.f as FoutV).v?.eerste ?? []).some((z) => !zelfdeKern(f1.eerste, z)) && !/weer/.test(f2.eerste)) problemen.push(`${r1.vraag}: 2 keer "bijna/dichtbij" bij 1 vraag: "${kaal(f1.eerste)}" en dan "${kaal(f2.eerste)}"`);
    if (OPDRACHT.test(kaal(`${f2.eerste} ${f2.uitleg}`))) problemen.push(`${r2.vraag} ${r2.antwoord}: opdracht in de zinnen bij de 2e fout: "${kaal(`${f2.eerste} ${f2.uitleg}`)}"`);
    if (/\bweer\b/.test(f2.eerste) && r1.antwoord !== r2.antwoord && (r1.f.noot || r1.f.soort !== r2.f.soort)) problemen.push(`${r2.vraag}: "weer" terwijl Bliepo dat de 1e keer niet zei: "${kaal(f2.eerste)}"`);
    K.kies("aanmoedigTikken", ZIN.aanmoedigTikken);
    K.kies("kiesHand", ZIN.kiesHand);
    K.kies("samenZet", ZIN.samenZet);
  }
  console.log(`Nooit 2 keer hetzelfde: ${keer} keer gekozen, ${dubbel} keer 2 keer achter elkaar dezelfde zin (moet 0); ${zelfdeInReactie} keer dezelfde zin 2 keer in 1 reactie (moet 0).`);
  if (dubbel) problemen.push(`de kiezer gaf ${dubbel} keer 2 keer achter elkaar dezelfde zin`);
  if (zelfdeInReactie) problemen.push(`${zelfdeInReactie} keer stond dezelfde zin 2 keer in 1 reactie`);
}
/* De vaste zinnen van het verloop: nooit "fout", geen getal 2 keer in 1 zin, genoeg varianten per situatie. */
const VERLOOP: [string, string[], number][] = [
  ["Begin van de les", ZIN.begin.map((z) => `${z} ${ZIN.beginTegels}`), 2],
  ["De eerste tegel", [ZIN.kies1], 1],
  ["Nog een tegel", ZIN.kiesAnder, 3],
  ["Het hulphandje (aanmoediging)", ZIN.aanmoedigTikken, 5],
  ["Het hulphandje (wat te doen)", ZIN.kiesHand, 2],
  ["Welk getal? (de vraag, 3 keer)", ZIN.welkGetal, 3],
  ["Welk getal: goed", ZIN.getalGoed(5), 3],
  ["Welk getal: Bliepo telde de vakjes", ZIN.getalTel(5), 2],
  ["2 tegels: de opdracht", [ZIN.tweeTegels.join(" "), ZIN.tweeTegelsNog], 1],
  ["2 tegels: de vraag", [ZIN.vraagTotaal(2, 3).join(" ")], 1],
  ["2 tegels: Bliepo telde de vakjes", ZIN.totaalTel(2, 3, 5), 2],
  ["Maak samen 7", [ZIN.zetEen, ZIN.maakSamen(6, 7).join(" ")], 1],
  ["Moeilijker: maak samen 10", [ZIN.moeilijker.join(" "), ZIN.maakSamen10(3).join(" ")], 1],
  ["Samen voordoen: de tegel die erbij past", ZIN.samenZet, 3],
  ["Samen voordoen: klaar", ZIN.samenGoed(3, 7, 10), 3],
  ["Samen voordoen: 20 s niets, Bliepo legt de tegel", ZIN.samenZelf(3, 7, 10), 2],
  ["De som: de vraag", [ZIN.vraagSom.join(" ")], 1],
  ["De som: goed", ZIN.somGoed(3, 7), 2],
  ["De som: samen voordoen", ZIN.somSamen(3, 7), 2],
  ["Omdraaien: de vraag", [ZIN.omdraaien.join(" "), ZIN.nuBovenop(3).join(" ")], 1],
  ["Omdraaien: goed", ZIN.omGoed(3, 7), 2],
  ["Omdraaien: Bliepo telde de vakjes", ZIN.omTel, 2],
  ["Nog een manier", [ZIN.nogManier.join(" ")], 1],
  ["Hetzelfde antwoord 2 keer", ZIN.weerGekozen("4"), 3],
  ["Slotzin", ZIN.slot, 3],
  ["De kaart", ZIN.kaartTik, 3],
  ["Zin met de som na lof", SOMREACTIE(3, 4, 7).zinnen, 5],
];
for (const [naam, zinnen, min] of VERLOOP) {
  if (new Set(zinnen).size < min) problemen.push(`${naam}: maar ${new Set(zinnen).size} variant(en), moet minstens ${min}`);
  for (const z of zinnen) {
    if (/\bfout/i.test(z)) problemen.push(`${naam}: het woord "fout" in "${kaal(z)}"`);
    if (/rooster|totaal/i.test(z)) problemen.push(`${naam}: moeilijk woord (rooster, totaal) in "${kaal(z)}"`);
    /* Een getal niet 2 keer, behalve bij het omdraaien: daar staan 2 sommen met dezelfde getallen naast elkaar. */
    const g2 = kaal(z).match(/\d+/g) ?? [];
    if (!/Omdraaien: goed/.test(naam) && new Set(g2).size !== g2.length) problemen.push(`${naam}: een getal staat 2 keer in "${kaal(z)}"`);
  }
}
/* F16: elke zin waarna de les op het kind wacht, heeft een vraag of opdracht. */
for (const z of [ZIN.kies1, ...ZIN.kiesAnder, ...ZIN.kiesHand, ...ZIN.welkGetal, ZIN.tweeTegels.join(" "), ZIN.tweeTegelsNog, ZIN.vraagTotaal(2, 3).join(" "), ZIN.zetEen, ZIN.maakSamen(6, 7).join(" "), ZIN.moeilijker.join(" "), ZIN.maakSamen10(3).join(" "), ...ZIN.samenZet, ZIN.vraagSom.join(" "), ZIN.nuBovenop(3).join(" "), ZIN.nogManier.join(" ")]) if (!heeftOpdracht(kaal(z))) problemen.push(`F16: geen vraag of opdracht in "${kaal(z)}"`);
if (!ZIN.samenZelf(3, 7, 10).every((z) => /^Kijk, /.test(z))) problemen.push('samenZelf: elke variant begint met "Kijk, " (geen "Ja")');
if (problemen.length) {
  console.error("PROBLEMEN (alle varianten):\n" + [...new Set(problemen)].join("\n"));
  process.exit(1);
}
console.log(`Alle varianten: ${combinaties} combinaties van eerste zin en hint nagelopen (nergens blijft maar 1 keuze over); nergens het woord "fout"; geen getal 2 keer in 1 zin; geen opdracht bij de 2e fout.`);
const V = (f: FoutV) => f.v ?? { eerste: [f.eerste], hint: [f.hint], uitleg: [f.uitleg], weerEerste: [], weerUitleg: [] };
const VOORBEELDEN: [string, FoutV][] = [
  ["Welk getal: te weinig (tegel 5, keuze 4)", getalFout(4, 5, dichtbij(5, 9), 5)],
  ["Welk getal: te veel (tegel 5, keuze 6)", getalFout(6, 5, dichtbij(5, 9), 5)],
  ["Welk getal: richting niet genoemd (tegel 1, keuze 2)", getalFout(2, 1, dichtbij(1, 9), 1)],
  ["2 tegels samen: te weinig (2 en 3, keuze 4)", totaalFout(4, 2, 3, dichtbij(5, 18), 2)],
  ["2 tegels samen: te veel (2 en 3, keuze 6)", totaalFout(6, 2, 3, dichtbij(5, 18), 2)],
  ["Maak samen 7 met de 6: tegel 2 (te veel)", aanvulFout(6, 2, 7)],
  ["Maak samen 10 met de 3: tegel 4 (te weinig)", aanvulFout(3, 4, 10)],
  ["De som: getallen naast elkaar (3 + 7 = 37)", somFout(somKeuzes(3, 7)[1], 3, 7)],
  ["De som: een min (7 − 3 = 10)", somFout(somKeuzes(3, 7)[2], 3, 7)],
  ["Omdraaien: keuze 9", omwisselFout(9)],
  ["Omdraaien: keuze 11", omwisselFout(11)],
];

const tekst = `# FOUTTABEL — extra les Plussommen (squla-plus-bakkerij-1-gouden-extra, "Plussommen met tegels, extra")

Gemaakt op 12 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-plussommen-extra-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-plussommen-extra-zinnen.ts\` en draai het script opnieuw. Besluit Sara 12 november 2026 (22.3): de Synthesis-opdrachten uit het draaiboek Plussommen die niet in de Squla-les zitten, als EXTRA les naast de gouden les.

**EIGEN INVULLING, NIET VAN SYNTHESIS.** De getallen zijn die van het draaiboek (tegels 1 t/m 9, totalen tot 10, doelen 7 en 10). Het draaiboek laat het kind bij een foute tegel zelf zien wat het maakte (§3 C), en noemt bij het totaal de richting (§3 D); Bliepo doet dat ook, met de denkfout erbij (BOUWREGELS 15.9). Niet gebouwd: de som zelf typen (stap 10), de slot-tegels van stap 5 en de zijroute na 2 fouten (vervangen door 2 pogingen).

**Varianten (18 november 2026, zoals de proefles Tellen):** elke zin bij een fout bestaat in varianten (§4; oud naast nieuw in WIJZIGINGEN-ZINNEN-PLUSSOMMEN.md). De les kiest willekeurig, maar nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen (gedeelde kiezer \`nooit-dubbel.ts\`). In §2 staat per fout antwoord 1 vaste variant als voorbeeld; het script loopt ALLE varianten na. "Rooster" heet nu "veld" en "totaal" heet "samen".

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **Keuzevragen (welk getal, totaal, de som, omwisselen):** 1e fout = scherm 1,5 s rood (geen fout-geluidje), Bliepo noemt wat het kind koos en de denkfout; dan komen de knoppen terug met de hint. 2e fout = uitleg (zonder het antwoord) en samen voordoen: Bliepo telt de vakjes (stuk voor stuk), of laat de som zien. De les gaat door. Elk vervolg gaat vanzelf (15.27).
- **De tegel zoeken (samen 7, samen 10, nog een manier):** een foute tegel verschijnt even en verdwijnt weer (zonder het woord "fout"). 1e fout = Bliepo rekent voor wat het kind maakte ("3 en 4 is samen 7. Dat is te weinig.") en het kind mag nog 1 keer een tegel zetten. 2e fout = uitleg, en een schaduw van de tegel die erbij past komt op het veld; het kind zet hem zelf (kleine stap), Bliepo zegt wat er gemaakt is.
- **Richting en verklappen (15.17):** zou "te weinig" of "te veel" maar 1 keuze overlaten (bij tegel 1, 2 of 9), dan noemt Bliepo alleen "dichtbij" (5 varianten). Het script controleert dat er na de eerste zin en de hint minstens 2 keuzes overblijven.
- **Hulphandje (15.19):** komt vanzelf na ± 6 s stilte bij een opdracht (een tegel kiezen en zetten), als het handje dat laat zien hoe je een tegel naar het veld sleept; nooit bij een keuzevraag, nooit een knop. **Heel snel antwoorden:** Bliepo zegt niets (BOUWREGELS 6.10).
- **Omwisselen (15.20):** het antwoord staat NIET in beeld zolang de vraag open is (het draaiboek liet het wel zien); pas na het antwoord komt de som er helemaal te staan.
- Elke fout wordt met de naam van de denkfout bewaard (tabel \`les_uitkomsten\`, kolom denkfout; \`onduidelijk\` wordt \`onbekend\`), elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`te-weinig-hokjes\` / \`te-veel-hokjes\` | telde de vakjes van 1 tegel verkeerd | draaiboek §3 A (gezien, R1, P-8nov) |
| \`samen-te-weinig\` / \`samen-te-veel\` | de tegels samen zijn te weinig of te veel (bij het totaal, en bij het aanvullen) | draaiboek §3 C en D (gezien) |
| \`cijfers-naast-elkaar\` | zette de getallen naast elkaar (3 en 7 werd 37) | draaiboek §3 E (gezien, 3×) |
| \`plus-min-verwisseld\` | koos een min in plaats van een plus | draaiboek §3 E (gezien) |
| \`totaal-verandert-bij-omwisselen\` | denkt dat het totaal verandert als de tegels omgedraaid liggen | draaiboek §3 F (gezien, R3) |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen | BOUWREGELS 15.9 |

## 2. Per vraag: elk fout antwoord (${rijen.length} rijen)

${tabel(rijen)}

## 3. Goed

- **Goed in één keer:** scherm 1 s groen, een lofzin uit het rijtje (BLIEPO-KARAKTER.md §3) en de som of het getal ("Dat klopt: 3 + 4 = 7." / "Ja, 3 en 4 maken samen 7." / "Precies, 3 + 4 = 7." / "Het is een 5."); de tegel krijgt een lichtgolf (draaiboek §3 A.1, D.1).
- **Goed na een fout:** alleen een korte bevestiging (BLIEPO-KARAKTER.md §3.4); vanzelf door.
- **Nog een manier voor 10:** komt alleen als omwisselen niet "samen gedaan" was (draaiboek stap 12).

## 4. Alle varianten (18 november 2026)

De les kiest uit elk rijtje steeds een andere zin dan de vorige keer.

### Bij een fout (per soort; voorbeelden)

| Situatie | Eerste zin | Hint | Uitleg bij de 2e fout | Dezelfde denkfout 2 keer |
|---|---|---|---|---|
${VOORBEELDEN.map(([naam, f]) => `| ${naam} | ${V(f).eerste.map(kaal).join(" / ")} | ${V(f).hint.map(kaal).join(" / ")} | ${V(f).uitleg.map(kaal).join(" / ")} | ${V(f).weerEerste.length ? `${V(f).weerEerste.map(kaal).join(" / ")} + ${V(f).weerUitleg.map(kaal).join(" / ")}` : "—"} |`).join("\n")}

### Het verloop

| Situatie | Zinnen (een / = varianten) |
|---|---|
${VERLOOP.map(([naam, z]) => `| ${naam} | ${z.map(kaal).join(" / ")} |`).join("\n")}
`;
schrijf("FOUTTABEL-squla-plus-bakkerij-1-gouden-extra.md", tekst);
