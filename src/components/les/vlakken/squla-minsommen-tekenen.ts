/**
 * Tekeningen voor de lessen "Minsommen" naar Squla groep 3 (30 oktober 2026,
 * opdracht eigenaar). Alles zelf getekend in code (geen plaatjes van Squla,
 * geen AI-plaatjes). Het geld komt NIET hier vandaan: dat zijn de officiële
 * plaatjes uit public/geld/ (zie BRON.md daar).
 *
 * Elke functie tekent op een canvas van een vaste maat (in punten); de scène
 * bakt er één keer een zachte gloed omheen (holo/basis.ts → bak).
 *
 *   - de zee (hologramstijl): visje, kwal, krab, zeepaardje, schildpad,
 *     zeester, dolfijn, en de walvis en de inktvis die er "een paar opeten";
 *   - de bus (platte 2D-stijl): een gele dubbeldekker, kinderhoofdjes achter
 *     de ramen, kinderen die buiten staan, een pijl van de deur naar buiten;
 *   - de machine, het schoolbord, bekers en bordjes, speelgoed en een
 *     portemonnee (platte 2D-stijl);
 *   - stippen (voor de uitleg van Bliepo) en bubbels.
 */

export type Dier = "visje" | "kwal" | "krab" | "zeepaardje" | "schildpad" | "zeester" | "dolfijn";
export type Eter = "walvis" | "inktvis";
export type Speelgoed = "ijsje" | "bal" | "boek" | "ballon" | "vlieger";
export type Bakje = "beker" | "bordje";

/** Kleurnamen zoals in de zinnen van Bliepo ({6:geel}). */
export type Kleurnaam = "rood" | "oranje" | "geel" | "groen" | "blauw" | "paars" | "roze" | "wit";

export const DIER: Record<Dier, { vul: string; donker: string; licht: string; kleur: Kleurnaam; een: string; veel: string }> = {
  visje: { vul: "#ffd34d", donker: "#e08a1e", licht: "#fff2b0", kleur: "geel", een: "visje", veel: "visjes" },
  kwal: { vul: "#ff9fd2", donker: "#d9579c", licht: "#ffe0f1", kleur: "roze", een: "kwal", veel: "kwallen" },
  krab: { vul: "#ff7b6b", donker: "#c23b2e", licht: "#ffc4bb", kleur: "rood", een: "krab", veel: "krabben" },
  zeepaardje: { vul: "#c9a2ff", donker: "#8152d6", licht: "#ece0ff", kleur: "paars", een: "zeepaardje", veel: "zeepaardjes" },
  schildpad: { vul: "#7ee0a0", donker: "#2f9e5b", licht: "#d4f7e0", kleur: "groen", een: "schildpad", veel: "schildpadden" },
  zeester: { vul: "#ffad5c", donker: "#d9701e", licht: "#ffe0bf", kleur: "oranje", een: "zeester", veel: "zeesterren" },
  dolfijn: { vul: "#8fc4ff", donker: "#3f7fd1", licht: "#dceeff", kleur: "blauw", een: "dolfijn", veel: "dolfijnen" },
};

export const hexGetal = (h: string) => parseInt(h.slice(1), 16);

/** Maat van één dier (vierkant). */
export const DIERMAAT = 100;
export const ETERMAAT: Record<Eter, { b: number; h: number }> = { walvis: { b: 250, h: 170 }, inktvis: { b: 190, h: 190 } };

type C = CanvasRenderingContext2D;

