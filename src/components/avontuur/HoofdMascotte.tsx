/**
 * De mascotte van de website, op één plek: de robot (sinds 12 oktober 2026).
 *
 * Elk scherm in de avontuurstijl haalt hem hier vandaan. Op de oefenschermen
 * en in de lessen staat dezelfde robot, via `TijdelijkMaatje` en `Robot`.
 */

import { Robot } from "@/components/avontuur/Robot";

export function HoofdMascotte({ className = "" }: { className?: string }) {
  return <Robot houding="rustig" className={className} />;
}
