"use client";

/**
 * Het lijntje op het scherm van Bliepo (18 oktober 2026, opdracht eigenaar).
 *
 * Bliepo zelf is een plaatje zonder lijntje (bliepo-leeg-*.webp, gemaakt uit
 * het 3D-model). Alleen dit lijntje wordt live getekend, in een klein canvas
 * precies over zijn scherm:
 *   - klinkt er geluid van Bliepo (lib/bliepo-geluid.ts), dan springt het
 *     lijntje mee op dat geluid;
 *   - praat de browserstem (die laat zich niet meten), dan beweegt het op een
 *     nagebootst praatritme;
 *   - is het stil, dan loopt er een rustig hartslaglijntje over het scherm;
 *   - bij "Beweging uit" staat er een rustige, stilstaande lijn.
 * Het tekent hoogstens 30 keer per seconde, en alleen als Bliepo in beeld is.
 *
 * Het scherm staat in het plaatje een tikje schuin. De vier hoeken (in
 * procenten van het plaatje, gemeten in het plaatje zelf) staan hieronder; elk
 * punt van het lijntje wordt daartussen geplaatst, zodat het precies op het
 * scherm ligt.
 */

import { useEffect, useRef } from "react";
import { bliepoGeluidKlinkt, leesBliepoGolf } from "@/lib/bliepo-geluid";

type Punt = readonly [number, number];
/** De vier hoeken van het scherm (links/rechts, boven/onder), in procenten van het vak waar het lijntje over ligt. */
export type Schermhoeken = { lb: Punt; rb: Punt; lo: Punt; ro: Punt };
const HOEK: { lb: Punt; rb: Punt; lo: Punt; ro: Punt } = {
  lb: [29.6, 13.8],
  rb: [78.5, 11.2],
  lo: [29.6, 32.4],
  ro: [78.5, 32.0],
};
/* Het canvas beslaat het vak rond die hoeken, met wat ruimte voor de gloed. */
const VAK = { links: 29.5, boven: 10.5, breed: 49.1, hoog: 23 };
/* Het lijntje loopt van 7 tot 93 procent van de breedte van het scherm, zoals op de 3D-robot. */
const BEGIN = 0.07;
const EIND = 0.93;
const PUNTEN = 64;

/** Een hartslagje rond x (0..1), breedte b: klein omhoog, diep omlaag, hoog omhoog, terug. */
function hartslag(x: number, midden: number, b: number) {
  const d = (x - midden) / b;
  if (d < -1 || d > 1) return 0;
  if (d < -0.5) return (d + 1) * 0.25;
  if (d < -0.1) return 0.125 - ((d + 0.5) / 0.4) * 0.6;
  if (d < 0.3) return -0.475 + ((d + 0.1) / 0.4) * 1.15;
  if (d < 0.6) return 0.675 - ((d - 0.3) / 0.3) * 0.775;
  return -0.1 + ((d - 0.6) / 0.4) * 0.1;
}