function oog(c: C, x: number, y: number, r = 6) {
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#1d2440";
  c.beginPath();
  c.arc(x - r * 0.15, y + r * 0.1, r * 0.55, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(x - r * 0.35, y - r * 0.25, r * 0.2, 0, Math.PI * 2);
  c.fill();
}

function lijn(c: C, kleur: string, breed: number) {
  c.strokeStyle = kleur;
  c.lineWidth = breed;
  c.lineJoin = "round";
  c.lineCap = "round";
}

/* ======================= de zee ======================= */

export function tekenDier(c: C, d: Dier) {
  const k = DIER[d];
  c.save();
  if (d === "visje") {
    /* staart */
    c.fillStyle = k.donker;
    c.beginPath();
    c.moveTo(68, 50);
    c.lineTo(92, 30);
    c.quadraticCurveTo(84, 50, 92, 70);
    c.closePath();
    c.fill();
    /* vin boven */
    c.beginPath();
    c.moveTo(34, 32);
    c.quadraticCurveTo(48, 14, 62, 32);
    c.fill();
    /* lijf */
    c.fillStyle = k.vul;
    c.beginPath();
    c.ellipse(44, 50, 32, 22, 0, 0, Math.PI * 2);
    c.fill();
    lijn(c, k.donker, 3);
    c.stroke();
    /* streepjes */
    lijn(c, k.donker, 3);
    for (const x of [48, 58]) {
      c.beginPath();
      c.moveTo(x, 34);
      c.quadraticCurveTo(x + 5, 50, x, 66);
      c.stroke();
    }
    c.fillStyle = k.licht;
    c.beginPath();
    c.ellipse(36, 58, 14, 6, 0, 0, Math.PI * 2);
    c.fill();
    oog(c, 26, 45, 7);
    lijn(c, "#1d2440", 2.5);
    c.beginPath();
    c.arc(20, 56, 5, 0.1, Math.PI * 0.6);
    c.stroke();
  } else if (d === "kwal") {
    /* tentakels */
    lijn(c, k.donker, 5);
    for (const x of [32, 44, 56, 68]) {
      c.beginPath();
      c.moveTo(x, 52);
      c.bezierCurveTo(x - 8, 64, x + 8, 76, x - 2, 92);
      c.stroke();
    }
    /* hoed */
    c.fillStyle = k.vul;
    c.beginPath();
    c.moveTo(16, 54);
    c.bezierCurveTo(14, 18, 86, 18, 84, 54);
    for (let i = 0; i < 5; i++) {
      const x0 = 84 - i * 13.6;
      c.quadraticCurveTo(x0 - 6.8, 62, x0 - 13.6, 54);
    }
    c.closePath();
    c.fill();
    lijn(c, k.donker, 3);
    c.stroke();
    c.fillStyle = k.licht;
    c.beginPath();
    c.ellipse(36, 32, 10, 6, -0.5, 0, Math.PI * 2);
    c.fill();
    oog(c, 41, 42, 5.5);
    oog(c, 59, 42, 5.5);
    lijn(c, "#1d2440", 2.5);
    c.beginPath();
    c.arc(50, 46, 5, 0.2, Math.PI - 0.2);
    c.stroke();
  } else if (d === "krab") {
    /* pootjes */
    lijn(c, k.donker, 5);
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.moveTo(50 + s * 22, 62 + i * 6);
        c.lineTo(50 + s * 40, 70 + i * 9);
        c.lineTo(50 + s * 44, 82 + i * 6);
        c.stroke();
      }
      /* armen */
      c.beginPath();
      c.moveTo(50 + s * 24, 54);
      c.quadraticCurveTo(50 + s * 38, 44, 50 + s * 34, 30);
      c.stroke();
    }
    /* scharen */
    c.fillStyle = k.vul;
    for (const s of [-1, 1]) {
      c.beginPath();
      c.arc(50 + s * 34, 24, 13, 0, Math.PI * 2);
      c.fill();
      lijn(c, k.donker, 3);
      c.stroke();
      c.fillStyle = "rgba(0,0,0,0)";
      c.strokeStyle = k.donker;
      c.beginPath();
      c.moveTo(50 + s * 34, 24);
      c.lineTo(50 + s * 34, 11);
      c.stroke();
      c.fillStyle = k.vul;
    }
    /* steeltjes en ogen */
    lijn(c, k.donker, 4);
    for (const x of [42, 58]) {
      c.beginPath();
      c.moveTo(x, 50);
      c.lineTo(x, 38);
      c.stroke();
    }
    /* lijf */
    c.fillStyle = k.vul;
    c.beginPath();
    c.ellipse(50, 62, 28, 18, 0, 0, Math.PI * 2);
    c.fill();
    lijn(c, k.donker, 3);
    c.stroke();
    c.fillStyle = k.licht;
    c.beginPath();
    c.ellipse(42, 56, 9, 4, -0.3, 0, Math.PI * 2);
    c.fill();
    oog(c, 42, 36, 5.5);
    oog(c, 58, 36, 5.5);
    lijn(c, "#1d2440", 2.5);
    c.beginPath();
    c.arc(50, 64, 6, 0.2, Math.PI - 0.2);
    c.stroke();
  } else if (d === "zeepaardje") {
    /* rugvin */
    c.fillStyle = k.licht;
    c.beginPath();
    c.moveTo(66, 40);
    c.quadraticCurveTo(84, 46, 68, 62);
    c.closePath();
    c.fill();
    /* lijf en staart als dikke lijn */
    lijn(c, k.vul, 22);
    c.beginPath();
    c.moveTo(52, 26);
    c.quadraticCurveTo(72, 44, 56, 64);
    c.stroke();
    lijn(c, k.vul, 11);
    c.beginPath();
    c.moveTo(56, 64);
    c.quadraticCurveTo(44, 82, 56, 88);
    c.quadraticCurveTo(66, 90, 62, 80);
    c.stroke();
    /* buikstreepjes */
    lijn(c, k.donker, 2.5);
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(50 + i * 1.5, 36 + i * 7);
      c.lineTo(58 + i * 1.5, 34 + i * 7);
      c.stroke();
    }
    /* hoofd en snuit */
    c.fillStyle = k.vul;
    c.beginPath();
    c.ellipse(50, 22, 15, 12, -0.3, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.roundRect(22, 22, 26, 9, 4);
    c.fill();
    lijn(c, k.donker, 2.5);
    c.beginPath();
    c.ellipse(50, 22, 15, 12, -0.3, 0, Math.PI * 2);
    c.stroke();
    /* kroontje */
    c.fillStyle = k.donker;
    c.beginPath();
    c.moveTo(52, 10);
    c.lineTo(56, 2);
    c.lineTo(60, 12);
    c.closePath();
    c.fill();
    oog(c, 50, 20, 5.5);
  } else if (d === "schildpad") {
    /* poten */
    c.fillStyle = k.vul;
    for (const [x, y, r] of [
      [26, 30, -0.6],
      [74, 30, 0.6],
      [28, 74, 0.6],
      [72, 74, -0.6],
    ] as const) {
      c.beginPath();
      c.ellipse(x, y, 14, 8, r, 0, Math.PI * 2);
      c.fill();
    }
    /* kop */
    c.beginPath();
    c.ellipse(50, 16, 12, 11, 0, 0, Math.PI * 2);
    c.fill();
    lijn(c, k.donker, 2.5);
    c.stroke();
    oog(c, 45, 14, 4);
    oog(c, 55, 14, 4);
    /* schild */
    c.fillStyle = k.donker;
    c.beginPath();
    c.ellipse(50, 54, 30, 33, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = k.vul;
    c.beginPath();
    c.ellipse(50, 54, 24, 27, 0, 0, Math.PI * 2);
    c.fill();
    lijn(c, k.donker, 3);
    c.beginPath();
    c.moveTo(50, 44);
    for (let i = 0; i < 6; i++) {
      const h = (i * Math.PI) / 3 - Math.PI / 2;
      c.lineTo(50 + 11 * Math.cos(h), 56 + 11 * Math.sin(h));
    }
    c.closePath();
    c.stroke();
    for (let i = 0; i < 6; i++) {
      const h = (i * Math.PI) / 3 - Math.PI / 2;
      c.beginPath();
      c.moveTo(50 + 11 * Math.cos(h), 56 + 11 * Math.sin(h));
      c.lineTo(50 + 24 * Math.cos(h), 54 + 27 * Math.sin(h));
      c.stroke();
    }
  } else if (d === "zeester") {
    c.fillStyle = k.vul;
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 18 : 42;
      const h = -Math.PI / 2 + (i * Math.PI) / 5;
      const x = 50 + r * Math.cos(h);
      const y = 54 + r * Math.sin(h);
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.closePath();
    lijn(c, k.vul, 10);
    c.stroke();
    c.fill();
    lijn(c, k.donker, 3);
    c.stroke();
    c.fillStyle = k.licht;
    for (let i = 0; i < 5; i++) {
      const h = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      c.beginPath();
      c.arc(50 + 26 * Math.cos(h), 54 + 26 * Math.sin(h), 3.5, 0, Math.PI * 2);
      c.fill();
    }
    oog(c, 43, 50, 5);
    oog(c, 57, 50, 5);
    lijn(c, "#1d2440", 2.5);
    c.beginPath();
    c.arc(50, 58, 5, 0.2, Math.PI - 0.2);
    c.stroke();
  } else {
    /* dolfijn, kijkt naar links */
    c.fillStyle = k.vul;
    c.beginPath();
    c.moveTo(8, 56);
    c.quadraticCurveTo(16, 44, 32, 42);
    c.quadraticCurveTo(58, 32, 78, 46);
    c.lineTo(94, 34);
    c.lineTo(88, 54);
    c.lineTo(96, 70);
    c.lineTo(78, 58);
    c.quadraticCurveTo(54, 72, 30, 64);
    c.quadraticCurveTo(16, 62, 8, 58);
    c.closePath();
    c.fill();
    lijn(c, k.donker, 3);
    c.stroke();
    /* rugvin */
    c.fillStyle = k.donker;
    c.beginPath();
    c.moveTo(46, 38);
    c.quadraticCurveTo(54, 22, 62, 20);
    c.quadraticCurveTo(58, 30, 62, 38);
    c.closePath();
    c.fill();
    /* buik */
    c.fillStyle = k.licht;
    c.beginPath();
    c.moveTo(20, 60);
    c.quadraticCurveTo(44, 70, 66, 62);
    c.quadraticCurveTo(44, 64, 20, 60);
    c.fill();
    /* zijvin */
    c.fillStyle = k.donker;
    c.beginPath();
    c.moveTo(42, 60);
    c.lineTo(50, 74);
    c.lineTo(54, 60);
    c.closePath();
    c.fill();
    oog(c, 30, 49, 5);
    lijn(c, "#1d2440", 2.5);
    c.beginPath();
    c.moveTo(10, 57);
    c.quadraticCurveTo(18, 60, 24, 58);
    c.stroke();
  }
  c.restore();
}

