/**
 * Controle van de stilteregel (Sara, 19 november 2026; BOUWREGELS 15.39).
 *
 *   npx tsx scripts/stilteregel-controle.ts
 *
 * Speelt de stiltekiezer (src/components/les/lessen/stilte-bij-goed.ts) 20.000 lessen lang na, met willekeurige
 * goede antwoorden in 1 keer, goede antwoorden na hulp en goede antwoorden waar de les zelf niets zegt. Faalt als:
 *   - er 2 keer achter elkaar geen zin is (ook over vragen heen);
 *   - het eerste goede antwoord van een les stil is;
 *   - een goed antwoord na hulp of na een tweede poging stil is;
 *   - een reactie die niet weg mag (geen lofreactie) stil is;
 *   - het aandeel stil bij goed in 1 keer niet ongeveer 1 op 3 is (tussen 0,28 en 0,38).
 * Daarna een paar vaste voorbeelden van isLofReactie (wat wel en niet weg mag).
 */

import { BEGIN_STAND, besluitStilte, isLofReactie, maakStilteKiezer } from "../src/components/les/lessen/stilte-bij-goed";
import { BEVESTIG, LOF, NAAM_LOF, UITLEGVRAGEN, metNaam } from "../src/components/les/lessen/squla-klok-gouden-zinnen";
import { ZIN as GL } from "../src/components/les/lessen/squla-getallenlijn-gouden-zinnen";

let fouten = 0;
const fout = (m: string) => {
  fouten++;
  if (fouten <= 20) console.log(`FOUT: ${m}`);
};

/* ---------- 1. de kiezer naspelen ---------- */

let zaad = 20261119;
const toeval = () => {
  zaad = (zaad * 1103515245 + 12345) % 2147483648;
  return zaad / 2147483648;
};

const LESSEN = 20000;
let eenKeer = 0;
let eenKeerStil = 0;
let stilTotaal = 0;
for (let les = 0; les < LESSEN; les++) {
  const k = maakStilteKiezer({ toeval });
  let vorigeStil = false;
  let eerste = true;
  const aantal = 5 + Math.floor(toeval() * 20);
  for (let i = 0; i < aantal; i++) {
    const r = toeval();
    if (r < 0.06) {
      /* De les zegt zelf niets na goed (tussenstap): telt als "zonder zin". */
      k.goedZonderZin();
      vorigeStil = true;
      eerste = false;
      continue;
    }
    const naHulp = r < 0.3;
    const magStil = toeval() < 0.92;
    const stil = k.goed({ naHulp, magStil });
    if (stil) stilTotaal++;
    if (stil && vorigeStil) fout(`les ${les}, antwoord ${i}: 2 keer achter elkaar zonder zin`);
    if (stil && eerste) fout(`les ${les}: het eerste goede antwoord is stil`);
    if (stil && naHulp) fout(`les ${les}, antwoord ${i}: stil na hulp`);
    if (stil && !magStil) fout(`les ${les}, antwoord ${i}: stil terwijl de reactie niet weg mag`);
    if (!naHulp && magStil && !eerste) {
      eenKeer++;
      if (stil) eenKeerStil++;
    }
    vorigeStil = stil;
    eerste = false;
  }
}
/* Het aandeel over alle goede antwoorden in 1 keer met een lofreactie (zonder het eerste van de les). */
const aandeel = eenKeerStil / eenKeer;
console.log(`${LESSEN} lessen nagespeeld: ${eenKeer} goede antwoorden in 1 keer (die stil mochten), ${eenKeerStil} stil = ${(aandeel * 100).toFixed(1)}% (doel: ongeveer 33%); ${stilTotaal} stiltes in totaal.`);
if (aandeel < 0.28 || aandeel > 0.38) fout(`aandeel stil is ${(aandeel * 100).toFixed(1)}%, niet ongeveer 1 op 3`);

/* Een les met alleen goede antwoorden in 1 keer: precies het patroon van Sara (nooit 2 stil, ±1/3). */
{
  let stand = BEGIN_STAND;
  let stil = 0;
  let vorige = false;
  const N = 20000;
  for (let i = 0; i < N; i++) {
    const r = besluitStilte(stand, { naHulp: false }, toeval());
    if (i === 0 && r.stil) fout("zuivere functie: eerste goed is stil");
    if (r.stil && vorige) fout("zuivere functie: 2 keer achter elkaar stil");
    if (r.stil) stil++;
    vorige = r.stil;
    stand = r.stand;
  }
  console.log(`1 lange les van ${N} goede antwoorden in 1 keer: ${((stil / N) * 100).toFixed(1)}% stil.`);
  if (stil / N < 0.3 || stil / N > 0.37) fout(`lange les: ${((stil / N) * 100).toFixed(1)}% stil`);
}

/* ---------- 2. wat mag weg (isLofReactie) ---------- */

const moet = (zinnen: string[], verwacht: boolean, wat: string) => {
  const uit = isLofReactie(zinnen);
  if (uit !== verwacht) fout(`isLofReactie(${JSON.stringify(zinnen)}) = ${uit}, verwacht ${verwacht} (${wat})`);
};
for (const z of LOF.zinnen) moet([z], true, "lofzin");
for (const z of LOF.zinnen) moet([`${z} Het zijn er {12:rood}.`], true, "lof + korte reactie in 1 zin");
for (const z of NAAM_LOF.zinnen) moet([metNaam(z, "Testkind")], true, "lof met naam");
for (const z of BEVESTIG.zinnen) moet([z], false, "bevestiging na een fout: altijd een zin");
for (const v of UITLEGVRAGEN) for (const z of v.naGoed ?? []) moet([LOF.zinnen[0], z], false, "weetje bij de klok");
for (const z of GL.uitlegWaarom) moet([LOF.zinnen[1], z], false, "uitleg waarom (Nee-route stap 5)");
moet([LOF.zinnen[2], "Tik op de volgende."], false, "lof + opdracht");
moet([LOF.zinnen[2], "Hoeveel zijn het er nu?"], false, "lof + vraag");
moet([LOF.zinnen[2], "Laten we samen kijken wat er verstopt zit."], false, "lof + samen nakijken");
moet(["Kom, we tellen ze samen."], false, "samen-zin");
moet([LOF.zinnen[0], "Het zijn er 12.", "Dat zijn er 2 meer dan 10."], false, "lof + 2 zinnen");

console.log(fouten ? `\n${fouten} fout(en) in de stilteregel.` : "\nStilteregel: alles goed (geen 2 stiltes achter elkaar, nooit bij het eerste goed, na hulp altijd een zin, ±1 op 3).");
process.exit(fouten ? 1 : 0);
