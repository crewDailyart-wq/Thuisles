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

/** Tekent het voorwerp passend (zonder vervormen) en gecentreerd in het vak x, y, b, h. */
export function tekenVoorwerp(c: CanvasRenderingContext2D, naam: string, x: number, y: number, b: number, h: number) {
  const img = voorwerpBeeld(naam);
  const f = Math.min(b / img.naturalWidth, h / img.naturalHeight);
  const w = img.naturalWidth * f;
  const hh = img.naturalHeight * f;
  c.drawImage(img, x + (b - w) / 2, y + (h - hh) / 2, w, hh);
}

/** Phaser: de sleutel van een textuur met dit plaatje (één keer toegevoegd per scène). */
export function voorwerpTextuur(scene: { textures: { exists(k: string): boolean; addImage(k: string, i: HTMLImageElement): unknown } }, naam: string): string {
  const sleutel = `vw-${naam}`;
  if (!scene.textures.exists(sleutel)) scene.textures.addImage(sleutel, voorwerpBeeld(naam));
  return sleutel;
}