export function tekenEter(c: C, e: Eter) {
  c.save();
  if (e === "walvis") {
    const vul = "#6fa8ff";
    const donker = "#2d5fb3";
    /* fontein */
    lijn(c, "#bfe9ff", 5);
    for (const [dx, dy] of [
      [-16, -10],
      [0, -18],
      [16, -10],
    ]) {
      c.beginPath();
      c.moveTo(92, 40);
      c.quadraticCurveTo(92 + dx * 0.4, 20, 92 + dx, 18 + dy);
      c.stroke();
    }
    /* staart */
    c.fillStyle = vul;
    c.beginPath();
    c.moveTo(200, 104);
    c.quadraticCurveTo(214, 70, 232, 52);
    c.quadraticCurveTo(236, 72, 222, 84);
    c.quadraticCurveTo(244, 86, 248, 100);
    c.quadraticCurveTo(226, 108, 206, 124);
    c.closePath();
    c.fill();
    lijn(c, donker, 3);
    c.stroke();
    /* lijf */
    c.fillStyle = vul;
    c.beginPath();
    c.moveTo(14, 110);
    c.bezierCurveTo(10, 50, 120, 30, 170, 70);
    c.bezierCurveTo(200, 92, 214, 116, 206, 126);
    c.bezierCurveTo(170, 150, 40, 160, 14, 110);
    c.closePath();
    c.fill();
    lijn(c, donker, 3.5);
    c.stroke();
    /* buik */
    c.fillStyle = "#dceeff";
    c.beginPath();
    c.moveTo(24, 122);
    c.bezierCurveTo(60, 150, 150, 144, 186, 126);
    c.bezierCurveTo(140, 132, 70, 134, 24, 122);
    c.fill();
    lijn(c, "#9cc4f2", 2.5);
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(56 + i * 26, 132);
      c.lineTo(62 + i * 26, 140);
      c.stroke();
    }
    oog(c, 52, 92, 8);
    lijn(c, "#1d2440", 3);
    c.beginPath();
    c.moveTo(18, 112);
    c.quadraticCurveTo(46, 122, 74, 112);
    c.stroke();
    c.fillStyle = donker;
    c.beginPath();
    c.ellipse(110, 112, 16, 8, 0.5, 0, Math.PI * 2);
    c.fill();
  } else {
    const vul = "#ff8fb6";
    const donker = "#c4467a";
    /* armen */
    lijn(c, vul, 14);
    for (let i = 0; i < 6; i++) {
      const x = 42 + i * 21;
      const s = i % 2 ? 1 : -1;
      c.beginPath();
      c.moveTo(95 + (x - 95) * 0.4, 100);
      c.bezierCurveTo(x, 130, x + s * 22, 150, x + s * 8, 172);
      c.stroke();
    }
    lijn(c, "#ffd0e2", 3);
    for (let i = 0; i < 6; i++) {
      const x = 42 + i * 21;
      const s = i % 2 ? 1 : -1;
      for (let j = 1; j < 4; j++) {
        const t = j / 4;
        const px = (1 - t) ** 3 * (95 + (x - 95) * 0.4) + 3 * (1 - t) ** 2 * t * x + 3 * (1 - t) * t * t * (x + s * 22) + t ** 3 * (x + s * 8);
        const py = (1 - t) ** 3 * 100 + 3 * (1 - t) ** 2 * t * 130 + 3 * (1 - t) * t * t * 150 + t ** 3 * 172;
        c.beginPath();
        c.arc(px, py, 2, 0, Math.PI * 2);
        c.stroke();
      }
    }
    /* kop */
    c.fillStyle = vul;
    c.beginPath();
    c.ellipse(95, 66, 54, 52, 0, 0, Math.PI * 2);
    c.fill();
    lijn(c, donker, 3.5);
    c.stroke();
    c.fillStyle = "#ffd0e2";
    c.beginPath();
    c.ellipse(74, 40, 16, 9, -0.5, 0, Math.PI * 2);
    c.fill();
    oog(c, 76, 74, 10);
    oog(c, 114, 74, 10);
    lijn(c, "#1d2440", 3);
    c.beginPath();
    c.arc(95, 92, 9, 0.2, Math.PI - 0.2);
    c.stroke();
  }
  c.restore();
}

