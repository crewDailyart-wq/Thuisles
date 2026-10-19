"use client";

/**
 * De bewegende sterrenhemel: één canvas met
 *   - sterren in drie dieptes die elk heel langzaam een paar pixels drijven
 *     (15 tot 30 seconden per rondje, ieder op zijn eigen tempo); verre sterren
 *     bewegen minder dan nabije, en een deel fonkelt zachtjes;
 *   - gouden sterren met een rustige gloed en af en toe een twinkeling;
 *   - gouden stofjes die langzaam zweven;
 *   - af en toe een vallende ster, hoog in de lucht.
 *
 * Zuinig: hoogstens 30 beelden per seconde, niet scherper dan 1,5 keer de
 * pixels, en helemaal stil als het tabblad niet zichtbaar is. Bij "minder
 * beweging" en tijdens een missie wordt de hemel één keer getekend en staat hij
 * stil.
 *
 * Parallax: de muisstand komt uit `parallax` (zie useParallax); verre lagen
 * schuiven het minst.
 */

import { useEffect, useRef } from "react";
import { parallax } from "@/components/zappie/parallax";

type Ster = {
  x: number; // 0..1 van de breedte
  y: number; // 0..1 van de hoogte
  r: number; // straal in css-pixels
  laag: 0 | 1 | 2;
  periode: number; // seconden per drijfrondje
  fase: number;
  amp: number; // drijfafstand in pixels
  fonkel: number; // 0 = niet, anders snelheid
  licht: number; // basishelderheid
};

type Goud = { x: number; y: number; grootte: number; periode: number; fase: number; flits: number };
type Stof = { x: number; y: number; r: number; vx: number; vy: number; fase: number };
type Vallend = { x: number; y: number; dx: number; dy: number; begin: number; duur: number };

/** Vaste plekken voor de gouden sterren, in de lege lucht van het ontwerp. */
const GOUDEN_STERREN: [number, number, number][] = [
  [0.058, 0.3, 1],
  [0.33, 0.19, 0.8],
  [0.505, 0.105, 0.9],
  [0.69, 0.165, 1.1],
  [0.727, 0.42, 0.8],
  [0.83, 0.485, 1],
  [0.94, 0.15, 0.9],
  [0.62, 0.035, 0.7],
];

const PARALLAX_PX = [2, 5, 9];

