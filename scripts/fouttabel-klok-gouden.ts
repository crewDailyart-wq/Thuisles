/**
 * Maakt FOUTTABEL-squla-klok-gouden.md uit de code (squla-klok-gouden-zinnen.ts), zodat de tabel altijd klopt met de les.
 *   npx tsx scripts/fouttabel-klok-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { writeFileSync } from "node:fs";
import { EXTRAVRAGEN, KLOKVRAGEN, SCHERM_TEKST, UITLEG, UITLEGVRAGEN, spiegel, zetFout, type Fout, type Vraag } from "../src/components/les/lessen/squla-klok-gouden-zinnen";

const ONDUIDELIJK_TEKST = '(zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.")';
const rij = (kop: string, antwoord: string, f: Fout) =>
  `| ${kop} | ${antwoord} | \`${f.code}\` — ${f.denkfout} | ${f.eerste || ONDUIDELIJK_TEKST} | ${f.hint} | ${SCHERM_TEKST[f.scherm]} |`;
const KOP = "| Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |\n|---|---|---|---|---|";
const KOP_V = "| Stap en vraag (goed antwoord) | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |\n|---|---|---|---|---|---|";
const vraagKop = (v: Vraag) => `${v.waar}: "${v.vraag.join(" ")}" (${v.goed})`;
const rijenVan = (lijst: Vraag[]) => lijst.flatMap((v) => Object.entries(v.fouten).map(([antw, f]) => rij(vraagKop(v), antw, f))).join("\n");

const klok = KLOKVRAGEN.map((v) => {
  const rijen = Object.entries(v.fouten).map(([a, f]) => `| ${v.waar.replace("oefenblok, ", "")} | ${a} | \`${f.code}\` — ${f.denkfout} | ${f.eerste || ONDUIDELIJK_TEKST} | ${f.hint} | ${SCHERM_TEKST[f.scherm]} |`);
  return rijen.join("\n");
}).join("\n");

const zetRijen = [2, 3, 6, 7]
  .flatMap((doel) => {
    const kandidaten: [number, string][] = [[doel + 1 > 12 ? 1 : doel + 1, "getal ernaast"], [doel - 1 < 1 ? 12 : doel - 1, "getal ernaast"], [((doel + 5) % 12) + 1, "andere kant"], [spiegel(doel), "spiegelbeeld"], [12, "de 12"], [doel === 5 ? 10 : 5, "een ander getal"]];
    const gezien = new Set<number>();
    return kandidaten
      .filter(([n]) => n !== doel && !gezien.has(n) && gezien.add(n))
      .map(([n, naam]) => rij(`${doel === 7 ? "stap 15 (extra keer zetten)" : "stap 14"}: "Zet de kleine wijzer op de ${doel}."`, `${n} (${naam})`, zetFout(n, doel)));
  })
  .join("\n");

const uitleg = Object.entries(UITLEG).map(([k, u]) => `| ${k} | ${u.uitleg.join(" ")} | ${u.weer.join(" ")} |`).join("\n");

const tekst = `# FOUTTABEL — gouden klokles (squla-klok-hoelaat-1-gouden, "Hoe laat is het?")

Opnieuw gemaakt op 9 november 2026 (zesde ronde) **uit de code** met \`npx tsx scripts/fouttabel-klok-gouden.ts\`; pas zinnen dus aan in \`src/components/les/lessen/squla-klok-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (vragen, keuzes, tijden) is die van de les squla-klok-hoelaat-1 en blijft gelijk (15.8). Sinds 9 november staan ook de vragen tussendoor en de bonus erin (alleen hele uren; besluit Sara, ronde 14).

Sara mag elke zin aanpassen. In de les krijgt het uur de kleur van de kleine wijzer (oranje) en de 12 bij de grote wijzer de kleur van de grote wijzer (paars) (14.16); hier staan de getallen zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11; de 3e poging is vervangen):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood, vraag en knoppen even weg, Bliepo zegt de eerste zin en de hint uit de tabel, met het beeld uit de tabel, wacht op de blauwe pijl (zoals het draaiboek), dan komt de vraag terug. Het kind mag nog 1 keer.
- **2e fout:** Bliepo legt het uit (§4, bij de denkfout van deze keuze) **en doet het samen met het kind voor**: nu pas de oranje ring om het goede antwoord en het antwoord in woorden; alleen de goede knop blijft, het kind tikt hem zelf; de les gaat verder. (Oude regel met een 3e poging: vervangen.)
- **Twee keer dezelfde denkfout** (bij dezelfde vraag, of al eerder in de les): Bliepo zegt dat vriendelijk ("weer") en legt het op een andere manier uit (§4, laatste kolom).
- **Niet duidelijk (\`onduidelijk\`):** eerste zin uit BLIEPO-KARAKTER.md §10 (wisselt, nooit 2 keer dezelfde achter elkaar) en een algemene hint. Geen reden verzonnen.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst (voorlopig alleen op het apparaat; zie §5).

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk dacht | Voor een ouder later (dashboard, nu niet bouwen) |
|---|---|---|
| \`verkeerde-wijzer\` | keek naar de grote (lange) wijzer in plaats van de kleine | kijkt vaak naar de verkeerde wijzer |
| \`andere-kant\` | nam het getal aan de andere kant (tegenover) van de klok, bijvoorbeeld 8 bij 2 | leest de wijzer van de verkeerde kant |
| \`spiegelbeeld\` | **nieuw (ronde 15):** koos het getal links in plaats van rechts van de klok, of andersom, bijvoorbeeld 10 bij 2 of 2 bij 10. Bij 3 en 9 is dat hetzelfde als \`andere-kant\`; daar blijft het \`andere-kant\` | draait links en rechts om bij het lezen van de klok |
| \`getal-ernaast\` | nam het getal vlak naast het goede | kijkt niet precies waar de wijzer staat |
| \`een-te-veel\` / \`een-te-weinig\` | telde 1 te veel of 1 te weinig | telt nog niet precies |
| \`plus-min-verwisseld\` | deed plus waar min moest, of andersom (bijvoorbeeld 1 uur terug in plaats van vooruit) | haalt plus en min door elkaar |
| \`groter-kleiner-verwisseld\` | koos het kleinste waar het grootste moest, of andersom | haalt meer en minder door elkaar |
| \`verkeerde-richting\` | ging tegen de klok in, of nam "ervoor" in plaats van "erna" | weet nog niet welke kant "met de klok mee" is |
| \`doortellen-na-12\` | telde door zoals op een getallenlijn (13 na 12) | weet nog niet dat de klok na 12 opnieuw begint |
| \`boven-onder-verwisseld\` | haalde bovenaan en onderaan door elkaar | |
| \`wijzers-verwisseld\` | haalde de namen of de taak van de wijzers door elkaar | haalt de wijzers door elkaar |
| \`uur-minuten-verwisseld\` | zag het goede getal, maar zei minuten in plaats van uur | |
| \`geen-heel-uur\` | lette niet op de grote wijzer bij "is het een heel uur?" | |
| \`beeld-van-net\` | noemde wat er net nog op het scherm stond | |
| \`onduidelijk\` | niet duidelijk: **geen reden verzonnen** | |

Bij \`onduidelijk\` zegt Bliepo een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.

---

## 2. Het oefenblok: de 13 klokken ("Hoe laat is het?")

Bij elke klok staat de grote wijzer op de 12 en de kleine wijzer op het uur. Een kind dat de wijzer op de 2 ziet en 10 kiest (of andersom), krijgt nu \`spiegelbeeld\` en niet meer \`onduidelijk\`.

${KOP}
${klok}

**Samen voordoen na de 2e fout bij een klok:** "Kijk, de kleine wijzer wijst naar de {uur}, in het oranje rondje. De grote wijzer staat op de 12. Dus het is {uur} uur." Oranje ring om het uur. Dan: "Tik nu zelf op {uur} uur."
Bij klok 2 (12 uur) staan beide wijzers op de 12; daar is de hint: "Hier staat de kleine wijzer op hetzelfde getal als de grote. Welk getal is dat?"

## 2b. Vragen tussendoor en de bonus (draaiboek stap 19 en 20; aan sinds 9 november 2026, alleen hele uren)

${KOP_V}
${rijenVan(EXTRAVRAGEN)}

## 3. De uitleg (route na "Nee" of na een mislukte proef)

${KOP_V}
${rijenVan(UITLEGVRAGEN)}
${zetRijen}

**2e fout in de uitleg:** uitleg (§4), dan oranje ring om het goede getal, Bliepo zegt het antwoord, het kind tikt zelf (zie \`samen\` per vraag in de code). Bij zetten: "Hier is de {doel}, in het oranje rondje. Tik maar op de {doel}." en alleen het doel werkt nog.

## 4. Uitleg bij de 2e fout (daarna samen voordoen)

| Soort denkfout | Uitleg bij de 2e fout | Andere uitleg als dezelfde denkfout nog eens komt |
|---|---|---|
${uitleg}

Bij een nieuwe denkfout bij de 2e fout zegt Bliepo eerst de eerste zin van die denkfout en dan de uitleg.

## 5. Bewaren voor de voortgang

- **Denkfout:** elke fout wordt vastgelegd met: les, vraag, gekozen antwoord, naam van de denkfout (§1), poging en tijd (functie \`legDenkfoutVast\`).
- **Uitkomst (nieuw, 9 november 2026, BOUWREGELS 15.11):** elke vraag krijgt 1 van drie uitkomsten: **goed in één keer**, **goed na een fout** of **samen gedaan** (functie \`legUitkomstVast\`). Alleen **goed in één keer** telt mee voor beheersing.
- Het bestaande voortgangsmechanisme heeft daar nog geen plek voor zonder nieuwe databasekolom. Daarom bewaart de les het nu alleen op het apparaat zelf (\`window.__denkfouten\` en \`window.__uitkomsten\`; op /voorbeeld ook in de browser onder "thuisles-denkfouten-test" en "thuisles-uitkomsten-test"). Niets gaat naar de server of de database (harde regel 2). Voor echte opslag is een nieuwe tabel of kolom nodig en Sara's akkoord.

## 6. Wat de code nu doet

1. 1e fout: reactie en hint uit deze tabel, wachten op de pijl, dan komt de vraag terug. — gebouwd.
2. 2e fout: uitleg (bij de nieuwe denkfout, of de andere uitleg bij dezelfde denkfout) en samen voordoen. — gebouwd (9 november 2026).
3. Eerste zin per denkfout gelijk aan deze tabel; \`onduidelijk\`: een zin uit BLIEPO-KARAKTER.md §10 plus de algemene hint. — gebouwd.
4. Spiegelbeeld is een eigen denkfout. — gebouwd (9 november 2026).
5. Aanmoediging samen met het hulphandje bij opdrachten, niets bij keuzevragen. — gebouwd (9 november 2026).
`;
writeFileSync(new URL("../FOUTTABEL-squla-klok-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-klok-gouden.md geschreven");