/*
  Bewegend scherm (23 oktober 2026): bij de filmpjes van Bliepo (BliepoFilm)
  beweegt zijn hoofd. Dan geeft `hoeken` per beeldje waar het scherm staat,
  ligt het canvas over het hele vak en loopt het lijntje mee met het scherm.
  Zonder `hoeken` blijft alles zoals het was.
*/
export function BliepoLijn({ rustig, praat, hoeken }: { rustig: boolean; praat: boolean; hoeken?: () => Schermhoeken | null }) {
  const doek = useRef<HTMLCanvasElement>(null);
  const instelling = useRef({ rustig, praat, hoeken });

  useEffect(() => {
    instelling.current = { rustig, praat, hoeken };
  }, [rustig, praat, hoeken]);

  useEffect(() => {
    const c = doek.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const golf = new Uint8Array(new ArrayBuffer(1024));
    const hoogte = new Float32Array(PUNTEN);
    let frame = 0;
    let zichtbaar = false;
    let laatste = 0;
    let ritme = 0;
    let ritmeDoel = 0;
    let ritmeWissel = 0;

    const maat = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
    };

    /* Een punt op het scherm: u langs de breedte (0..1), v langs de hoogte (0 = boven). */
    const VOL = { links: 0, boven: 0, breed: 100, hoog: 100 };
    let H: Schermhoeken = HOEK;
    let V = VAK;
    const plek = (u: number, v: number): Punt => {
      const boven = [H.lb[0] + (H.rb[0] - H.lb[0]) * u, H.lb[1] + (H.rb[1] - H.lb[1]) * u];
      const onder = [H.lo[0] + (H.ro[0] - H.lo[0]) * u, H.lo[1] + (H.ro[1] - H.lo[1]) * u];
      const x = boven[0] + (onder[0] - boven[0]) * v;
      const y = boven[1] + (onder[1] - boven[1]) * v;
      return [((x - V.links) / V.breed) * c.width, ((y - V.boven) / V.hoog) * c.height];
    };

    const teken = (nu: number) => {
      const { rustig: stil, praat: browserPraat, hoeken: haalHoeken } = instelling.current;
      const nuHoeken = haalHoeken?.();
      if (haalHoeken && !nuHoeken) {
        ctx.clearRect(0, 0, c.width, c.height);
        return;
      }
      H = nuHoeken ?? HOEK;
      V = nuHoeken ? VOL : VAK;
      const geluid = !stil && leesBliepoGolf(golf);
      if (geluid) {
        /* Het geluid zelf: de golf in stukjes, sterk vergroot, zacht nagelopen. */
        const stap = Math.floor(golf.length / PUNTEN);
        for (let i = 0; i < PUNTEN; i++) {
          const w = (golf[i * stap] - 128) / 128;
          const rand = Math.sin((i / (PUNTEN - 1)) * Math.PI);
          hoogte[i] += (Math.max(-1, Math.min(1, w * 3.2)) * 0.42 * rand - hoogte[i]) * 0.6;
        }
      } else if (!stil && (browserPraat || bliepoGeluidKlinkt())) {
        /* Nagebootst praten: lettergrepen van wisselende sterkte. */
        if (nu > ritmeWissel) {
          ritmeDoel = Math.random() < 0.18 ? 0.05 : 0.35 + Math.random() * 0.65;
          ritmeWissel = nu + 80 + Math.random() * 120;
        }
        ritme += (ritmeDoel - ritme) * 0.35;
        for (let i = 0; i < PUNTEN; i++) {
          const x = i / (PUNTEN - 1);
          const rand = Math.sin(x * Math.PI);
          const doel = (Math.sin(x * 23 + nu / 70) * 0.6 + Math.sin(x * 41 - nu / 45) * 0.4) * ritme * 0.4 * rand;
          hoogte[i] += (doel - hoogte[i]) * 0.5;
        }
      } else {
        /* Stil: een rustig hartslagje dat over het scherm loopt (bij Beweging uit staat het stil in het midden). */
        const midden = stil ? 0.5 : ((nu / 2600) % 1.3) - 0.15;
        for (let i = 0; i < PUNTEN; i++) {
          const doel = hartslag(i / (PUNTEN - 1), midden, 0.09) * 0.3;
          hoogte[i] = stil ? doel : hoogte[i] + (doel - hoogte[i]) * 0.5;
        }
      }

      ctx.clearRect(0, 0, c.width, c.height);
      ctx.beginPath();
      for (let i = 0; i < PUNTEN; i++) {
        const u = BEGIN + (EIND - BEGIN) * (i / (PUNTEN - 1));
        const [x, y] = plek(u, 0.5 - hoogte[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = "#effcff";
      /* Even dik als altijd: naar de breedte van het scherm, niet van het canvas. */
      const schermBreed = (((H.rb[0] - H.lb[0]) / V.breed) * c.width) / ((HOEK.rb[0] - HOEK.lb[0]) / VAK.breed);
      ctx.lineWidth = Math.max(1, schermBreed * 0.012);
      ctx.shadowColor = "#7ff6ff";
      ctx.shadowBlur = schermBreed * 0.03;
      ctx.stroke();
    };

    const lus = (nu: number) => {
      frame = 0;
      if (!zichtbaar || document.hidden) return;
      if (nu - laatste >= 1000 / 30) {
        laatste = nu;
        teken(nu);
      }
      /* Bij Beweging uit en stilte hoeft er niets te bewegen: niet verder tekenen. */
      const { rustig: stil } = instelling.current;
      if (stil && !bliepoGeluidKlinkt()) return;
      frame = requestAnimationFrame(lus);
    };
    const start = () => {
      if (!frame && zichtbaar && !document.hidden) frame = requestAnimationFrame(lus);
    };

    maat();
    teken(performance.now());
    const maatkijker = new ResizeObserver(() => {
      maat();
      teken(performance.now());
    });
    maatkijker.observe(c);
    const kijker = new IntersectionObserver((items) => {
      zichtbaar = items.some((i) => i.isIntersecting);
      start();
    });
    kijker.observe(c);
    document.addEventListener("visibilitychange", start);
    /* Geluid of Beweging-knop: de lus weer aanzetten als hij stillag. */
    const wakker = window.setInterval(start, 250);

    return () => {
      cancelAnimationFrame(frame);
      maatkijker.disconnect();
      kijker.disconnect();
      document.removeEventListener("visibilitychange", start);
      window.clearInterval(wakker);
    };
  }, []);

  return (
    <canvas
      ref={doek}
      className="bliepo__lijn"
      style={
        hoeken
          ? { left: 0, top: 0, width: "100%", height: "100%" }
          : { left: `${VAK.links}%`, top: `${VAK.boven}%`, width: `${VAK.breed}%`, height: `${VAK.hoog}%` }
      }
      aria-hidden="true"
    />
  );
}
