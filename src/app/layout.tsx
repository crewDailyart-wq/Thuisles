import { MERKNAAM } from "@/lib/merk";
import type { Metadata, Viewport } from "next";
import { Architects_Daughter, Caveat, Fredoka, Grandstander, Lexend } from "next/font/google";
import "./globals.css";
import "./avontuur.css";

/*
  Lettertypes, keuze van de eigenaar (oktober 2026), voor de kinderkant, de
  oefeningen, de homepagina en scholenkaart, het ouderdeel en het inloggen:

  - Lexend voor lopende tekst en vragen: ontworpen voor vlot lezen, veel
    gebruikt in het onderwijs. Variabel lettertype: één bestand voor alle
    diktes van 100 tot 900.
  - Fredoka voor titels, koppen, namen op tegels en knoppen.

  Het beheer houdt Inter (lib/lettertypen.ts); dat laadt alleen daar.
*/
const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

/** Titels en koppen: dik, rond en speels. */
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  /*
    700 voor titels; 400 tot 600 sinds 16 oktober 2026 ook voor de lopende
    tekst op de Zappie-schermen (keuze eigenaar).
  */
  weight: ["400", "500", "600", "700"],
});

/**
 * Grandstander (16 oktober 2026, keuze eigenaar): speels en herkenbaar, gemaakt
 * voor kindermedia. Staat vóór Fredoka op alle plekken waar Fredoka stond;
 * Fredoka blijft als reserve geladen. Variabel lettertype: alle diktes in één bestand.
 */
const grandstander = Grandstander({
  variable: "--font-grandstander",
  subsets: ["latin"],
});

/**
 * Tesla's handschrift op de bouwtekening (proef ?achtergrond=bouwtekening):
 * blokletters zoals een architect ze schrijft. Niet vooraf geladen, zodat de
 * andere pagina's er niets van merken.
 */
const architect = Architects_Daughter({
  variable: "--font-architect",
  subsets: ["latin"],
  weight: ["400"],
  preload: false,
});

/** Avontuurstijl: handschrift voor kleine zinnetjes. */
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  title: `${MERKNAAM}`,
  description: "Oefenen met rekenen, in je eigen tempo.",
};

export const viewport: Viewport = {
  themeColor: "#fbf6ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${lexend.variable} ${fredoka.variable} ${grandstander.variable} ${architect.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col">{children}</body>
    </html>
  );
}
