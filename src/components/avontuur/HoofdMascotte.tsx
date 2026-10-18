/**
 * De mascotte van de website, op één plek: Bliepo, de robot (sinds 12 oktober
 * 2026; de naam sinds 18 oktober 2026).
 *
 * Elk scherm in de avontuurstijl haalt hem hier vandaan. Op de oefenschermen
 * en in de lessen staat dezelfde robot, via `TijdelijkMaatje` en `Bliepo`.
 */

import { Bliepo } from "@/components/avontuur/Bliepo";

export function HoofdMascotte({ className = "" }: { className?: string }) {
  return <Bliepo houding="rustig" className={className} />;
}
