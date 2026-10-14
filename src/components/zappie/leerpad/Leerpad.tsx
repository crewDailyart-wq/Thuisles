"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { STAPPEN, LEEG_LEERPAD, volgendeIndex, toetsvariant, uitgesteldeStappen, type Leerstap } from '@/lib/leerpad/model';
import { bewaarToetsperiodes, useVoortgang, voltooiLeerstap, voltooiInhaalstap } from '@/lib/zappie/opslag';
import { PUNTEN_MISSIE } from '@/lib/zappie/voortgang';
import jaar from '@/lib/leerpad/groep3.json';
import './leerpad.css';

const abonneer=()=>()=>{};
const tekens=['123','Aa','✎'];
const rustig=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Symbool({soort}:{soort:'slot'|'vink'}) {
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">{soort==='vink'?<path d="m5 12 4 4 10-10"/>:<><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>}</svg>;
}

export function Leerpad(){
 const v=useVoortgang();
 const stand=v.leerpad??LEEG_LEERPAD;
 const geladen=useSyncExternalStore(abonneer,()=>true,()=>false);
 const huidig=volgendeIndex(stand);
 const nu=STAPPEN[Math.min(huidig,599)];
 const [weekKeuze,zetWeek]=useState<number|null>(null);
 const week=weekKeuze??nu.week;
 const weekStappen=STAPPEN.filter(s=>s.week===week);
 const [gekozen,zetGekozen]=useState<Leerstap|null>(null);
 const [bezig,zetBezig]=useState(false);
 const [nagekeken,zetNagekeken]=useState(false);
 const [melding,zetMelding]=useState('');
 const [ouder,zetOuder]=useState(false);
 const [inhaal,zetInhaal]=useState(false);
 const dialoog=useRef<HTMLDialogElement>(null);
 const actief=useRef<HTMLButtonElement>(null);
 const openKnop=useRef<HTMLElement|null>(null);
 const achterstallig=uitgesteldeStappen(stand);
 const klaar=Object.keys(stand.resultaten).length;
 const dagKlaar=STAPPEN.filter(s=>s.week===nu.week&&s.dag===nu.dag&&stand.resultaten[s.id]).length;

 useEffect(()=>{
  if(!geladen || weekKeuze!==null) return;
  const frame=requestAnimationFrame(()=>actief.current?.scrollIntoView({block:'center',behavior:'instant'}));
  return()=>cancelAnimationFrame(frame);
 },[geladen,weekKeuze]);
 useEffect(()=>{
  if(gekozen||ouder) dialoog.current?.showModal();
  else if(dialoog.current?.open) dialoog.current.close();
 },[gekozen,ouder]);

 function sluit(){zetGekozen(null);zetOuder(false);zetBezig(false);zetNagekeken(false);zetInhaal(false);openKnop.current?.focus();}
 function open(s:Leerstap,inh=false){openKnop.current=document.activeElement as HTMLElement;zetGekozen(s);zetInhaal(inh);zetBezig(false);zetNagekeken(false);}
 function mijnPlek(){zetWeek(null);requestAnimationFrame(()=>actief.current?.scrollIntoView({block:'center',behavior:rustig()?'instant':'smooth'}));}
 function rondAf(bewijs:'zelfstandig'|'met_hulp'){
  if(!gekozen||!nagekeken) return;
  const gelukt=inhaal?voltooiInhaalstap(gekozen.id,bewijs):voltooiLeerstap(gekozen.id,bewijs);
  if(gelukt){zetMelding(inhaal?'Inhaalstap geoefend.':`Stap geoefend! Je krijgt ${PUNTEN_MISSIE} tokens.`);zetWeek(null);}
  sluit();
  requestAnimationFrame(()=>actief.current?.scrollIntoView({block:'center',behavior:rustig()?'instant':'smooth'}));
 }
 const geoefend=gekozen?(inhaal?gekozen:toetsvariant(gekozen,stand)):null;
 const opSlot=gekozen?gekozen.nummer>huidig+1:false;
 const alKlaar=gekozen?Boolean(stand.resultaten[gekozen.id])&&!inhaal:false;
 const volgendeWeek=week<40;

 return <main className="lp">
  <header className="lp-header">
   <Link href="/zappie" className="lp-terug" aria-label="Terug naar start">‹</Link>
   <div><p className="lp-eyebrow">GROEP 3 · JOUW ONTDEKKINGSREIS</p><h1>Mijn leerpad</h1></div>
   <button className="lp-volwassen" onClick={()=>{openKnop.current=document.activeElement as HTMLElement;zetOuder(true);}}>Voor de begeleider</button>
  </header>
  <section className="lp-dag" aria-label="Je leerroute">
   <div><span className="lp-klein">{huidig===600?'Je jaarpad is geoefend':`Week ${nu.week} · Dag ${nu.dag}`}</span><strong>{huidig===600?'Wat heb je veel ontdekt!':'Drie kleine stappen vandaag'}</strong></div>
   <div className="lp-dagstappen" aria-label={`${dagKlaar} van 3 stappen van deze leerdag geoefend`}>{[0,1,2].map(lane=>{const s=STAPPEN.find(s=>s.week===nu.week&&s.dag===nu.dag&&s.lane===lane)!;return <span key={lane} data-klaar={Boolean(stand.resultaten[s.id])}>{stand.resultaten[s.id]?<Symbool soort="vink"/>:tekens[lane]}</span>;})}</div>
  </section>
  <div className="lp-toolbar"><label>Bekijk week <select value={week} onChange={e=>zetWeek(Number(e.target.value))}>{Array.from({length:40},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select></label><button onClick={mijnPlek}>Waar ben ik?</button><span>{klaar} / 600 stappen</span></div>
  <div role="status" className="lp-melding" aria-live="polite">{melding}</div>
  {!geladen?<p className="lp-laden">Je leerpad wordt geladen…</p>:<>
   <div className="lp-weekrand"><span>{volgendeWeek?`Het avontuur gaat verder in week ${week+1}`:'Het einde van jouw jaarpad'}</span>{volgendeWeek&&<button onClick={()=>{zetWeek(week+1);zetMelding('Je bekijkt de volgende week.');}}>Volgende week ↑</button>}</div>
   <ol className="lp-pad" aria-label={`Leerstappen week ${week}, van boven naar beneden in omgekeerde volgorde`} reversed>
    {[...weekStappen].reverse().map((s,i)=>{
     const gedaan=Boolean(stand.resultaten[s.id]);const actiefNu=s.nummer===huidig+1;const x=s.dag%2===0?63:37;
     return <li key={s.id} value={s.nummer} className={`lp-stap ${actiefNu?'lp-actief':''}`} data-staat={gedaan?'klaar':actiefNu?'nu':'later'} style={{'--lp-x':`${x}%`} as CSSProperties}>
      {i<14&&<svg className="lp-lijn" viewBox="0 0 100 240" preserveAspectRatio="none" aria-hidden="true"><path d={`M ${x} 90 C ${x} 230 ${s.lane===0?(s.dag%2===0?37:63):x} 180 ${s.lane===0?(s.dag%2===0?37:63):x} 330`}/></svg>}
      <div className="lp-eiland"><Image src="/assets/zappie/leerpad/eiland.webp" alt="" width={640} height={640} sizes="(max-width: 600px) 250px, 290px" priority={actiefNu}/>
       <button ref={actiefNu?actief:undefined} className="lp-rond" onClick={()=>open(s)} aria-label={`Stap ${s.nummer}: ${s.titel}. ${gedaan?'Geoefend':actiefNu?'Start':'Nog gesloten'}`} aria-current={actiefNu?'step':undefined}>
        {gedaan?<Symbool soort="vink"/>:actiefNu?<span>{tekens[s.lane]}</span>:<Symbool soort="slot"/>}
       </button>
      </div>
      <div className="lp-label"><span className="lp-vak">{s.vak} · Stap {s.nummer}</span><h2>{s.titel}</h2>{actiefNu?<><p>{s.fase} · ongeveer {s.minuten} minuten</p><button className="lp-start" onClick={()=>open(s)}>Start <span aria-hidden="true">▶</span></button></>:<span className="lp-klein">{gedaan?'✓ Geoefend':`Dag ${s.dag}`}</span>}</div>
     </li>;
    })}
   </ol>
   <div className="lp-weekrand"><span>{week===1?'Hier begint jouw avontuur':`Dit was week ${week-1}`}</span>{week>1&&<button onClick={()=>zetWeek(week-1)}>↓ Vorige week</button>}</div>
  </>}
  <footer className="lp-voet">Elke stap op jouw tempo. Je kunt altijd opnieuw oefenen.</footer>
  <dialog ref={dialoog} className="lp-dialog" onCancel={e=>{e.preventDefault();sluit();}} onClose={()=>{if(gekozen||ouder)sluit();}}>
   <button className="lp-sluiten" onClick={sluit} aria-label="Sluiten">×</button>
   {ouder?<div className="lp-ouder"><p className="lp-eyebrow">GROEP 3</p><h2>De route achter het avontuur</h2><p>40 schoolweken, 5 dagen en 3 stappen per dag. Deze algemene leerlijn is een eigen uitwerking van de aangeleverde doelen met SLO als referentiekader. De weekvolgorde is geen landelijke norm.</p><p><strong>Deze eerste versie bevat begeleide opdrachten.</strong> Een volwassene controleert de concrete uitvoering. Groen betekent geoefend, niet automatisch beheerst. Voortgang staat per gekozen kind in deze browser; nog niet in de centrale ouderrapportage.</p>
    <a href="/assets/zappie/leerpad/jaartabel-groep3.csv" download>Download de tabel met alle 600 stappen</a>
    <h3>Toetsvoorbereiding instellen</h3><p>Kies alleen een periode die aansluit bij de school. In die weken herhalen we eerder geoefende stof. Dit zijn eigen opdrachten, geen Cito-toetsen. Nieuwe stof die hierdoor opschuift, blijft hieronder als inhaalstap staan.</p>
    <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const vanWeek=Number(f.get('van'));const totWeek=Number(f.get('tot'));if(totWeek<vanWeek){zetMelding('De eindweek moet na of gelijk aan de startweek liggen.');return;}bewaarToetsperiodes([...stand.toetsperiodes,{vanWeek,totWeek,aanbieder:String(f.get('aanbieder')||'Schooltoets')}]);zetMelding('Voorbereidingsperiode opgeslagen.');}}>
     <label>Toetsnaam<input name="aanbieder" placeholder="Bijvoorbeeld Leerling in beeld" maxLength={50}/></label><div className="lp-velden"><label>Van week<input name="van" type="number" min={2} max={40} defaultValue={18} required/></label><label>Tot week<input name="tot" type="number" min={2} max={40} defaultValue={19} required/></label></div><button type="submit">Periode toevoegen</button>
    </form><p role="status">{melding}</p>
    <ul>{stand.toetsperiodes.map((p,i)=><li key={`${p.vanWeek}-${i}`}>{p.aanbieder}: week {p.vanWeek}–{p.totWeek}<button onClick={()=>bewaarToetsperiodes(stand.toetsperiodes.filter((_,j)=>j!==i))}>Verwijder periode</button></li>)}</ul>
    {achterstallig.length>0&&<><h3>Doorgeschoven nieuwe leerstof</h3><p>Werk deze opdrachten na de voorbereiding bij. Ze geven geen dubbele beloning.</p><ul>{achterstallig.map(s=><li key={s.id}><button onClick={()=>{zetOuder(false);open(s,true);}}>Stap {s.nummer}: {s.titel}</button></li>)}</ul></>}
    <h3>Jaaroverzicht</h3><div className="lp-tabel"><table><thead><tr><th>Week</th><th>Rekenen</th><th>Lezen / taal</th><th>Spelling / schrijven</th></tr></thead><tbody>{Array.from({length:40},(_,i)=><tr key={i}><th>{i+1}</th>{[0,1,2].map(l=><td key={l}>{STAPPEN[i*15+l].titel}</td>)}</tr>)}</tbody></table></div>
    <h3>Bronnen en afbakening</h3>{jaar.bronnen.map(b=><p key={b.id}><a href={b.url} target="_blank" rel="noreferrer">{b.titel}</a><br/>{b.gebruik}</p>)}
   </div>:gekozen&&geoefend?<div className="lp-opdracht"><p className="lp-eyebrow">{geoefend.vak} · STAP {gekozen.nummer} VAN 600</p><h2>{geoefend.titel}</h2>
    {geoefend.id!==gekozen.id&&<p className="lp-voorbereiding">Toetsvoorbereiding: we halen eerder geoefende stof terug. De oorspronkelijke opdracht blijft bewaard om later in te halen.</p>}
    {opSlot?<><p>Deze stap komt later. Ga eerst verder waar je gebleven bent.</p><button className="lp-start" onClick={()=>{sluit();mijnPlek();}}>Naar mijn stap</button></>:<>
     <p className="lp-doel">{geoefend.doel}</p><p className="lp-samen">Samen met een volwassene · ongeveer 5 minuten</p>
     {!bezig?<><h3>Leg klaar</h3><p>{geoefend.materiaal}</p><button className="lp-start" onClick={()=>zetBezig(true)}>{alKlaar?'Oefen nog eens':'Begin samen'}</button></>:<>
      <div className="lp-doen"><h3>Aan de slag</h3><p>{geoefend.materiaal}</p><ol><li>Laat één voorbeeld zien of horen.</li><li>Laat het kind de opdracht uitvoeren.</li><li>Probeer een ander passend voorbeeld zonder het antwoord voor te zeggen.</li></ol></div>
      <details className="lp-hulp"><summary>Het lukt nog niet</summary><p>Maak het voorbeeld kleiner. Doe één stap voor en laat het kind daarna een nieuw voorbeeld proberen. Bij lezen: verklank rustig en voeg samen. Bij rekenen: leg de hoeveelheden neer.</p><button onClick={()=>{zetNagekeken(false);zetMelding('Neem rustig de tijd. Deze stap blijft open.');}}>We oefenen nog even</button></details>
      <fieldset className="lp-controle"><legend>Controle door de begeleider</legend><p>{geoefend.controle}</p><label><input type="checkbox" checked={nagekeken} onChange={e=>zetNagekeken(e.target.checked)}/> Ik heb de uitvoering bekeken en het kind heeft de opdracht afgemaakt.</label>
       {alKlaar?<><p>Deze stap is al geoefend. Opnieuw oefenen geeft geen dubbele tokens.</p><button onClick={sluit}>Terug naar het pad</button></>:<div className="lp-uitkomsten"><button disabled={!nagekeken} onClick={()=>rondAf('zelfstandig')}>Zelfstandig gelukt</button><button disabled={!nagekeken} onClick={()=>rondAf('met_hulp')}>Met hulp gelukt</button></div>}
      </fieldset>
     </>}
    </>}
   </div>:null}
  </dialog>
 </main>;
}
