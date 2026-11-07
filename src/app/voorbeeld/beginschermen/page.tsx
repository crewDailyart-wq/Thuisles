import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LESCATALOGUS } from "@/lib/lessen/catalogus";
import { leesControle } from "./bewaren";
import { Beginschermen } from "./Beginschermen";
import { lesbeheerActief, lokaleLaptop } from "@/lib/lessen/lokaal-beheer";
import { cijfersInTekst } from "@/lib/lessen/cijfertaal";

export const metadata: Metadata = {
  title: "Beginschermen controleren · Thuisles",
  robots: { index: false, follow: false },
};

export default async function Pagina({ searchParams }: { searchParams: Promise<{ zoek?: string; onderwerp?: string; les?: string; opnieuw?: string; stap?: string; melding?: string; veld?: string }> }) {
  const selectie = await searchParams;
  if (process.env.NODE_ENV === "production") notFound();
  const [beheer, laptop] = await Promise.all([lesbeheerActief(), lokaleLaptop()]);
  const controle = leesControle();
  const lessen = LESCATALOGUS.flatMap((les) => {
    const zinnen = controle.zinnen[les.id];
    return les.id.startsWith("squla-") && zinnen
      ? [{ id: les.id, titel: les.titel, onderwerp: les.synthesis.split(" · ")[1] ?? "Overig", zin1: cijfersInTekst(zinnen.zin1), zin2: cijfersInTekst(zinnen.zin2), wens: controle.wensen[les.id]?.tekst ?? "" }]
      : [];
  });
  return <Beginschermen lessen={lessen} zoek={selectie.zoek} onderwerp={selectie.onderwerp} open={selectie.les} herhaling={selectie.opnieuw} stap={selectie.stap === "nee" ? "nee" : "begin"} melding={selectie.melding} veld={selectie.veld} beheer={beheer} laptop={laptop} />;
}
