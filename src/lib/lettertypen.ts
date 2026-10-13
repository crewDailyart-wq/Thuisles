/**
 * Het zakelijke lettertype (Inter) voor het beheer.
 *
 * Het ouderdeel, het inloggen en de openbare pagina's gebruikten dit ook, maar
 * zijn in oktober 2026 op verzoek van de eigenaar overgegaan op de lettertypes
 * van de rest van de site: Lexend voor tekst en Fredoka voor titels
 * (app/layout.tsx).
 *
 * Staat bewust niet in de hoofdlayout: dan laadde elk kind het ook, terwijl
 * de kinderkant het nergens gebruikt. Nu laadt het alleen op de schermen
 * waarvan de layout `zakelijk.variable` op de buitenste laag zet.
 */

import { Inter } from "next/font/google";

export const zakelijk = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
