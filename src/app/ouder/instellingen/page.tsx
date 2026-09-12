/**
 * Instellingen — account, kinderen en gegevens.
 *
 * Vaste opbouw: titel, één regel uitleg, het belangrijkste eerst (de
 * kinderen), daaronder details die uitklappen, en onderaan de markering met
 * wat er voor de privacyverklaring nog beoordeeld moet worden.
 */

import {
  Beoordeling,
  Gegevens,
  Kaart,
  Pagina,
  Uitklap,
} from "@/components/ouder/Bouwstenen";
import {
  AccountInstellingen,
  AccountVerwijderen,
  KindToevoegen,
  KindVerwijderen,
  KindWijzigen,
} from "@/components/ouder/Instellingformulieren";
import { Pictogram } from "@/components/kind/Pictogram";
import { vereisOuder } from "@/lib/auth/sessie";
import { haalKinderen } from "@/lib/data/kinderen";
import { TALEN } from "@/lib/types";

export default async function InstellingenPagina() {
  const ouder = await vereisOuder();
  const kinderen = haalKinderen(ouder.id);
  const taalnaam = TALEN.find((t) => t.code === ouder.taal)?.naam ?? "Nederlands";

  return (
    <Pagina
      titel="Instellingen"
      uitleg="Hier beheer je je account, de profielen van je kinderen en wat er met de gegevens gebeurt."
    >
      {/* Het belangrijkste eerst: de kinderen. */}
      <Kaart
        titel="Kinderen"
        bijschrift="Per kind een roepnaam, een groep en een avatar. Meer hoeven we niet te weten."
      >
        {kinderen.length === 0 ? (
          <p className="text-sm leading-relaxed text-beheer-zacht">
            Je hebt nog geen kindprofiel. Voeg er een toe, dan kan het oefenen
            beginnen.
          </p>
        ) : (
          <div className="flex flex-col">
            {kinderen.map((kind) => (
              <div
                key={kind.id}
                className="flex flex-wrap items-center gap-3 border-t border-beheer-rand-zacht py-3 first:border-t-0"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-viool-zacht">
                  <Pictogram naam={kind.avatar} className="size-6" />
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block font-medium">{kind.roepnaam}</span>
                  <span className="block text-beheer-zacht">
                    Groep {kind.groep}
                    {kind.heeftKindcode ? " · met kindcode" : " · zonder kindcode"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 border-t border-beheer-rand-zacht pt-4">
          <KindToevoegen altijdOpen={kinderen.length === 0} />
        </div>
      </Kaart>

      {/* Details, uitklapbaar. Nooit standaard open. */}
      <div className="flex flex-col gap-3">
        {kinderen.map((kind) => (
          <Uitklap
            key={kind.id}
            titel={`Profiel van ${kind.roepnaam}`}
            bijschrift="Roepnaam, groep, avatar en kindcode"
          >
            <KindWijzigen kind={kind} />
            <details className="mt-5 border-t border-beheer-rand-zacht pt-4">
              <summary className="cursor-pointer text-sm text-beheer-zacht">
                Profiel verwijderen
              </summary>
              <div className="mt-3">
                <KindVerwijderen kind={kind} />
              </div>
            </details>
          </Uitklap>
        ))}

        <Uitklap titel="Jouw account" bijschrift="Naam, e-mailadres en taal van de uitleg">
          <Gegevens
            rijen={[
              ["E-mailadres", ouder.email ?? "Nog niet ingevuld"],
              ["Taal van de uitleg", taalnaam],
            ]}
          />
          <div className="mt-4 border-t border-beheer-rand-zacht pt-4">
            <AccountInstellingen ouder={ouder} />
          </div>
        </Uitklap>

        <Uitklap
          titel="Je gegevens"
          bijschrift="Downloaden of verwijderen — jij bent de beheerder"
        >
          <AccountVerwijderen />
        </Uitklap>
      </div>

      <Beoordeling
        soort="PRIVACY REVIEW REQUIRED"
        punten={[
          "Kinderdata: welke velden worden echt bewaard, en waarom is elk veld nodig. Nu: roepnaam, groep, avatar, kindcode (als hash), antwoorden en voortgang.",
          "Bewaartermijnen: hoe lang blijven antwoorden en voortgang staan, en wat gebeurt er bij een slapend account.",
          "Verwerkers: hosting, database en de stemdienst — verwerkersovereenkomsten en de regio waar gegevens staan.",
          "Door ouders opgegeven schoolgegevens (stap 2): wat daarvan zichtbaar mag zijn voor andere ouders.",
          "Inloggen: er is nu TIJDELIJK GEEN INLOG — wie de app opent, ziet alles. Vóór livegang moet hier een echte inlog voor terug, met wachtwoordherstel.",
          "Beveiliging van de beheeromgeving (/admin): die is nu voor iedereen bereikbaar en moet vóór livegang achter een inlog.",
        ]}
      />
    </Pagina>
  );
}
