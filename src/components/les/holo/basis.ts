/**
 * De gedeelde hologrambasis voor alle Phaser-lessen (27 oktober 2026,
 * LESSENPLAN.md § 1b/§ 4, ONTWERPREGELS.md "Gloed" en HARDE REGEL 7).
 *
 * Elke les tekent haar voorwerpen als hologrammen die Bliepo tevoorschijn
 * tovert, vóór de bestaande blauwe ruimte (het canvas is doorzichtig). Deze
 * basis geeft iedere scène hetzelfde gereedschap, zodat alles er hetzelfde
 * uitziet en licht blijft:
 *
 *   canvasPlaatje()  een plaatje één keer tekenen (op dubbele scherpte)
 *   bak()            de gloed één keer "bakken" in een plaatje, met de
 *                    centrale gloedsterkte (lib/phaser/gloed.ts); nooit een
 *                    gloed die elk beeld opnieuw wordt uitgerekend
 *   plaats()         een plaatje neerzetten
 *   tover()          verschijnen: lichtstraal uit de vloer + zachte flits
 *   golf()           een rustige lichtgolf bij een goed antwoord
 *   schud()          zacht schudden bij een fout
 *   verdwijn()       oplossen naar beneden
 *   selectieRing()   een gekleurde ring die zacht pulseert rond wat gekozen is
 *   demo()           voor `npm run vloeiend` (window.__phaser.beweeg)
 *
 * Gebruik (in een vlak):
 *   const { plek, scene } = useHoloMotor<MijnScene>(schaal, (Phaser, rustig) => {
 *     const Basis = holoBasis(Phaser, rustig);
 *     return class extends Basis implements MijnScene { maak() { ... } };
 *   });
 * `maak()` wordt aangeroepen na de gedeelde plaatjes; tekenen in punten van
 * het vlak (980 × 720).
 */

import { gloedMaten } from "@/lib/phaser/gloed";

export type PhaserModule = typeof import("phaser");
export type Holo = InstanceType<ReturnType<typeof holoBasis>>;

/** Plaatjes op dubbele scherpte, zodat ze ook op een scherp scherm niet wazig zijn. */
export const TX = 2;
export const VLAK_B = 980;
export const VLAK_H = 720;
/** Waar de vloer van de ruimte ongeveer is (onderkant van het vlak). */
export const VLOER_Y = 690;

/** De kleuren van de werelden (gloed en randen). */
export const WERELDKLEUR = { oceaan: 0x7fe9ff, aarde: 0xffd36e, universum: 0xc9b6ff, neutraal: 0xbfe6ff } as const;
export const WARM = 0xffd36e;
export const GOED = 0x8ff0c0;