/** Een bubbel (doorzichtig, met een glimmertje). */
export function tekenBubbel(c: C, d: number) {
  const r = d / 2 - 4;
  const g = c.createRadialGradient(d * 0.4, d * 0.36, r * 0.1, d / 2, d / 2, r);
  g.addColorStop(0, "rgba(220,250,255,0.28)");
  g.addColorStop(0.75, "rgba(127,233,255,0.12)");
  g.addColorStop(1, "rgba(190,245,255,0.5)");
  c.fillStyle = g;
  c.beginPath();
  c.arc(d / 2, d / 2, r, 0, Math.PI * 2);
  c.fill();
  lijn(c, "rgba(200,248,255,0.95)", 3);
  c.stroke();
  lijn(c, "rgba(255,255,255,0.9)", 5);
  c.beginPath();
  c.arc(d / 2, d / 2, r * 0.74, Math.PI * 1.08, Math.PI * 1.36);
  c.stroke();
}

/** Een hologramkaartje (verbinden). */
export function tekenKaart(c: C, b: number, h: number) {
  c.beginPath();
  c.roundRect(3, 3, b - 6, h - 6, 18);
  c.fillStyle = "rgba(14,52,120,0.55)";
  c.fill();
  lijn(c, "rgba(170,240,255,0.95)", 3);
  c.stroke();
}

