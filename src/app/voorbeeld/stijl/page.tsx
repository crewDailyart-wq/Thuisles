import type { Metadata } from "next";
import { StijlVariabelen } from "@/components/StijlVariabelen";
import { MERKNAAM } from "@/lib/merk";
import { StijlVoorbeeld } from "./StijlVoorbeeld";

export const metadata: Metadata = { title: `Voorbeeld opdracht · ${MERKNAAM}`, robots: { index: false, follow: false } };

/**
 * Een opdrachtscherm met de echte onderdelen (26 oktober 2026): de bovenbalk,
 * het bord, de antwoordknoppen, Controleer, en Bliepo op de cirkel met zijn
 * tekst en de praatknop (het gedeelde onderdeel BliepoVloer). Schrijft niets
 * naar de database.
 *
 * Twee doelen:
 * - het voorbeeld rechts in de stijlkiezer (/admin/stijl), die de stijl
 *   hierheen stuurt zolang je kiest;
 * - de automatische controle (scripts/bliepocontrole.mjs), met
 *   ?opdracht=lang (een hoog bord), ?tekst=lang (een lange zin van Bliepo) en
 *   ?ronde=godot (zoals een opdracht met een Godot-spel, zoals de instaptoets,
 *   met het oude donkere thema erbij: dat zette Bliepo achter de bovenbalk).
 */
export default async function Pagina({ searchParams }: { searchParams: Promise<{ opdracht?: string; tekst?: string; fase?: string; ronde?: string }> }) {
  const { opdracht, tekst, fase, ronde } = await searchParams;
  return (
    <>
      <StijlVariabelen />
      <StijlVoorbeeld lang={opdracht === "lang"} langeTekst={tekst === "lang"} fase={fase === "goed" || fase === "fout" ? fase : "bezig"} godot={ronde === "godot"} />
    </>
  );
}
