"use client";

import { useEffect } from "react";
import { Illustratie } from "@/components/zappie/reis/Illustratie";
import "@/components/zappie/reis-afwerking.css";
import { reisStand, useBewegingsstand, zetOmgevingRustig } from "@/components/zappie/reis/beweging";

const begrens = (n: number) => Math.max(0, Math.min(1, n));
const vloeiend = (n: number) => { const t = begrens(n); return t * t * (3 - 2 * t); };

/** Normaal scrollen blijft intact: alleen de decoratieve omgeving reageert. */
export function ScrollReis() {
  const stand = useBewegingsstand();
  const rustig = stand !== "aan";

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.zp[data-start="ja"]');
    const bestemming = document.getElementById("zappies-atelier");
    if (!root || !bestemming) return;
    root.dataset.beweging = rustig ? "rustig" : "aan";

    let frame = 0;
    let vorigeTijd = 0;
    let positie = 0;
    let doel = 0;
    let afstand = 1;
    const teken = (nu: number) => {
      frame = 0;
      const delta = vorigeTijd ? Math.min(80, nu - vorigeTijd) : 16;
      vorigeTijd = nu;
      positie += (doel - positie) * (rustig ? 1 : 1 - Math.exp(-delta / 90));
      if (Math.abs(doel - positie) < 0.0005) positie = doel;
      const land = vloeiend((positie - 0.42) / 0.4);
      const wolken = vloeiend((positie - 0.2) / 0.25) * (1 - vloeiend((positie - 0.62) / 0.28));
      reisStand.positie = rustig ? 0 : positie;
      root.style.setProperty("--zr-scroll", positie.toFixed(4));
      root.style.setProperty("--zr-land", land.toFixed(4));
      root.style.setProperty("--zr-wolken", wolken.toFixed(4));
      root.dataset.reisfase = positie < 0.2 ? "ruimte" : positie < 0.67 ? "atmosfeer" : "kust";
      if (!rustig && Math.abs(doel - positie) > 0.0005 && !document.hidden) frame = requestAnimationFrame(teken);
    };
    const plan = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(teken);
    };
    const scroll = () => { doel = begrens(window.scrollY / afstand); plan(); };
    const meet = () => {
      // Een anker in de inhoud, niet een vaste pixelhoogte. Werkt ook na tekstzoom,
      // laden van illustraties, lettertypen en wisselen van schermoriëntatie.
      afstand = Math.max(1, bestemming.getBoundingClientRect().top + window.scrollY + Math.min(420, window.innerHeight * 0.35));
      scroll();
    };
    const zichtbaarheid = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      vorigeTijd = 0;
      if (!document.hidden) meet();
    };
    const observer = new ResizeObserver(meet);
    observer.observe(root);
    meet();
    // Geen inhaalvlucht na herstel van een eerder bezochte scrollpositie.
    positie = doel;
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", meet);
    document.addEventListener("visibilitychange", zichtbaarheid);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", meet);
      document.removeEventListener("visibilitychange", zichtbaarheid);
      for (const naam of ["--zr-scroll", "--zr-land", "--zr-wolken"]) root.style.removeProperty(naam);
      delete root.dataset.reisfase;
      delete root.dataset.beweging;
      reisStand.positie = 0;
    };
  }, [rustig]);

  return (
    <>
      <div className="zr-camera" aria-hidden="true">
        <div className="zr-landing"><Illustratie naam="kust" sizes="100vw" /></div>
        <div className="zr-camerawolk zr-camerawolk-links" />
        <div className="zr-camerawolk zr-camerawolk-rechts" />
      </div>
      <a href="#vrij-oefenen" className="zr-skip">Direct naar de vakken</a>
      <button
        type="button"
        className="zr-beweging"
        aria-pressed={rustig}
        disabled={stand === "systeem"}
        title={stand === "systeem" ? "Je apparaat heeft minder beweging ingesteld." : "Zet de bewegende omgeving aan of uit."}
        onClick={() => zetOmgevingRustig(!rustig)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">{rustig ? <path d="m8 5 11 7-11 7z" /> : <path d="M7 5h3v14H7zm7 0h3v14h-3z" />}</svg>
        <span>{rustig ? "Rustige weergave" : "Beweging uit"}</span>
      </button>
    </>
  );
}
