import type { Metadata } from "next";
import { StijlVariabelen } from "@/components/StijlVariabelen";
import { VoorbeeldBliepo } from "./VoorbeeldBliepo";

/*
  Testpagina (18 oktober 2026, fase 1): drie versies van Bliepo naast elkaar,
  om te kiezen welke er op de site komt. Staat in geen menu of navigatie.
  Blijft staan tot de eigenaar zegt dat hij weg mag.
*/
export const metadata: Metadata = {
  title: "Voorbeeld Bliepo",
  robots: { index: false, follow: false },
};

/* De gekozen stijl (stijlkiezer, /admin/stijl) komt uit de database: niet vooraf klaarzetten. */
export const dynamic = "force-dynamic";

export default function Pagina() {
  return (
    <>
      <StijlVariabelen />
      <VoorbeeldBliepo />
    </>
  );
}
