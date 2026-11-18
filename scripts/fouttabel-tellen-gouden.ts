/**
 * Maakt FOUTTABEL-squla-tellen-fruit-1-gouden.md uit de code (squla-tellen-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les.
 *   npx tsx scripts/fouttabel-tellen-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { writeFileSync } from "node:fs";
import { APPEL, RICHTINGWOORDEN, RICHTINGWOORDEN_TEL, TEL, TELREACTIE_WARM, VARIANTEN_FOUT, VRAGEN, dichtbijAnders, foutenVan, telFout, tweedeEerste, zelfdeKern, zonderDichtbij } from "../src/components/les/lessen/squla-tellen-gouden-zinnen";
import { deeltStuk, maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");

const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(
    ([a, f]) =>
      `| ${v.nr}. ${v.n} ${v.fruit.naam} (keuzes ${v.keuzes.join(" / ")}) | ${a} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${kaal(f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${kaal(f.hint)} | ${f.scherm} |`,
  ),
).join("\n");

const uitleg = VRAGEN.flatMap((v) => {
  const fouten = Object.entries(foutenVan(v));
  return fouten.map(([a, f]) => {
    /* De 1e fout was dan het andere foute antwoord (er zijn er maar 2). */
    const ander = fouten.find(([b]) => b !== a)?.[1];
    const weer = !ander || ander.soort !== f.soort ? "— (1e fout was een andere denkfout: dan de uitleg links)" : ander.noot ? "— (1e keer zei Bliepo alleen \"… is dichtbij\": dan de uitleg links, geen \"weer\")" : f.weer.map(kaal).join(" ");
    return `| ${v.nr}. ${v.n} ${v.fruit.naam} | ${a} (\`${f.code}\`) | ${kaal(f.eerste)} ${kaal(f.uitleg)} | ${weer} |`;
  });
}).join("\n");
const telling = VRAGEN.reduce((n, v) => n + Object.keys(foutenVan(v)).length, 0);
/* Controle: elk fout antwoord van elke vraag staat erin. */
for (const v of VRAGEN) for (const k of v.keuzes) if (k !== v.n && !foutenVan(v)[String(k)]) throw new Error(`geen rij voor ${v.id} ${k}`);
void telFout;
/*
 * Verklapcontrole (15.17; keuring 9 nov): noemt Bliepo de richting niet (alleen "… is dichtbij."), dan mag de hint ook
 * geen richting geven. En: blijft er na eerste zin + hint logisch maar 1 keuze over? Dan is het een verklapper.
 */
const verklappers: string[] = [];
/* Wat de zinnen zeggen: "te weinig" (meer nodig), "te veel" (minder nodig) of niets. Voor ALLE varianten (18 nov 2026). */
const MEER = /nog niet allemaal|volle rijen|laatste rij|sla geen|sla er geen|niet geteld|nog meer|te weinig|overgeslagen|ook de laatste/i;
const MINDER = /te veel|1 keer|maar 1|2 keer|zo veel liggen er niet|\bminder\b/i;
let combinaties = 0;
for (const v of VRAGEN)
  for (const [a, f] of Object.entries(foutenVan(v))) {
    const x = Number(a);
    const rest = v.keuzes.filter((k) => k !== x);
    const eersten = f.v?.eerste ?? [f.eerste];
    const hints = f.v?.hint ?? [f.hint];
    for (const h of hints) if (f.noot && (RICHTINGWOORDEN.test(kaal(h)) || RICHTINGWOORDEN_TEL.test(kaal(h)))) verklappers.push(`${v.id} ${a}: hint geeft toch een richting: "${h}"`);
    for (const e of eersten) {
      if (f.noot && RICHTINGWOORDEN_TEL.test(kaal(e))) verklappers.push(`${v.id} ${a}: eerste zin geeft toch een richting: "${e}"`);
      for (const h of hints) {
        combinaties++;
        const tekst = kaal(`${e} ${h}`);
        const meer = MEER.test(tekst);
        const minder = MINDER.test(tekst);
        const over = rest.filter((k) => (meer ? k > x : true) && (minder ? k < x : true));
        if (over.length <= 1) verklappers.push(`${v.id} ${a}: na "${tekst}" blijft alleen ${over.join("")} over`);
        if (meer && minder) verklappers.push(`${v.id} ${a}: "${tekst}" zegt te weinig en te veel tegelijk`);
        /* Een zin met richting moet de goede richting hebben. */
        if ((meer && x > v.n) || (minder && x < v.n)) verklappers.push(`${v.id} ${a}: verkeerde richting in "${tekst}"`);
        /* Zonder noot noemt Bliepo de richting: dan moet elke eerste zin er ook echt een hebben. */
        if (!f.noot && !MEER.test(kaal(e)) && !MINDER.test(kaal(e))) verklappers.push(`${v.id} ${a}: eerste zin zonder richting terwijl "weer" daarop rekent: "${e}"`);
      }
    }
  }
