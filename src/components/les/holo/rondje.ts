/**
 * Het rode rondje (Sara, 6 november 2026): wat Bliepo aanwijst, noemt of telt krijgt een
 * met de hand getekend rood rondje, in plaats van op te lichten. Het plaatje is het dubbele
 * rondje uit Magnific (`public/rondje/rondje-rood-2.png`, achtergrond weggehaald). Goed (groen)
 * en fout (rood) houden hun gloed; dit gaat alleen over "kijk hier".
 *
 * Gebruik in een Phaser-scène:
 *   rondjes = maakRondjes(this, houder, rustig);          // houder: de container waar het rondje in komt
 *   rondjes.zet(new Map([["munten", { x, y, b, h }]]));   // x, y = midden, b, h = het ding zelf (in de coördinaten van de houder)
 *   rondjes.zet(new Map());                                // alles weg
 * `zet` mag bij elke staatsverandering opnieuw worden aangeroepen: een rondje dat er al staat blijft
 * staan (geen nieuw getekend rondje, geen nieuwe animatie); wat niet meer in de lijst staat verdwijnt.
 * Het plaatje wordt één keer geladen en één keer als textuur gezet; per beeld wordt niets gemaakt.
 */

type Phaser = typeof import("phaser");
type SceneLos = import("phaser").Scene;
type Plaatje = import("phaser").GameObjects.Image;
type Houder = import("phaser").GameObjects.Container;

export type RondjeVak = { x: number; y: number; b: number; h: number };

const SLEUTEL = "holo-rondje-2";
const URL = "/rondje/rondje-rood-2.png";

/** Het plaatje is één keer geladen voor de hele pagina (de scènes komen en gaan). */
let geladen: HTMLImageElement | null = null;
let laadt: Promise<void> | null = null;
/** Het laden is mislukt: dan tekenen we geen rondje en proberen we het niet eindeloos opnieuw. */
let mislukt = false;
function laad(): Promise<void> {
  if (geladen || mislukt) return Promise.resolve();
  if (!laadt) {
    const img = new Image();
    img.src = URL;
    laadt = img
      .decode()
      .then(() => void (geladen = img))
      .catch(() => {
        mislukt = true;
        console.error("[rondje] rondje-rood-2.png laadt niet");
      });
  }
  return laadt;
}

export function maakRondjes(scene: SceneLos, houder: Houder, rustig: boolean) {
  const staan = new Map<string, Plaatje>();
  let laatste = new Map<string, RondjeVak>();

  const textuur = (): string | null => {
    if (scene.textures.exists(SLEUTEL)) return SLEUTEL;
    if (geladen) {
      scene.textures.addImage(SLEUTEL, geladen);
      return SLEUTEL;
    }
    if (!mislukt) {
      void laad().then(() => {
        /* Alleen opnieuw tekenen als het plaatje er nu is (anders zou dit eindeloos doorlopen). */
        if (geladen && scene.sys?.isActive()) zet(laatste);
      });
    }
    return null;
  };

  /** Hoe groot het rondje is om een ding van b × h: ruim eromheen, ook om iets langs en smal. */
  const maat = (v: RondjeVak) => ({ b: v.b * 1.15 + 44, h: v.h * 1.4 + 50 });

  function zet(wens: Map<string, RondjeVak>) {
    laatste = wens;
    for (const [sl, im] of staan) {
      if (wens.has(sl) && im.active) continue;
      im.destroy();
      staan.delete(sl);
    }
    if (!wens.size) return;
    const tex = textuur();
    if (!tex) return;
    for (const [sl, v] of wens) {
      if (staan.has(sl)) continue;
      const m = maat(v);
      const im = scene.add.image(v.x, v.y, tex).setDisplaySize(m.b, m.h);
      /* Elk rondje staat een heel klein beetje scheef, maar steeds dezelfde kant op voor dezelfde sleutel. */
      im.setAngle((([...sl].reduce((a, c) => a + c.charCodeAt(0), 0) * 37) % 50) / 10 - 2.5);
      houder.add(im);
      staan.set(sl, im);
      if (rustig) continue;
      const sx = im.scaleX;
      const sy = im.scaleY;
      im.setAlpha(0);
      scene.tweens.add({ targets: im, alpha: 1, scaleX: { from: sx * 0.9, to: sx }, scaleY: { from: sy * 0.9, to: sy }, duration: 240, ease: "Back.easeOut" });
    }
  }

  void laad();
  return {
    zet,
    /** De houder is weg of opnieuw gemaakt (nieuw beeld): vergeet alles. */
    vergeet() {
      for (const im of staan.values()) im.destroy();
      staan.clear();
      laatste = new Map();
    },
  };
}

/** Het vierkant om een aantal plaatjes (gemeten in de coördinaten van hun houder), of null. */
export function vakOm(plaatjes: { x: number; y: number; displayWidth: number; displayHeight: number; active?: boolean; visible?: boolean }[]): RondjeVak | null {
  const lijst = plaatjes.filter((p) => p.active !== false && p.visible !== false);
  if (!lijst.length) return null;
  const x0 = Math.min(...lijst.map((p) => p.x - p.displayWidth / 2));
  const x1 = Math.max(...lijst.map((p) => p.x + p.displayWidth / 2));
  const y0 = Math.min(...lijst.map((p) => p.y - p.displayHeight / 2));
  const y1 = Math.max(...lijst.map((p) => p.y + p.displayHeight / 2));
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, b: x1 - x0, h: y1 - y0 };
}

export type { Phaser };
