"use client";

import { useEffect } from "react";

/**
 * De homepage is een reis: van de ruimte via de wolken naar Zappies atelier.
 * We sturen slechts één CSS-variabele aan. De bestaande WebGL-aarde,
 * sterren en muis-parallax blijven zelfstandig draaien en bewegen.
 */
export function ScrollReis() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.zp[data-start="ja"]');
    if (!root) return;

    const minderBeweging = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let huidigeStand = 0;
    let doel = 0;

    const meet = () => {
      const lengte = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      doel = Math.max(0, Math.min(1, window.scrollY / lengte));
      if (!frame) frame = window.requestAnimationFrame(teken);
    };

    const teken = () => {
      frame = 0;
      huidigeStand += (doel - huidigeStand) * (minderBeweging.matches ? 1 : 0.18);
      if (Math.abs(doel - huidigeStand) < 0.001) huidigeStand = doel;
      root.style.setProperty("--zr-scroll", huidigeStand.toFixed(4));
      root.dataset.reisfase =
        huidigeStand < 0.2 ? "ruimte" : huidigeStand < 0.58 ? "atmosfeer" : "kust";
      if (huidigeStand !== doel) frame = window.requestAnimationFrame(teken);
    };

    meet();
    window.addEventListener("scroll", meet, { passive: true });
    window.addEventListener("resize", meet);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", meet);
      window.removeEventListener("resize", meet);
      root.style.removeProperty("--zr-scroll");
      delete root.dataset.reisfase;
    };
  }, []);

  return null;
}