/*
 * Waarheidscontrole (keuring Huisnummers, 10 nov 2026): elke bewering in de eerste zin, de hint, de uitleg en de
 * "weer"-zin moet kloppen voor DIT antwoord bij DEZE vraag. En (keuring Getallenlijn): de zinnen bij de 2e fout zijn
 * uitleg, geen opdracht (meteen daarna tellen we samen; het kind kan "Tel ook …" niet meer doen).
 */
const OPDRACHT = /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Sla|Leg|Sleep|Schuif|Pak|Zoek|Tik)\b/;
let beweringen = 0;
for (const v of VRAGEN)
  for (const [a, f] of Object.entries(foutenVan(v))) {
    const x = Number(a);
    const waar = `${v.id} ${a}`;
    const alles = [f.eerste, f.hint, f.uitleg, ...f.weer, dichtbijAnders(x, v), ...(f.v ? [...f.v.eerste, ...f.v.hint, ...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg] : [])].map(kaal).join(" ");
    const klopt = (zin: RegExp, ok: boolean, wat: string) => {
      if (!zin.test(alles)) return;
      beweringen++;
      if (!ok) verklappers.push(`${waar}: niet waar: ${wat} ("${alles}")`);
    };
    klopt(/dichtbij|scheelt|bijna|net niet/i, Math.abs(x - v.n) <= 2, "dichtbij, maar het scheelt meer dan 2");
    klopt(/te veel|zo veel liggen er niet|\bminder\b|2 keer geteld/i, x > v.n, "te veel, maar het kind koos minder");
    klopt(/nog niet allemaal|te weinig|niet geteld|nog meer|overgeslagen|\bmeer\b/i, x < v.n, "te weinig, maar het kind koos meer");
    klopt(/volle rijen/, x === Math.floor(v.n / 5) * 5, "alleen de volle rijen, maar dat aantal is het niet");
    klopt(/1 (appel|peer|pruim) (niet geteld|overgeslagen|meer|minder|te veel|2 keer)/, Math.abs(x - v.n) === 1, "precies 1 verschil, maar het scheelt er meer");
    klopt(/een paar/, Math.abs(x - v.n) >= 2, "een paar, maar het scheelt er maar 1");
    klopt(new RegExp(`\\b${x}\\b`), true, "");
    for (const z of [f.uitleg, ...f.weer, ...(f.v ? [...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg] : [])]) if (OPDRACHT.test(kaal(z))) verklappers.push(`${waar}: opdracht in de zin bij de 2e fout: "${kaal(z)}"`);
    /* Nooit het woord "fout", en geen getal 2 keer in 1 zin (Sara, 18 nov 2026). */
    for (const z of f.v ? [...f.v.eerste, ...f.v.hint, ...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg] : []) {
      if (/\bfout/i.test(z)) verklappers.push(`${waar}: het woord "fout" in "${kaal(z)}"`);
      const g = kaal(z).match(/\d+/g) ?? [];
      if (new Set(g).size !== g.length) verklappers.push(`${waar}: een getal staat 2 keer in "${kaal(z)}"`);
    }
    if (f.noot && dichtbijAnders(x, v) === f.eerste) verklappers.push(`${waar}: dichtbijAnders is dezelfde zin als de eerste zin`);
    const z2 = kaal(zonderDichtbij(x, v));
    if (/dichtbij/.test(z2)) verklappers.push(`${waar}: zonderDichtbij zegt toch "dichtbij": "${z2}"`);
    if ((x > v.n && !/te veel|zo veel liggen er niet|scheelt|net niet/i.test(z2)) || (x < v.n && !/niet allemaal|te weinig|volle rijen|nog meer|scheelt|net niet/i.test(z2))) verklappers.push(`${waar}: zonderDichtbij klopt niet: "${z2}"`);
  }