/** Een stip voor de uitleg van Bliepo (rond, warm geel). */
export function tekenStip(c: C, d: number) {
  const g = c.createRadialGradient(d * 0.38, d * 0.35, 1, d / 2, d / 2, d / 2 - 2);
  g.addColorStop(0, "#fff6c4");
  g.addColorStop(1, "#ffc93d");
  c.fillStyle = g;
  c.beginPath();
  c.arc(d / 2, d / 2, d / 2 - 3, 0, Math.PI * 2);
  c.fill();
  lijn(c, "#e8962a", 2.5);
  c.stroke();
}

/* ======================= de bus (platte 2D) ======================= */

export const BUS = {
  b: 720,
  h: 360,
  /** Raampjes: per verdieping 10 (5 + 5); x-midden en y-midden in het busplaatje. */
  ramen: (() => {
    const xs: number[] = [];
    const breed = 46;
    let x = 44 + breed / 2;
    for (let i = 0; i < 10; i++) {
      xs.push(x);
      x += breed + 8 + (i === 4 ? 18 : 0);
    }
    return { xs, boven: 96, onder: 246, b: breed, h: 74 };
  })(),
  deur: { x: 640, y: 262, b: 54, h: 108 },
};

export function tekenBus(c: C) {
  const R = BUS.ramen;
  /* schaduw */
  c.fillStyle = "rgba(0,0,40,0.25)";
  c.beginPath();
  c.ellipse(360, 346, 330, 12, 0, 0, Math.PI * 2);
  c.fill();
  /* lijf */
  c.fillStyle = "#ffcf3f";
  c.beginPath();
  c.roundRect(14, 26, 692, 300, [34, 46, 22, 22]);
  c.fill();
  lijn(c, "#d9961a", 5);
  c.stroke();
  /* streep tussen de verdiepingen */
  c.fillStyle = "#ff8a3d";
  c.fillRect(16, 170, 688, 16);
  c.fillStyle = "#ff8a3d";
  c.fillRect(16, 300, 688, 10);
  /* ramen */
  for (const y of [R.boven, R.onder]) {
    for (const x of R.xs) {
      c.fillStyle = "#cdeaff";
      c.beginPath();
      c.roundRect(x - R.b / 2, y - R.h / 2, R.b, R.h, 9);
      c.fill();
      lijn(c, "#d9961a", 4);
      c.stroke();
      c.fillStyle = "rgba(255,255,255,0.55)";
      c.beginPath();
      c.moveTo(x - R.b / 2 + 6, y - R.h / 2 + 22);
      c.lineTo(x - R.b / 2 + 20, y - R.h / 2 + 6);
      c.lineTo(x - R.b / 2 + 28, y - R.h / 2 + 6);
      c.lineTo(x - R.b / 2 + 6, y - R.h / 2 + 30);
      c.closePath();
      c.fill();
    }
  }
  /* voorruit boven */
  c.fillStyle = "#cdeaff";
  c.beginPath();
  c.roundRect(616, 58, 74, 76, [10, 30, 10, 10]);
  c.fill();
  lijn(c, "#d9961a", 4);
  c.stroke();
  /* deur */
  const D = BUS.deur;
  c.fillStyle = "#9fd4ff";
  c.beginPath();
  c.roundRect(D.x - D.b / 2, D.y - D.h / 2, D.b, D.h, 8);
  c.fill();
  lijn(c, "#d9961a", 4);
  c.stroke();
  c.beginPath();
  c.moveTo(D.x, D.y - D.h / 2 + 4);
  c.lineTo(D.x, D.y + D.h / 2 - 4);
  c.stroke();
  /* lamp */
  c.fillStyle = "#fff6c4";
  c.beginPath();
  c.arc(694, 282, 9, 0, Math.PI * 2);
  c.fill();
  lijn(c, "#d9961a", 3);
  c.stroke();
  /* wielen */
  for (const x of [150, 540]) {
    c.fillStyle = "#3a3f55";
    c.beginPath();
    c.arc(x, 326, 34, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#c8cfdf";
    c.beginPath();
    c.arc(x, 326, 14, 0, Math.PI * 2);
    c.fill();
  }
}

const HUID = ["#f6cfa6", "#d9a074", "#a86b45", "#f2d9c0"];
const HAAR = ["#5a3a22", "#1f1a1a", "#e8b84a", "#c4562b"];
const SHIRT = ["#ff7b7b", "#7ee0a0", "#8fc4ff", "#c9a2ff"];

/** Een hoofdje achter het raam (40 × 44). */
export function tekenHoofd(c: C, v: number) {
  const huid = HUID[v % 4];
  const haar = HAAR[(v * 3 + 1) % 4];
  c.fillStyle = SHIRT[(v + 2) % 4];
  c.beginPath();
  c.roundRect(6, 36, 28, 10, 5);
  c.fill();
  c.fillStyle = huid;
  c.beginPath();
  c.arc(20, 24, 14, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = haar;
  c.beginPath();
  c.arc(20, 22, 15, Math.PI * 1.05, Math.PI * 1.95);
  c.closePath();
  c.fill();
  if (v % 2) {
    c.beginPath();
    c.arc(6, 28, 5, 0, Math.PI * 2);
    c.arc(34, 28, 5, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#1d2440";
  c.beginPath();
  c.arc(15, 25, 2.2, 0, Math.PI * 2);
  c.arc(25, 25, 2.2, 0, Math.PI * 2);
  c.fill();
  lijn(c, "#1d2440", 2);
  c.beginPath();
  c.arc(20, 29, 4, 0.2, Math.PI - 0.2);
  c.stroke();
}

/** Een kind dat buiten staat (50 × 90). */
export function tekenKind(c: C, v: number) {
  const huid = HUID[v % 4];
  const haar = HAAR[(v * 3 + 1) % 4];
  /* benen */
  lijn(c, "#3a4f8a", 8);
  c.beginPath();
  c.moveTo(19, 64);
  c.lineTo(18, 84);
  c.moveTo(31, 64);
  c.lineTo(32, 84);
  c.stroke();
  /* lijf */
  c.fillStyle = SHIRT[(v + 2) % 4];
  c.beginPath();
  c.roundRect(11, 34, 28, 34, 10);
  c.fill();
  /* armen */
  lijn(c, huid, 6);
  c.beginPath();
  c.moveTo(12, 40);
  c.lineTo(6, 58);
  c.moveTo(38, 40);
  c.lineTo(44, 58);
  c.stroke();
  /* hoofd */
  c.fillStyle = huid;
  c.beginPath();
  c.arc(25, 20, 14, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = haar;
  c.beginPath();
  c.arc(25, 18, 15, Math.PI * 1.05, Math.PI * 1.95);
  c.closePath();
  c.fill();
  if (v % 2) {
    c.beginPath();
    c.arc(11, 24, 5, 0, Math.PI * 2);
    c.arc(39, 24, 5, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#1d2440";
  c.beginPath();
  c.arc(20, 21, 2.2, 0, Math.PI * 2);
  c.arc(30, 21, 2.2, 0, Math.PI * 2);
  c.fill();
  lijn(c, "#1d2440", 2);
  c.beginPath();
  c.arc(25, 25, 4, 0.2, Math.PI - 0.2);
  c.stroke();
}

/** Een rode gebogen pijl van de deur naar buiten (130 × 110). */
export function tekenPijl(c: C) {
  lijn(c, "#ff5a5a", 9);
  c.beginPath();
  c.moveTo(14, 96);
  c.quadraticCurveTo(40, 14, 104, 40);
  c.stroke();
  c.fillStyle = "#ff5a5a";
  c.beginPath();
  c.moveTo(124, 50);
  c.lineTo(92, 56);
  c.lineTo(104, 24);
  c.closePath();
  c.fill();
}

/* ======================= machine, bord, bakjes, speelgoed ======================= */

export function tekenBand(c: C, b: number) {
  c.fillStyle = "#4a5578";
  c.beginPath();
  c.roundRect(4, 8, b - 8, 26, 13);
  c.fill();
  c.fillStyle = "#6b7aa6";
  for (let x = 24; x < b - 20; x += 46) {
    c.beginPath();
    c.arc(x, 21, 8, 0, Math.PI * 2);
    c.fill();
  }
  lijn(c, "#2f3756", 3);
  c.beginPath();
  c.roundRect(4, 8, b - 8, 26, 13);
  c.stroke();
}

/** De min-machine (240 × 250); het venster (getal) komt er los op. */
export function tekenMachine(c: C) {
  /* trechter */
  c.fillStyle = "#9aa7c9";
  c.beginPath();
  c.moveTo(80, 8);
  c.lineTo(160, 8);
  c.lineTo(140, 40);
  c.lineTo(100, 40);
  c.closePath();
  c.fill();
  lijn(c, "#4a5578", 3);
  c.stroke();
  /* kast */
  c.fillStyle = "#7d6bd6";
  c.beginPath();
  c.roundRect(14, 38, 212, 200, 24);
  c.fill();
  lijn(c, "#4a3aa0", 4);
  c.stroke();
  /* venster */
  c.fillStyle = "#f4f7ff";
  c.beginPath();
  c.roundRect(48, 70, 144, 96, 16);
  c.fill();
  lijn(c, "#4a3aa0", 4);
  c.stroke();
  /* lampjes en knop */
  for (const [x, k] of [
    [58, "#ff7b7b"],
    [86, "#ffe066"],
    [114, "#7ee0a0"],
  ] as const) {
    c.fillStyle = k;
    c.beginPath();
    c.arc(x, 196, 9, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#ffad5c";
  c.beginPath();
  c.roundRect(150, 184, 46, 26, 10);
  c.fill();
  /* opening links en rechts */
  c.fillStyle = "#2f2366";
  c.beginPath();
  c.roundRect(4, 186, 20, 40, 6);
  c.roundRect(216, 186, 20, 40, 6);
  c.fill();
}

/** Een blok op de band (130 × 110); het getal komt er los op. */
export function tekenBlok(c: C) {
  c.fillStyle = "#ffad5c";
  c.beginPath();
  c.roundRect(4, 4, 122, 102, 18);
  c.fill();
  lijn(c, "#d9701e", 4);
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.35)";
  c.beginPath();
  c.roundRect(14, 12, 60, 12, 6);
  c.fill();
}

/** Een dikke pijl naar rechts (70 × 40). */
export function tekenPijlRechts(c: C) {
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.moveTo(4, 14);
  c.lineTo(44, 14);
  c.lineTo(44, 4);
  c.lineTo(66, 20);
  c.lineTo(44, 36);
  c.lineTo(44, 26);
  c.lineTo(4, 26);
  c.closePath();
  c.fill();
}

/** Het schoolbord (640 × 360). */
export function tekenBord(c: C) {
  c.fillStyle = "#b07a42";
  c.beginPath();
  c.roundRect(4, 4, 632, 330, 18);
  c.fill();
  c.fillStyle = "#2f5d46";
  c.beginPath();
  c.roundRect(24, 24, 592, 290, 8);
  c.fill();
  /* krijtvegen */
  c.fillStyle = "rgba(255,255,255,0.06)";
  for (const [x, y, b] of [
    [80, 70, 160],
    [380, 240, 180],
    [300, 90, 120],
  ]) {
    c.beginPath();
    c.ellipse(x, y, b / 2, 18, -0.15, 0, Math.PI * 2);
    c.fill();
  }
  /* richel met krijtjes */
  c.fillStyle = "#8a5a2c";
  c.beginPath();
  c.roundRect(40, 318, 560, 24, 8);
  c.fill();
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.roundRect(470, 312, 44, 10, 5);
  c.fill();
  c.fillStyle = "#ffe066";
  c.beginPath();
  c.roundRect(526, 312, 34, 10, 5);
  c.fill();
}

/** Een beker (80 × 110), vol of leeg. */
export function tekenBeker(c: C, vol: boolean) {
  const vorm = () => {
    c.beginPath();
    c.moveTo(10, 10);
    c.lineTo(70, 10);
    c.lineTo(62, 102);
    c.lineTo(18, 102);
    c.closePath();
  };
  if (vol) {
    c.save();
    vorm();
    c.clip();
    c.fillStyle = "#ff9a3d";
    c.fillRect(0, 30, 80, 80);
    c.fillStyle = "#ffc27a";
    c.fillRect(0, 30, 80, 8);
    c.restore();
    /* rietje */
    lijn(c, "#ff6b9a", 6);
    c.beginPath();
    c.moveTo(48, 40);
    c.lineTo(58, 0);
    c.stroke();
  }
  vorm();
  c.fillStyle = "rgba(220,240,255,0.25)";
  c.fill();
  lijn(c, "#ffffff", 4);
  c.stroke();
  lijn(c, "rgba(255,255,255,0.7)", 3);
  c.beginPath();
  c.moveTo(20, 22);
  c.lineTo(25, 88);
  c.stroke();
}

/** Een bordje (110 × 80), met of zonder koekje. */
export function tekenBordje(c: C, vol: boolean) {
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.ellipse(55, 50, 50, 24, 0, 0, Math.PI * 2);
  c.fill();
  lijn(c, "#9fb0d6", 3);
  c.stroke();
  c.beginPath();
  c.ellipse(55, 50, 32, 14, 0, 0, Math.PI * 2);
  c.stroke();
  if (vol) {
    c.fillStyle = "#d99a4e";
    c.beginPath();
    c.ellipse(55, 40, 28, 18, 0, 0, Math.PI * 2);
    c.fill();
    lijn(c, "#a8692a", 3);
    c.stroke();
    c.fillStyle = "#5a3418";
    for (const [x, y] of [
      [44, 36],
      [58, 32],
      [66, 44],
      [50, 46],
    ]) {
      c.beginPath();
      c.arc(x, y, 3.5, 0, Math.PI * 2);
      c.fill();
    }
  }
}

/** Een portemonnee (240 × 150). */
export function tekenPortemonnee(c: C) {
  c.fillStyle = "#b5653a";
  c.beginPath();
  c.roundRect(8, 30, 224, 112, 20);
  c.fill();
  lijn(c, "#7a3f1e", 4);
  c.stroke();
  c.fillStyle = "#cf7b4a";
  c.beginPath();
  c.moveTo(8, 50);
  c.quadraticCurveTo(120, 4, 232, 50);
  c.lineTo(232, 64);
  c.quadraticCurveTo(120, 30, 8, 64);
  c.closePath();
  c.fill();
  c.fillStyle = "#ffd34d";
  c.beginPath();
  c.arc(120, 62, 11, 0, Math.PI * 2);
  c.fill();
  lijn(c, "#7a3f1e", 3);
  c.stroke();
}

/** Speelgoed om te kopen (160 × 160). */
export function tekenSpeelgoed(c: C, s: Speelgoed) {
  c.save();
  if (s === "ijsje") {
    c.fillStyle = "#e0a85a";
    c.beginPath();
    c.moveTo(48, 70);
    c.lineTo(112, 70);
    c.lineTo(80, 152);
    c.closePath();
    c.fill();
    lijn(c, "#a8692a", 3);
    c.stroke();
    lijn(c, "#c4884a", 2.5);
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(56 + i * 14, 72);
      c.lineTo(74 + i * 6, 120);
      c.stroke();
    }
    c.fillStyle = "#ff9fd2";
    c.beginPath();
    c.arc(80, 54, 30, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fff2f8";
    c.beginPath();
    c.arc(70, 44, 8, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#ff5a5a";
    c.beginPath();
    c.arc(80, 22, 8, 0, Math.PI * 2);
    c.fill();
  } else if (s === "bal") {
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(80, 82, 62, 0, Math.PI * 2);
    c.fill();
    c.save();
    c.clip();
    c.fillStyle = "#ff6b6b";
    c.fillRect(0, 0, 160, 58);
    c.fillStyle = "#4da3ff";
    c.fillRect(0, 106, 160, 60);
    c.restore();
    lijn(c, "#3a4f8a", 4);
    c.beginPath();
    c.arc(80, 82, 62, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = "rgba(255,255,255,0.6)";
    c.beginPath();
    c.ellipse(58, 50, 14, 8, -0.6, 0, Math.PI * 2);
    c.fill();
  } else if (s === "boek") {
    c.fillStyle = "#4da3ff";
    c.beginPath();
    c.roundRect(26, 22, 108, 124, 8);
    c.fill();
    lijn(c, "#2c5fa8", 4);
    c.stroke();
    c.fillStyle = "#ffffff";
    c.fillRect(126, 30, 8, 108);
    c.fillStyle = "#ffe066";
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 12 : 28;
      const h = -Math.PI / 2 + (i * Math.PI) / 5;
      if (i) c.lineTo(78 + r * Math.cos(h), 78 + r * Math.sin(h));
      else c.moveTo(78 + r * Math.cos(h), 78 + r * Math.sin(h));
    }
    c.closePath();
    c.fill();
  } else if (s === "ballon") {
    lijn(c, "#ffffff", 2.5);
    c.beginPath();
    c.moveTo(80, 112);
    c.bezierCurveTo(70, 130, 92, 140, 80, 158);
    c.stroke();
    c.fillStyle = "#ff6b6b";
    c.beginPath();
    c.ellipse(80, 62, 44, 52, 0, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.moveTo(74, 114);
    c.lineTo(86, 114);
    c.lineTo(80, 106);
    c.closePath();
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.55)";
    c.beginPath();
    c.ellipse(64, 40, 10, 16, -0.4, 0, Math.PI * 2);
    c.fill();
  } else {
    /* vlieger */
    lijn(c, "#ffffff", 2.5);
    c.beginPath();
    c.moveTo(80, 128);
    c.bezierCurveTo(60, 140, 100, 146, 84, 158);
    c.stroke();
    const vlak = (pts: number[][], k: string) => {
      c.fillStyle = k;
      c.beginPath();
      pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.closePath();
      c.fill();
    };
    vlak(
      [
        [80, 8],
        [80, 70],
        [30, 60],
      ],
      "#ffe066",
    );
    vlak(
      [
        [80, 8],
        [130, 60],
        [80, 70],
      ],
      "#ff6b6b",
    );
    vlak(
      [
        [30, 60],
        [80, 70],
        [80, 128],
      ],
      "#4da3ff",
    );
    vlak(
      [
        [80, 70],
        [130, 60],
        [80, 128],
      ],
      "#7ee0a0",
    );
    lijn(c, "#3a4f8a", 3);
    c.beginPath();
    c.moveTo(80, 8);
    c.lineTo(130, 60);
    c.lineTo(80, 128);
    c.lineTo(30, 60);
    c.closePath();
    c.stroke();
  }
  c.restore();
}

/** Een luidspreker (luistervraag zonder som in beeld), 160 × 140. */
export function tekenLuister(c: C) {
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.moveTo(20, 50);
  c.lineTo(52, 50);
  c.lineTo(92, 16);
  c.lineTo(92, 124);
  c.lineTo(52, 90);
  c.lineTo(20, 90);
  c.closePath();
  c.fill();
  lijn(c, "#ffffff", 9);
  for (const r of [26, 50]) {
    c.beginPath();
    c.arc(96, 70, r, -0.7, 0.7);
    c.stroke();
  }
}
