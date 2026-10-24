/**
 * De gekozen stijl (stijlkiezer, /admin/stijl) als CSS-variabelen op de
 * pagina. Staat alleen op de schermen met de nieuwe onderdelen (kinderkant en
 * voorbeelden). Bij de standaardstijl komt er niets op de pagina: de
 * onderdelen hebben dezelfde standaard zelf al.
 */

import { haalStijl } from "@/lib/data/stijl";
import { isStandaard, stijlVariabelen } from "@/lib/stijl";

export function StijlVariabelen() {
  const stijl = haalStijl();
  if (isStandaard(stijl)) return null;
  const regels = Object.entries(stijlVariabelen(stijl))
    .map(([k, v]) => `${k}:${v};`)
    .join("");
  return <style>{`:root{${regels}}`}</style>;
}
