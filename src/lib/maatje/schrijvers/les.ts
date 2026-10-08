/**
 * Het maatje bij een uitleg-les (oktober 2026, zie `lib/lessen`).
 *
 * De les zelf heeft per stap al alles: de vraag, wat er bij goed en fout
 * gezegd wordt, en een kleine hint. Het maatje leest de vraag voor (de uitleg
 * van de stap gaat ervoor, zie OefenSpeler) en gebruikt die zinnen. Er zijn
 * geen herkende denkfouten: na een fout laat het spel de goede manier zien.
 */

import { maak, zin } from "@/lib/maatje/bouw";
import type { Geschreven } from "@/lib/maatje/types";
import type { Opgave } from "@/lib/maatje/schrijf";

const getallen = (tekst: string) => (tekst.match(/\d+/g) ?? []).map(Number);

export function schrijfLes(o: Opgave): Geschreven | null {
  const f = o.figuur;
  if (!f || f.soort !== "godotspel" || !f.les) return null;
  const antwoordGetallen = o.antwoord.split("|")[0].match(/\d+/g)?.map(Number) ?? [];
  const opgave = [...getallen(o.vraagtekst), ...getallen(String(f.kop).replace("?", ""))];
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin(f.goedZin, "het spel laat het zien")],
    fouten: [],
    uitleg: [zin(f.foutZin, "het spel laat de goede manier zien")],
    tip: zin(f.tip ?? "Kijk nog eens goed naar het spel."),
    rondewoord: "opdrachten",
    opgave,
    tussen: [...getallen(f.goedZin), ...getallen(f.foutZin)],
    /* Bij typen mag het antwoord niet in de vraag of de hint staan. */
    geheim: f.invoer === "typen" ? antwoordGetallen.filter((n) => !opgave.includes(n)) : [],
  });
}