export function holoBasis(Phaser: PhaserModule, rustig: boolean) {
  const G = gloedMaten();
  return class HoloBasis extends Phaser.Scene {
    readonly rustig = rustig;
    readonly gloed = G;
    klaar = false;

    constructor(sleutel = "holo") {
      super(sleutel);
    }

    /** Eigen plaatjes en voorwerpen van de scène; na de gedeelde plaatjes. */
    maak(): void {}

    /** Voor de vloeiendheidscontrole: laat de scène `ms` lang haar animaties zien. */
    demo(ms: number): void {
      const eind = performance.now() + ms;
      const stap = () => {
        if (performance.now() > eind) return;
        const ster = this.plaats("holo-ring", VLAK_B / 2, VLAK_H / 2 - 40).setScale(0.6 / TX);
        this.tover(ster);
        this.time.delayedCall(420, () => this.golf(VLAK_B / 2, VLAK_H / 2 - 40));
        this.time.delayedCall(700, () => this.verdwijn(ster));
        this.time.delayedCall(800, stap);
      };
      stap();
    }

    create() {
      this.maakGedeeld();
      this.maak();
      this.klaar = true;
      this.events.emit("klaar");
    }

    /* ---------- plaatjes ---------- */

    canvasPlaatje(sleutel: string, b: number, h: number, teken: (c: CanvasRenderingContext2D) => void) {
      if (this.textures.exists(sleutel)) return;
      const t = this.textures.createCanvas(sleutel, b * TX, h * TX)!;
      const c = t.getContext();
      c.scale(TX, TX);
      teken(c);
      t.refresh();
    }

    /**
     * De gloed één keer bakken: een zacht, smal randje licht in `kleur`
     * (sterkte en breedte uit de centrale instelling). Bij gloed 0 is het
     * gewoon hetzelfde plaatje.
     */
    bak(bron: string, doel: string, kleur: number, extraRand = 0) {
      if (this.textures.exists(doel)) return;
      const los = this.add.image(0, 0, bron);
      const rand = (this.gloed.rand + extraRand) * TX;
      if (this.gloed.buiten > 0.01) {
        los.enableFilters();
        los.filters!.external.addGlow(kleur, this.gloed.buiten, 0, this.gloed.breedte * TX, false, 10, 12).setPaddingOverride(null);
      }
      const b = los.width + rand * 2;
      const h = los.height + rand * 2;
      this.textures.addDynamicTexture(doel, b, h)!.draw(los, b / 2, h / 2).render();
      los.destroy();
    }

    plaats(sl: string, x: number, y: number) {
      return this.add.image(x, y, sl).setScale(1 / TX);
    }

    /* ---------- gedeelde effecten ---------- */

    maakGedeeld() {
      /* De lichtstraal uit de vloer: zacht aan de zijkanten, van fel onderaan naar niets bovenaan. */
      this.canvasPlaatje("holo-straal", 120, 520, (c) => {
        for (let x = 0; x < 120; x++) {
          const zij = Math.sin((Math.PI * (x + 0.5)) / 120) ** 2;
          const g = c.createLinearGradient(0, 520, 0, 0);
          g.addColorStop(0, `rgba(170,245,255,${0.6 * zij})`);
          g.addColorStop(0.45, `rgba(127,233,255,${0.16 * zij})`);
          g.addColorStop(1, "rgba(127,233,255,0)");
          c.fillStyle = g;
          c.fillRect(x, 0, 1, 520);
        }
      });
      /* Een zachte lichtring (flits en lichtgolf). */
      this.canvasPlaatje("holo-ring", 200, 200, (c) => {
        const g = c.createRadialGradient(100, 100, 62, 100, 100, 98);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.7, "rgba(210,250,255,0.8)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(100, 100, 98, 0, Math.PI * 2);
        c.fill();
      });
      /* Het lichtplekje op de vloer waar het hologram vandaan komt. */
      this.canvasPlaatje("holo-vloer", 260, 60, (c) => {
        const g = c.createRadialGradient(130, 30, 4, 130, 30, 128);
        g.addColorStop(0, "rgba(190,250,255,0.6)");
        g.addColorStop(1, "rgba(127,233,255,0)");
        c.fillStyle = g;
        c.save();
        c.scale(1, 0.23);
        c.beginPath();
        c.arc(130, 130, 128, 0, Math.PI * 2);
        c.fill();
        c.restore();
      });
      /* De selectiering: een smalle ring (kleur via tint). */
      this.canvasPlaatje("holo-selectie", 120, 120, (c) => {
        c.strokeStyle = "rgba(255,255,255,0.95)";
        c.lineWidth = 4;
        c.beginPath();
        c.arc(60, 60, 52, 0, Math.PI * 2);
        c.stroke();
      });
    }

    /**
     * Laat iets verschijnen alsof Bliepo het tevoorschijn tovert: een
     * lichtstraal schiet uit de vloer, er is een zachte flits en het voorwerp
     * groeit op zijn plek. Werkt op een plaatje of een groep (container).
     */
    tover(doel: import("phaser").GameObjects.Components.Transform & import("phaser").GameObjects.Components.AlphaSingle & { scaleX: number; scaleY: number }, opties: { x?: number; vertraging?: number } = {}) {
      const eindX = doel.scaleX;
      const eindY = doel.scaleY;
      if (this.rustig) return;
      const x = opties.x ?? doel.x;
      const wacht = opties.vertraging ?? 0;
      const vloer = this.plaats("holo-vloer", x, VLOER_Y).setAlpha(0);
      const straal = this.plaats("holo-straal", x, VLOER_Y).setOrigin(0.5, 1).setScale(1.4 / TX, 0);
      const flits = this.plaats("holo-ring", x, doel.y).setScale(0.2 / TX).setAlpha(0);
      doel.setAlpha(0);
      doel.setScale(eindX * 0.86, eindY * 0.2);
      this.tweens.add({ targets: vloer, alpha: 1, delay: wacht, duration: 120, yoyo: true, hold: 220, onComplete: () => vloer.destroy() });
      this.tweens.add({
        targets: straal,
        scaleY: 1.05 / TX,
        delay: wacht,
        duration: 170,
        ease: "Cubic.easeOut",
        onComplete: () => this.tweens.add({ targets: straal, alpha: 0, duration: 240, onComplete: () => straal.destroy() }),
      });
      this.tweens.add({ targets: doel, alpha: 1, scaleX: eindX, scaleY: eindY, delay: wacht + 110, duration: 220, ease: "Back.easeOut" });
      this.tweens.add({
        targets: flits,
        alpha: { from: this.gloed.flits * 0.8, to: 0 },
        scale: 2.4 / TX,
        delay: wacht + 140,
        duration: 340,
        ease: "Cubic.easeOut",
        onComplete: () => flits.destroy(),
      });
    }

    /** Een rustige lichtgolf (goed antwoord). */
    golf(x: number, y: number, kleur: number = GOED) {
      const golf = this.plaats("holo-ring", x, y).setScale(0.6 / TX).setTint(kleur);
      this.tweens.add({
        targets: golf,
        scale: 3 / TX,
        alpha: { from: this.gloed.flits, to: 0 },
        duration: this.rustig ? 1 : 520,
        ease: "Cubic.easeOut",
        onComplete: () => golf.destroy(),
      });
    }

    /** Zacht schudden (fout). */
    schud(doel: import("phaser").GameObjects.Components.Transform & import("phaser").GameObjects.Components.AlphaSingle) {
      if (this.rustig) return;
      const x = doel.x;
      this.tweens.add({ targets: doel, x: x + 10, duration: 55, yoyo: true, repeat: 3, onComplete: () => doel.setX(x) });
      this.tweens.add({ targets: doel, alpha: 0.6, duration: 110, yoyo: true });
    }

    /** Oplossen naar beneden en weg. */
    verdwijn(doel: import("phaser").GameObjects.GameObject & import("phaser").GameObjects.Components.Transform & import("phaser").GameObjects.Components.AlphaSingle, klaar?: () => void) {
      if (this.rustig) {
        doel.destroy();
        klaar?.();
        return;
      }
      this.tweens.add({
        targets: doel,
        alpha: 0,
        scaleY: 0.15 * ((doel as unknown as { scaleY: number }).scaleY || 1),
        y: doel.y + 40,
        duration: 220,
        ease: "Cubic.easeIn",
        onComplete: () => {
          doel.destroy();
          klaar?.();
        },
      });
    }

    /** Een smalle ring die zacht pulseert rond iets wat gekozen is. `straal` in punten. */
    selectieRing(x: number, y: number, straal: number, kleur: number = WARM) {
      const ring = this.plaats("holo-selectie", x, y).setTint(kleur).setScale((straal / 52) / TX);
      ring.setAlpha(0.55 + 0.35 * this.gloed.flits);
      if (!this.rustig) this.tweens.add({ targets: ring, scale: ((straal + 6) / 52) / TX, alpha: 0.35, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      return ring;
    }
  };
}
