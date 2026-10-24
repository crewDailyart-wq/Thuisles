import { StijlVariabelen } from "@/components/StijlVariabelen";
import { MERKNAAM } from "@/lib/merk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Work_Sans } from "next/font/google";
import { zoekDraaiboek } from "@/components/les/lessen";
import { LesVoorbeeld } from "./LesVoorbeeld";

const letter = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "700", "800"], variable: "--font-les" });

export const metadata: Metadata = { title: `Les · ${MERKNAAM}`, robots: { index: false, follow: false } };

/** Los voorbeeld van een uitleg-les. Schrijft niets naar de database. */
export default async function Pagina({
  params,
  searchParams,
}: {
  params: Promise<{ les: string }>;
  searchParams: Promise<{ naam?: string }>;
}) {
  const { les } = await params;
  const { naam } = await searchParams;
  if (!zoekDraaiboek(les)) notFound();
  return (
    <div className={letter.variable}>
      <StijlVariabelen />
      <LesVoorbeeld id={les} naam={naam ?? ""} />
    </div>
  );
}
