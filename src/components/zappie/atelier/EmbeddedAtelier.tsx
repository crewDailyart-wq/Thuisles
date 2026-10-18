"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
const Scene=dynamic(()=>import('./AtelierStudy').then(m=>m.AtelierStudy),{ssr:false,loading:()=> <p className="zs-atelier-loading" role="status">Het atelier gaat open…</p>});

/**
 * Load the WebGL scene only when the child approaches the atelier.
 * Weerspiegeling (18 oktober 2026, keuze van de eigenaar op /voorbeeld-bliepo?atelier=1):
 * versie C, scherp genoeg zonder blokjes en zachter verder van het podium.
 */
export function EmbeddedAtelier({mascot}:{mascot:ReactNode}){
  const host=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'200px'});
    if(host.current)observer.observe(host.current);
    return()=>observer.disconnect();
  },[]);
  return <div className="zs-live-atelier" ref={host}>{visible?<Scene embedded mascot={mascot} reflectie="c"/>:<p className="zs-atelier-loading">Het atelier wacht op je…</p>}</div>;
}
