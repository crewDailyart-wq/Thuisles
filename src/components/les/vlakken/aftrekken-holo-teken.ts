/**
 * Gedeelde tekeningen voor de Aftrekken-hologrammen (27 oktober 2026,
 * wereld Aarde, LESSENPLAN.md § 2.4): het vuurvliegje, het lantaarntje en
 * de knop-iconen. Alles wordt één keer getekend (canvasPlaatje) en de gloed
 * één keer gebakken (bak, met de centrale sterkte); nooit een gloed die elk
 * beeld opnieuw wordt uitgerekend (HARDE REGEL 7).
 */

import type { Holo } from "../holo/basis";

/** De kleur van het licht van een vuurvliegje (warm geelgroen). */
export const VUURVLIEG = 0xf6ff9a;
/** De warme kleur van de Aarde-hologrammen. */
export const AARDE = 0xffd36e;

/**
 * Een vuurvliegje: twee doorschijnende vleugeltjes en een helder lichtje als
 * achterlijf. Het lichtje is wat je telt, dus groot en egaal.
 * Plaatje "vlieg" (60 × 54), met gloed "vlieg-gloed".
 */
export function maakVuurvliegje(sc: Holo) {
  sc.canvasPlaatje("vlieg", 60, 54, (c) => {
    /* vleugels */
    c.fillStyle = "rgba(220,245,255,0.42)";
    c.strokeStyle = "rgba(235,250,255,0.75)";
    c.lineWidth = 1.5;
    for (const k of [-1, 1]) {
      c.beginPath();
      c.ellipse(30 + k * 13, 15, 13, 8, k * -0.55, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    }
    /* kopje en lijfje */
    c.fillStyle = "#3b3a2a";
    c.beginPath();
    c.ellipse(30, 19, 6, 8, 0, 0, Math.PI * 2);
    c.fill();
    /* het lichtje */
    const g = c.createRadialGradient(28, 31, 2, 30, 35, 17);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.45, "#fbffc8");
    g.addColorStop(1, "#d8ee4a");
    c.fillStyle = g;
    c.beginPath();
    c.arc(30, 35, 15, 0, Math.PI * 2);
    c.fill();
  });
  sc.bak("vlieg", "vlieg-gloed", VUURVLIEG);
}

/**
 * Een lantaarntje (een kapje, een glazen huisje en een voetje). `aan`: het
 * huisje brandt warm; uit: alleen een lichte rand.
 * Plaatjes "lantaarn-aan" en "lantaarn-uit" (44 × 60), met gloed.
 */
export function maakLantaarntje(sc: Holo) {
  for (const aan of [true, false]) {
    const sl = aan ? "lantaarn-aan" : "lantaarn-uit";
    sc.canvasPlaatje(sl, 44, 60, (c) => {
      const rand = aan ? "rgba(255,222,150,1)" : "rgba(255,226,170,0.55)";
      c.strokeStyle = rand;
      c.lineWidth = 2.5;
      c.lineJoin = "round";
      /* hengsel */
      c.beginPath();
      c.arc(22, 8, 5, Math.PI, 0);
      c.stroke();
      /* kapje */
      c.fillStyle = aan ? "rgba(255,211,110,0.55)" : "rgba(255,211,110,0.12)";
      c.beginPath();
      c.moveTo(10, 18);
      c.lineTo(22, 9);
      c.lineTo(34, 18);
      c.closePath();
      c.fill();
      c.stroke();
      /* het huisje */
      c.beginPath();
      c.roundRect(11, 19, 22, 28, 5);
      if (aan) {
        const g = c.createRadialGradient(22, 33, 1, 22, 33, 15);
        g.addColorStop(0, "#fffbe6");
        g.addColorStop(0.5, "#ffe08a");
        g.addColorStop(1, "rgba(255,190,80,0.85)");
        c.fillStyle = g;
      } else {
        c.fillStyle = "rgba(255,211,110,0.08)";
      }
      c.fill();
      c.stroke();
      /* voetje */
      c.beginPath();
      c.moveTo(9, 50);
      c.lineTo(35, 50);
      c.stroke();
    });
    if (aan) sc.bak(sl, `${sl}-gloed`, AARDE);
  }
}
