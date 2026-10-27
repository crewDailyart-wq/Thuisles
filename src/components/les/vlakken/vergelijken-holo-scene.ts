/**
 * De Phaser-scène voor de lessen Vergelijken als hologrammen (27 oktober
 * 2026, LESSENPLAN.md G7–G11, wereld Aarde). Hoort bij
 * `vergelijken-holo-vlak.tsx`; daar staan de knoppen, getallen en het
 * invulvak (gewone HTML). Hier staat alleen wat getekend wordt:
 *
 *   - twee glazen potjes met 6 (2 × 3) of 10 (2 × 5) plekken, zoals de
 *     vakjeskaarten van Synthesis "Compare the Pair";
 *   - vuurvliegjes in drie kleuren (blauw, geel, groen) op die plekken;
 *     erbij = het vliegje vliegt in het potje, eraf = het vliegt weg;
 *     "zakken" = alle vliegjes glijden netjes naar onderen (hulp);
 *   - het teken =, < of > (of een vraagteken) als groot gloeiend hologram,
 *     met het gele stipje bij de kleine of de grote kant;
 *   - lantaarntjes met een getal (of een vraagteken) voor de getallen;
 *   - lichtringen rond wat gekozen of geteld is, pijltjes, lichtgolf.
 *
 * Gloed alleen via `bak()` uit holo/basis.ts (één keer gebakken, centrale
 * sterkte). Alle maten in punten van het vlak (980 × 720).
 */

import { holoBasis, TX, WARM, GOED, WERELDKLEUR, type PhaserModule } from "../holo/basis";

export type Kant = "links" | "rechts";
export type Kleur = "blauw" | "geel" | "groen";
export type Vak = "" | Kleur;
export type Teken = "=" | "<" | ">" | "?";

export const KLEUR_HEX: Record<Kleur, number> = { blauw: 0x7fb4ff, geel: 0xffc94a, groen: 0x86f07a };
export const KLEUR_CSS: Record<Kleur, string> = { blauw: "#8fbcff", geel: "#ffcf5c", groen: "#93f088" };

/* ---------- maten ---------- */

export const POT_X: Record<Kant, number> = { links: 250, rechts: 730 };
export const MIDDEN_X = 490;
const POT_MIDDEN_Y = 404;
const RAND = 16;
const DEKSEL = 26;

/** De maten van een potje met `rijen` rijen van 2 plekken. */
export function potMaat(rijen: number) {
  const cel = rijen > 3 ? 100 : 112;
  const gat = 8;
  const b = 2 * cel + gat;
  const h = rijen * cel + (rijen - 1) * gat;
  const boven = POT_MIDDEN_Y - h / 2;
  return { cel, gat, b, h, boven, onder: boven + h, buitenB: b + 2 * RAND, buitenBoven: boven - RAND - DEKSEL };
}

/** Het midden van plek `i` (0 = linksboven, 1 = rechtsboven, …) in punten van het vlak. */
export function plek(kant: Kant, rijen: number, i: number) {
  const m = potMaat(rijen);
  const k = i % 2;
  const r = Math.floor(i / 2);
  return { x: POT_X[kant] - m.b / 2 + k * (m.cel + m.gat) + m.cel / 2, y: m.boven + r * (m.cel + m.gat) + m.cel / 2 };
}

/* ---------- de scène ---------- */

export type Plek = { x: number; y: number };
export type Ring = Plek & { r: number; kleur: number };
export type TekenPlek = Plek & { s: Teken; maat: number };

export interface VergelijkScene {
  /** De potjes tonen (met hun aantal rijen) of weghalen. */
  potjes(rijen: number | null): void;
  /** De vuurvliegjes in één potje. `wijze`: nieuw (alles opnieuw), zak (netjes naar onderen), diff (alleen wat veranderde). */
  vliegjes(kant: Kant, vakken: Vak[], wijze: "nieuw" | "zak" | "diff", alleen: Kleur | null): void;
  ringen(lijst: Ring[]): void;
  tekens(lijst: TekenPlek[]): void;
  lantaarns(lijst: Plek[]): void;
  stippen(lijst: Plek[]): void;
  pijlen(lijst: Plek[]): void;
  golfOp(x: number, y: number): void;
  schudPot(kant: Kant): void;
  schudTeken(): void;
}

type Img = import("phaser").GameObjects.Image;
type Cont = import("phaser").GameObjects.Container;

