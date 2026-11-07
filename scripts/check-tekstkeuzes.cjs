/** Echte tekstkeuzes op een tijdelijke bestandskopie; geen database of echte lestekst wijzigen. */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const ts = require(root + '/node_modules/typescript');
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const resolve = Module._resolveFilename;
Module._resolveFilename = function (spec, parent, ...rest) {
  if (spec.startsWith('@/')) spec = root + '/src/' + spec.slice(2);
  if ((spec.startsWith('/') || spec.startsWith('.')) && !path.extname(spec)) {
    const base = spec.startsWith('/') ? spec : path.resolve(path.dirname(parent.filename), spec);
    for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) if (fs.existsSync(base + ext)) { spec = base + ext; break; }
  }
  return resolve.call(this, spec, parent, ...rest);
};
let bevoegd = true;
const load = Module._load;
Module._load = function (spec, ...args) {
  if (spec === 'server-only') return {};
  if (spec === '@/lib/lessen/lokaal-beheer') return { vereisLesbeheer: async () => { if (!bevoegd) throw new Error('Geen beheer'); } };
  if (spec === 'next/cache') return { revalidatePath: () => {} };
  return load.call(this, spec, ...args);
};

const tijdelijk = fs.mkdtempSync(path.join(os.tmpdir(), 'thuisles-tekstkeuzes-'));
const cwd = process.cwd();
const src = path.join(tijdelijk, 'src/lib/lessen');
fs.mkdirSync(src, { recursive: true });
const tekstPad = path.join(src, 'tekstwijzigingen.json');
const oorspronkelijk = fs.readFileSync(root + '/src/lib/lessen/tekstwijzigingen.json', 'utf8');
fs.copyFileSync(root + '/src/lib/lessen/beginzinnen.json', path.join(src, 'beginzinnen.json'));
fs.writeFileSync(tekstPad, oorspronkelijk);
process.chdir(tijdelijk);

