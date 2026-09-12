/**
 * De twee manieren om te oefenen, als eerste keuze binnen een vak.
 *
 * Dit scherm zit bewust tussen "Rekenen" en de rest: een kind maakt hier één
 * keuze, en die keuze is groot en zonder omhaal. Twee kaarten, meer niet.
 *
 * Waarom altijd `grid-cols-2` en nooit onder elkaar: de twee routes zijn
 * elkaars alternatief. Zodra ze onder elkaar staan, leest de bovenste als
 * "de eerste stap" en de onderste als "daarna", en dat is precies de verkeerde
 * indruk. Naast elkaar zie je in één oogopslag dat het een keuze is.
 *
 * ---------------------------------------------------------------------------
 * De afbeelding ís de kaart
 * ---------------------------------------------------------------------------
 * De twee tekeningen zijn complete kaarten: titel, uitleg en knop staan er al
 * in getekend. Ze worden daarom precies zo getoond als ze zijn — er staat geen
 * losse tekst of knop meer omheen. De hele afbeelding is de link.
 *
 * Twee dingen die daaruit volgen:
 *
 *   1. De tekst zit in het beeld en is dus onzichtbaar voor een
 *      voorleesprogramma. Daarom is `alt` hier géén lege string maar de
 *      volledige omschrijving van waar de kaart heen gaat; dat is meteen de
 *      naam die de link krijgt.
 *   2. Er is geen knop meer die zegt "hier kun je klikken". Dat moet de kaart
 *      zelf uitstralen: bij zweven wordt hij iets groter en krijgt hij een
 *      schaduw, en bij toetsenbordfocus een duidelijke ring.
 *
 * De schaduw is een `drop-shadow` en geen gewone `shadow`. De tekeningen
 * hebben doorzichtige hoeken; een gewone schaduw zou een rechthoek om dat
 * lege gebied tekenen, een drop-shadow volgt de vorm van de tekening zelf.
 *
 * Wil je later een andere tekening gebruiken: zet hem in `public/` en pas
 * `afbeelding`, `breedte` en `hoogte` hieronder aan. De verhouding komt uit
 * die twee getallen, dus er wordt nooit uitgerekt — hij schaalt alleen mee met
 * de breedte van de kolom.
 */

import Image from "next/image";
import Link from "next/link";

/*
  De twee tekeningen zijn op één maat gebracht: de doorzichtige rand is
  weggehaald, ze zijn allebei op dezelfde hoogte geschaald, en daarna op één
  gemeenschappelijk doek van 1224x1148 gezet. Daardoor is de zichtbare kaart
  bij allebei precies even hoog en staan ze op dezelfde lijn — ook al zijn de
  twee tekeningen van zichzelf niet even hoog. Er is niets uitgerekt: het
  schalen ging bij beide gelijkmatig, en alleen naar beneden.

  De schoolkaart is smaller dan de vrij-oefenenkaart en houdt daardoor wat
  doorzichtige ruimte links en rechts over. Dat is onvermijdelijk: gelijke
  hoogte én gelijke breedte kan alleen als je één van de twee zou uitrekken.

  Let op bij het vervangen van een tekening: geef het bestand een NIEUWE naam.
  Blijft de naam gelijk, dan blijven browsers en de beeldcache van Next de
  oude versie teruggeven, ook al staat de nieuwe al op schijf.
*/
const BREEDTE = 1224;
const HOOGTE = 1148;

function KeuzeKaart({
  href,
  afbeelding,
  beschrijving,
}: {
  href: string;
  /** Complete kaart, inclusief de getekende titel, tekst en knop. */
  afbeelding: string;
  /**
   * Wat er in de tekening staat, in woorden. Dit wordt de naam van de link,
   * want de getekende tekst kan een voorleesprogramma niet lezen.
   */
  beschrijving: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-groot transition duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-viool motion-reduce:transform-none"
    >
      <Image
        src={afbeelding}
        alt={beschrijving}
        width={BREEDTE}
        height={HOOGTE}
        /*
          `quality` staat hoger dan standaard omdat er getekende tekst in de
          afbeelding zit; die wordt bij 75 net iets zacht. De waarde staat in
          `next.config.ts` toegestaan.
        */
        quality={90}
        sizes="(min-width: 1024px) 24rem, 45vw"
        className="h-auto w-full drop-shadow-[0_2px_6px_rgb(44_37_69_/_0.10)] transition duration-200 group-hover:drop-shadow-[0_14px_28px_rgb(44_37_69_/_0.28)]"
      />
    </Link>
  );
}

export function Routekeuze({ vakSlug }: { vakSlug: string }) {
  return (
    <section aria-labelledby="kop-routekeuze">
      <h2 id="kop-routekeuze" className="sr-only">
        Hoe wil je oefenen?
      </h2>

      {/*
        Een bovengrens op de breedte. Zonder dat groeien de kaarten op een
        breed scherm zo ver mee dat ze samen hoger worden dan het venster.
      */}
      <div className="grid max-w-3xl grid-cols-2 items-start gap-3 sm:gap-6">
        <KeuzeKaart
          href={`/oefenen/${vakSlug}/vrij`}
          afbeelding="/keuze-vrij-oefenen.png"
          beschrijving="Vrij oefenen — kies zelf wat je wilt oefenen. Reken op jouw manier, in jouw tempo."
        />

        <KeuzeKaart
          href={`/oefenen/${vakSlug}/methode`}
          afbeelding="/keuze-volgens-school.png"
          beschrijving="Oefenen volgens school — oefen met de lesstof van jouw school. Sluit goed aan bij wat je nu op school doet."
        />
      </div>
    </section>
  );
}
