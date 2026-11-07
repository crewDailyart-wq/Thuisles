/**
 * Laden en tekenen van de vaste plaatjes uit public/voorwerpen (zie
 * src/lib/voorwerpen/soort.ts en WISSELEN.md).
 *
 * Een les zet in zijn draaiboek welke voorwerpen hij gebruikt
 * (`voorwerpen: ["appel", "bal-rood"]`). Het lesscherm laadt die allemaal
 * vóórdat de les begint, zodat een vlak ze daarna meteen kan tekenen
 * (`voorwerpBeeld`, `tekenVoorwerp`, `voorwerpTextuur`). Een voorwerp dat
 * niet in die lijst staat, geeft een duidelijke fout: dan klopt de lijst niet.
 */
import status from "@/lib/voorwerpen/status.json";
import { VOORWERPEN } from "@/lib/voorwerpen";

/**
 * Mag dit voorwerp helemaal in de kleur van zijn getal (Sara, 1 november 2026)?
 * Ja bij speelgoed en dingen; nee bij fruit en eten (een blauwe appel klopt niet):
 * daar blijft de echte kleur en kiest de les een getalkleur die bij het fruit past.
 */
const ETEN = new Set(VOORWERPEN.filter((v) => v.groep === "fruit" || v.groep === "eten").map((v) => v.naam));
export const voorwerpKleurbaar = (naam: string) => !ETEN.has(naam);

type Status = Record<string, { bron: "placeholder" | "eigen"; v: number }>;

const geladen = new Map<string, HTMLImageElement>();
const bezig = new Map<string, Promise<void>>();

/** Het adres van het plaatje, met het versienummer erachter zodat een vervangen plaatje niet uit de cache komt. */
export function voorwerpUrl(naam: string): string {
  const v = (status as Status)[naam]?.v ?? 0;
  return `/voorwerpen/${naam}.png${v ? `?v=${v}` : ""}`;
}

/** Laadt de plaatjes (één keer per naam). Een plaatje dat niet laadt, meldt een fout maar houdt de les niet tegen. */
export function laadVoorwerpen(namen: readonly string[] = []): Promise<void> {
  return Promise.all(
    [...new Set(namen)].map((naam) => {
      if (geladen.has(naam)) return;
      if (!bezig.has(naam)) {
        const img = new Image();
        img.src = voorwerpUrl(naam);
        bezig.set(
          naam,
          img
            .decode()
            .then(() => void geladen.set(naam, img))
            .catch(() => console.error(`[voorwerpen] ${naam}.png laadt niet`)),
        );
      }
      return bezig.get(naam);
    }),
  ).then(() => undefined);
}

/** Het geladen plaatje. Fout als de les dit voorwerp niet in zijn lijst `voorwerpen` heeft staan. */
export function voorwerpBeeld(naam: string): HTMLImageElement {
  const img = geladen.get(naam);
  if (!img) throw new Error(`Voorwerp "${naam}" is niet geladen: zet het in "voorwerpen" van de les.`);
  return img;
}

/*
 * Glansstijl B (Sara, 1 november 2026: "ik vind de glans perfect", "ik vind B
 * beter"): over elk plaatje een zacht kleurverloop met een glimmend
 * lichtvlekje, een zachte schaduw eronder en een zachte vaste gloed in de
 * eigen kleur. Eén keer per plaatje uitgerekend (canvas in een cache), dus
 * geen kosten per beeld (regel 7). Even groot als het plaatje zelf: alles
 * past in de lege rand die elk plaatje al heeft, dus wat een les IN een
 * plaatje tekent (pakjes in de bus, het klokje op het scherm) blijft precies
 * op zijn plek. Het voorwerp blijft vol en stevig: alleen de rand eromheen
 * gloeit, er wordt niets doorzichtig.
 */
const glansCache = new Map<string, HTMLCanvasElement>();

