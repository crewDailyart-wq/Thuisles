'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { StudyController, StudyView } from './study-scene';
import './study.css';

const views: { id:StudyView;label:string }[] = [{id:'samen',label:'Het geheel'},{id:'podium',label:'Het podium'},{id:'vitrine',label:'De vitrine'}];
export function AtelierStudy(){
  const host=useRef<HTMLDivElement>(null),controller=useRef<StudyController|null>(null);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  const [view,setView]=useState<StudyView>('samen'),[glow,setGlow]=useState(true);
  useEffect(()=>{let cancelled=false;let instance:StudyController|undefined;
    import('./study-scene').then(({createStudy})=>{if(cancelled||!host.current)return;instance=createStudy(host.current,()=>{if(!cancelled)setStatus('ready');},()=>{if(!cancelled)setStatus('error');});controller.current=instance;}).catch(()=>{if(!cancelled)setStatus('error');});
    return()=>{cancelled=true;instance?.dispose();controller.current=null;};
  },[]);
  return <main className="as" data-status={status} data-view={view}>
    <div className="as-canvas" ref={host}/>
    <header className="as-header"><div><p>ZAPPIES ATELIER <span> / </span> ONTWERPSTUDIE 01</p><h1>Het begint met licht.</h1></div><Link href="/atelier-prototype" aria-label="Terug naar het eerdere prototype">Terug ↗</Link></header>
    <div className="as-caption"><span>01 — PODIUM & VITRINE</span><p>Diepblauw email. Warm goud.<br/>Een vleugje magie.</p></div>
    <footer className="as-footer"><nav aria-label="Kies een detail">{views.map(v=><button key={v.id} disabled={status!=='ready'} aria-pressed={view===v.id} onClick={()=>{setView(v.id);controller.current?.view(v.id);}}>{v.label}</button>)}</nav><button className="as-glow" disabled={status!=='ready'} aria-pressed={glow} onClick={()=>{setGlow(!glow);controller.current?.glow(!glow);}}>Gloed {glow?'aan':'uit'} <span aria-hidden="true">✦</span></button><p>Een eerste 3D-materiaalstudie · De fantasiewereld en Zappie volgen later</p></footer>
    {status!=='ready'&&<div className="as-status" role="status"><span>✦</span><h2>{status==='error'?'De 3D-studie kon niet openen':'Het licht gaat aan…'}</h2>{status==='error'&&<><p>Controleer of je browser 3D-weergave ondersteunt.</p><button onClick={()=>window.location.reload()}>Opnieuw proberen</button></>}</div>}
  </main>;
}
