import { Kop } from "@/components/beheer/Bouwstenen";
import { KiesStijl } from "@/components/beheer/KiesStijl";
import { haalStijl } from "@/lib/data/stijl";

/*
  Kies een stijl (30 oktober 2026, opdracht eigenaar): per onderdeel 3 of 4
  kant-en-klare varianten naast elkaar, elk als klein lesscherm met de stem van
  Ruth. De keuze is een deel van dezelfde stijl als /admin/stijl (één systeem)
  en geldt na Opslaan meteen voor alle lessen aan de kindkant.
*/
export default function KiesStijlPagina() {
  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Stijl", href: "/admin/stijl" }, { label: "Kies een stijl" }]}
        titel="Kies een stijl"
        bijschrift="Kies per onderdeel een letter. Tik op Speel af om het te horen en te zien. Na Opslaan zien kinderen het meteen als ze een les openen of verversen. A is steeds zoals het nu is. Lokaal en online zijn twee aparte sites: wat je hier bewaart, geldt alleen voor deze site."
      />
      <KiesStijl begin={haalStijl()} />
    </div>
  );
}
