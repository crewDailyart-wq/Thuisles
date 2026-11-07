/** Controleer herhaling in de foutenhulp en overgang van uitleg naar oefenen.
 * Alleen een testgids: geen browser, database of stemdienst.
 * Uitvoeren: node scripts/check-herhaling.cjs
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

const hulp=require(root+'/src/components/les/lessen/squla-hulp.ts');
const {uitlegVoorVraag,krijgtVervolgvraag}=require(root+'/src/components/les/lessen/squla-uitleg.ts');
const echt=hulp.squlaVraag;
const uit=[];
let huidig, zinnen;
function gids(id){return new Proxy({lesId:id,naam:'',zeg:async(...z)=>zinnen.push(...z),kies:async(opts)=>opts.includes('Ja')?'Ja':opts[0],wachtOpVlak:async(soort)=>{if(soort==='memoryKlaar')return {soort};throw STOP},getal:async()=>{throw STOP},stopLes:()=>{throw STOP},kaart:async()=>{},wijsAan:async(_k,...z)=>zinnen.push(...z),wacht:async()=>{},verder:async()=>{}},{get:(o,k)=>k in o?o[k]:(()=>{})});}
(async()=>{
 global.window={__phaser:{}};
 const opgaven=[];
 hulp.squlaVraag=async(l,v)=>{opgaven.push({id:huidig,l,v});return true};
 const overgeslagen=[];
 for(const info of expected){
  huidig=info.id;zinnen=[];
  try{await lessons.find(x=>x.id===huidig).speel(gids(huidig))}catch(e){if(e!==STOP)throw e;overgeslagen.push(huidig)}
 }
 hulp.squlaVraag=echt;
 for(const {id,l,v} of opgaven){
  zinnen=[];
  try{await uitlegVoorVraag(l,v.samen)}catch(e){if(e!==STOP)throw e;}
  const vragen=zinnen.filter(z=>z.trim().endsWith('?'));
  if(vragen.length)uit.push({id,vraag:v.vraag,uitleg:vragen});
 }
 fs.mkdirSync(root+'/output/lescontrole',{recursive:true});
 fs.writeFileSync(root+'/output/lescontrole/hulpvragen-audit.json',JSON.stringify({opgaven:opgaven.length,overgeslagen,kandidaten:uit},null,2));
 // Echte centrale foutafhandeling: elke vraag 1 keer per antwoordpoging.
 const patroon=opgaven.find(o=>o.id==='squla-vormen-patronen-1');
 for(const route of ['direct','hulp','opnieuw-goed','opnieuw-hulp','hint','pauze']) {
  const {l,v}=patroon;let poging=0,vragen=0,goed=0,stop=false;zinnen=[];
  const antwoorden=route==='direct'?['groen']:route==='opnieuw-goed'?['blauw','groen']:route==='opnieuw-hulp'?['blauw','rood','groen']:route==='hint'?['blauw','rood','groen']:route==='pauze'?['blauw','rood','blauw']:['blauw','groen'];
  l.kies=async()=>route.startsWith('opnieuw')?'Nog een keer':'Hulp';
  l.zeg=async(...z)=>{zinnen.push(...z);vragen+=z.filter(s=>s.includes('Welke kraal komt na de rode kraal?')).length;assert(!z.some(s=>s.includes('Wat komt er steeds na rood?')))};
  l.stopLes=async()=>{stop=true;throw STOP};
  const vraag={...v,antwoord:async()=>{assert.equal(vragen,poging===2&&['hint','pauze'].includes(route)?0:1,route+': vraag slechts 1 keer per antwoordpoging; na tip blijft zij in beeld');vragen=0;return antwoorden[poging++];},goed:async()=>{goed++;await v.goed('groen')}};
  // Na een tip blijft de vraag in beeld: geen tweede uitspraak nodig.
  let resultaat;
  try{resultaat=await echt(l,vraag)}catch(e){if(e!==STOP)throw e}
  assert.equal(stop,route==='pauze');assert.equal(goed,stop?0:1);
  if(!stop)assert.equal(resultaat,route==='direct','goed na hulp telt niet als direct goed');
  assert(!isBegeleideUitleg(l));assert(!krijgtVervolgvraag(l),'foutenhulp-context opgeruimd');
 }
 const fake={};
 await assert.rejects(uitlegVoorVraag(fake,async()=>{assert(krijgtVervolgvraag(fake));assert(!isBegeleideUitleg(fake));throw Error('afbreken')}));
 assert(!krijgtVervolgvraag(fake),'context ook bij afbreken opgeruimd');

 // Lesrouting over de volledige echte opgavenlijsten; antwoordstappen zijn hier stubs.
 // De echte Nee-antwoorden worden apart door check-uitleg.cjs en browsercontrole getest.
 const routes=[];
 for(const info of expected){
  if(['squla-huisnummers','squla-rekentaal','squla-dagen-van-de-week'].includes(info.id))continue;
  const perRoute={};
  for(const keuze of ['Ja','Nee']){
   let geopend=false,gewoon=0,begeleid=0,laatsteLetters=null;const eersteVragen=[];zinnen=[];
   const l=gids(info.id);
   l.kies=async(opts)=>{if(!geopend){geopend=true;return keuze;}const x=String(window.__phaser.antwoord);assert(opts.includes(x),info.id+': uitlegantwoord in keuzes');return x;};
   l.wachtOpVlak=async(soort)=>{if(soort==='memoryKlaar')return {soort};if(soort==='uitlegTel')return {soort,index:Number(String(window.__phaser.antwoord).replace('tel-',''))};throw STOP};
   l.pasVlakAan=p=>{const letters=p.beeld?.delen?.find(d=>d.s==='letters');if(letters)laatsteLetters=letters;};
   hulp.squlaVraag=async(_l,v)=>{v.toon?.();if(isBegeleideUitleg(_l))begeleid++;else {gewoon++;if(eersteVragen.length<2)eersteVragen.push(v.vraag.join(' '));}return true;};
   let onvolledig=false;
   try{await lessons.find(x=>x.id===info.id).speel(l)}catch(e){if(e!==STOP)throw e;onvolledig=true}
   perRoute[keuze]={gewoon,begeleid,onvolledig,laatsteLetters,eersteVragen};
  }
  const {Ja,Nee}=perRoute;
  if(!Ja.onvolledig&&!Nee.onvolledig){
   const verschil=Ja.gewoon-Nee.gewoon;
   assert([0,1].includes(verschil),info.id+': hoogstens de ene afgeronde eerste opgave overslaan');
   if(info.id.startsWith('squla-piraat-'))assert.deepEqual(Nee.laatsteLetters,Ja.laatsteLetters,info.id+': alle schatletters blijven behouden');
   if(['squla-min-machine-2','squla-klok-hoelaat-1','squla-vormen-kleuren-1'].includes(info.id))assert.equal(verschil,0,info.id+': andere vervolgvraag behouden');
   if(['squla-vormen-patronen-1','squla-geld-geldmachine-1','squla-plus-bakkerij-1','squla-tellen-fruit-1'].includes(info.id)){assert.equal(verschil,1,info.id+': afgeronde eerste opgave weg');assert.equal(Nee.eersteVragen[0],Ja.eersteVragen[1],info.id+': start met volgende opgave');}
  }
  routes.push({id:info.id,...perRoute});
 }
 hulp.squlaVraag=echt;
 fs.writeFileSync(root+'/output/lescontrole/herhaling-routes.json',JSON.stringify(routes,null,2));
 assert.equal(routes.filter(r=>!r.Ja.onvolledig&&!r.Nee.onvolledig).length,132);
 console.log('Foutreacties: direct goed, hulp, opnieuw goed, opnieuw fout, hint en pauze gecontroleerd.');
 console.log('Ja/Nee-opgavenlijsten gecontroleerd:',routes.filter(r=>!r.Ja.onvolledig&&!r.Nee.onvolledig).length,'lessen.');
 console.log('Uitleg doorgelopen:' ,opgaven.length,'opgaven; extra vragen:',uit.length,'; eigen routes:',overgeslagen);
})().catch(e=>{console.error(e);process.exitCode=1});
