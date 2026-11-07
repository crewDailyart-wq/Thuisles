import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Figtree } from "next/font/google";
import { StijlVariabelen } from "@/components/StijlVariabelen";
import "../les/[les]/letterproef.css";
import { GeldMuntenConcept } from "./GeldMuntenConcept";

const letter = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: "Concept · Getekende munten",
  robots: { index: false, follow: false },
};

export default function Pagina() {
  if (process.env.NODE_ENV === "production") notFound();
  return <div className={letter.variable} data-lettertype="figtree"><StijlVariabelen /><GeldMuntenConcept /></div>;
}
