/**
 * Rekenmateriaal voor de lessen "Plussommen" naar Squla (31 oktober 2026),
 * strak in code getekend: kaartjes en platen met een getal, krijtbordjes met
 * een som, de rij van 10 (of twee rijen) met stippen voor Bliepo's uitleg, het
 * rondje met een getal en het sierplaatje bij de kale sommen. Echte dingen
 * (lekkers, de bezorgbus, pakjes, discobal) zijn vaste plaatjes uit
 * src/lib/voorwerpen (tekenVoorwerp). Maten in punten van het vlak (980 × 720).
 */

type C = CanvasRenderingContext2D;

/** De vaste plaatjes die het vlak tekent (voor `voorwerpen` in het draaiboek; hier en niet in het vlak, want dat is een client-bestand). */
export const VOORWERPEN_DISCO = ["discobal", "luidspreker", "draaitafel"] as const;
export const VOORWERPEN_BUS = ["bezorgbus", "pakje"] as const;

function rondeRechthoek(c: C, x: number, y: number, b: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, b, h, r);
}

export const KLEUREN_DISCO = ["#ff6fae", "#7c8cff", "#3fd0c8", "#ffb347", "#b67cff", "#69d26a"];

/** Een kaartje met één of twee rondjes voor de getallen (b × h). */
export function tekenKaartje(c: C, b: number, h: number, kleur: string, rondjes: number) {
  c.lineWidth = 4;
  c.strokeStyle = "#1b1f33";
  c.fillStyle = kleur;
  rondeRechthoek(c, 4, 4, b - 8, h - 8, 18);
  c.fill();
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.22)";
  rondeRechthoek(c, 10, 10, b - 20, (h - 20) / 2, 12);
  c.fill();
  c.fillStyle = "#ffffff";
  const r = Math.min(h / 2 - 16, rondjes === 2 ? b / 4 - 10 : b / 2 - 16);
  const xs = rondjes === 2 ? [b / 4 + 4, (3 * b) / 4 - 4] : [b / 2];
  for (const x of xs) {
    c.beginPath();
    c.arc(x, h / 2, r, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }
}

/** Een grammofoonplaat met een gekleurd midden voor het getal (d × d). */
export function tekenPlaat(c: C, d: number, kleur: string) {
  const m = d / 2;
  c.fillStyle = "#1b1f33";
  c.beginPath();
  c.arc(m, m, m - 3, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(255,255,255,0.18)";
  c.lineWidth = 1.5;
  for (let r = m - 12; r > m * 0.5; r -= 7) {
    c.beginPath();
    c.arc(m, m, r, 0, Math.PI * 2);
    c.stroke();
  }
  c.fillStyle = kleur;
  c.beginPath();
  c.arc(m, m, m * 0.46, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#ffffff";
  c.lineWidth = 3;
  c.stroke();
}

/** Een lichtbundel van een spot (60 × 300), van fel bovenaan naar niets. */
export function tekenBundel(c: C, kleur: string) {
  const g = c.createLinearGradient(0, 0, 0, 300);
  g.addColorStop(0, kleur);
  g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g;
  c.globalAlpha = 0.5;
  c.beginPath();
  c.moveTo(24, 0);
  c.lineTo(36, 0);
  c.lineTo(60, 300);
  c.lineTo(0, 300);
  c.closePath();
  c.fill();
  c.globalAlpha = 1;
}

/** Een kaartje met een som (b × h), zoals een krijtbordje. */
export function tekenSomkaart(c: C, b: number, h: number, nacht: boolean) {
  c.lineWidth = 4;
  c.strokeStyle = nacht ? "#c9b6ff" : "#5b3a1e";
  c.fillStyle = nacht ? "rgba(30,24,70,0.92)" : "#2f5d50";
  rondeRechthoek(c, 4, 4, b - 8, h - 8, 16);
  c.fill();
  c.stroke();
  if (!nacht) {
    c.strokeStyle = "#c98b4e";
    c.lineWidth = 6;
    rondeRechthoek(c, 9, 9, b - 18, h - 18, 12);
    c.stroke();
  }
}

/** Een donkerblauw rondje (voor het getal van de instappers, 130 × 130), met een rand in de kleur van dat getal. */
export function tekenRondje(c: C, rand = "#ffffff") {
  c.fillStyle = "#1f3f8f";
  c.strokeStyle = rand;
  c.lineWidth = 5;
  c.beginPath();
  c.arc(65, 65, 60, 0, Math.PI * 2);
  c.fill();
  c.stroke();
}

/* ---------- rek (de uitleg van Bliepo) ---------- */

export const REK = { vak: 58, gat5: 22, rijGat: 70 };

/** Het paneel van het rek (rijen van 10 vakjes). */
export function rekMaat(rijen: number) {
  return { b: 10 * REK.vak + REK.gat5 + 40, h: rijen * REK.rijGat + 30 };
}

export function tekenRek(c: C, rijen: number, nacht: boolean) {
  const { b, h } = rekMaat(rijen);
  c.fillStyle = nacht ? "rgba(20,16,50,0.9)" : "rgba(255,255,255,0.94)";
  c.strokeStyle = nacht ? "#c9b6ff" : "#5d6a86";
  c.lineWidth = 4;
  rondeRechthoek(c, 3, 3, b - 6, h - 6, 20);
  c.fill();
  c.stroke();
  c.lineWidth = 2.5;
  for (let r = 0; r < rijen; r++)
    for (let i = 0; i < 10; i++) {
      const { x, y } = rekVakje(r * 10 + i, rijen);
      c.strokeStyle = nacht ? "rgba(201,182,255,0.7)" : "#9db4c8";
      c.beginPath();
      c.arc(x + b / 2, y + h / 2, REK.vak / 2 - 6, 0, Math.PI * 2);
      c.stroke();
    }
}

/** Het midden van vakje k (0–19) ten opzichte van het midden van het rek. */
export function rekVakje(k: number, rijen: number) {
  const r = Math.floor(k / 10);
  const i = k % 10;
  const x = -(10 * REK.vak + REK.gat5) / 2 + i * REK.vak + (i >= 5 ? REK.gat5 : 0) + REK.vak / 2;
  const y = (r - (rijen - 1) / 2) * REK.rijGat;
  return { x, y };
}

export function tekenStip(c: C, kleur: string) {
  c.fillStyle = kleur;
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 2;
  c.beginPath();
  c.arc(25, 25, 21, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.45)";
  c.beginPath();
  c.arc(18, 17, 6, 0, Math.PI * 2);
  c.fill();
}

/* ---------- kale sommen (sierplaatje) ---------- */

export function tekenPlus(c: C, kleur: string) {
  c.fillStyle = kleur;
  c.strokeStyle = "#ffffff";
  c.lineWidth = 5;
  rondeRechthoek(c, 70, 10, 60, 180, 22);
  c.fill();
  c.stroke();
  rondeRechthoek(c, 10, 70, 180, 60, 22);
  c.fill();
  c.stroke();
  c.fillStyle = kleur;
  c.fillRect(73, 73, 54, 54);
}

export function tekenCijfer(c: C, cijfer: string, kleur: string) {
  c.font = "bold 64px Fredoka, 'Work Sans', system-ui, sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.lineWidth = 6;
  c.strokeStyle = "rgba(255,255,255,0.9)";
  c.strokeText(cijfer, 40, 44);
  c.fillStyle = kleur;
  c.fillText(cijfer, 40, 44);
}

/** "#rrggbb" → 0xrrggbb */
export function hex(k: string) {
  return parseInt(k.slice(1), 16);
}
