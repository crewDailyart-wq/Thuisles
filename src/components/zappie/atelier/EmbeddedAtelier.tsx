"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
const Scene=dynamic(()=>import('./AtelierStudy').then(m=>m.AtelierStudy),{ssr:false,loading:()=> <p className="zs-atelier-loading" role="status">Het atelier gaat open…</p>});

/**
 * Load the WebGL scene when the child approaches the atelier, or earlier when the page is at rest (see below).
 * Weerspiegeling (18 oktober 2026, keuze van de eigenaar op /voorbeeld-bliepo?atelier=1):
 * versie C, scherp genoeg zonder blokjes en zachter verder van het podium.
 */
export function EmbeddedAtelier({mascot}:{mascot:ReactNode}){
  const host=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'200px'});
    if(host.current)observer.observe(host.current);
    /*
      Snelheid (18 oktober 2026, optie 3): het atelier wordt al klaargezet
      zodra de pagina geladen is en de browser even niets te doen heeft, terwijl
      het kind nog bovenaan kijkt. Komt het kind bij het atelier, dan staat het
      er al. Het bouwen gaat in kleine stukjes (study-scene.ts), zodat de pagina
      bovenaan gewoon blijft reageren.
    */
    let wacht=0,rust=0;
    const klaarzetten=()=>{wacht=window.setTimeout(()=>{if(typeof window.requestIdleCallback==='function')rust=window.requestIdleCallback(()=>setVisible(true),{timeout:6000});else setVisible(true);},1500);};
    if(document.readyState==='complete')klaarzetten();else window.addEventListener('load',klaarzetten,{once:true});
    return()=>{observer.disconnect();window.removeEventListener('load',klaarzetten);window.clearTimeout(wacht);if(rust&&typeof window.cancelIdleCallback==='function')window.cancelIdleCallback(rust);};
  },[]);
  return <div className="zs-live-atelier" ref={host}>{visible?<Scene embedded mascot={mascot} reflectie="c"/>:<p className="zs-atelier-loading">Het atelier wacht op je…</p>}</div>;
}
