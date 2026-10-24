import { Kop } from "@/components/beheer/Bouwstenen";
import { Stijlkiezer } from "@/components/beheer/Stijlkiezer";
import { haalStijl } from "@/lib/data/stijl";

/*
  Stijlkiezer (24 oktober 2026, opdracht eigenaar): zelf het lettertype, de
  kleuren en de knopvorm kiezen van de nieuwe onderdelen (het gesprek met
  Bliepo, het meelezen, de antwoordknoppen en de praatknop), met een live
  voorbeeld. Ook bereikbaar via /beheer/stijl.
*/
export default function StijlPagina() {
  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Stijl" }]}
        titel="Stijl"
        bijschrift="Kies het lettertype, de kleuren en de knopvorm van het gesprek met Bliepo, het meelezen en de knoppen. Het voorbeeld laat meteen zien hoe het wordt; de kinderen zien het pas na Bewaren."
      />
      <Stijlkiezer begin={haalStijl()} />
    </div>
  );
}
