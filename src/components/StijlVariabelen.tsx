/**
 * De gekozen stijl (stijlkiezer, /admin/stijl) op de pagina: de centrale
 * stijlvariabelen van de kinderkant (lib/stijl.ts, stijlCss). Staat in elke
 * layout van de kinderkant (kind, Zappie, profielkeuze) en op de voorbeelden.
 *
 * Wordt bij elk bezoek opnieuw uit de database gelezen (connection), zodat er
 * nooit een oude stijl uit een cache komt. Bij de standaardstijl komt er geen
 * CSS op de pagina: de onderdelen hebben dezelfde standaard zelf al.
 *
 * StijlVerversen zorgt dat een tabblad dat al open staat in dezelfde browser
 * meteen ververst als de stijl in de stijlkiezer wordt bewaard.
 */

import { connection } from "next/server";
import { StijlVerversen } from "@/components/stijl/StijlVerversen";
import { haalStijl } from "@/lib/data/stijl";
import { stijlCss } from "@/lib/stijl";

export async function StijlVariabelen() {
  await connection();
  const css = stijlCss(haalStijl());
  return (
    <>
      {css && <style data-stijl="">{css}</style>}
      <StijlVerversen />
    </>
  );
}
