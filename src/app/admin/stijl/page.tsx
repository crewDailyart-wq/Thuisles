import { Kop } from "@/components/beheer/Bouwstenen";
import { Stijlkiezer } from "@/components/beheer/Stijlkiezer";
import { haalStijl, haalThemas, haalVorige } from "@/lib/data/stijl";

/*
  Stijlkiezer (24 oktober 2026, uitgebreid 26 oktober 2026, opdracht
  eigenaar): zelf de lettertypes, de lettergrootte, de kleuren, de knoppen,
  de praatknop en de grootte van Bliepo kiezen voor de hele kinderkant, met
  een echt opdrachtscherm als voorbeeld. Ook bereikbaar via /beheer/stijl.
*/
export default function StijlPagina() {
  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Stijl" }]}
        titel="Stijl"
        bijschrift="Kies de lettertypes, kleuren en knoppen van de hele kinderkant: startpagina, profielscherm, bovenbalk, opdrachten, lessen, de tekst boven Bliepo, de antwoordknoppen, Controleer en de praatknop. Het voorbeeld laat meteen zien hoe het wordt; de kinderen zien het pas na Bewaren. Lokaal en online zijn twee aparte sites: wat je hier bewaart, geldt alleen voor deze site."
      />
      <Stijlkiezer begin={haalStijl()} vorige={haalVorige().length} themas={haalThemas()} />
    </div>
  );
}
