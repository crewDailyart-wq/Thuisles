/**
 * Losse onderwerppagina — bestaat niet meer als eigen scherm.
 *
 * Onderwerp en oefeningen staan sinds de herindeling naast elkaar op de
 * domeinpagina. Deze route blijft bestaan omdat er nog naar gelinkt wordt
 * (het rekenpaneel op het startscherm, de blokken op het methodescherm, en
 * links die iemand ooit heeft bewaard) en stuurt door naar dezelfde inhoud op
 * de nieuwe plek, met dit onderwerp al geselecteerd.
 *
 * `redirect` en niet `notFound`: er is niets verdwenen, het staat ergens
 * anders. Een kind dat op een oude link klikt hoort gewoon te zien wat het
 * verwachtte.
 */

import { notFound, redirect } from "next/navigation";
import { haalDomein, haalVak } from "@/lib/data/queries";

export default async function OnderwerpPagina({
  params,
}: {
  params: Promise<{ vak: string; domein: string; subdomein: string }>;
}) {
  const { vak: vakSlug, domein: domeinSlug, subdomein: subSlug } = await params;

  const vak = await haalVak(vakSlug);
  const domein = await haalDomein(vakSlug, domeinSlug);
  if (!vak || !domein) notFound();

  redirect(`/oefenen/${vak.slug}/${domein.slug}?onderwerp=${subSlug}`);
}
