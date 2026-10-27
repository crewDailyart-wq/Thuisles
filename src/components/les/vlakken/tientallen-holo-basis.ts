/**
 * Gedeelde hologram-plaatjes voor de Universum-lessen van Tientallen en
 * Optellen tot 100 (27 oktober 2026, LESSENPLAN.md § 1b: sterren, een
 * sterrenbeeld van 10 dat samenklontert tot één lichtbol, kristallen vakken).
 *
 * Eén soort voorwerp: sterren. Tien sterren worden samen één lichtbol (een
 * tiental); tien lichtbollen samen één grote lichtbol (honderd). Alle gloed
 * gaat via `bak()` uit holo/basis.ts (centrale sterkte); niets wordt per
 * beeld opnieuw uitgerekend (HARDE REGEL 7).
 */

import { TEGELKLEUR } from "../tegels";
import { WERELDKLEUR, type Holo } from "../holo/basis";

export const PAARS = WERELDKLEUR.universum;

/** Een vijfpuntige ster als pad. */
export function sterPad(c: CanvasRenderingContext2D, cx: number, cy: number, r: number, binnen = 0.46) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const hoek = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * binnen;
    const x = cx + rr * Math.cos(hoek);
    const y = cy + rr * Math.sin(hoek);
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.closePath();
}

/** Een gevulde ster met een licht verloop (wit hart, warme of eigen kleur aan de rand). */
export function tekenSter(c: CanvasRenderingContext2D, cx: number, cy: number, r: number, kleur = "#ffd76e") {
  const g = c.createRadialGradient(cx - r * 0.15, cy - r * 0.2, r * 0.05, cx, cy, r);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.45, kleur === "#ffd76e" ? "#fff3c0" : mengWit(kleur, 0.55));
  g.addColorStop(1, kleur);
  sterPad(c, cx, cy, r);
  c.fillStyle = g;
  c.fill();
  c.lineJoin = "round";
  c.lineWidth = Math.max(1.2, r * 0.06);
  c.strokeStyle = "rgba(255,255,255,0.85)";
  c.stroke();
}

/** Een kleur een beetje lichter (naar wit). */
export function mengWit(hex: string, deel: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const m = (x: number) => Math.round(x + (255 - x) * deel);
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}

export const hexNaarGetal = (hex: string) => parseInt(hex.slice(1), 16);

/** Tien plekjes in een lichtbol: twee rijen van vijf (zoals een tienveld), zodat je de tien goed ziet. */
export function bolPlekken(r: number): { x: number; y: number }[] {
  const stap = r * 0.36;
  return Array.from({ length: 10 }, (_, i) => ({ x: (i % 5 - 2) * stap, y: (i < 5 ? -1 : 1) * stap * 0.62 }));
}

/** De maten van de plaatjes (punten van het vlak). */
export const MAAT = {
  ster: 46,
  bol: 104,
  groot: 250,
};

/**
 * Maakt de gedeelde plaatjes één keer: `ster`, `bol` (lichtbol met tien
 * sterren), `bol100` (grote lichtbol met tien kleine lichtbollen), `plek`
 * (een leeg plekje), en voor 1 t/m 9 een ster in de kleur van dat getal
 * (`ster-k<n>`). Allemaal met een gebakken gloed (`…-g`).
 */
