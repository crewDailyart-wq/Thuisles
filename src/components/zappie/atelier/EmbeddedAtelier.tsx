"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useLichteWeergave } from '@/lib/lichte-weergave';
import { wachtOpScrollrust } from '@/lib/scrollrust';
const Scene=dynamic(()=>import('./AtelierStudy').then(m=>m.AtelierStudy),{ssr:false,loading:()=> <p className="zs-atelier-loading" role="status">Het atelier gaat open…</p>});

/**
 * Load the WebGL scene when the child approaches the atelier, or earlier when the page is at rest (see below).
 * Weerspiegeling (18 oktober 2026, keuze van de eigenaar op /voorbeeld-bliepo?atelier=1):
 * versie C, scherp genoeg zonder blokjes en zachter verder van het podium.
 */
export function EmbeddedAtelier({mascot}:{mascot:ReactNode}){
  const host=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  /* Lichte weergave (telefoon, tablet, traag apparaat): plaatjes in plaats van 3D, en niet vooraf klaarzetten. */
  const licht=useLichteWeergave();
  useEffect(()=>{
    if(licht===null)return;
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'200px'});
    if(host.current)observer.observe(host.current);
    /*
      Snelheid (18 oktober 2026, optie 3): het atelier wordt al klaargezet
      zodra de pagina geladen is en de browser even niets te doen heeft, terwijl
      het kind nog bovenaan kijkt. Komt het kind bij het atelier, dan staat het
      er al. Het bouwen gaat in kleine stukjes (study-scene.ts), zodat de pagina
      bovenaan gewoon blijft reageren.
    */
    /*
      Vloeiend scrollen (19 oktober 2026): klaarzetten pas als er minstens 1
      seconde niet gescrold is, nooit tijdens het scrollen. Op telefoon en
      tablet (licht) is het geen 3D maar alleen de plaatjesversie; die wordt
      zo ook in een rustig moment in de pagina gezet, in plaats van midden in
      het scrollen als het kind bij het atelier komt (dat gaf een hapering).
    */
    let wacht=0,rust=0,weg=false;
    const zetKlaar=()=>{void wachtOpScrollrust().then(()=>{if(!weg)setVisible(true);});};
    const klaarzetten=()=>{wacht=window.setTimeout(()=>{if(typeof window.requestIdleCallback==='function')rust=window.requestIdleCallback(zetKlaar,{timeout:6000});else zetKlaar();},1500);};
    if(document.readyState==='complete')klaarzetten();else window.addEventListener('load',klaarzetten,{once:true});
    return()=>{weg=true;observer.disconnect();window.removeEventListener('load',klaarzetten);window.clearTimeout(wacht);if(rust&&typeof window.cancelIdleCallback==='function')window.cancelIdleCallback(rust);};
  },[licht]);
  return <div className="zs-live-atelier" ref={host}>{visible?<Scene embedded mascot={mascot} reflectie="c" plaatjes={licht===true}/>:<p className="zs-atelier-loading">Het atelier wacht op je…</p>}</div>;
}