const CREME = "#fff4dc";

function tekenPad(c: CanvasRenderingContext2D, s: Teken, d: number) {
  c.lineCap = "round";
  c.lineJoin = "round";
  c.lineWidth = d * 0.12;
  c.beginPath();
  if (s === "=") {
    c.moveTo(d * 0.16, d * 0.37);
    c.lineTo(d * 0.84, d * 0.37);
    c.moveTo(d * 0.16, d * 0.63);
    c.lineTo(d * 0.84, d * 0.63);
  } else if (s === "<") {
    c.moveTo(d * 0.78, d * 0.18);
    c.lineTo(d * 0.22, d * 0.5);
    c.lineTo(d * 0.78, d * 0.82);
  } else if (s === ">") {
    c.moveTo(d * 0.22, d * 0.18);
    c.lineTo(d * 0.78, d * 0.5);
    c.lineTo(d * 0.22, d * 0.82);
  }
  c.stroke();
}

export function maakVergelijkScene() {
  return (Phaser: PhaserModule, rustig: boolean) => {
    const Basis = holoBasis(Phaser, rustig);
    class Vergelijk extends Basis implements VergelijkScene {
      pot: Partial<Record<Kant, Cont>> = {};
      rijen: number | null = null;
      vlieg: Record<Kant, ({ img: Img; kleur: Kleur } | null)[]> = { links: [], rechts: [] };
      ringLijst: Img[] = [];
      tekenLijst: { img: Img; s: Teken; x: number; y: number }[] = [];
      lampLijst: Img[] = [];
      stipLijst: Img[] = [];
      pijlLijst: Img[] = [];

      constructor() {
        super("vergelijk");
      }

      maak() {
        /* Voor de automatische test: wat de scène nu laat zien (aantal vliegjes per potje). */
        (window as unknown as { __vergelijk?: () => unknown }).__vergelijk = () => ({
          rijen: this.rijen,
          links: this.vlieg.links.filter(Boolean).length,
          rechts: this.vlieg.rechts.filter(Boolean).length,
        });
        const aarde = WERELDKLEUR.aarde;
        /* Een glazen potje per maat (3 of 5 rijen), met een warm dekseltje en zachte plekjes. */
        for (const rijen of [3, 5]) {
          const m = potMaat(rijen);
          const b = m.buitenB;
          const h = m.h + 2 * RAND + DEKSEL;
          this.canvasPlaatje(`pot-${rijen}`, b + 8, h + 8, (c) => {
            c.translate(4, 4);
            /* deksel */
            c.beginPath();
            c.roundRect(b * 0.16, 0, b * 0.68, DEKSEL - 6, 9);
            c.fillStyle = "rgba(255,211,110,0.28)";
            c.fill();
            c.strokeStyle = "rgba(255,221,150,0.95)";
            c.lineWidth = 3;
            c.stroke();
            /* glas */
            c.beginPath();
            c.roundRect(0, DEKSEL, b, h - DEKSEL, 30);
            c.fillStyle = "rgba(20,52,120,0.38)";
            c.fill();
            c.strokeStyle = "rgba(205,240,255,0.95)";
            c.lineWidth = 3;
            c.stroke();
            /* een glimlijntje op het glas */
            c.beginPath();
            c.roundRect(10, DEKSEL + 18, 7, h - DEKSEL - 60, 4);
            c.fillStyle = "rgba(255,255,255,0.16)";
            c.fill();
            /* de plekken: zachte stippellijn-rondjes */
            c.setLineDash([6, 5]);
            c.strokeStyle = "rgba(190,235,255,0.42)";
            c.lineWidth = 2;
            for (let i = 0; i < rijen * 2; i++) {
              const k = i % 2;
              const r = Math.floor(i / 2);
              const x = RAND + k * (m.cel + m.gat) + m.cel / 2;
              const y = DEKSEL + RAND + r * (m.cel + m.gat) + m.cel / 2;
              c.beginPath();
              c.arc(x, y, m.cel * 0.38, 0, Math.PI * 2);
              c.stroke();
            }
          });
          this.bak(`pot-${rijen}`, `pot-${rijen}-gloed`, aarde);
        }
        /* Een vuurvliegje per kleur: een helder lijfje met twee doorschijnende vleugeltjes. */
        for (const [naam, hex] of Object.entries(KLEUR_HEX) as [Kleur, number][]) {
          const css = KLEUR_CSS[naam];
          this.canvasPlaatje(`vlieg-${naam}`, 72, 72, (c) => {
            c.fillStyle = "rgba(235,248,255,0.55)";
            c.beginPath();
            c.ellipse(24, 22, 15, 9, -0.5, 0, Math.PI * 2);
            c.fill();
            c.beginPath();
            c.ellipse(48, 22, 15, 9, 0.5, 0, Math.PI * 2);
            c.fill();
            const g = c.createRadialGradient(31, 36, 2, 36, 42, 23);
            g.addColorStop(0, "#ffffff");
            g.addColorStop(0.45, css);
            g.addColorStop(1, css);
            c.fillStyle = g;
            c.beginPath();
            c.arc(36, 42, 21, 0, Math.PI * 2);
            c.fill();
          });
          this.bak(`vlieg-${naam}`, `vlieg-${naam}-gloed`, hex);
        }
        /* De tekens als dikke, ronde lichtlijnen; het vraagteken als groot teken. */
        for (const s of ["=", "<", ">", "?"] as Teken[]) {
          this.canvasPlaatje(`teken-${s}`, 140, 140, (c) => {
            c.strokeStyle = CREME;
            c.fillStyle = s === "?" ? "#ffe27a" : CREME;
            if (s === "?") {
              c.font = "800 128px Fredoka, 'Work Sans', system-ui, sans-serif";
              c.textAlign = "center";
              c.textBaseline = "middle";
              c.fillText("?", 70, 76);
            } else tekenPad(c, s, 140);
          });
          this.bak(`teken-${s}`, `teken-${s}-gloed`, WARM);
        }
        /* Een lantaarntje: haakje, dakje, glazen lijf en voetje. */
        this.canvasPlaatje("lamp", 200, 262, (c) => {
          c.strokeStyle = "rgba(255,221,150,0.95)";
          c.lineWidth = 3;
          c.beginPath();
          c.arc(100, 14, 10, 0, Math.PI * 2);
          c.stroke();
          c.beginPath();
          c.moveTo(56, 52);
          c.lineTo(78, 26);
          c.lineTo(122, 26);
          c.lineTo(144, 52);
          c.closePath();
          c.fillStyle = "rgba(255,211,110,0.3)";
          c.fill();
          c.stroke();
          c.beginPath();
          c.roundRect(14, 52, 172, 178, 26);
          c.fillStyle = "rgba(255,200,110,0.12)";
          c.fill();
          c.stroke();
          c.beginPath();
          c.roundRect(44, 230, 112, 22, 8);
          c.fillStyle = "rgba(255,211,110,0.3)";
          c.fill();
          c.stroke();
        });
        this.bak("lamp", "lamp-gloed", WARM);
        /* Het gele stipje bij het teken. */
        this.canvasPlaatje("stip", 30, 30, (c) => {
          const g = c.createRadialGradient(12, 12, 1, 15, 15, 13);
          g.addColorStop(0, "#fffbe0");
          g.addColorStop(1, "#ffd23a");
          c.fillStyle = g;
          c.beginPath();
          c.arc(15, 15, 12, 0, Math.PI * 2);
          c.fill();
        });
        this.bak("stip", "stip-gloed", 0xffd23a);
        /* Een licht pijltje omhoog (deze kant mag je veranderen / hier tellen we). */
        this.canvasPlaatje("pijl", 44, 52, (c) => {
          c.fillStyle = "rgba(235,246,255,0.9)";
          c.beginPath();
          c.moveTo(22, 2);
          c.lineTo(42, 24);
          c.lineTo(30, 24);
          c.lineTo(30, 50);
          c.lineTo(14, 50);
          c.lineTo(14, 24);
          c.lineTo(2, 24);
          c.closePath();
          c.fill();
        });
        this.bak("pijl", "pijl-gloed", WERELDKLEUR.neutraal);
      }

      /* ---------- potjes en vliegjes ---------- */

      potjes(rijen: number | null) {
        if (rijen === this.rijen) return;
        for (const kant of ["links", "rechts"] as Kant[]) {
          const oud = this.pot[kant];
          if (oud) this.verdwijn(oud);
          this.pot[kant] = undefined;
          this.vlieg[kant] = [];
        }
        this.rijen = rijen;
        if (rijen === null) return;
        const m = potMaat(rijen);
        for (const kant of ["links", "rechts"] as Kant[]) {
          const midY = m.boven - RAND - DEKSEL + (m.h + 2 * RAND + DEKSEL) / 2;
          const groep = this.add.container(POT_X[kant], midY);
          groep.add(this.plaats(`pot-${rijen}-gloed`, 0, 0));
          this.pot[kant] = groep;
          this.tover(groep, { vertraging: kant === "links" ? 0 : 120 });
        }
      }

      /** Waar plek `i` binnen de container van het potje ligt. */
      binnen(kant: Kant, i: number) {
        const p = plek(kant, this.rijen ?? 3, i);
        const g = this.pot[kant]!;
        return { x: p.x - g.x, y: p.y - g.y };
      }

      nieuwVlieg(kant: Kant, i: number, kleur: Kleur, vertraging: number) {
        const g = this.pot[kant]!;
        const p = this.binnen(kant, i);
        const cel = potMaat(this.rijen ?? 3).cel;
        const schaal = (cel / 100) * 0.92 / TX;
        const img = this.plaats(`vlieg-${kleur}-gloed`, p.x, p.y).setScale(schaal);
        g.add(img);
        if (!this.rustig) {
          /* Het vliegje vliegt van boven het potje naar zijn plekje. */
          img.setAlpha(0).setPosition(p.x + (i % 2 ? 30 : -30), p.y - 90);
          this.tweens.add({ targets: img, alpha: 1, x: p.x, y: p.y, delay: vertraging, duration: 360, ease: "Cubic.easeOut" });
          this.zweef(img, p.y, vertraging + 380);
        }
        return { img, kleur };
      }

      /** Heel zacht zweven, zodat het echte vuurvliegjes lijken. */
      zweef(img: Img, y: number, vertraging: number) {
        if (this.rustig) return;
        this.tweens.add({ targets: img, y: y - 3, delay: vertraging + Math.random() * 600, duration: 1100 + Math.random() * 500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }

      wegVlieg(v: { img: Img } | null) {
        if (!v) return;
        this.tweens.killTweensOf(v.img);
        if (this.rustig) {
          v.img.destroy();
          return;
        }
        this.tweens.add({ targets: v.img, y: v.img.y - 120, x: v.img.x + 40, alpha: 0, duration: 420, ease: "Cubic.easeIn", onComplete: () => v.img.destroy() });
      }

      vliegjes(kant: Kant, vakken: Vak[], wijze: "nieuw" | "zak" | "diff", alleen: Kleur | null) {
        if (!this.pot[kant]) return;
        const oud = this.vlieg[kant];
        let nieuw: ({ img: Img; kleur: Kleur } | null)[] = Array(vakken.length).fill(null);
        if (oud.length !== vakken.length) wijze = "nieuw";
        if (wijze === "zak") {
          const van = oud.map((v, i) => (v ? i : -1)).filter((i) => i >= 0).sort((a, b) => b - a);
          const naar = vakken.map((v, i) => (v ? i : -1)).filter((i) => i >= 0).sort((a, b) => b - a);
          if (van.length !== naar.length) wijze = "diff";
          else {
            van.forEach((vi, k) => {
              const v = oud[vi]!;
              const ni = naar[k];
              const p = this.binnen(kant, ni);
              this.tweens.killTweensOf(v.img);
              this.tweens.add({ targets: v.img, x: p.x, y: p.y, duration: this.rustig ? 1 : 520, delay: k * 30, ease: "Cubic.easeInOut", onComplete: () => this.zweef(v.img, p.y, 0) });
              nieuw[ni] = v;
            });
          }
        }
        if (wijze === "nieuw") {
          oud.forEach((v) => this.wegVlieg(v));
          let k = 0;
          nieuw = vakken.map((kl, i) => (kl ? this.nieuwVlieg(kant, i, kl, 80 + 45 * k++) : null));
        } else if (wijze === "diff") {
          nieuw = vakken.map((kl, i) => {
            const v = oud[i];
            if (v && v.kleur === kl) return v;
            this.wegVlieg(v);
            return kl ? this.nieuwVlieg(kant, i, kl, 0) : null;
          });
        }
        this.vlieg[kant] = nieuw;
        for (const v of nieuw) {
          if (!v) continue;
          const doel = alleen && v.kleur !== alleen ? 0.1 : 1;
          if (Math.abs(v.img.alpha - doel) > 0.05 && v.img.alpha > 0.05) this.tweens.add({ targets: v.img, alpha: doel, duration: this.rustig ? 1 : 360 });
          else if (alleen && v.kleur !== alleen) v.img.setAlpha(0.1);
        }
      }

      /* ---------- ringen, tekens, lantaarns, stippen, pijlen ---------- */

      ringen(lijst: Ring[]) {
        this.ringLijst.forEach((r) => r.destroy());
        this.ringLijst = lijst.map((r) => this.selectieRing(r.x, r.y, r.r, r.kleur));
      }

      tekens(lijst: TekenPlek[]) {
        const oud = this.tekenLijst;
        const nieuw: typeof oud = [];
        lijst.forEach((t, i) => {
          const o = oud[i];
          if (o && o.x === t.x && o.y === t.y) {
            if (o.s !== t.s) {
              o.img.setTexture(`teken-${t.s}-gloed`);
              o.s = t.s;
              if (!this.rustig) this.tweens.add({ targets: o.img, scaleX: { from: 0.2 / TX * t.maat, to: t.maat / TX }, duration: 220, ease: "Back.easeOut" });
            }
            o.img.setScale(t.maat / TX);
            nieuw.push(o);
            return;
          }
          if (o) this.verdwijn(o.img);
          const img = this.plaats(`teken-${t.s}-gloed`, t.x, t.y).setScale(t.maat / TX);
          this.tover(img, { vertraging: 60 * i });
          nieuw.push({ img, s: t.s, x: t.x, y: t.y });
        });
        oud.slice(lijst.length).forEach((o) => this.verdwijn(o.img));
        this.tekenLijst = nieuw;
      }

      lantaarns(lijst: Plek[]) {
        const oud = this.lampLijst;
        const zelfde = oud.length === lijst.length && oud.every((l, i) => l.x === lijst[i].x && l.y === lijst[i].y);
        if (zelfde) return;
        oud.forEach((l) => this.verdwijn(l));
        this.lampLijst = lijst.map((p, i) => {
          const img = this.plaats("lamp-gloed", p.x, p.y);
          img.setDepth(-1);
          this.tover(img, { vertraging: 80 * i });
          return img;
        });
      }

      stippen(lijst: Plek[]) {
        this.stipLijst.forEach((s) => s.destroy());
        this.stipLijst = lijst.map((p) => {
          const img = this.plaats("stip-gloed", p.x, p.y);
          if (!this.rustig) {
            img.setScale(0);
            this.tweens.add({ targets: img, scale: 1 / TX, duration: 300, ease: "Back.easeOut" });
          }
          return img;
        });
      }

      pijlen(lijst: Plek[]) {
        this.pijlLijst.forEach((p) => p.destroy());
        this.pijlLijst = lijst.map((p) => {
          const img = this.plaats("pijl-gloed", p.x, p.y);
          if (!this.rustig) this.tweens.add({ targets: img, y: p.y - 8, duration: 650, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
          return img;
        });
      }

      golfOp(x: number, y: number) {
        this.golf(x, y, GOED);
      }

      schudPot(kant: Kant) {
        const g = this.pot[kant];
        if (g) this.schud(g);
      }

      schudTeken() {
        for (const t of this.tekenLijst) this.schud(t.img);
      }

      /** Voor `npm run vloeiend`: vliegjes vliegen in en uit, met een lichtgolf. */
      demo(ms: number) {
        const eind = performance.now() + ms;
        if (this.rijen === null) this.potjes(5);
        let n = 0;
        const stap = () => {
          if (performance.now() > eind) return;
          n++;
          const kleuren: Kleur[] = ["blauw", "geel", "groen"];
          for (const kant of ["links", "rechts"] as Kant[]) {
            const vak: Vak[] = Array.from({ length: (this.rijen ?? 5) * 2 }, () => (Math.random() < 0.55 ? kleuren[(n + (kant === "links" ? 0 : 1)) % 3] : ""));
            this.vliegjes(kant, vak, n % 2 ? "nieuw" : "zak", null);
          }
          this.time.delayedCall(450, () => this.golfOp(MIDDEN_X, 300));
          this.time.delayedCall(900, stap);
        };
        stap();
      }
    }
    return Vergelijk as unknown as new () => import("phaser").Scene;
  };
}
