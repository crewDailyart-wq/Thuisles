import { StijlVariabelen } from "@/components/StijlVariabelen";
import { MERKNAAM } from "@/lib/merk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Work_Sans, Figtree } from "next/font/google";
import "./letterproef.css";
import { zoekDraaiboek } from "@/components/les/lessen";
import { LesVoorbeeld } from "./LesVoorbeeld";
import { LESCATALOGUS, zoekLesregel } from "@/lib/lessen/catalogus";
import { lesAdres, zoekSeoLesOpId } from "@/lib/seo/lessen-groep3";
import { lesbeheerActief } from "@/lib/lessen/lokaal-beheer";

const letter = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "700", "800"], variable: "--font-les" });

/*
  Letterproef (2 november 2026): Synthesis gebruikt Work Sans. Wij proberen voor
  de lessen in LETTERPROEF_LESSEN bewust een ander, vrij lettertype dat er dicht
  bij zit: Figtree (SIL OFL 1.1, Google Fonts). Alle andere lessen blijven
  precies zoals ze waren tot Sara akkoord geeft. Zie letterproef.css.
*/
const LETTERPROEF_LESSEN = ["squla-tellen-fruit-1"];
const proefLetter = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-figtree" });

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
  searchParams: Promise<{ naam?: string; uitleg?: string; beheer?: string; snel?: string }>;
}) {
  const { les } = await params;
  const { naam, uitleg, beheer, snel } = await searchParams;
  /*
    Proef eindscherm (24 nov 2026; EINDSCHERM-ONTWERP.md): "Volgende les" gaat naar de volgende gouden les in de volgorde van
    de lescatalogus (er is nog geen apart lesplan); "Terug" en "geen volgende" gaan naar het lesoverzicht. `&snel=1`
    (of alles/moeite) laat meteen het eindscherm zien, alleen hier op de voorbeeldpagina.
  */
  const plek = LESCATALOGUS.findIndex((r) => r.id === les);
  const volgende = plek >= 0 ? LESCATALOGUS.slice(plek + 1).find((r) => /-gouden(-|$)/.test(r.id)) : undefined;
  const naamDeel = naam ? `?naam=${encodeURIComponent(naam)}` : "";
  const volgendeHref = volgende ? `/voorbeeld/les/${volgende.id}${naamDeel}` : undefined;
  const snelEinde = snel === "alles" || snel === "moeite" ? snel : snel ? ("gewoon" as const) : undefined;
  const bewerken = beheer === "1" && await lesbeheerActief();
  if (!zoekDraaiboek(les)) notFound();
  /* Sara heeft Figtree goedgekeurd (3 november 2026): alle nieuwe lessen (alle draaiboeken op deze pagina) gebruiken het. LETTERPROEF_LESSEN blijft staan als de oude proeflijst. */
  const proef = true || LETTERPROEF_LESSEN.includes(les);
  return (
    /* De leestekst uit de stijlkiezer (/admin/stijl) geldt ook voor de les; zonder keuze blijft het Work Sans. */
    <div className={proef ? `${letter.variable} ${proefLetter.variable}` : letter.variable} data-lettertype={proef ? "figtree" : undefined} style={{ ["--font-les" as string]: `var(--stijl-lettertype, ${letter.style.fontFamily})` }}>
      <StijlVariabelen />
      <LesVoorbeeld id={les} naam={naam ?? ""} uitleg={process.env.NODE_ENV !== "production" && uitleg === "nee"} bewerken={bewerken} volgendeHref={volgendeHref} overzichtHref="/alle-lessen.html" snelEinde={snelEinde} />
    </div>
  );
}
