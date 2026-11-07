/** Controleer hoeveelheden in de echte weergavefunctie, zonder lesdata te wijzigen. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const { cijfersInTekst: f } = require('../src/lib/lessen/cijfertaal.ts');
const { lesTekst } = require('../src/lib/lessen/tekstwijzigingen.ts');
const { beginzinnen } = require('../src/lib/lessen/beginzinnen.ts');
const { leesbareLesTekst } = require('../src/lib/lessen/tekstbewerking.ts');
const begin = require('../src/lib/lessen/beginzinnen.json');
const wijzigingen = require('../src/lib/lessen/tekstwijzigingen.json');
const voorstellen = require('../src/app/voorbeeld/uitleg-kindertaal/alle-voorstellen.json');
const gevallen = [
  ['Tel één verder vanaf vierentwintig.', 'Tel 1 verder vanaf 24.'],
  ['Ja, na vierentwintig komt vijfentwintig.', 'Ja, na 24 komt 25.'],
  ['Nul, één, twee, drie, vier, vijf, zes, zeven, acht, negen, tien.', '0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.'],
  ['elf twaalf dertien veertien vijftien zestien zeventien achttien negentien', '11 12 13 14 15 16 17 18 19'],
  ['twintig dertig veertig vijftig zestig zeventig tachtig negentig honderd', '20 30 40 50 60 70 80 90 100'],
  ['eenentwintig tweeëntwintig drieëntwintig tweeënveertig negenennegentig', '21 22 23 42 99'],
  ['honderdeen tweehonderd vijfhonderd duizend', '101 200 500 1000'],
  ['Een munt is één euro waard.', 'Een munt is 1 euro waard.'],
  ['Hij is minder waard dan een euro.', 'Hij is minder waard dan 1 euro.'],
  ['Een vierkant heeft vier hoeken. Een driehoek heeft drie hoeken.', 'Een vierkant heeft 4 hoeken. Een driehoek heeft 3 hoeken.'],
  ['In het tweede vak staat twee.', 'In het tweede vak staat 2.'],
  ['Ik vier mijn verjaardag. Vier feest! Vier appels.', 'Ik vier mijn verjaardag. Vier feest! 4 appels.'],
  ['Er komt een bij. Tel er een bij. Het nummer wordt een groter.', 'Er komt 1 bij. Tel er 1 bij. Het nummer wordt 1 groter.'],
  ['Er zijn er een meer. Kies een groter huis.', 'Er zijn er 1 meer. Kies een groter huis.'],
  ['We tellen één voor één.', 'We tellen 1 voor 1.'],
  ['We tellen e\u0301e\u0301n verder.', 'We tellen 1 verder.'],
  ['Elke wagon in de trein is een dag. Elk vakje is een dag.', 'Elke wagon in de trein is 1 dag. Elk vakje is 1 dag.'],
  ['Na nog een nachtje ben je een dag verder.', 'Na nog 1 nachtje ben je 1 dag verder.'],
  ['Een week kamperen duurt langer.', '1 week kamperen duurt langer.'],
  ['Een week heeft zeven dagen.', 'Een week heeft 7 dagen.'],
  ['Voor elke appel zet ik een streepje. Voor elke euro zet ik een stip.', 'Voor elke appel zet ik 1 streepje. Voor elke euro zet ik 1 stip.'],
  ['Bij elke appel zet ik een streepje.', 'Bij elke appel zet ik 1 streepje.'],
  ['Bij elke euro die je betaalt, wordt een stip grijs.', 'Bij elke euro die je betaalt, wordt 1 stip grijs.'],
  ['Dan komt er een bolletje ijs op. En dan nog een bolletje erbij.', 'Dan komt er 1 bolletje ijs op. En dan nog 1 bolletje erbij.'],
  ['Wat duurt ongeveer een minuut? Een uur later.', 'Wat duurt ongeveer 1 minuut? 1 uur later.'],
  ['Drie uur. Half drie. Kwart over vier.', '3 uur. Half 3. Kwart over 4.'],
  ['Kijk naar een munt. Nog een keer. Een paar. Een half uur. Een halve liter. Een heel uur.', 'Kijk naar een munt. Nog een keer. Een paar. Een half uur. Een halve liter. Een heel uur.'],
  ['Er staat een {5:wit} op. {3:oranje} en {3:blauw}. [[g:één]] meer.', 'Er staat een {5:wit} op. {3:oranje} en {3:blauw}. [[g:1]] meer.'],
];
for (const [bron, verwacht] of gevallen) {
  assert.equal(f(bron), verwacht, bron);
  assert.equal(f(f(bron)), verwacht, 'opnieuw toepassen mag niets veranderen');
}
// Beide kolommen van alle voorstellen en de echte leesfunctie volgen dezelfde cijferafspraak.
let momenten = 0;
for (const les of voorstellen) {
  assert(Object.hasOwn(begin, les.id));
  const opening = beginzinnen(les.id);
  for (const veld of ['zin1', 'zin2']) assert.equal(opening[veld], f(begin[les.id][veld]));
  for (const regel of les.regels) {
    const actueel = wijzigingen[les.id]?.[regel.bron] ?? regel.bron;
    assert.equal(lesTekst(les.id, regel.bron), f(actueel));
    for (const tekst of [f(leesbareLesTekst(actueel)), f(regel.nieuw)]) {
      assert(!/(?<!\p{L})(?:één|twee|drie|vijf|zes|zeven|acht|negen|tien|twaalf)(?!\p{L})/iu.test(tekst), les.id + ': ' + tekst);
    }
    momenten++;
  }
}
assert.equal(voorstellen.length, 135);
assert.equal(lesTekst('synthesis-proef', 'Twee en één.'), 'Twee en één.');
assert.equal(lesTekst('squla-oud-concept', 'Twee en één.'), 'Twee en één.');
console.log(`${gevallen.length} betekenisgevallen, 135 beginzinnenparen en ${momenten} tekstmomenten gecontroleerd; lidwoorden, kleuren, Synthesis en oude concepten behouden.`);
