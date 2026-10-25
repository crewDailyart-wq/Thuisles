/**
 * De lettertypes van de kinderkant (oktober 2026, keuze eigenaar), en sinds 26
 * oktober 2026 ook de lettertypes die in de stijlkiezer (/admin/stijl) te
 * kiezen zijn.
 *
 * - Lexend voor lopende tekst en vragen: ontworpen voor vlot lezen, veel
 *   gebruikt in het onderwijs. Variabel lettertype: één bestand voor alle
 *   diktes van 100 tot 900.
 * - Fredoka voor titels, koppen, namen op tegels en knoppen.
 * - Grandstander (16 oktober 2026, keuze eigenaar): speels en herkenbaar,
 *   gemaakt voor kindermedia. Staat vóór Fredoka op alle plekken waar Fredoka
 *   stond; Fredoka blijft als reserve geladen.
 *
 * De lettertypes uit de stijlkiezer laden niet vooraf (preload: false): een
 * browser haalt er pas een op als de gekozen stijl hem gebruikt. De namen
 * waaronder ze laden staan in lib/stijl.ts (LETTERTYPES).
 */

import { Andika, Atkinson_Hyperlegible_Next, Baloo_2, Comic_Neue, Fredoka, Grandstander, Lexend, Mali, Nunito, Playpen_Sans, Quicksand, Sour_Gummy } from "next/font/google";

export const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

/** Titels en koppen: dik, rond en speels. */
export const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  /*
    700 voor titels; 400 tot 600 sinds 16 oktober 2026 ook voor de lopende
    tekst op de Zappie-schermen (keuze eigenaar).
  */
  weight: ["400", "500", "600", "700"],
});

export const grandstander = Grandstander({
  variable: "--font-grandstander",
  subsets: ["latin"],
});

/* De keuzes uit de stijlkiezer. */
const andika = Andika({ subsets: ["latin"], weight: ["400", "700"], preload: false });
const playpen = Playpen_Sans({ subsets: ["latin"], preload: false });
const quicksand = Quicksand({ subsets: ["latin"], preload: false });
const comic = Comic_Neue({ subsets: ["latin"], weight: ["400", "700"], preload: false });
const sourgummy = Sour_Gummy({ subsets: ["latin"], preload: false });
const mali = Mali({ subsets: ["latin"], weight: ["400", "500", "600", "700"], preload: false });
const nunito = Nunito({ subsets: ["latin"], preload: false });
const baloo = Baloo_2({ subsets: ["latin"], preload: false });
const atkinson = Atkinson_Hyperlegible_Next({ subsets: ["latin"], preload: false });

/**
 * De klassen voor <html>: de drie vaste lettertypes zetten hun variabele, de
 * keuzes uit de stijlkiezer zorgen alleen dat hun @font-face op de pagina staat.
 */
export const KIND_LETTERS = [lexend.variable, fredoka.variable, grandstander.variable].join(" ");
export const KEUZE_LETTERS = [andika, playpen, quicksand, comic, sourgummy, mali, nunito, baloo, atkinson].map((f) => f.style.fontFamily);
