import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Figtree } from "next/font/google";
import { GeldConcept } from "./GeldConcept";

const letter = Figtree({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Concept · Munten en briefjes · Bliepo",
  robots: { index: false, follow: false },
};

/** Los ontwerpvoorbeeld. Geen lesvoortgang of wijzigingen aan de bestaande les. */
export default function Pagina() {
  if (process.env.NODE_ENV === "production") notFound();
  return <div className={letter.className}><GeldConcept /></div>;
}
