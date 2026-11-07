/** Controleer de interactieve Nee-route van alle 135 Squla-lessen.
 * Alleen een testgids: geen browser, database of stemdienst.
 * Uitvoeren: node scripts/check-uitleg.cjs
 */
const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const ts=require(root+'/node_modules/typescript');
for(const ext of ['.ts','.tsx']) require.extensions[ext]=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
require.extensions['.css']=(mod)=>{mod.exports={}};
const resolve=Module._resolveFilename;
Module._resolveFilename=function(spec,parent,...rest){ if(spec.startsWith('@/'))spec=root+'/src/'+spec.slice(2); if((spec.startsWith('/') || spec.startsWith('.')) && !path.extname(spec)){const base=spec.startsWith('/')?spec:path.resolve(path.dirname(parent.filename),spec); for(const ext of ['.ts','.tsx','/index.ts','/index.tsx'])if(fs.existsSync(base+ext)){spec=base+ext;break;}} return resolve.call(this,spec,parent,...rest);};

const {LESCATALOGUS}=require(root+'/src/lib/lessen/catalogus.ts');
const expected=LESCATALOGUS.filter(x=>x.id.startsWith('squla-'));
const modules=fs.readdirSync(root+'/src/components/les/lessen').filter(x=>/^squla-.*\.tsx$/.test(x));
const lessons=modules.flatMap(f=>Object.entries(require(root+'/src/components/les/lessen/'+f)).filter(([k])=>k.startsWith('LESSEN_SQULA')).flatMap(([,v])=>v));
const {begeleideVraag,samenOefenen,isBegeleideUitleg}=require(root+'/src/components/les/lessen/squla-uitleg.ts');
const STOP=Symbol('invoer bereikt');
(async()=>{
 const traces=[];const errors=[];
 for(const lesinfo of expected){
  const les=lessons.find(x=>x.id===lesinfo.id); const said=[];let begin=false, input='';
  const invoer=(soort)=>{if(!begin)throw new Error('invoer vóór Ja/Nee');input=soort;if(!['squla-huisnummers','squla-dagen-van-de-week','squla-rekentaal'].includes(les.id))assert(isBegeleideUitleg(l),les.id+': invoer pas na uitleg');throw STOP;};
  const l=new Proxy({lesId:les.id,naam:'',zeg:async(...z)=>{if(begin)said.push(...z);},kies:async(opts)=>{if(!begin){assert.deepEqual(opts,['Ja','Nee']);begin=true;return 'Nee';}return invoer('keuze');},getal:async()=>invoer('getal'),wachtOpVlak:async(soort)=>invoer(soort),knoppen:async()=>invoer('hulpknop'),kaart:()=>{throw new Error('kaart vóór uitleg-invoer')},stopLes:()=>{throw new Error('gestopt vóór uitleg-invoer')},wacht:async()=>{},verder:async()=>{},vlak:()=>{},pasVlakAan:()=>{},wijsAan:async(_k,...z)=>said.push(...z)},{get:(o,k)=>k in o?o[k]:(()=>{})});
  try{await les.speel(l);errors.push(les.id+': geen invoer');}catch(e){if(e!==STOP)errors.push(les.id+': '+String(e));}
  if(input)traces.push({id:les.id,invoer:input,zinnen:said});
 }
 fs.writeFileSync('/tmp/squla-uitleg-controle.json',JSON.stringify(traces,null,2));
 assert.deepEqual(errors,[]);
 assert.equal(traces.length,135);
 // Elk getoond uitlegblok hoort nog bij een echte stap; oude dubbele rijen mogen niet achterblijven.
 const voorstellen=require(root+'/src/app/voorbeeld/uitleg-kindertaal/alle-voorstellen.json');
 for(const les of voorstellen) {
  assert.equal(new Set(les.regels.map(r=>r.bron)).size,les.regels.length,les.id+': dubbele bron in overzicht');
  if(les.volledigeUitleg)continue;
  const trace=traces.find(t=>t.id===les.id);
  for(const regel of les.regels)assert(trace.zinnen.includes(regel.bron),les.id+': vervallen uitleg staat nog in overzicht: '+regel.bron);
 }
 const kralen=traces.find(t=>t.id==='squla-vormen-patronen-1');
 assert(!kralen.zinnen.some(z=>z.includes('Wat komt er steeds na rood?')));
 assert.equal(kralen.zinnen.filter(z=>z.includes('Welke kraal komt na de rode kraal?')).length,1);

 // Een fout is nooit een goed antwoord; pas na een echt correct antwoord bevestigen.
 for(const reeks of [[2],[1,2],[1,1,2],[1,1,1]]){
  const events=[];let i=0;
  const l={zeg:async(...z)=>events.push(['zeg',...z]),verder:async()=>{},stopLes:async()=>{events.push(['stop']);throw STOP;}};
  const v={toon:()=>events.push(['beeld']),vraag:['Hoeveel blijven er over?'],antwoord:async()=>{events.push(['antwoord',reeks[i]]);return reeks[i++]},isGoed:x=>x===2,noem:String,goed:async()=>events.push(['goed']),samen:async()=>events.push(['hulp']),tip:['Tel de voorwerpen die overblijven.']};
  try{const uit=await begeleideVraag(l,v);assert.equal(uit,false,'uitleg is geen zelfstandig goed beantwoorde toetsvraag');}catch(e){if(e!==STOP)throw e;}
  assert.equal(events.filter(x=>x[0]==='goed').length,reeks.includes(2)?1:0);
  assert.equal(events.some(x=>x[0]==='stop'),!reeks.includes(2));
  const bevestiging=events.findIndex(x=>x[0]==='goed');
  if(bevestiging>=0)assert.equal(events.slice(0,bevestiging).filter(x=>x[0]==='antwoord').at(-1)[1],2);
 }
 // De vraag verschijnt één keer per antwoordpoging, ook als de tip dezelfde vraag bevat.
 {
  let poging=0;const vragenPerPoging=[];let gevraagd=0;
  const vraag='Op welk kaartje zijn de twee getallen samen {10:wit}?';
  const l={zeg:async(...z)=>{gevraagd+=z.filter(x=>x===vraag).length},verder:async()=>{},stopLes:async()=>{throw STOP}};
  await begeleideVraag(l,{vraag:[vraag],tip:['Tel de getallen bij elkaar op.',vraag],toon:()=>{},samen:async()=>{},
   antwoord:async()=>{vragenPerPoging.push(gevraagd);gevraagd=0;return ++poging},isGoed:x=>x===3,noem:String,goed:async()=>{}});
  assert.deepEqual(vragenPerPoging,[1,1,1]);
 }
 // Doorloop de nieuwe meervoudige tel-, reken- en klokstappen tot de gewone les.
 // De echte antwoordcontroles blijven actief; alleen de invoer wordt gesimuleerd.
 global.window={__phaser:{}};
 const volledig=lessons.filter(x=>/^squla-tellen-(fruit|resultatief)|^squla-min-|^squla-plus-bakkerij-|^squla-klok-hoelaat-1$/.test(x.id));
 const complete=[];
 for(const les of volledig) for(const eerstFout of [false,true]) {
  let geopend=false, foutGedaan=false, antwoorden=0, telstappen=0, vervolgd=false;
  const zinnen=[];
  const invoer=(opties)=>{
   if(!isBegeleideUitleg(l)){vervolgd=true;throw STOP;}
   const juist=window.__phaser.antwoord;
   assert(juist!==null && juist!==undefined,les.id+': antwoord ontbreekt');
   assert(opties.includes(String(juist)),les.id+': correct antwoord niet in keuzes');
   antwoorden++;
   if(eerstFout&&!foutGedaan){foutGedaan=true;return opties.find(x=>x!==String(juist));}
   return String(juist);
  };
  const l=new Proxy({lesId:les.id,naam:'',zeg:async(...z)=>zinnen.push(...z),
   kies:async(opties)=>{if(!geopend){geopend=true;return 'Nee';}return invoer(opties)},
   getal:async()=>{if(!isBegeleideUitleg(l)){vervolgd=true;throw STOP;}throw new Error('onverwacht getal');},
   wachtOpVlak:async(soort)=>{if(!isBegeleideUitleg(l)){vervolgd=true;throw STOP;}assert.equal(soort,'uitlegTel');telstappen++;return {soort,index:Number(String(window.__phaser.antwoord).replace('tel-',''))}},
   stopLes:async()=>{throw new Error(les.id+': onterecht gestopt')},
   kaart:()=>{throw new Error('kaart vóór gewone vraag')},
   wacht:async()=>{},verder:async()=>{},vlak:()=>{},pasVlakAan:()=>{},wijsAan:async(_k,...z)=>zinnen.push(...z)
  },{get:(o,k)=>k in o?o[k]:(()=>{})});
  try{await les.speel(l)}catch(e){if(e!==STOP)throw e;}
  assert(vervolgd,les.id+': geen gewone vraag na uitleg');
  assert(antwoorden>0);
  if(les.id.startsWith('squla-tellen-'))assert(telstappen>0);
  if(eerstFout)assert(foutGedaan);
  assert(!isBegeleideUitleg(l));
  complete.push({id:les.id,eerstFout,antwoorden,telstappen,zinnen});
 }
 for(const id of ['squla-huisnummers','squla-dagen-van-de-week','squla-rekentaal']) for(const eerstFout of [false,true]) {
  const les=lessons.find(x=>x.id===id);let geopend=false, afgerond=false, foutGedaan=false, antwoorden=0;
  const slot={ 'squla-huisnummers':'Nu ga jij ontbrekende huisnummers zoeken.', 'squla-dagen-van-de-week':'Nu mag je de gevraagde dagen op de trein zoeken.', 'squla-rekentaal':'Nu ga je verder met nieuwe plaatjes. Probeer het maar.' }[id];
  const zinnen=[];
  const kiesAntwoord=(goed,fout)=>{antwoorden++;if(eerstFout&&!foutGedaan){foutGedaan=true;return fout;}return goed;};
  const l=new Proxy({lesId:id,naam:'',zeg:async(...z)=>{zinnen.push(...z);if(z.includes(slot)){afgerond=true;throw STOP;}},
   kies:async(opties)=>{if(!geopend){geopend=true;return 'Nee';}return kiesAntwoord(String(window.__phaser.antwoord),opties.find(x=>x!==String(window.__phaser.antwoord)));},
   wachtOpVlak:async(soort)=>soort==='wagon'?{soort,dag:kiesAntwoord(Number(String(window.__phaser.antwoord).replace('wagon-','')),2)}:{soort,id:kiesAntwoord(window.__phaser.antwoord,'groot')},
   stopLes:async()=>{throw new Error(id+': onterecht gestopt')},wacht:async()=>{},verder:async()=>{},vlak:()=>{},pasVlakAan:()=>{}
  },{get:(o,k)=>k in o?o[k]:(()=>{})});
  try{await les.speel(l)}catch(e){if(e!==STOP)throw e;}
  assert(afgerond,id+': uitleg niet afgerond');assert(antwoorden>0);if(eerstFout)assert(foutGedaan);
  complete.push({id,eerstFout,antwoorden,zinnen});
 }
 // Rekentaal: de 6 stappen blijven interactief, zonder antwoordgloed vooraf.
 for(const route of ['ja','goed','hint-per-stap','pauze']) {
  const les=lessons.find(x=>x.id==='squla-rekentaal');
  let opening=true, markeer=[], pogingen=0, gestopt=false, gewoneVraag=false, laatstGoed=false;
  const doelen=[], bevestigingen=[];const geholpen=new Set();
  const l=new Proxy({lesId:les.id,naam:'',
   kies:async()=>{assert(opening);opening=false;return route==='ja'?'Ja':'Nee'},
   vlak:(_component,p)=>{markeer=p.markeer??[]},
   pasVlakAan:p=>{if(p.markeer)markeer=p.markeer},
   zeg:async(...z)=>{for(const zin of z) {
    if(/^Kijk, deze pannenkoek is groot/.test(zin))assert.deepEqual(markeer,['groot'],'voordoen wijst het genoemde voorwerp aan');
    if(isBegeleideUitleg(l)&&/^(Ja,|Goed zo\.|Dat klopt\.)/.test(zin)){
     assert(laatstGoed,'geen bevestiging vóór een correct antwoord');bevestigingen.push(zin);laatstGoed=false;
    }
   }},
   wachtOpVlak:async(soort)=>{
    assert.equal(soort,'tik');
    if(!isBegeleideUitleg(l)){gewoneVraag=true;assert.equal(window.__phaser.antwoord,'g');throw STOP;}
    assert.deepEqual(markeer,[],'tijdens beantwoorden is geen antwoord aangewezen');
    const doel=window.__phaser.antwoord;pogingen++;
    const mis=route==='pauze'||route==='hint-per-stap'&&!geholpen.has(doel);
    if(mis){geholpen.add(doel);laatstGoed=false;return {soort,id:doel==='klein'?'groot':'klein'};}
    doelen.push(doel);laatstGoed=true;return {soort,id:doel};
   },
   stopLes:async()=>{gestopt=true;throw STOP},wacht:async()=>{},verder:async()=>{}
  },{get:(o,k)=>k in o?o[k]:(()=>{})});
  try{await les.speel(l)}catch(e){if(e!==STOP)throw e;}
  assert(!isBegeleideUitleg(l),'begeleiding opgeruimd na einde of stoppen');
  if(route==='ja'){assert(gewoneVraag);assert.equal(pogingen,0);}
  else if(route==='pauze'){assert(gestopt);assert(!gewoneVraag);assert.equal(pogingen,3);assert.equal(bevestigingen.length,0);}
  else {assert(gewoneVraag);assert(!gestopt);assert.deepEqual(doelen,['klein','groot','leeg','vol','meloen','appel','kort','lang']);assert.equal(bevestigingen.length,8);assert.equal(pogingen,route==='goed'?8:16);}
 }
 console.log('Rekentaal: Ja overslaat uitleg; 8 wachtende tikvragen, hint bij elke stap, bevestiging pas na goed, pauze en overgang naar gewone opdrachten gecontroleerd.');
 // Opruimen: 1 aanwijzing per antwoordpoging, zonder de herhaalde vraag erachter.
 for(const fouten of [-1,0,1,2,3]) {
  const les=lessons.find(x=>x.id==='squla-vormen-opruimen-1');
  let poging=0, instructies=0, bevestigd=0, klaar=false, gestopt=false, actief=false;
  const zinnen=[];
  const l=new Proxy({lesId:les.id,naam:'',kies:async()=>fouten===-1?'Ja':'Nee',
   zeg:async(...z)=>{zinnen.push(...z);
    if(isBegeleideUitleg(l)){
     assert(!z.some(s=>s.includes('Help je mee opruimen?')||s.includes('Op welk plaatje zie je alleen broeken?')));
     instructies+=z.filter(s=>s==='Zoek het plaatje met alleen broeken.').length;
     if(z.includes('Goed zo!')){assert.equal(poging,fouten+1);bevestigd++;}
    }
    if(z.includes('Nu ga je verder met oefenen.')){klaar=true;throw STOP;}
   },
   vlak:()=>{},pasVlakAan:p=>{if('actief' in p)actief=p.actief;},
   wachtOpVlak:async(soort)=>{
    assert.equal(soort,'tik');assert(actief,'het kind kan na de aanwijzing antwoorden');
    if(fouten===-1){assert(zinnen.some(s=>s.includes('Op welk plaatje zie je alleen broeken?')));klaar=true;throw STOP;}
    assert(isBegeleideUitleg(l));assert.equal(instructies,1,'geen dubbele aanwijzing vóór het antwoord');instructies=0;
    poging++;return {soort,id:poging<=fouten?'s0':'s1'};
   },stopLes:async()=>{gestopt=true;throw STOP;},wacht:async()=>{},verder:async()=>{}
  },{get:(o,k)=>k in o?o[k]:(()=>{})});
  try{await les.speel(l)}catch(e){if(e!==STOP)throw e;}
  assert(!isBegeleideUitleg(l));
  assert.equal(klaar,fouten<3);assert.equal(gestopt,fouten===3);
  assert.equal(bevestigd,fouten>=0&&fouten<3?1:0);
 }
 console.log('Opruimen: aanwijzing 1 keer vóór elke tik; Ja, goed, 1×/2× fout en pauze blijven werken.');
 delete global.window;
 fs.writeFileSync('/tmp/squla-uitleg-volledig.json',JSON.stringify(complete,null,2));
 console.log(`${volledig.length + 3} tel-, reken-, week- en kloklessen volledig van Nee tot de gewone opgaven: direct goed én eerst fout.`);
 const gids={};
 try{await samenOefenen(gids,async()=>{assert(isBegeleideUitleg(gids));throw STOP})}catch(e){assert.equal(e,STOP)}
 assert(!isBegeleideUitleg(gids),'begeleiding blijft nooit hangen na afbreken');
 console.log('135 Nee-routes bereiken een kindhandeling; hint, opnieuw proberen, bevestiging, pauze en opruimen gecontroleerd.');
})().catch(e=>{console.error(e);process.exitCode=1;});
