import { Missie } from "@/components/zappie/Missie";
import { MISSIENAAM, maakSommen, soortVanMissie } from "@/lib/zappie/missie";
import { WERELDEN, vindWereld } from "@/lib/zappie/werelden";

/**
 * Een Zappie-missie. Het adres zegt welke: /zappie/oefenen?wereld=oceaan&missie=8.
 * De knop "Start oefenen" maakt dat adres uit de voortgang van het kind. Zonder
 * adres begint de eerste missie van de Oceaan.
 *
 * De sommen worden hier bij elk bezoek opnieuw gemaakt en gaan als gegevens
 * mee naar het scherm. Ze staan nergens anders.
 */
export default async function ZappieOefenen({ searchParams }: PageProps<"/zappie/oefenen">) {
  const adres = await searchParams;
  const wereld = vindWereld(typeof adres.wereld === "string" ? adres.wereld : undefined) ?? WERELDEN[0];
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