/*
 * Keuring 11 nov 2026: 2 verschillende foute getallen bij 1 vraag zeggen nooit allebei "dichtbij". Zelfde keuze van de
 * eerste zin bij de 2e fout als de les (squla-tellen-gouden.tsx telVraag).
 */
let paren = 0;
for (const v of VRAGEN) {
  const F = foutenVan(v);
  for (const a of Object.keys(F))
    for (const b of Object.keys(F)) {
      if (a === b) continue;
      const e = F[a];
      const f = F[b];
      const zelfde = e.soort === f.soort && !e.noot && f.code !== "onduidelijk";
      /* Elke eerste zin die Bliepo bij de 1e fout kan zeggen, tegen elke zin die hij daarna bij de 2e fout kan kiezen. */
      for (const z1 of e.v?.eerste ?? [e.eerste]) {
        const kandidaten = zelfde ? f.v?.weerEerste ?? [f.weer[0]] : tweedeEerste(Number(b), v, z1);
        if (!kandidaten.length) verklappers.push(`${v.id} ${a} dan ${b}: geen eerste zin over voor de 2e fout`);
        for (const z2 of kandidaten) {
          paren++;
          if (zelfdeKern(z1, z2)) verklappers.push(`${v.id} ${a} dan ${b}: 2 keer hetzelfde woord ("${kaal(z1)}" en dan "${kaal(z2)}")`);
          if (z1 === z2) verklappers.push(`${v.id} ${a} dan ${b}: 2 keer dezelfde zin`);
          /* Bij de 2e fout is er altijd een uitleg die geen stuk herhaalt uit de eerste zin. */
          const uit = zelfde ? f.v?.weerUitleg ?? [] : f.v?.uitleg ?? [];
          if (uit.length && !uit.some((u) => !deeltStuk(z2, u))) verklappers.push(`${v.id} ${a} dan ${b}: elke uitleg herhaalt een stuk uit "${kaal(z2)}"`);
        }
      }
    }
}
/*
 * NOOIT 2 KEER HETZELFDE (Sara, 18 nov 2026): speel de kiezer 20.000 keer na met willekeurige vragen en foute keuzes en
 * kijk of er ooit 2 keer achter elkaar dezelfde zin komt (getallen en fruit weggedacht), ook over vragen heen.
 */
{
  const vorm = maakVorm(["appels", "appel", "peren", "peer", "pruimen", "pruim"]);
  const K = maakKiezer({ wissel: ["appels", "appel", "peren", "peer", "pruimen", "pruim"] });
  const laatste = new Map<string, string>();
  let dubbel = 0;
  let keer = 0;
  const neem = (sleutel: string, zinnen: string[], mag?: (z: string) => boolean) => {
    const z = K.kies(sleutel, zinnen, mag);
    keer++;
    if (laatste.get(sleutel) === vorm(z) && new Set(zinnen.map(vorm)).size > 1) {
      dubbel++;
      if (dubbel <= 5) console.error(`   dubbel bij "${sleutel}": ${kaal(z)} (keuze uit: ${zinnen.map(kaal).join(" | ")})`);
    }
    laatste.set(sleutel, vorm(z));
    return z;
  };
  for (let i = 0; i < 20000; i++) {
    const v = VRAGEN[Math.floor(Math.random() * VRAGEN.length)];
    const fouten = Object.entries(foutenVan(v));
    const [a, f] = fouten[Math.floor(Math.random() * fouten.length)];
    const e = neem("eerste", f.v!.eerste);
    neem("hint", f.v!.hint, (z) => !deeltStuk(e, z));
    if (Math.random() < 0.5) continue;
    const [b, g] = fouten[Math.floor(Math.random() * fouten.length)];
    if (g.soort === f.soort && !f.noot) {
      const w = neem("weer", g.v!.weerEerste);
      neem("uitleg", g.v!.weerUitleg, (z) => !deeltStuk(w, z));
    } else {
      const e2 = a === b ? neem("weerGekozen", TEL.weerGekozen(Number(b), v.fruit)) : neem("eerste", tweedeEerste(Number(b), v, e));
      neem("uitleg", g.v!.uitleg, (z) => !deeltStuk(e2, z));
    }
    neem("samenHelp", TEL.samenHelp);
    neem("samenTik", TEL.samenTik(v.fruit));
    neem("samenHand", TEL.samenHand(v.fruit));
    neem("aanmoedigTikken", TEL.aanmoedigTikken);
    neem("samenKlaar", TEL.samenKlaar(v.n, v.fruit));
  }
  console.log(`Nooit 2 keer hetzelfde: ${keer} keer gekozen, ${dubbel} keer 2 keer achter elkaar dezelfde zin (moet 0).`);
  if (dubbel) verklappers.push(`de kiezer gaf ${dubbel} keer 2 keer achter elkaar dezelfde zin`);
}
/* De vaste zinnen van het verloop (TEL): nooit "fout", geen getal 2 keer in 1 zin, en genoeg varianten per situatie. */
{
  const f = APPEL;
  const rijtjes: [string, string[], number][] = [
    ["begin", TEL.begin, 2], ["natellen", TEL.natellen, 2], ["natellenKlaar", TEL.natellenKlaar(12, f), 2], ["natellenKlaarSnel", TEL.natellenKlaarSnel(12, f), 2], ["samenHelp", TEL.samenHelp, 3], ["samenTik", TEL.samenTik(f), 2], ["samenHand", TEL.samenHand(f), 2],
    ["samenKlaar", TEL.samenKlaar(12, f), 2], ["samenZelf", TEL.samenZelf(12, f), 2], ["slot", TEL.slot, 2], ["kaartTik", TEL.kaartTik, 3], ["weerGekozen", TEL.weerGekozen(11, f), 3], ["aanmoedigTikken", TEL.aanmoedigTikken, 3],
    ["TELREACTIE_WARM", TELREACTIE_WARM(12, f).zinnen, 5],
    ...VARIANTEN_FOUT(f, "11").map(([naam, z]): [string, string[], number] => [naam, z, /^Eerste|^Weer (te|alleen)[^,]*$/.test(naam) ? 3 : 2]),
  ];
  for (const [naam, zinnen, min] of rijtjes) {
    if (new Set(zinnen).size < min) verklappers.push(`${naam}: maar ${new Set(zinnen).size} variant(en), moet minstens ${min}`);
    for (const z of zinnen) {
      if (/\bfout/i.test(z)) verklappers.push(`${naam}: het woord "fout" in "${kaal(z)}"`);
      const g = kaal(z).match(/\d+/g) ?? [];
      if (new Set(g).size !== g.length) verklappers.push(`${naam}: een getal staat 2 keer in "${kaal(z)}"`);
    }
  }
  if (!TEL.samenZelf(12, f).every((z) => /^Kijk, /.test(z))) verklappers.push('samenZelf: elke variant begint met "Kijk, " (geen "Ja", geen "samen")');
}
/* "… is dichtbij." niet steeds dezelfde zin (keuring Meer-minder): bij de foute antwoorden zonder richting minstens 3 versies. */
const zonderRichting = new Set(VRAGEN.flatMap((v) => Object.values(foutenVan(v)).filter((f) => f.noot).map((f) => kaal(f.eerste).replace(/\d+/g, "#"))));
if (zonderRichting.size < 3) verklappers.push(`eerste zin zonder richting heeft maar ${zonderRichting.size} versie(s): ${[...zonderRichting].join(" | ")}`);
console.log(`Waarheidscontrole: ${beweringen} beweringen nagelopen (alle varianten); ${combinaties} combinaties van eerste zin en hint en ${paren} paren van 1e en 2e fout nagelopen; ${zonderRichting.size} versies van de eerste zin zonder richting; geen opdracht in de zinnen bij de 2e fout.`);
if (verklappers.length) {
  console.error("VERKLAPPERS:\n" + verklappers.join("\n"));
  process.exit(1);
}
console.log("Verklapcontrole: geen enkele variant van eerste zin + hint laat maar 1 keuze over (ook niet bij alleen-volle-rijen, vraag 15 keuze 10: daar noemt Bliepo de richting niet meer).");

