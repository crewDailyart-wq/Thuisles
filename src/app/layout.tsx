import { MERKNAAM } from "@/lib/merk";
import type { Metadata, Viewport } from "next";
import { Architects_Daughter, Caveat } from "next/font/google";
import { KIND_LETTERS } from "@/lib/lettertypen-kind";
import "./globals.css";
import "./avontuur.css";

/*
  Lettertypes, keuze van de eigenaar (oktober 2026), voor de kinderkant, de
  oefeningen, de homepagina en scholenkaart, het ouderdeel en het inloggen:
  Lexend voor tekst, Grandstander en Fredoka voor titels. Ze staan sinds 26
  oktober 2026 in lib/lettertypen-kind.ts, samen met de lettertypes die in de
  stijlkiezer (/admin/stijl) te kiezen zijn.

  Het beheer houdt Inter (lib/lettertypen.ts); dat laadt alleen daar.
*/

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
      className={`${KIND_LETTERS} ${architect.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col">{children}</body>
    </html>
  );
}