function glansBeeld(naam: string): HTMLCanvasElement | HTMLImageElement {
  const klaar = glansCache.get(naam);
  if (klaar) return klaar;
  const img = voorwerpBeeld(naam);
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const doek = document.createElement("canvas");
  doek.width = W;
  doek.height = H;
  const c = doek.getContext("2d");
  if (!c) return img;
  /* het voorwerp zelf: waar staat het, en wat is zijn kleur gemiddeld? */
  c.drawImage(img, 0, 0);
  let data: Uint8ClampedArray;
  try {
    data = c.getImageData(0, 0, W, H).data;
  } catch {
    return img;
  }
  let x0 = W, y0 = H, x1 = 0, y1 = 0, r = 0, g = 0, b = 0, n = 0;
  for (let y = 0; y < H; y += 2)
    for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 4;
      if (data[i + 3] < 128) continue;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
  if (!n) return img;
  const bw = x1 - x0, bh = y1 - y0;
  const kleur = (f: number, a: number) => `rgba(${[r, g, b].map((v) => Math.round(v / n + (255 - v / n) * f)).join(",")},${a})`;
  c.clearRect(0, 0, W, H);
  const marge = Math.max(4, Math.min(x0, y0, W - x1, H - y1));
  /* zachte schaduw eronder, binnen de lege rand */
  c.save();
  const sy = Math.min(H - marge * 0.45, y1 + marge * 0.35);
  c.translate(x0 + bw / 2, sy);
  c.scale(1, 0.14);
  const sch = c.createRadialGradient(0, 0, 0, 0, 0, bw * 0.42);
  sch.addColorStop(0, "rgba(0,0,20,0.4)");
  sch.addColorStop(1, "rgba(0,0,20,0)");
  c.fillStyle = sch;
  c.beginPath();
  c.arc(0, 0, bw * 0.42, 0, Math.PI * 2);
  c.fill();
  c.restore();
  /* zachte vaste gloed in de eigen kleur */
  c.save();
  c.shadowColor = kleur(0.3, 0.9);
  c.shadowBlur = marge * 0.8;
  c.drawImage(img, 0, 0);
  c.drawImage(img, 0, 0);
  c.restore();
  /* het plaatje zelf, vol, met glans en verloop alleen op het voorwerp (source-atop): licht linksboven, iets donkerder rechtsonder */
  const laag = document.createElement("canvas");
  laag.width = W;
  laag.height = H;
  const l = laag.getContext("2d");
  if (!l) return img;
  l.drawImage(img, 0, 0);
  l.globalCompositeOperation = "source-atop";
  const verloop = l.createLinearGradient(x0, y0, x1, y1);
  verloop.addColorStop(0, "rgba(255,255,255,0.18)");
  verloop.addColorStop(0.5, "rgba(255,255,255,0)");
  verloop.addColorStop(1, "rgba(0,0,30,0.18)");
  l.fillStyle = verloop;
  l.fillRect(0, 0, W, H);
  const lx = x0 + bw * 0.3, ly = y0 + bh * 0.24, lr = Math.min(bw, bh) * 0.16;
  const vlek = l.createRadialGradient(lx, ly, 0, lx, ly, lr);
  vlek.addColorStop(0, "rgba(255,255,255,0.45)");
  vlek.addColorStop(0.4, "rgba(255,255,255,0.2)");
  vlek.addColorStop(1, "rgba(255,255,255,0)");
  l.fillStyle = vlek;
  l.fillRect(0, 0, W, H);
  c.drawImage(laag, 0, 0);
  glansCache.set(naam, doek);
  return doek;
}

/** Tekent het voorwerp passend (zonder vervormen) en gecentreerd in het vak x, y, b, h, in glansstijl B. */
export function tekenVoorwerp(c: CanvasRenderingContext2D, naam: string, x: number, y: number, b: number, h: number) {
  const img = voorwerpBeeld(naam);
  const f = Math.min(b / img.naturalWidth, h / img.naturalHeight);
  const w = img.naturalWidth * f;
  const hh = img.naturalHeight * f;
  c.drawImage(glansBeeld(naam), x + (b - w) / 2, y + (h - hh) / 2, w, hh);
}

/** Een horizontaal stuk van het plaatje (van `van` tot `tot`, als deel van de hoogte), op breedte `b` getekend op (0, 0). Voor een deksel dat los van de kist beweegt. */
export function tekenVoorwerpStuk(c: CanvasRenderingContext2D, naam: string, van: number, tot: number, b: number) {
  const img = voorwerpBeeld(naam);
  const bron = glansBeeld(naam);
  const sy = van * img.naturalHeight;
  const sh = (tot - van) * img.naturalHeight;
  c.drawImage(bron, 0, sy, img.naturalWidth, sh, 0, 0, b, (sh * b) / img.naturalWidth);
}

/** Een rechthoek uit het plaatje (in pixels van het plaatje zelf) getekend op (dx, dy) met maat (dw, dh). */
export function tekenVoorwerpRechthoek(c: CanvasRenderingContext2D, naam: string, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) {
  c.drawImage(glansBeeld(naam), sx, sy, sw, sh, dx, dy, dw, dh);
}

/** Phaser: de sleutel van een textuur met dit plaatje (één keer toegevoegd per scène). */
export function voorwerpTextuur(scene: { textures: { exists(k: string): boolean; addImage(k: string, i: HTMLImageElement): unknown; addCanvas(k: string, c: HTMLCanvasElement): unknown } }, naam: string): string {
  const sleutel = `vw-${naam}`;
  if (!scene.textures.exists(sleutel)) {
    const beeld = glansBeeld(naam);
    if (beeld instanceof HTMLCanvasElement) scene.textures.addCanvas(sleutel, beeld);
    else scene.textures.addImage(sleutel, beeld);
  }
  return sleutel;
}
