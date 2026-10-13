import { MERKNAAM } from "@/lib/merk";
import type { Metadata, Viewport } from "next";
import { Caveat, Figtree } from "next/font/google";
import "./globals.css";
import "./avontuur.css";

/*
  Eén lettertype voor de hele site (keuze van de eigenaar, oktober 2026):
  Figtree, strak en geometrisch. Vervangt Fredoka (titels) en Nunito (tekst)
  op de kinderkant, de homepagina, het ouderdeel en het inloggen. Het is een
  variabel lettertype: één bestand voor alle diktes van 300 tot 900.

  Het beheer houdt Inter (lib/lettertypen.ts); dat laadt alleen daar.
*/
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
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
      className={`${figtree.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col">{children}</body>
    </html>
  );
}
