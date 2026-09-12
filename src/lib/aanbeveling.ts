/**
 * De regel achter "Voor jou".
 *
 * Bewust eenvoudig en volledig uitlegbaar: er zit geen AI in en de uitkomst
 * is altijd in één zin te verantwoorden richting kind en ouder. De volgorde
 * van de regels is de hele logica.
 *
 *   1. Bijna beheerst  -> afmaken wat bijna af is. Kortste weg naar succes.
 *   2. Mee bezig       -> doorgaan waar het kind gebleven is.
 *   3. Nog niet gestart-> het eerstvolgende leerdoel dat bij de groep past.
 *
 * Leerdoelen die al beheerst zijn, worden hier nooit voorgesteld.
 */

import type {
  Aanbeveling,
  Kind,
  Leerdoel,
  LeerdoelVoortgang,
  MasteryStatus,
  Subdomein,
} from "@/lib/types";

const VOLGORDE_VAN_VOORKEUR: MasteryStatus[] = [
  "bijna_beheerst",
  "oefent",
  "nog_niet_gestart",
];

const WAAROM: Record<MasteryStatus, string> = {
  bijna_beheerst: "Je was hier bijna! Nog een paar sommen en je hebt hem.",
  oefent: "Hier ben je mee bezig. Even doorzetten.",
  nog_niet_gestart: "Dit is nieuw voor je. Zin om het te proberen?",
  beheerst: "Deze beheers je al.",
};

/** Past het leerdoel bij de groep van het kind? Ranges mogen overlappen. */
export function pastBijGroep(leerdoel: Leerdoel, kind: Kind): boolean {
  return kind.groep >= leerdoel.groepVan && kind.groep <= leerdoel.groepTot;
}

export function bepaalAanbeveling(
  kind: Kind,
  leerdoelen: Leerdoel[],
  subdomeinen: Subdomein[],
  voortgang: LeerdoelVoortgang[],
): Aanbeveling | null {
  const voortgangVan = new Map(voortgang.map((v) => [v.leerdoelId, v]));

  const kandidaten = leerdoelen
    .filter((ld) => pastBijGroep(ld, kind))
    .map((ld) => {
      const v = voortgangVan.get(ld.id);
      return {
        leerdoel: ld,
        status: v?.status ?? ("nog_niet_gestart" as MasteryStatus),
        laatstGeoefendOp: v?.laatstGeoefendOp ?? null,
      };
    })
    .filter((k) => k.status !== "beheerst");

  for (const gezochteStatus of VOLGORDE_VAN_VOORKEUR) {
    const treffer = kandidaten
      .filter((k) => k.status === gezochteStatus)
      // Binnen dezelfde status: pak waar het kind het laatst mee bezig was.
      // Dat sluit aan bij de belofte "verder waar je gebleven was". Is er nog
      // niet geoefend, dan telt de vaste volgorde van het leerdoel.
      .sort(
        (a, b) =>
          (b.laatstGeoefendOp ?? "").localeCompare(a.laatstGeoefendOp ?? "") ||
          a.leerdoel.volgorde - b.leerdoel.volgorde,
      )[0];

    if (!treffer) continue;

    const subdomein = subdomeinen.find(
      (s) => s.id === treffer.leerdoel.subdomeinId,
    );
    if (!subdomein) continue;

    return {
      leerdoel: treffer.leerdoel,
      subdomein,
      status: treffer.status,
      waarom: WAAROM[treffer.status],
    };
  }

  return null;
}
