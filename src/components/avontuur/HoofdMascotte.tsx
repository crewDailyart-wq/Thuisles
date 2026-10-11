/**
 * De mascotte van de website, op één plek.
 *
 * De echte mascotte komt later. Tot die tijd staat hier het tijdelijke
 * bolletje-maatje van de oefeningen. Komt de mascotte, dan hoeft alleen dit
 * bestand anders: elk scherm in de avontuurstijl haalt hem hier vandaan.
 */

import { TijdelijkMaatje } from "@/components/oefenen/TijdelijkMaatje";

export function HoofdMascotte({ className = "" }: { className?: string }) {
  return <TijdelijkMaatje houding="rustig" className={className} />;
}
