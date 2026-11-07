/** Controleer dekking, unieke vragen en de echte openingsroute van alle Squla-lessen.
 * Alleen een testgids: geen browser, database of stemdienst.
 * Uitvoeren: node scripts/check-beginzinnen.cjs
 */
const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const ts=require(root+'/node_modules/typescript');
for(const ext of ['.ts','.tsx']) require.extensions[ext]=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
require.extensions['.css']=(mod)=>{mod.exports={}};
const resolve=Module._resolveFilename;
Module._resolveFilename=function(spec,parent,...rest){ if(spec.startsWith('@/'))spec=root+'/src/'+spec.slice(2); if((spec.startsWith('/') || spec.startsWith('.')) && !path.extname(spec)){const base=spec.startsWith('/')?spec:path.resolve(path.dirname(parent.filename),spec); for(const ext of ['.ts','.tsx','/index.ts','/index.tsx'])if(fs.existsSync(base+ext)){spec=base+ext;break;}} return resolve.call(this,spec,parent,...rest);};
const data=require(root+'/src/lib/lessen/beginzinnen.json');
const {cijfersInTekst}=require(root+'/src/lib/lessen/cijfertaal.ts');
const openingstekst=id=>cijfersInTekst(data[id].zin1+' '+data[id].zin2);
const {LESCATALOGUS}=require(root+'/src/lib/lessen/catalogus.ts');
const expected=LESCATALOGUS.filter(x=>x.id.startsWith('squla-'));
assert.deepEqual(Object.keys(data).sort(),expected.map(x=>x.id).sort());
assert.equal(new Set(Object.values(data).map(x=>x.zin2)).size,expected.length);
for(const x of Object.values(data)){assert(x.zin1.endsWith('.'));assert(x.zin2.endsWith('?'));assert(!/\bzelf\b/.test(x.zin2));}
const modules=fs.readdirSync(root+'/src/components/les/lessen').filter(x=>/^squla-.*\.tsx$/.test(x));
const lessons=modules.flatMap(f=>Object.entries(require(root+'/src/components/les/lessen/'+f)).filter(([k])=>k.startsWith('LESSEN_SQULA')).flatMap(([,v])=>v));
const STOP=Symbol('opening reached');
(async()=>{
 for(const info of expected){
  const les=lessons.find(x=>x.id===info.id);assert(les,info.id);
  const said=[];let choice;
  const gids=new Proxy({lesId:les.id,naam:'Testkind',zeg:async(...z)=>said.push(...z),kies:async(opts)=>{choice=opts;throw STOP;},wacht:async()=>{},vlak:()=>{},pasVlakAan:()=>{}},{get:(o,k)=>k in o?o[k]:(()=>{})});
  try{await les.speel(gids);}catch(e){if(e!==STOP)throw new Error(les.id+': '+String(e),{cause:e});}
  assert.deepEqual(choice,['Ja','Nee'],les.id);
  assert(said.includes(openingstekst(les.id)),les.id+': opening not used: '+said.join(' '));
 }
 const {squlaBegin}=require(root+'/src/components/les/lessen/squla-hulp.ts');
 for(const info of expected){
  for(const antwoord of ['Ja','Nee']){
   let uitleg=0,voorbeeld=0;const gezegd=[];
   await squlaBegin({lesId:info.id,zeg:async(...z)=>gezegd.push(...z),kies:async()=>antwoord},{welkom:['Oude opening.'],voorbeeld:()=>voorbeeld++,uitleg:async()=>{uitleg++;}});
   assert.equal(voorbeeld,1,info.id);
   assert.equal(uitleg,antwoord==='Nee'?1:0,info.id);
   assert.equal(gezegd[0],openingstekst(info.id),info.id);
  }
 }
 const {beginzinnen}=require(root+'/src/lib/lessen/beginzinnen.ts');
 for(const les of LESCATALOGUS.filter(x=>!x.id.startsWith('squla-')))assert.equal(beginzinnen(les.id),undefined,les.id);
 console.log(expected.length+' echte lesopeningen: juiste tekst en Ja/Nee; hulpvertakking gecontroleerd; overige lessen uitgesloten.');
})().catch(e=>{console.error(e);process.exitCode=1});
