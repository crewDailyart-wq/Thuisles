'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Zappie } from '../Zappie';
import { ITEMS, STATIONS, type AtelierController, type ItemId, type Outfit, type Station } from './model';
import './atelier.css';

/** Prototype only: all choices live in memory, without account or storage calls. */
export function Atelier3D() {
  const host = useRef<HTMLDivElement>(null);
  const mascot = useRef<HTMLDivElement>(null);
  const anchors = useRef(new Map<string, HTMLButtonElement>());
  const controller = useRef<AtelierController | null>(null);
  const [station, setStation] = useState<Station>('podium');
  const [outfit, setOutfit] = useState<Outfit>({});
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('Welkom in jouw atelier');
  const [retry, setRetry] = useState(0);
  const state = useRef({ station, outfit });
  useEffect(() => { state.current = { station, outfit }; }, [station, outfit]);
  const pickRef = useRef<(id: ItemId) => void>(() => {});

  function pick(id: ItemId) {
    const item = ITEMS.find(i => i.id === id)!;
    setOutfit(previous => ({ ...previous, [item.station]: previous[item.station] === id ? undefined : id }));
    setMessage(outfit[item.station] === id ? `${item.naam} afgedaan` : `${item.naam} gepast! Bekijk Bliepo op het podium.`);
  }
  useEffect(() => { pickRef.current = pick; });
  useEffect(() => {
    let cancelled = false;
    const element = host.current, svg = mascot.current?.querySelector('svg');
    if (!element || !svg) return;
    import('./scene').then(({ createAtelier }) => {
      if (cancelled) return;
      const instance = createAtelier({
        host: element, mascot: svg, anchors: anchors.current,
        onPick: id => pickRef.current(id),
        onReady: () => { if (!cancelled) setStatus('ready'); },
        onError: () => { if (!cancelled) setStatus('error'); },
      });
      controller.current = instance;
      instance.station(state.current.station); instance.outfit(state.current.outfit);
    }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; controller.current?.dispose(); controller.current = null; };
  }, [retry]);
  useEffect(() => { controller.current?.station(station); }, [station]);
  useEffect(() => { controller.current?.outfit(outfit); }, [outfit]);
  const chosen = ITEMS.filter(i => outfit[i.station] === i.id);
  const current = STATIONS.find(s => s.id === station)!;
  const ready = status === 'ready';

  return (
    <main className="za" data-station={station} data-status={status}>
      <div className="za-source" ref={mascot} aria-hidden="true"><Zappie stemming="blij" houding="zwaai" /></div>
      <div ref={host} className="za-scene">
        <div className="za-anchors" aria-label="Voorwerpen in het atelier" inert={!ready}>
          {STATIONS.filter(s => s.id !== 'podium').map(s => (
            <button key={s.id} ref={el => { if (el) anchors.current.set(s.id, el); else anchors.current.delete(s.id); }}
              className="za-anchor za-station-anchor" onClick={() => setStation(s.id)} hidden>
              <span>{s.icoon}</span> {s.naam} <span className="za-small-arrow">↗</span>
            </button>
          ))}
          {ITEMS.map(item => (
            <button key={item.id} ref={el => { if (el) anchors.current.set(item.id, el); else anchors.current.delete(item.id); }}
              className="za-anchor za-item-anchor" onClick={() => pick(item.id)}
              aria-pressed={outfit[item.station] === item.id} hidden>
              {item.naam} <span>{outfit[item.station] === item.id ? '✓ Aan' : '+ Pas'}</span>
            </button>
          ))}
        </div>
      </div>
      <header className="za-header">
        <Link className="za-back" href="/zappie" aria-label="Terug naar Zappie">←</Link>
        <div><p className="za-eyebrow">Een wereld vol mogelijkheden</p><h1>Bliepo’s atelier<span>✦</span></h1></div>
        <span className="za-prototype">PROTOTYPE</span>
      </header>
      <div className="za-direction" aria-live="polite"><span className="za-dot" />{current.uitleg}</div>
      {status !== 'ready' && (
        <div className="za-loading" role="status">
          <span className="za-loading-star">✦</span>
          <h2>{status === 'error' ? 'Het atelier kon niet openen' : 'De deuren gaan open…'}</h2>
          <p>{status === 'error' ? 'Voor dit atelier is een browser met WebGL nodig.' : 'Even de lichten aan, Bliepo staat al klaar.'}</p>
          {status === 'error' && <button onClick={() => { setStatus('loading'); setRetry(n => n + 1); }}>Probeer opnieuw</button>}
          {status === 'error' && <Link href="/zappie">Terug naar Zappie</Link>}
        </div>
      )}
      <aside className="za-outfit" aria-label="Je gekozen outfit">
        <span className="za-eyebrow">Jouw Bliepo</span>
        <p role="status">{message}</p>
        {chosen.length > 0 && <div className="za-chosen">{chosen.map(i => <span key={i.id}>{i.naam}</span>)}</div>}
        <div className="za-outfit-actions">
          {station !== 'podium' && <button className="za-see" onClick={() => setStation('podium')}>Bekijk Bliepo <span>↗</span></button>}
          {chosen.length > 0 && <button className="za-reset" onClick={() => { setOutfit({}); setMessage('Bliepo is weer helemaal zichzelf'); }}>Opnieuw</button>}
        </div>
      </aside>
      <footer className="za-footer">
        <nav aria-label="Camerastandpunten" className="za-nav">
          {STATIONS.map((s, index) => <button key={s.id} disabled={!ready} aria-pressed={station === s.id} onClick={() => setStation(s.id)}>
            <span className="za-nav-icon">{s.icoon}</span><span>{s.naam}</span><small>0{index + 1}</small>
          </button>)}
        </nav>
        <p>Alles mag je passen <span>·</span> Je keuzes worden niet bewaard</p>
      </footer>
    </main>
  );
}
