/**
 * De eigen voorwerpenstijl van Bliepo (28 oktober 2026, opdracht eigenaar;
 * eerst als voorbeeld in de klokles en de bloementuin, de rest pas na
 * goedkeuring). Zie VOORWERPEN-BRONNEN.md.
 *
 * - Vlakke, volledig dekkende vormen: geen gloed, glas, glans, doorzichtigheid
 *   of sterretjes.
 * - Een klein vast palet: donkerblauw voor contouren, petrol en koraal voor
 *   onderdelen, warmgeel als accent, warmwit als lichte vulling. Lichte of
 *   warme vullingen met een donkere rand, zodat alles goed afsteekt tegen de
 *   blauwe achtergrond van de les.
 * - Afgeronde vormen en dezelfde lijndiktes overal (RAND, RAND_DUN).
 * - Elk voorwerp is SVG-paddata in code (Path2D), zelf ontworpen; geen
 *   plaatjes van buiten, geen AI, geen emoji.
 *
 * `bliepoBasis` is de hologrambasis (holo/basis.ts) met dezelfde namen maar
 * vlakke effecten, zodat een bestaand vlak er zonder andere code op overgaat:
 * `bak` bakt geen gloed meer, `tover` laat iets rustig opploppen, `golf` is
 * een korte gele ring, `selectieRing` een vlakke gele ring.
 */

import { holoBasis, TX, type PhaserModule } from "../holo/basis";

/* ---------- het palet ---------- */

export const PALET = {
  navy: "#1d2b5e",
  petrol: "#127c86",
  petrolLicht: "#bfe6e3",
  koraal: "#f2715e",
  koraalLicht: "#ffd6cc",
  geel: "#ffc845",
  geelLicht: "#ffeab0",
  warmwit: "#fff7ea",
} as const;

/** Dezelfde kleuren als getal, voor Phaser (lijnen en tinten). */
export const KLEUR = {
  navy: 0x1d2b5e,
  petrol: 0x127c86,
  petrolLicht: 0xbfe6e3,
  koraal: 0xf2715e,
  koraalLicht: 0xffd6cc,
  geel: 0xffc845,
  geelLicht: 0xffeab0,
  warmwit: 0xfff7ea,
} as const;

/** De lijndiktes, in punten van het voorwerp: overal dezelfde. */
export const RAND = 6;
export const RAND_DUN = 3.5;

/* ---------- SVG-vormen tekenen ---------- */

export type Vorm = {
  /** SVG-paddata (zoals in <path d="…">). */
  d: string;
  vul?: string;
  rand?: string;
  dik?: number;
};

/** Teken een rij SVG-vormen op een canvas (vlak, dekkend, ronde hoeken in de lijnen). */
export function tekenVormen(c: CanvasRenderingContext2D, vormen: Vorm[]) {
  c.lineJoin = "round";
  c.lineCap = "round";
  for (const v of vormen) {
    const p = new Path2D(v.d);
    if (v.vul) {
      c.fillStyle = v.vul;
      c.fill(p);
    }
    if (v.rand) {
      c.strokeStyle = v.rand;
      c.lineWidth = v.dik ?? RAND;
      c.stroke(p);
    }
  }
}

/** Een cirkel als SVG-pad. */
export const cirkel = (x: number, y: number, r: number) =>
  `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;

/** Een afgeronde rechthoek als SVG-pad. */
export const blok = (x: number, y: number, b: number, h: number, r: number) =>
  `M ${x + r} ${y} H ${x + b - r} A ${r} ${r} 0 0 1 ${x + b} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + b - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;

/* ---------- de basis met vlakke effecten ---------- */

export function bliepoBasis(Phaser: PhaserModule, rustig: boolean) {
  const Holo = holoBasis(Phaser, rustig);
  return class BliepoBasis extends Holo {
    /** Geen gloed: het "gebakken" plaatje is gewoon hetzelfde plaatje. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bak(bron: string, doel: string, _kleur?: number, _extraRand?: number) {
      if (this.textures.exists(doel)) return;
      const bronBeeld = this.textures.get(bron).getSourceImage() as HTMLCanvasElement;
      this.textures.addCanvas(doel, bronBeeld);
    }

    /** Verschijnen: rustig opploppen op de plek (geen lichtstraal of flits). */
    tover(
      doel: import("phaser").GameObjects.Components.Transform &
        import("phaser").GameObjects.Components.AlphaSingle & { scaleX: number; scaleY: number },
      opties: { x?: number; vertraging?: number } = {},
    ) {
      if (rustig) return;
      const sx = doel.scaleX;
      const sy = doel.scaleY;
      doel.setScale(sx * 0.6, sy * 0.6);
      doel.setAlpha(0);
      this.tweens.add({ targets: doel, alpha: 1, duration: 120, delay: opties.vertraging ?? 0 });
      this.tweens.add({ targets: doel, scaleX: sx, scaleY: sy, duration: 300, delay: opties.vertraging ?? 0, ease: "Back.easeOut" });
    }

    /** Goed: een korte, vlakke gele ring die even groter wordt en weg is. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    golf(x: number, y: number, _kleur?: number) {
      if (rustig) return;
      const g = this.add.graphics({ x, y });
      g.lineStyle(RAND_DUN, KLEUR.navy, 1);
      g.strokeCircle(0, 0, 33);
      g.lineStyle(RAND, KLEUR.geel, 1);
      g.strokeCircle(0, 0, 28);
      g.setScale(0.7);
      this.tweens.add({ targets: g, scale: 1.5, duration: 340, ease: "Cubic.easeOut", onComplete: () => g.destroy() });
    }

    /** Wat gekozen is: een vlakke gele ring met een donkere rand, die zacht ademt (geen doorzichtigheid). */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectieRing(x: number, y: number, straal: number, _kleur?: number) {
      const sl = `bl-ring-${Math.round(straal)}`;
      const m = straal + RAND * 2;
      this.canvasPlaatje(sl, m * 2, m * 2, (c) =>
        tekenVormen(c, [
          { d: cirkel(m, m, straal + RAND / 2), rand: PALET.navy, dik: RAND + RAND_DUN * 2 },
          { d: cirkel(m, m, straal + RAND / 2), rand: PALET.geel, dik: RAND },
        ]),
      );
      const ring = this.add.image(x, y, sl).setScale(1 / TX);
      if (!rustig) this.tweens.add({ targets: ring, scale: 1.08 / TX, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      return ring;
    }
  };
}
