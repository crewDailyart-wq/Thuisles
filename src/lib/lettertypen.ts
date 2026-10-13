/**
 * Het zakelijke lettertype (Inter) voor het beheer, het ouderdeel, het
 * inloggen en de openbare pagina's.
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
