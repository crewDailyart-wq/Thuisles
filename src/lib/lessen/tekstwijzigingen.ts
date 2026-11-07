import wijzigingen from "./tekstwijzigingen.json";
import begin from "./beginzinnen.json";
import { cijfersInTekst } from "./cijfertaal";

/** Tekstcorrecties per les; verandert geen antwoorden of lesstappen. */
export function lesTekst(id: string, bron: string): string {
  const perLes = wijzigingen as Record<string, Record<string, string>>;
  const regels = Object.hasOwn(perLes, id) ? perLes[id] : undefined;
  const tekst = regels && Object.hasOwn(regels, bron) ? regels[bron] : bron;
  return id.startsWith("squla-") && Object.hasOwn(begin, id) ? cijfersInTekst(tekst) : tekst;
}
