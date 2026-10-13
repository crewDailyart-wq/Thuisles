import { Missie } from "@/components/zappie/Missie";
import { MISSIENAAM, maakSommen, soortVanMissie, vrijeMissie } from "@/lib/zappie/missie";
import { WERELDEN, vindWereld } from "@/lib/zappie/werelden";

/**
 * Een Zappie-missie. Het adres zegt welke: /zappie/oefenen?wereld=oceaan&missie=8.
 * De knop "Start oefenen" maakt dat adres uit de voortgang van het kind. Zonder
 * adres begint de eerste missie van de Oceaan.
 *
 * Met ?vrij=1 is het een vrije missie ("Vrije Missie" op de startpagina): die
 * geeft tokens maar telt niet mee voor de wereld.
 *
 * De sommen worden hier bij elk bezoek opnieuw gemaakt en gaan als gegevens
 * mee naar het scherm. Ze staan nergens anders.
 */
export default async function ZappieOefenen({ searchParams }: PageProps<"/zappie/oefenen">) {
  const adres = await searchParams;
  const wereld = vindWereld(typeof adres.wereld === "string" ? adres.wereld : undefined) ?? WERELDEN[0];

  /* Vrije missie: extra oefenen voor tokens; telt niet mee voor de wereld. */
  if (adres.vrij === "1") {
    const vrij = vrijeMissie();
    return (
      <Missie
        key={`vrij-${vrij.soort}`}
        wereld={wereld.id}
        wereldnaam={wereld.naam}
        nummer={null}
        titel={MISSIENAAM[vrij.soort]}
        sommen={vrij.sommen}
      />
    );
  }

  const gevraagd = Number(typeof adres.missie === "string" ? adres.missie : 1);
  const nummer = Number.isInteger(gevraagd) ? Math.min(Math.max(gevraagd, 1), wereld.missies) : 1;
  const soort = soortVanMissie(nummer);

  return (
    <Missie
      key={`${wereld.id}-${nummer}`}
      wereld={wereld.id}
      wereldnaam={wereld.naam}
      nummer={nummer}
      titel={MISSIENAAM[soort]}
      sommen={maakSommen(soort)}
    />
  );
}
