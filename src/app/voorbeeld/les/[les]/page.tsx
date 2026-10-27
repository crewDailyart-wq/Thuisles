import { StijlVariabelen } from "@/components/StijlVariabelen";
import { MERKNAAM } from "@/lib/merk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Work_Sans } from "next/font/google";
import { zoekDraaiboek } from "@/components/les/lessen";
import { LesVoorbeeld } from "./LesVoorbeeld";
import { zoekLesregel } from "@/lib/lessen/catalogus";
import { lesAdres, zoekSeoLesOpId } from "@/lib/seo/lessen-groep3";

const letter = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "700", "800"], variable: "--font-les" });

/*
  Alleen onzichtbare dingen in de kop (LESSENPLAN.md § 6): een nette titel in
  het tabblad, noindex, en voor de lessen met een openbare pagina een canonical
  naar die pagina. Aan het scherm zelf verandert niets.
*/
export async function generateMetadata({ params }: { params: Promise<{ les: string }> }): Promise<Metadata> {
  const { les } = await params;
  const openbaar = zoekSeoLesOpId(les);
  const titel = openbaar?.titel ?? zoekLesregel(les)?.titel;
  return {
    title: titel ? `${titel} · ${MERKNAAM}` : `Les · ${MERKNAAM}`,
    robots: { index: false, follow: false },
    ...(openbaar ? { alternates: { canonical: lesAdres(openbaar) } } : {}),
  };
}

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
    /* De leestekst uit de stijlkiezer (/admin/stijl) geldt ook voor de les; zonder keuze blijft het Work Sans. */
    <div className={letter.variable} style={{ ["--font-les" as string]: `var(--stijl-lettertype, ${letter.style.fontFamily})` }}>
      <StijlVariabelen />
      <LesVoorbeeld id={les} naam={naam ?? ""} />
    </div>
  );
}
