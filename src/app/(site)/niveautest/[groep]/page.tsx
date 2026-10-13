/**
 * De niveautest voor één groep.
 *
 * Bij elk bezoek een nieuwe greep uit de vragen van de toets die in beheer is
 * samengesteld (`stelToetsSamen`). Heeft deze groep geen toets, dan bestaat de
 * pagina niet. Niet in Google: de vragen wisselen per keer, de pagina
 * /niveautest is het adres om te vinden.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Toetsspeler } from "@/components/site/Toetsspeler";
import { stelToetsSamen, TOETSGROEPEN } from "@/lib/data/niveautest";
import { NIET_INDEXEREN } from "@/lib/seo";

export const dynamic = "force-dynamic";

function leesGroep(tekst: string): number | null {
  const groep = Number(tekst);
  return (TOETSGROEPEN as readonly number[]).includes(groep) && String(groep) === tekst ? groep : null;
}

export async function generateMetadata({ params }: PageProps<"/niveautest/[groep]">): Promise<Metadata> {
  const { groep } = await params;
  return {
    title: leesGroep(groep) ? `Niveautest groep ${groep}` : "Niveautest",
    robots: NIET_INDEXEREN,
  };
}

export default async function NiveautestGroep({ params }: PageProps<"/niveautest/[groep]">) {
  const groep = leesGroep((await params).groep);
  if (groep === null) notFound();

  let toets: ReturnType<typeof stelToetsSamen> = null;
  try {
    toets = stelToetsSamen(groep);
  } catch {
    toets = null;
  }
  if (!toets) notFound();

  return (
    <section className="st-sectie st-nt-sectie" aria-label={`Niveautest groep ${groep}`}>
      <div className="st-binnen st-nt-binnen">
        <Toetsspeler toets={toets} />
      </div>
    </section>
  );
}
