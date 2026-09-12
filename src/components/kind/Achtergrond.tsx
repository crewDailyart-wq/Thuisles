/**
 * Achtergrond van de kindomgeving.
 *
 * De illustratie `public/achtergrond-wereld.png` vult het hele scherm en staat
 * achter alle kaarten en tekst. De afbeelding staat vast (`fixed`): bij het
 * scrollen schuift de inhoud eroverheen en blijft het landschap staan. Dat is
 * rustiger om naar te kijken dan een meebewegende achtergrond.
 *
 * ---------------------------------------------------------------------------
 * Nooit uitrekken, altijd bijsnijden
 * ---------------------------------------------------------------------------
 * De illustratie is breed (1672 x 941, ongeveer 16:9). Een telefoon is smal en
 * hoog, dus daar past maar een verticale strook in beeld. `object-cover` lost
 * dat op zoals gevraagd: de verhouding blijft altijd gelijk en er wordt
 * ingezoomd tot het scherm vol is. Er wordt dus nooit platgedrukt, vervormd of
 * scheefgetrokken — alleen bijgesneden. Wat je verliest is beeldrand, nooit de
 * vorm van het kasteel.
 *
 * Welk stuk in beeld blijft, regelt `object-position`. Dat verschuift per
 * schermbreedte, zodat op elk formaat de herkenningspunten (het kasteel op de
 * rots, het pad en de brug) in beeld blijven in plaats van een willekeurig
 * stuk lucht of gras:
 *
 *   - telefoon staand   -> 58%: kasteel, rots en een deel van de brug
 *   - grote telefoon/tablet -> 55%: de brug komt er verder bij
 *   - vanaf desktop     -> midden: de hele plaat past bijna precies
 *
 * Liggend op een telefoon is het net andersom: dan vult de breedte het scherm
 * en valt er boven- en onderlangs wat weg. Verticaal blijft het daarom op het
 * midden staan, waar het kasteel en de brug zitten.
 *
 * `h-[100lvh]` in plaats van `inset-0`: op iOS en Android schuift de
 * adresbalk weg tijdens het scrollen, waardoor het scherm hoger wordt. Met
 * `lvh` (largest viewport height) is de laag meteen zo hoog als het scherm
 * maximaal kan worden, dus verschijnt er onderaan nooit een witte strook.
 *
 * `sizes` vraagt op smalle schermen een veel grotere versie van het bestand
 * op. Zonder dat zou de browser een afbeelding ter breedte van de telefoon
 * downloaden, waarna de smalle uitsnede daarvan flink opgerekt en dus wazig
 * wordt.
 *
 * ---------------------------------------------------------------------------
 * Geen laag eroverheen
 * ---------------------------------------------------------------------------
 * De illustratie wordt in haar eigen, originele kleuren getoond: er ligt
 * bewust GEEN sluier, dimlaag of kleurfilter overheen. Deze plaat is fel en
 * druk, maar dat mag je zien.
 *
 * De leesbaarheid wordt daarom bij de tekst zelf opgelost, niet hier. Alles
 * wat los op het landschap staat — de begroeting, de statuspillen, "Vakken",
 * "Jouw wereld", de paginakoppen en de balk onderaan — heeft een klein, effen
 * wit vlak eronder (`bg-kaart`, zonder doorzichtigheid en zonder blur). Dat
 * geeft rustige, volledig dekkende ondergrond precies waar tekst staat, en
 * laat de rest van de illustratie onaangeroerd.
 *
 * Puur decor, dus `aria-hidden`: een voorleesprogramma slaat dit over.
 */

import Image from "next/image";

export function Achtergrond() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[100lvh] overflow-hidden"
    >
      <Image
        src="/achtergrond-wereld.png"
        alt=""
        fill
        preload
        sizes="(max-width: 1024px) 320vw, 100vw"
        className="object-cover object-[58%_center] sm:object-[55%_center] lg:object-center"
      />
    </div>
  );
}
