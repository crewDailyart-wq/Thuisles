"use client";

/**
 * Parallax: de lagen van het heelal schuiven een paar pixels mee met de muis,
 * de verste het minst. Zo voelt de ruimte diep.
 *
 * `useParallax` volgt de muis en zet de stand (van -1 tot 1) op twee plekken:
 *   - als --px en --py op het Zappie-element, voor alles wat met CSS beweegt
 *     (de ruimte, de werelden, het pad);
 *   - in `parallax`, voor wat op een canvas getekend wordt (sterren, aarde).
 *
 * De stand loopt zacht achter de muis aan, zodat er niets schokt. Niet op een
 * aanraakscherm (daar is geen muis om te volgen) en niet bij "minder beweging".
 * Knoppen, menu, kaarten en teksten doen niet mee: die blijven stil staan.
 */

import { useEffect } from "react";

export const parallax = { x: 0, y: 0 };

export function useParallax(element: React.RefObject<HTMLElement | null>, aan: boolean) {
  useEffect(() => {
    const el = element.current?.closest<HTMLElement>(".zp");
    if (!el || !aan) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let doelX = 0;
    let doelY = 0;
    let frame = 0;
    const stap = () => {
      parallax.x += (doelX - parallax.x) * 0.08;
      parallax.y += (doelY - parallax.y) * 0.08;
      el.style.setProperty("--px", parallax.x.toFixed(3));
      el.style.setProperty("--py", parallax.y.toFixed(3));
      frame = Math.abs(doelX - parallax.x) + Math.abs(doelY - parallax.y) > 0.002 ? requestAnimationFrame(stap) : 0;
    };
    const beweeg = (e: PointerEvent) => {
      doelX = (e.clientX / window.innerWidth) * 2 - 1;
      doelY = (e.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(stap);
    };
    window.addEventListener("pointermove", beweeg, { passive: true });
    return () => {
      window.removeEventListener("pointermove", beweeg);
      cancelAnimationFrame(frame);
      parallax.x = 0;
      parallax.y = 0;
      el.style.removeProperty("--px");
      el.style.removeProperty("--py");
    };
  }, [element, aan]);
}