(async () => {
  const { alleVoorstellen, leesKeuzes, bewaarKeuze, bewaarEigenTekst } = require(root + '/src/app/voorbeeld/uitleg-kindertaal/keuzes-bewaren.ts');
  const { voorstelMetOpmaak } = require(root + '/src/app/voorbeeld/uitleg-kindertaal/opmaak.ts');
  const { kiesTekst, pasTekstAan } = require(root + '/src/app/voorbeeld/uitleg-kindertaal/acties.ts');
  const { leesbareLesTekst } = require(root + '/src/lib/lessen/tekstbewerking.ts');
  const { cijfersInTekst } = require(root + '/src/lib/lessen/cijfertaal.ts');
  const catalogus = require(root + '/src/lib/lessen/catalogus.ts').LESCATALOGUS.filter(x => x.id.startsWith('squla-'));
  assert.deepEqual(alleVoorstellen.map(x => x.id).sort(), catalogus.map(x => x.id).sort());
  const keys = alleVoorstellen.flatMap(l => l.regels.map(r => r.sleutel));
  assert.equal(new Set(keys).size, keys.length);
  let getest = 0;
  for (const les of leesKeuzes()) for (const regel of les.regels) {
    assert(regel.nieuw.trim().length > 0);
    assert(!/(?<!\p{L})één(?!\p{L})/iu.test(regel.nieuw), les.id);
    if (cijfersInTekst(leesbareLesTekst(regel.stand.actueel)) === regel.nieuw) continue;
    const vooraf = JSON.parse(fs.readFileSync(tekstPad, 'utf8'));
    const toegepast = bewaarKeuze(regel.sleutel, true, regel.stand.actueel, regel.versie);
    assert(!toegepast.fout, toegepast.fout);
    assert(toegepast.stand.aan);
    assert(toegepast.stand.kanTerug);
    assert.equal(leesbareLesTekst(toegepast.stand.actueel), regel.nieuw);
    const opSchijf = JSON.parse(fs.readFileSync(tekstPad, 'utf8'));
    assert.equal(opSchijf[les.id]?.[regel.bron] ?? regel.bron, voorstelMetOpmaak(regel.nieuw, regel.bron));
    // De bestaande functie die het echte lesscherm gebruikt moet de nieuwe tekst lezen.
    const modulePad = root + '/src/lib/lessen/tekstwijzigingen.ts';
    const jsonPad = root + '/src/lib/lessen/tekstwijzigingen.json';
    require.cache[jsonPad] = { id: jsonPad, filename: jsonPad, loaded: true, exports: opSchijf };
    delete require.cache[modulePad];
    assert.equal(require(modulePad).lesTekst(les.id, regel.bron), toegepast.stand.actueel);
    const gelezen = leesKeuzes().find(x => x.id === les.id).regels.find(x => x.sleutel === regel.sleutel);
    assert(gelezen.stand.aan, 'vinkje blijft na opnieuw lezen staan');
    const hersteld = bewaarKeuze(regel.sleutel, false, toegepast.stand.actueel, regel.versie);
    assert(!hersteld.fout, hersteld.fout);
    assert.deepEqual(JSON.parse(fs.readFileSync(tekstPad, 'utf8')), vooraf, 'uitvinken herstelt exact, inclusief handmatige tekst');
    getest++;
  }
  const regel = leesKeuzes().flatMap(l => l.regels).find(r => cijfersInTekst(leesbareLesTekst(r.stand.actueel)) !== r.nieuw);
  const gezet = bewaarKeuze(regel.sleutel, true, regel.stand.actueel, regel.versie);
  const oudVenster = bewaarKeuze(regel.sleutel, false, regel.stand.actueel, regel.versie);
  assert(oudVenster.fout, 'verouderd venster mag niet overschrijven');
  assert.equal(oudVenster.stand.actueel, gezet.stand.actueel);
  const voorAfwijzing = fs.readFileSync(tekstPad, 'utf8');
  assert(bewaarKeuze('onbekend', true, '', '').fout);
  assert(bewaarKeuze(regel.sleutel, true, gezet.stand.actueel, 'oude-versie').fout);
  assert.equal(fs.readFileSync(tekstPad, 'utf8'), voorAfwijzing);
  bevoegd = false;
  await assert.rejects(kiesTekst(regel.sleutel, false, gezet.stand.actueel, regel.versie), /Geen beheer/);
  await assert.rejects(pasTekstAan(regel.sleutel, 'Eigen tekst.', gezet.stand.actueel, regel.versie), /Geen beheer/);
  assert.equal(fs.readFileSync(tekstPad, 'utf8'), voorAfwijzing);
  bevoegd = true;
  const terug = await kiesTekst(regel.sleutel, false, gezet.stand.actueel, regel.versie);
  assert(!terug.fout);
  assert.deepEqual(JSON.parse(fs.readFileSync(tekstPad, 'utf8')), JSON.parse(oorspronkelijk));
  assert.equal(voorstelMetOpmaak('3 en 3 is 6.', '{3:oranje} + {3:blauw} = {6:paars}.'), '{3:oranje} en {3:blauw} is {6:paars}.');
  assert.equal(voorstelMetOpmaak('Er komt 1 bij.', 'Er komt één bij.'), 'Er komt {1:wit} bij.');
  // De bestaande losse teksteditor moet de zichtbare cijfertekst blijven kunnen opslaan.
  const { bewaarLeszin, bewaarControle } = require(root + '/src/app/voorbeeld/beginschermen/bewaren.ts');
  assert.equal(bewaarLeszin(regel.id, regel.bron, 'Er komt twee bij.', cijfersInTekst(leesbareLesTekst(regel.stand.actueel))), 'opgeslagen');
  assert.equal(leesbareLesTekst(JSON.parse(fs.readFileSync(tekstPad, 'utf8'))[regel.id][regel.bron]), 'Er komt 2 bij.');
  assert.equal(bewaarLeszin(regel.id, regel.bron, 'Een oude bewerking.', cijfersInTekst(leesbareLesTekst(regel.stand.actueel))), 'conflict');
  fs.writeFileSync(tekstPad, oorspronkelijk);
  // Eigen tekst opslaan: meteen toepassen, na herladen bewaren, uitvinken en opnieuw kiezen.
  const eigen = bewaarEigenTekst(regel.sleutel, 'Kijk naar een munt. Tel er twee bij.', regel.stand.actueel, regel.versie);
  assert(!eigen.fout, eigen.fout);
  assert(eigen.stand.aan && eigen.stand.kanTerug);
  assert.equal(eigen.nieuw, 'Kijk naar een munt. Tel er 2 bij.');
  assert.notEqual(eigen.versie, regel.versie);
  const naHerladen = leesKeuzes().flatMap(l => l.regels).find(r => r.sleutel === regel.sleutel);
  assert.equal(naHerladen.nieuw, eigen.nieuw);
  assert.equal(naHerladen.versie, eigen.versie);
  assert(naHerladen.stand.aan);
  const aangepastBestand = JSON.parse(fs.readFileSync(tekstPad, 'utf8'));
  assert.equal(leesbareLesTekst(aangepastBestand[regel.id][regel.bron]), eigen.nieuw);
  assert(bewaarEigenTekst(regel.sleutel, 'Verouderd venster.', eigen.stand.actueel, regel.versie).fout);
  assert(bewaarEigenTekst(regel.sleutel, ' ', eigen.stand.actueel, eigen.versie).fout);
  assert(bewaarEigenTekst(regel.sleutel, 'x'.repeat(1501), eigen.stand.actueel, eigen.versie).fout);
  assert.deepEqual(JSON.parse(fs.readFileSync(tekstPad, 'utf8')), aangepastBestand);
  const eigenUit = bewaarKeuze(regel.sleutel, false, eigen.stand.actueel, eigen.versie);
  assert(!eigenUit.fout);
  assert.deepEqual(JSON.parse(fs.readFileSync(tekstPad, 'utf8')), JSON.parse(oorspronkelijk));
  assert.equal(leesKeuzes().flatMap(l => l.regels).find(r => r.sleutel === regel.sleutel).nieuw, eigen.nieuw);
  const weerAan = await kiesTekst(regel.sleutel, true, eigenUit.stand.actueel, eigen.versie);
  assert(weerAan.stand.aan);
  const nogmaals = bewaarEigenTekst(regel.sleutel, eigen.nieuw, weerAan.stand.actueel, eigen.versie);
  assert.equal(nogmaals.stand.vorig, regel.stand.actueel, 'dezelfde tekst nogmaals opslaan behoudt herstelpunt');
  const gewijzigd = await pasTekstAan(regel.sleutel, 'Tel de twee munten. Kijk goed.', nogmaals.stand.actueel, eigen.versie);
  assert(!gewijzigd.fout);
  assert.equal(gewijzigd.nieuw, 'Tel de 2 munten. Kijk goed.');
  const herstelEigen = bewaarKeuze(regel.sleutel, false, gewijzigd.stand.actueel, gewijzigd.versie);
  assert.equal(herstelEigen.stand.actueel, nogmaals.stand.actueel, 'vorige eigen tekst is herstelbaar');
  fs.writeFileSync(tekstPad, oorspronkelijk);
  const zinnenPad = path.join(src, 'beginzinnen.json');
  const zinnenVooraf = JSON.parse(fs.readFileSync(zinnenPad, 'utf8'));
  assert.equal(bewaarControle('squla-huisnummers', 'zin1', 'Je telt twee huizen.', cijfersInTekst(zinnenVooraf['squla-huisnummers'].zin1)), 'opgeslagen');
  assert.equal(JSON.parse(fs.readFileSync(zinnenPad, 'utf8'))['squla-huisnummers'].zin1, 'Je telt 2 huizen.');
  const nodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  assert.throws(() => bewaarKeuze(regel.sleutel, true, regel.stand.actueel, regel.versie), /Alleen beschikbaar/);
  if (nodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = nodeEnv;
  console.log(`${catalogus.length} lessen, ${keys.length} unieke tekstmomenten; ${getest} keuzes opgeslagen, in lesfunctie gelezen en exact teruggezet.`);
  console.log('Ook gecontroleerd: behouden andere teksten, herladen, verouderde vensters, onbekende voorstellen, beheercontrole, productieblokkade en getalkleuren.');
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => { process.chdir(cwd); fs.rmSync(tijdelijk, { recursive: true, force: true }); });