export function maakSterPlaatjes(sc: Holo) {
  const s = MAAT.ster;
  sc.canvasPlaatje("ster", s, s, (c) => tekenSter(c, s / 2, s / 2 + 1, s / 2 - 2));
  sc.bak("ster", "ster-g", PAARS);
  for (let n = 1; n <= 9; n++) {
    const k = TEGELKLEUR[n];
    sc.canvasPlaatje(`ster-k${n}`, s, s, (c) => tekenSter(c, s / 2, s / 2 + 1, s / 2 - 2, k));
    sc.bak(`ster-k${n}`, `ster-k${n}-g`, hexNaarGetal(k));
  }
  /* Een leeg plekje in een sterrenbeeld: een gestippelde ster. */
  sc.canvasPlaatje("plek", s, s, (c) => {
    sterPad(c, s / 2, s / 2 + 1, s / 2 - 4);
    c.fillStyle = "rgba(30,20,90,0.35)";
    c.fill();
    c.setLineDash([4, 3]);
    c.lineWidth = 2;
    c.strokeStyle = "rgba(220,210,255,0.85)";
    c.stroke();
  });

  /* De lichtbol: een doorzichtige bol met een dunne rand en tien sterretjes. */
  const b = MAAT.bol;
  sc.canvasPlaatje("bol", b, b, (c) => {
    const r = b / 2 - 3;
    const g = c.createRadialGradient(b / 2 - r * 0.3, b / 2 - r * 0.35, r * 0.1, b / 2, b / 2, r);
    g.addColorStop(0, "rgba(150,130,255,0.55)");
    g.addColorStop(0.7, "rgba(70,50,190,0.55)");
    g.addColorStop(1, "rgba(120,100,240,0.75)");
    c.fillStyle = g;
    c.beginPath();
    c.arc(b / 2, b / 2, r, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 2.5;
    c.strokeStyle = "rgba(225,215,255,0.95)";
    c.stroke();
    for (const p of bolPlekken(r)) tekenSter(c, b / 2 + p.x, b / 2 + p.y, r * 0.17);
  });
  sc.bak("bol", "bol-g", PAARS);

  /* De grote lichtbol van honderd: tien kleine lichtbollen erin (3, 4, 3). */
  const G = MAAT.groot;
  sc.canvasPlaatje("bol100", G, G, (c) => {
    const r = G / 2 - 4;
    const g = c.createRadialGradient(G / 2 - r * 0.3, G / 2 - r * 0.35, r * 0.1, G / 2, G / 2, r);
    g.addColorStop(0, "rgba(255,200,140,0.45)");
    g.addColorStop(0.75, "rgba(150,70,170,0.5)");
    g.addColorStop(1, "rgba(255,190,120,0.7)");
    c.fillStyle = g;
    c.beginPath();
    c.arc(G / 2, G / 2, r, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 3;
    c.strokeStyle = "rgba(255,225,180,0.95)";
    c.stroke();
    const rk = r * 0.2;
    const rijen = [3, 4, 3];
    rijen.forEach((aantal, ri) => {
      for (let i = 0; i < aantal; i++) {
        const x = G / 2 + (i - (aantal - 1) / 2) * rk * 2.15;
        const y = G / 2 + (ri - 1) * rk * 2.05;
        c.fillStyle = "rgba(90,70,210,0.75)";
        c.beginPath();
        c.arc(x, y, rk, 0, Math.PI * 2);
        c.fill();
        c.lineWidth = 1.5;
        c.strokeStyle = "rgba(230,220,255,0.9)";
        c.stroke();
        for (const p of bolPlekken(rk)) tekenSter(c, x + p.x, y + p.y, rk * 0.15);
      }
    });
  });
  sc.bak("bol100", "bol100-g", 0xffc98a);
}

/** Vaste, losse plekken in een gebied met een minimale afstand (altijd dezelfde, zodat niets verspringt). */
export function lossePlekken(aantal: number, gebied: { x: number; y: number; b: number; h: number }, afstand: number, zaadBegin: number) {
  let zaad = zaadBegin;
  const kans = () => {
    zaad = (zaad * 16807) % 2147483647;
    return zaad / 2147483647;
  };
  const uit: { x: number; y: number }[] = [];
  for (let poging = 0; uit.length < aantal && poging < 40000; poging++) {
    const p = { x: gebied.x + kans() * gebied.b, y: gebied.y + kans() * gebied.h };
    const min = poging < 20000 ? afstand : afstand * 0.85;
    if (uit.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= min)) uit.push(p);
  }
  while (uit.length < aantal) uit.push({ x: gebied.x + (uit.length % 4) * afstand, y: gebied.y + Math.floor(uit.length / 4) * afstand });
  return uit;
}

/**
 * Voor de automatische test (zoals `window.__phaser.antwoord` bij de
 * flitskaarten): wat er nu gevraagd wordt. Verandert niets aan de les.
 */
export function testHaak(o: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __les?: Record<string, unknown> };
  w.__les = { ...w.__les, ...o };
}
