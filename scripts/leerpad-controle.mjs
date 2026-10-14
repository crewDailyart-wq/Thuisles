import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';

// Echte voortgangsregels uitvoeren; geen browser of productiedatabase nodig.
const data=JSON.parse(fs.readFileSync('src/lib/leerpad/groep3.json','utf8'));
let code=fs.readFileSync('src/lib/leerpad/model.ts','utf8').replace("import jaar from './groep3.json';",`const jaar=${JSON.stringify(data)};`);
code=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {STAPPEN,LEEG_LEERPAD,volgendeIndex,rondStapAf,normaliseerLeerpad,toetsvariant,uitgesteldeStappen}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
assert.equal(STAPPEN.length,600);
assert.equal(new Set(STAPPEN.map(s=>s.id)).size,600);
for(let w=1;w<=40;w++)for(let d=1;d<=5;d++)assert.deepEqual(STAPPEN.filter(s=>s.week===w&&s.dag===d).map(s=>s.lane),[0,1,2]);
const doelen=new Set(data.doelen.map(d=>d.id));
for(const s of STAPPEN){assert.ok(s.hoofddoelen.every(id=>doelen.has(id)));assert.ok(s.doel&&s.materiaal&&s.controle);if(s.voorwaarde)assert.ok(STAPPEN.find(p=>p.id===s.voorwaarde).nummer<s.nummer);if(s.herhalingVan)assert.equal(STAPPEN.find(p=>p.id===s.herhalingVan).week,s.week-2);}
for(const id of doelen)assert.ok(STAPPEN.some(s=>s.hoofddoelen.includes(id)));
assert.equal(rondStapAf(LEEG_LEERPAD,'g3-002','zelfstandig','2026-10-14'),LEEG_LEERPAD,'gesloten stap mag niet vooruit springen');
let stand=rondStapAf(LEEG_LEERPAD,'g3-001','met_hulp','2026-10-14');
assert.equal(volgendeIndex(stand),1);
assert.equal(stand.resultaten['g3-001'].bewijs,'met_hulp');
assert.equal(rondStapAf(stand,'g3-001','zelfstandig','2026-10-14'),stand,'dubbele afronding mag niet belonen');
assert.deepEqual(normaliseerLeerpad(JSON.parse(JSON.stringify(stand))),stand);
assert.deepEqual(normaliseerLeerpad({resultaten:{fake:{bewijs:'zelfstandig'}},toetsperiodes:[{vanWeek:50,totWeek:1}]}),LEEG_LEERPAD);
stand=LEEG_LEERPAD;
for(let i=0;i<15;i++)stand=rondStapAf(stand,STAPPEN[i].id,'zelfstandig','2026-10-14');
stand={...stand,toetsperiodes:[{vanWeek:2,totWeek:2,aanbieder:'Schooltoets'}]};
const variant=toetsvariant(STAPPEN[15],stand);
assert.equal(variant.week,1);assert.equal(variant.lane,0);
stand=rondStapAf(stand,STAPPEN[15].id,'zelfstandig','2026-10-14');
assert.equal(uitgesteldeStappen(stand).length,1,'nieuw leerdoel blijft uitgesteld');
assert.notEqual(stand.resultaten['g3-016'].geoefendeStap,'g3-016');
stand=LEEG_LEERPAD;
for(const s of STAPPEN)stand=rondStapAf(stand,s.id,'zelfstandig','2026-10-14');
assert.equal(volgendeIndex(stand),600);
assert.equal(rondStapAf(stand,'g3-600','zelfstandig','2026-10-14'),stand);
console.log('Jaarpad: 600 unieke stappen, dagmix, doelen, herhaling, volgorde, afronding, hervatten, toetsvariant en einde gecontroleerd.');
