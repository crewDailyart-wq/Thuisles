/**
 * Het hulphandje van de gouden lessen (Sara, 17 november 2026): een witte hand met een wijsvinger, gemaakt in Magnific
 * (public/hulphand/hulphand-wijs.png, 432 x 480, transparante achtergrond). Alle gouden lessen gebruiken dit plaatje voor
 * een hand die naar iets wijst; geen eigen getekende handen meer.
 *
 * Phaser-vlakken: laad het plaatje met `laadHulphand()` (1 keer voor de hele pagina), zet het met
 * `scene.textures.addImage(HULPHAND_SLEUTEL, img)` in de scène en gebruik `HULPHAND_ANKER` (de vingertop) als origin en
 * `HULPHAND_SCHAAL` (punten per beeldpunt, hand ± 65 punten hoog) als schaal. De hand wijst zelf al schuin omhoog naar
 * links: geen draaiing nodig.
 * DOM-vlakken: gebruik `HULPHAND_URL` in een <img> en zet de vingertop op het doel (ankerpunt in procenten:
 * HULPHAND_ANKER).
 * Mislukt het laden, dan blijft de oude getekende hand van die les staan (reserve).
 */
export const HULPHAND_URL = "/hulphand/hulphand-wijs.png";
export const HULPHAND_SLEUTEL = "hulphand-magnific";
/** De vingertop als deel van de breedte en hoogte van het plaatje. */
export const HULPHAND_ANKER = { x: 0.14, y: 0.05 } as const;
/** Grootte in punten van het vlak per beeldpunt (432 x 480 beeldpunten geeft een hand van ± 58 x 65 punten). */
export const HULPHAND_SCHAAL = 0.135;

let geladen: Promise<HTMLImageElement | null> | null = null;
export function laadHulphand(): Promise<HTMLImageElement | null> {
  if (!geladen) {
    const img = new Image();
    img.src = HULPHAND_URL;
    geladen = img.decode().then(
      () => img,
      () => null,
    );
  }
  return geladen;
}