const tekst = `# FOUTTABEL — gouden les Tellen (squla-tellen-fruit-1-gouden, "Fruit tellen")

Gemaakt op 9 november 2026, bijgewerkt op 10 november 2026 (omgezet naar de nieuwste gouden stijl, KEUZES-VOOR-SARA.md Ronde 29) en op 18 november 2026 (warmere zinnen in varianten, proefles; oud naast nieuw in WIJZIGINGEN-ZINNEN-TELLEN.md), **uit de code** met \`npx tsx scripts/fouttabel-tellen-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-tellen-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, getallen, 3 keuzes per vraag) is die van squla-tellen-fruit-1 en blijft gelijk (BOUWREGELS 15.22).

**EIGEN INVULLING, NIET VAN SYNTHESIS.** Alle vragen gaan over 11 t/m 17; het draaiboek Tellen (Color Count) gaat tot 10. De vragen krijgen hetzelfde skelet als Color Count; de hints en deze fouttabel zijn eigen invulling (15.22 punt 5). Wel volgt de soort reactie het draaiboek (§3 A, §7): Bliepo noemt het gekozen getal en de richting (te weinig / te veel) en vraagt opnieuw te tellen.

In de les staan de getallen in de kleur van het fruit (appel rood, peer groen, pruim paars); hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje), de vraag en de knoppen even weg, het fruit blijft staan zonder nummers. Bliepo zegt de eerste zin (de pijl staat erbij als snelkoppeling; ± 0,7 s na de zin gaat het vanzelf verder, 15.27); daarna komen de 3 knoppen terug met de hint (een vraag: geen pijl).
- **Richting en verklappen (15.17):** zou "te weinig" of "te veel" bij deze 3 keuzes maar 1 keuze overlaten, dan noemt Bliepo de richting niet (alleen "dichtbij", "bijna" of "scheelt niet veel", in 5 varianten) en wijst hij naar de manier van tellen. Zo verklapt de hint het antwoord niet. Komt bij dezelfde vraag een 2e fout getal zonder richting, dan een andere versie.
- **2e fout:** een korte uitleg bij de denkfout (§3, zonder het antwoord, uitleg en geen opdracht), "Kom, we tellen ze samen." (4 varianten; vanzelf door). Dan tikt het kind elk stuk fruit aan (een opdracht: geen pijl); er komt een nummer bij en Bliepo zegt het getal. Het laatste getal is het aantal ("En 12! Zoveel appels zijn het."; het getal 1 keer), de les gaat vanzelf door. Na ± 6 s stilte komt vanzelf het hulphandje; na 20 s zonder tik telt Bliepo de rest zelf ("Kijk, ik tel de rest. Het zijn er 12.").
- **Twee keer dezelfde denkfout** bij dezelfde vraag: Bliepo zegt "weer" en legt het anders uit (§3, laatste kolom). Alleen als hij de 1e keer al zei wat er mis was; na alleen "… is dichtbij." komt de gewone uitleg.
- **Varianten (18 november 2026):** elke zin bij een fout bestaat in varianten (§5). De les kiest willekeurig, maar nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen (gedeelde kiezer \`nooit-dubbel.ts\`). In §2 en §3 staat per fout antwoord 1 vaste variant als voorbeeld; het script loopt ALLE varianten na (verklappen, waarheid, geen opdracht bij de 2e fout, geen getal 2 keer, nooit het woord "fout").
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (elk fout antwoord is kleiner of groter dan het goede); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- Elke fout wordt met de naam van de denkfout bewaard (tabel \`les_uitkomsten\`, kolom denkfout; \`onduidelijk\` wordt \`onbekend\`), elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`te-weinig\` | telde er te weinig (sloeg er een over) | draaiboek §7 (gezien bij Synthesis) |
| \`te-veel\` | telde er te veel (telde er een 2 keer) | draaiboek §7 (gezien bij Synthesis) |
| \`alleen-volle-rijen\` | telde alleen de volle rijen van 5 (bijvoorbeeld 10 bij 12), niet de rij die niet vol is | eigen invulling, lijkt op \`alleen-tiental\` uit draaiboek §7 (The Next 10) |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen | BOUWREGELS 15.9 |

Niet gebruikt uit draaiboek §7: \`een-kleur-vergeten\`, \`verkeerde-kleur\`, \`lijst-kleur-mis\`, \`niet-alles-gemaakt\` (deze les heeft maar 1 soort fruit per vraag en geen maak-opdracht), \`cijfers-naast-elkaar\` en \`cijfers-omgedraaid\` (geen keuze als 101 of 31 bij Squla), \`dubbel-geteld\` en \`getal-overgeslagen\` (niet los te zien van te-veel en te-weinig; draaiboek §7 "Let op").

## 2. Per vraag: elk fout antwoord (${telling} rijen)

| Vraag (goed antwoord) | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. Uitleg na de 2e fout (zonder het antwoord), en als dezelfde denkfout nog eens komt

Na deze uitleg volgt altijd: "Kom, we tellen ze samen." (of een variant) en het samen tellen (nu pas het aantal in beeld).

| Vraag | 2e fout (denkfout) | Uitleg bij de 2e fout (eerste zin + uitleg) | Als de 1e fout (het andere foute antwoord) dezelfde denkfout was |
|---|---|---|---|
${uitleg}

## 4. Goed

- **Goed in één keer:** scherm 1 s groen, een lofzin uit het rijtje (BLIEPO-KARAKTER.md §3) en het aantal (${TELREACTIE_WARM(12, APPEL).zinnen.map((z) => `"${kaal(z)}"`).join(" / ")}), samen als 1 uiting. Begint de lofzin met "Ja", dan komt een telzin zonder "Ja". De robotzin "Ik heb ze nagekeken …" hooguit 1 keer per les. Niet 2 keer achter elkaar dezelfde telzin.
- **Eerste vraag in één keer goed:** lofzin, "${TEL.natellen[0]}", Bliepo telt hardop 1 t/m 11 (± 1,15 s per nummer); het laatste getal zegt hij in de slotzin, zodat het maar 1 keer klinkt: "${kaal(TEL.natellenKlaar(12, APPEL)[0])}" Een tik op de pijl zet alle nummers er meteen bij: dan "${kaal(TEL.natellenKlaarSnel(12, APPEL)[0])}" Alles vanzelf door.
- **Goed na een fout:** alleen een korte bevestiging (BLIEPO-KARAKTER.md §3.4); de nummers staan erbij; vanzelf door.
- **Heel snel:** Bliepo zegt niets over snel (BOUWREGELS 6.10).
- **Hetzelfde foute getal 2 keer:** de eerste zin wordt "Je koos weer 11." of een variant (niet 2 keer dezelfde zin).
- **Verklapcontrole:** het script stopt met een foutmelding als een hint zonder richting toch een richting geeft, of als er na eerste zin + hint maar 1 keuze logisch overblijft. Vraag 15, keuze 10 (was open, KEUZES Ronde 20 vraag 2): Bliepo noemt de volle rijen daar niet meer bij de 1e fout, want dan bleef alleen 11 over.

## 5. Alle varianten (18 november 2026)

De les kiest uit elk rijtje steeds een andere zin dan de vorige keer. Voorbeeld met appels en het getal 11.

### Bij een fout

| Situatie | Varianten |
|---|---|
${VARIANTEN_FOUT(APPEL, "11").map(([naam, z]) => `| ${naam} | ${z.map(kaal).join(" / ")} |`).join("\n")}

### Het verloop

| Situatie | Varianten |
|---|---|
| Begin van de les | ${TEL.begin.join(" / ")} (daarna: ${kaal(TEL.beginKijk)}) |
| Eerste vraag goed: Bliepo telt na | ${TEL.natellen.join(" / ")} |
| Na het natellen | ${TEL.natellenKlaar(12, APPEL).map(kaal).join(" / ")} |
| Na het natellen, als het kind op de pijl tikte | ${TEL.natellenKlaarSnel(12, APPEL).map(kaal).join(" / ")} |
| 2e fout: we gaan samen tellen | ${TEL.samenHelp.join(" / ")} |
| Samen tellen: de opdracht | ${TEL.samenTik(APPEL).join(" / ")} |
| Samen tellen: het hulphandje (aanmoediging) | ${TEL.aanmoedigTikken.join(" / ")} |
| Samen tellen: het hulphandje (wat te doen) | ${TEL.samenHand(APPEL).join(" / ")} |
| Samen tellen: klaar | ${TEL.samenKlaar(12, APPEL).map(kaal).join(" / ")} |
| Samen tellen: 20 s niets, Bliepo telt de rest | ${TEL.samenZelf(12, APPEL).map(kaal).join(" / ")} |
| Hetzelfde getal 2 keer | ${TEL.weerGekozen(11, APPEL).map(kaal).join(" / ")} |
| Slotzin | ${TEL.slot.join(" / ")} |
| De kaart | ${TEL.kaartTik.join(" / ")} |
`;

writeFileSync(new URL("../FOUTTABEL-squla-tellen-fruit-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-tellen-fruit-1-gouden.md geschreven");
