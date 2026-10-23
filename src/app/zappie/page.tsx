import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { Startscherm, type Profiel } from "@/components/zappie/Startscherm";
import { huidigeOuder } from "@/lib/auth/sessie";
import { haalKinderen } from "@/lib/data/kinderen";

/**
 * De Zappie-startpagina. Alles wat er gebeurt, staat in `Startscherm`.
 *
 * Sinds 23 oktober 2026 (opdracht eigenaar) krijgt hij ook de kinderen van het
 * account mee, voor het scherm "Wie gaat er oefenen?" dat eerst verschijnt
 * als de site opent of ververst wordt. Lukt de database niet, dan zonder dat
 * scherm (zoals de naam rechtsboven in de layout).
 */
async function profielen(): Promise<Profiel[]> {
  await connection();
  try {
    const ouder = await huidigeOuder();
    return haalKinderen(ouder.id).map((k) => ({ id: k.id, naam: k.roepnaam, avatar: k.avatar, code: k.heeftKindcode }));
  } catch (fout) {
    unstable_rethrow(fout);
    console.warn("[zappie] geen profielen op te halen, verder zonder profielkeuze:", fout);
    return [];
  }
}

export default async function ZappieStart() {
  return <Startscherm profielen={await profielen()} />;
}