/** Een vaste reeks toevalsgetallen, zodat de hemel bij elke keer laden gelijk is. */
function zaad(n: number) {
  let s = n;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function maakSterren(): Ster[] {
  const kans = zaad(20261013);
  const sterren: Ster[] = [];
  const aantallen = [110, 55, 20];
  aantallen.forEach((n, laag) => {
    for (let i = 0; i < n; i++) {
      sterren.push({
        x: kans(),
        y: Math.pow(kans(), 1.35) * 0.72,
        r: [0.45, 0.8, 1.25][laag] + kans() * [0.45, 0.5, 0.6][laag],
        laag: laag as 0 | 1 | 2,
        periode: 15 + kans() * 15,
        fase: kans() * Math.PI * 2,
        amp: [2, 4, 6][laag] * (0.6 + kans() * 0.6),
        fonkel: kans() < 0.35 ? 0.6 + kans() * 1.6 : 0,
        licht: 0.45 + kans() * 0.5,
      });
    }
  });
  return sterren;
}

function maakStof(): Stof[] {
  const kans = zaad(777);
  return Array.from({ length: 26 }, () => ({
    x: kans(),
    y: kans() * 0.75,
    r: 0.6 + kans() * 1.1,
    vx: (kans() - 0.5) * 0.004,
    vy: -0.002 - kans() * 0.004,
    fase: kans() * Math.PI * 2,
  }));
}

export function Sterrenveld({ rustig = false }: { rustig?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const doek = canvas.current;
    const ctx = doek?.getContext("2d");
    if (!doek || !ctx) return;

    const stil = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sterren = maakSterren();
    const stof = maakStof();
    const goud: Goud[] = GOUDEN_STERREN.map(([x, y, g], i) => ({
      x,
      y,
      grootte: g,
      periode: 4 + (i % 4) * 1.1,
      fase: i * 1.7,
      flits: 9 + ((i * 3.3) % 6),
    }));
    let vallend: Vallend | null = null;
    let volgendeVallend = 4;
    let breed = 0;
    let hoog = 0;
    let dpr = 1;

    const maat = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      breed = window.innerWidth;
      hoog = window.innerHeight;
      doek.width = Math.round(breed * dpr);
      doek.height = Math.round(hoog * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    maat();

    /* Eén keer een gloed-plaatje maken in plaats van elk beeld opnieuw. */
    const gloed = document.createElement("canvas");
    gloed.width = gloed.height = 64;
    const g = gloed.getContext("2d")!;
    const verloop = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    verloop.addColorStop(0, "rgba(255,248,214,1)");
    verloop.addColorStop(0.18, "rgba(255,222,120,0.85)");
    verloop.addColorStop(0.45, "rgba(255,200,80,0.25)");
    verloop.addColorStop(1, "rgba(255,200,80,0)");
    g.fillStyle = verloop;
    g.fillRect(0, 0, 64, 64);

    const teken = (t: number) => {
      ctx.clearRect(0, 0, breed, hoog);
      const px = rustig ? 0 : parallax.x;
      const py = rustig ? 0 : parallax.y;

      /* Sterren. */
      for (const s of sterren) {
        if (rustig && s.laag === 0 && s.fonkel === 0) continue;
        const hoek = (t / s.periode) * Math.PI * 2 + s.fase;
        const x = s.x * breed + Math.cos(hoek) * s.amp - px * PARALLAX_PX[s.laag];
        const y = s.y * hoog + Math.sin(hoek * 0.8) * s.amp * 0.7 - py * PARALLAX_PX[s.laag] * 0.7;
        let a = s.licht;
        if (s.fonkel) a *= 0.55 + 0.45 * Math.sin(t * s.fonkel + s.fase);
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = s.laag === 2 ? "#eaf6ff" : "#d6e8ff";
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.laag === 2) {
          ctx.globalAlpha = a * 0.25;
          ctx.beginPath();
          ctx.arc(x, y, s.r * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* Gouden stofjes: langzaam omhoog en opzij, en weer van onder. */
      if (!rustig) {
        for (const d of stof) {
          const x = ((d.x + d.vx * t) % 1 + 1) % 1;
          const y = ((d.y + d.vy * t) % 0.75 + 0.75) % 0.75;
          ctx.globalAlpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.9 + d.fase));
          ctx.drawImage(gloed, x * breed - px * 6 - d.r * 3, y * hoog - py * 4 - d.r * 3, d.r * 6, d.r * 6);
        }
      }

      /* Gouden sterren: rustige gloed, af en toe een twinkeling. */
      for (const s of goud) {
        const x = s.x * breed - px * 7;
        const y = s.y * hoog - py * 5;
        const adem = 0.65 + 0.35 * Math.sin((t / s.periode) * Math.PI * 2 + s.fase);
        const inFlits = (t + s.fase * 3) % s.flits;
        const flits = inFlits < 0.7 ? Math.sin((inFlits / 0.7) * Math.PI) : 0;
        const maatGloed = (20 + 12 * flits) * s.grootte;
        ctx.globalAlpha = 0.55 * adem + 0.4 * flits;
        ctx.drawImage(gloed, x - maatGloed, y - maatGloed, maatGloed * 2, maatGloed * 2);
        /* De vier punten. */
        const arm = (11 + 10 * flits) * s.grootte;
        ctx.globalAlpha = 0.75 * adem + 0.25 * flits;
        ctx.fillStyle = "#fff4c4";
        ctx.beginPath();
        ctx.moveTo(x, y - arm);
        ctx.quadraticCurveTo(x, y, x + arm * 0.22, y);
        ctx.quadraticCurveTo(x, y, x, y + arm);
        ctx.quadraticCurveTo(x, y, x - arm * 0.22, y);
        ctx.quadraticCurveTo(x, y, x, y - arm);
        ctx.moveTo(x - arm * 0.8, y);
        ctx.quadraticCurveTo(x, y, x, y - arm * 0.18);
        ctx.quadraticCurveTo(x, y, x + arm * 0.8, y);
        ctx.quadraticCurveTo(x, y, x, y + arm * 0.18);
        ctx.quadraticCurveTo(x, y, x - arm * 0.8, y);
        ctx.fill();
      }

      /* Af en toe een vallende ster, hoog in de lucht. */
      if (!rustig && !stil) {
        if (!vallend && t > volgendeVallend) {
          const naarRechts = Math.random() < 0.5;
          vallend = {
            x: naarRechts ? 0.15 + Math.random() * 0.35 : 0.5 + Math.random() * 0.35,
            y: 0.04 + Math.random() * 0.22,
            dx: (naarRechts ? 1 : -1) * (0.16 + Math.random() * 0.08),
            dy: 0.07 + Math.random() * 0.05,
            begin: t,
            duur: 0.9 + Math.random() * 0.4,
          };
        }
        if (vallend) {
          const v = (t - vallend.begin) / vallend.duur;
          if (v >= 1) {
            vallend = null;
            volgendeVallend = t + 9 + Math.random() * 8;
          } else {
            const kop = v;
            const staart = Math.max(0, v - 0.35);
            const x1 = (vallend.x + vallend.dx * kop) * breed;
            const y1 = (vallend.y + vallend.dy * kop) * hoog;
            const x0 = (vallend.x + vallend.dx * staart) * breed;
            const y0 = (vallend.y + vallend.dy * staart) * hoog;
            const lijn = ctx.createLinearGradient(x0, y0, x1, y1);
            lijn.addColorStop(0, "rgba(200,230,255,0)");
            lijn.addColorStop(1, "rgba(255,255,255,0.95)");
            ctx.globalAlpha = Math.sin(v * Math.PI);
            ctx.strokeStyle = lijn;
            ctx.lineWidth = 1.8;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    /* Bij "minder beweging" en tijdens een missie: één keer tekenen, dan stil. */
    if (stil || rustig) {
      teken(0);
      const opnieuw = () => {
        maat();
        teken(0);
      };
      window.addEventListener("resize", opnieuw);
      return () => window.removeEventListener("resize", opnieuw);
    }

    let frame = 0;
    let vorige = 0;
    /*
      Alleen tekenen als het sterrenveld te zien is (19 oktober 2026). Bij de
      bouwtekening staat het verborgen (display: none), maar het tekende toch
      30 keer per seconde door; dat kostte rekenwerk tijdens het scrollen.
    */
    let inBeeld = true;
    const begin = performance.now();
    const lus = (nu: number) => {
      frame = 0;
      if (!inBeeld || document.hidden) return;
      frame = requestAnimationFrame(lus);
      if (nu - vorige < 1000 / 30) return;
      vorige = nu;
      teken((nu - begin) / 1000);
    };
    const zichtbaar = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden && inBeeld) frame = requestAnimationFrame(lus);
    };
    const kijker = new IntersectionObserver((items) => {
      inBeeld = items.some((i) => i.isIntersecting);
      zichtbaar();
    });
    kijker.observe(doek);
    frame = requestAnimationFrame(lus);
    window.addEventListener("resize", maat);
    document.addEventListener("visibilitychange", zichtbaar);
    return () => {
      cancelAnimationFrame(frame);
      kijker.disconnect();
      window.removeEventListener("resize", maat);
      document.removeEventListener("visibilitychange", zichtbaar);
    };
  }, [rustig]);

  return <canvas ref={canvas} className="zp-laag zp-sterrenveld" />;
}
