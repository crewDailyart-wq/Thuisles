import { MERKNAAM } from "@/lib/merk";
import type { Metadata, Viewport } from "next";
import { Caveat, Fredoka, Inter, Nunito } from "next/font/google";
import "./globals.css";
import "./avontuur.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

/** Alleen voor de beheeromgeving: rustiger en compacter dan Nunito. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Avontuurstijl: dikke, ronde letters voor titels en tegels. */
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  /* alleen de dikte die gebruikt wordt: scheelt laadtijd op een trage verbinding */
  weight: ["700"],
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
      className={`${nunito.variable} ${inter.variable} ${fredoka.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col">{children}</body>
    </html>
  );
}
