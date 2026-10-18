'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import type { Reflectie, StudyController, StudyView } from './study-scene';
import './study.css';

const views: { id:StudyView;label:string }[] = [{id:'samen',label:'Het geheel'},{id:'podium',label:'Het podium'},{id:'vitrine',label:'De vitrine'},{id:'koepel',label:'De koepel'},{id:'lintjes',label:'Lintjes'}];
const badges=[
  {name:'Eerste vonk',hint:'Voorbeeld: rond je eerste les af.'},
  {name:'Flitsdenker',hint:'Voorbeeld: oefen tien rekensommen.'},
  {name:'Verhalenzoeker',hint:'Voorbeeld: lees drie verhalen.'},
  {name:'Sterrenverkenner',hint:'Voorbeeld: ontdek alle leerwerelden.'},
  {name:'Doorzetter',hint:'Voorbeeld: oefen vijf dagen.'},
  {name:'Wereldbouwer',hint:'Voorbeeld: voltooi een creatieve opdracht.'},
];
/** reflectie: welke weerspiegeling (zie study-scene.ts); onKlaar: voor de metingen op /voorbeeld-bliepo?atelier=1. */
export function AtelierStudy({embedded=false,mascot,reflectie=null,onKlaar}:{embedded?:boolean;mascot?:ReactNode;reflectie?:Reflectie|null;onKlaar?:(c:StudyController)=>void}){
  const mascotAnchor=useRef<HTMLDivElement>(null);
  const host=useRef<HTMLDivElement>(null),controller=useRef<StudyController|null>(null);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  const [badge,setBadge]=useState(0),[unlocked,setUnlocked]=useState([true,true,true,false,false,false]);
  const [view,setView]=useState<StudyView>('samen'),[glow,setGlow]=useState(true);
  useEffect(()=>{let cancelled=false;let instance:StudyController|undefined;
    import('./study-scene').then(({createStudy})=>{if(cancelled||!host.current)return;instance=createStudy(host.current,()=>{if(!cancelled)setStatus('ready');},()=>{if(!cancelled)setStatus('error');},index=>{if(!cancelled){setBadge(index);setView('lintjes');instance?.view('lintjes');}},mascotAnchor.current,reflectie);controller.current=instance;}).catch(()=>{if(!cancelled)setStatus('error');});
    return()=>{cancelled=true;instance?.dispose();controller.current=null;};
  },[reflectie]);
  useEffect(()=>{controller.current?.badge(badge,unlocked[badge]);},[badge,unlocked,status]);
  const klaarMelder=useRef(onKlaar);
  useEffect(()=>{klaarMelder.current=onKlaar;});
  useEffect(()=>{if(status==='ready'&&controller.current)klaarMelder.current?.(controller.current);},[status]);
  return <div className={`as${embedded?' as-embedded':''}`} role="region" aria-label="Interactief 3D-atelier" data-status={status} data-view={view}>
    <div className="as-canvas" ref={host}/>
    {mascot&&<div ref={mascotAnchor} className="as-mascot">{mascot}</div>}
    {!embedded&&<header className="as-header"><div><p>BLIEPO’S ATELIER <span> / </span> ONTWERPSTUDIE 03</p><h1>De Sterrenwerkplaats.</h1></div><Link href="/atelier-prototype" aria-label="Terug naar het eerdere prototype">Terug ↗</Link></header>}
    {!embedded&&view!=='lintjes'&&<div className="as-caption"><span>02 — HET STERRENOBSERVATORIUM</span><p>Onder de glazen koepel.<br/>Een wereld vol energie.</p></div>}
    {view==='lintjes'&&status==='ready'&&<section className="as-badges" aria-label="De lintjeskast">
      <span className="as-eyebrow">DE LINTJESKAST · PROTOTYPE</span>
      <nav aria-label="Kies een badge">{badges.map((b,i)=><button key={b.name} aria-label={b.name} aria-pressed={badge===i} onClick={()=>setBadge(i)}>{String(i+1).padStart(2,'0')}<span aria-hidden="true">{unlocked[i]?'✦':'◇'}</span></button>)}</nav>
      <div aria-live="polite"><h2>{badges[badge].name}</h2><p>{badges[badge].hint}</p><span className="as-badge-state">{unlocked[badge]?'Ontgrendeld in deze demo':'Nog vergrendeld'}</span></div>
      <button className="as-unlock" disabled={unlocked[badge]} onClick={()=>setUnlocked(values=>values.map((value,i)=>i===badge?true:value))}>{unlocked[badge]?'In je voorbeeldcollectie':'Ontgrendel voorbeeld'}</button>
      <small>Probeer het uit. Je echte voortgang verandert niet.</small>
    </section>}
    <footer className="as-footer"><nav aria-label="Kies een detail">{views.map(v=><button key={v.id} disabled={status!=='ready'} aria-pressed={view===v.id} onClick={()=>{setView(v.id);controller.current?.view(v.id);}}>{v.label}</button>)}</nav><button className="as-glow" disabled={status!=='ready'} aria-pressed={glow} onClick={()=>{setGlow(!glow);controller.current?.glow(!glow);}}>Gloed {glow?'aan':'uit'} <span aria-hidden="true">✦</span></button><p>{embedded?<>Passen is gratis · <Link href="/zappie/beloningen">Bekijk je echte beloningen</Link></>:'3D-atelier & glazen koepel · Bliepo volgt later'}</p></footer>
    {status!=='ready'&&<div className="as-status" role="status"><span>✦</span><h2>{status==='error'?'De 3D-studie kon niet openen':'Het licht gaat aan…'}</h2>{status==='error'&&<><p>Controleer of je browser 3D-weergave ondersteunt.</p><button onClick={()=>window.location.reload()}>Opnieuw proberen</button></>}</div>}
  </div>;
}
