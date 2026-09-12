/**
 * School & methode.
 *
 * De harde regels van het project, hier afgedwongen en zichtbaar gemaakt:
 *
 *   - de methode van een school heeft altijd één van drie standen, en die
 *     staat er letterlijk bij;
 *   - er wordt nooit een methode geraden of automatisch ingevuld; standaard is
 *     "Rekenmethode nog niet bekend";
 *   - alleen de naam van een methode in tekst, nooit een logo of omslag, en
 *     altijd de vaste zin over niet-verbondenheid eronder;
 *   - de bron en de datum van de schoollijst staan erbij, zoals de licentie
 *     van de open data van DUO verlangt.
 */

import {
  Beoordeling,
  GeenKind,
  Gegevens,
  Kaart,
  Pagina,
  Uitklap,
} from "@/components/ouder/Bouwstenen";
import {
  HuidigBlok,
  Jaarcontrole,
  MethodeOpgeven,
  MethodeSchakelaar,
  MethodeVoorKind,
  SchoolWeghalen,
  SchoolZoeken,
} from "@/components/ouder/Schoolformulieren";
import { bekekenKind, vereisOuder } from "@/lib/auth/sessie";
import {
  blokkenVoorStartscherm,
  haalKindschool,
  moetJaarcontrole,
} from "@/lib/data/kindschool";
import { haalMethodes, nietVerbondenZin } from "@/lib/data/methodes";
import {
  DUO,
  laatsteImport,
  methodestatus,
  opgaveVanOuder,
  zoekScholen,
} from "@/lib/data/scholen";
import type { MethodeHerkomst, SchoolMethodeStatus } from "@/lib/types";

/** De drie standen, letterlijk zoals de opdracht ze voorschrijft. */
const STAND: Record<MethodeHerkomst, { tekst: string; stijl: string }> = {
  geverifieerd: {
    tekst: "Geverifieerd door Thuisles",
    stijl: "border-groen/40 bg-groen-zacht text-groen-diep",
  },
  opgegeven_door_ouder: {
    tekst: "Opgegeven door een ouder, nog niet geverifieerd",
    stijl: "border-oranje/40 bg-oranje-zacht text-oranje-diep",
  },
  onbekend: {
    tekst: "Rekenmethode nog niet bekend",
    stijl: "border-beheer-rand bg-beheer-vlak text-beheer-zacht",
  },
};

function datum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Standmelding({ stand }: { stand: SchoolMethodeStatus }) {
  const s = STAND[stand.herkomst];
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${s.stijl}`}>
      <p className="text-sm font-semibold">{s.tekst}</p>
      {stand.herkomst === "geverifieerd" && (
        <p className="mt-0.5 text-xs leading-relaxed">
          Gecontroleerd door Thuisles: {stand.bron}
          {stand.bronLink && (
            <>
              {" — "}
              <a href={stand.bronLink} target="_blank" rel="noreferrer" className="underline">
                bekijk de bron
              </a>
            </>
          )}
          . Bevestigd op {datum(stand.bevestigdOp!)}, schooljaar {stand.schooljaar}.
        </p>
      )}
      {stand.herkomst === "opgegeven_door_ouder" && (
        <p className="mt-0.5 text-xs leading-relaxed">
          {stand.aantalOpgaven === 1
            ? "Eén ouder heeft dit doorgegeven."
            : `${stand.aantalOpgaven} ouders hebben dit doorgegeven.`}{" "}
          Wij hebben het nog niet gecontroleerd.
        </p>
      )}
      {stand.herkomst === "onbekend" && (
        <p className="mt-0.5 text-xs leading-relaxed">
          We vullen dit nooit zelf in. Weet jij het? Geef het hieronder door.
        </p>
      )}
    </div>
  );
}

export default async function SchoolPagina({
  searchParams,
}: {
  searchParams: Promise<{ zoek?: string }>;
}) {
  const ouder = await vereisOuder();
  const kind = await bekekenKind(ouder.id);
  if (!kind) return <GeenKind />;

  const { zoek } = await searchParams;
  const zoekterm = (zoek ?? "").trim();

  const ks = haalKindschool(kind.id);
  const methodes = haalMethodes(true);
  const stand = ks.school ? methodestatus(ks.school.id) : null;
  const eigenOpgave = ks.school ? opgaveVanOuder(ks.school.id, ouder.id) : null;
  const blokken = ks.methode ? blokkenVoorStartscherm(kind.id, kind.groep) : [];
  const importInfo = laatsteImport();

  return (
    <Pagina
      titel="School & methode"
      uitleg={`Stel in op welke school ${kind.roepnaam} zit en met welke rekenmethode de klas werkt. Daarmee volgt het oefenen thuis dezelfde volgorde als op school.`}
    >
      {/* B5: één keer per schooljaar controleren of het nog klopt. */}
      {moetJaarcontrole(ks) && (
        <Jaarcontrole kindId={kind.id} roepnaam={kind.roepnaam} />
      )}

      {/* Het belangrijkste eerst: wat er nu staat, en hoe zeker dat is. */}
      <Kaart titel="Nu ingesteld">
        <Gegevens
          rijen={[
            ["School", ks.school?.naam ?? "Nog niet ingesteld"],
            ["Plaats", ks.school ? `${ks.school.plaats} · ${ks.school.postcode}` : "—"],
            ["Groep", `Groep ${kind.groep}`],
            [
              "Rekenmethode van je kind",
              ks.methode ? ks.methode.naam : "Nog niet ingesteld",
            ],
          ]}
        />

        {stand && (
          <div className="mt-3">
            <p className="mb-1.5 text-sm text-beheer-zacht">
              Wat wij van deze school weten:
            </p>
            <Standmelding stand={stand} />
          </div>
        )}

        {ks.methode && (
          <p className="mt-4 border-t border-beheer-rand-zacht pt-3 text-xs leading-relaxed text-beheer-zacht">
            {nietVerbondenZin(ks.methode)}
          </p>
        )}

        {ks.school && (
          <div className="mt-4 border-t border-beheer-rand-zacht pt-4">
            <SchoolWeghalen kindId={kind.id} />
          </div>
        )}
      </Kaart>

      {/* Details, uitklapbaar. Nooit standaard open. */}
      <div className="flex flex-col gap-3">
        {!ks.school && (
          <Uitklap
            titel="School kiezen"
            bijschrift="Zoeken op naam, plaats of postcode"
          >
            <SchoolZoeken
              kindId={kind.id}
              gevonden={zoekterm ? zoekScholen(zoekterm) : []}
              zoekterm={zoekterm}
            />
            <p className="mt-4 border-t border-beheer-rand-zacht pt-3 text-xs leading-relaxed text-beheer-zacht">
              {importInfo ? (
                <>
                  Bron van de schoollijst: {importInfo.bron}, bijgewerkt op{" "}
                  {datum(importInfo.uitgevoerdOp)}. Beschikbaar onder{" "}
                  {importInfo.licentie}.
                </>
              ) : (
                <>
                  De schoollijst is nog niet ingeladen. Bron wordt: {DUO.naam}.
                </>
              )}
            </p>
          </Uitklap>
        )}

        <Uitklap
          titel={`Rekenmethode van ${kind.roepnaam}`}
          bijschrift="Bepaalt de volgorde waarin je kind oefent"
        >
          <MethodeVoorKind
            kindId={kind.id}
            roepnaam={kind.roepnaam}
            methodes={methodes}
            huidigeMethodeId={ks.methode?.id ?? null}
            voorstelId={
              stand?.herkomst === "geverifieerd" ? (stand.methode?.id ?? null) : null
            }
          />
          {!ks.school && (
            <p className="mt-4 border-t border-beheer-rand-zacht pt-3 text-xs leading-relaxed text-beheer-zacht">
              Je hebt nog geen school ingesteld. Dat hoeft ook niet: weet je van
              je eigen kind uit welk werkboek het werkt, dan kun je dat hier
              gewoon instellen. Dat is geen uitspraak over de school.
            </p>
          )}
        </Uitklap>

        {ks.school && (
          <Uitklap
            titel="Rekenmethode van de school doorgeven"
            bijschrift={
              eigenOpgave
                ? "Je hebt dit al doorgegeven. Je kunt het wijzigen."
                : "Weet je welke methode de klas gebruikt? Geef het door."
            }
          >
            <MethodeOpgeven kindId={kind.id} methodes={methodes} />
          </Uitklap>
        )}

        {ks.methode && (
          <Uitklap
            titel="Oefenen volgens de methode"
            bijschrift="Aan of uit, en waar de klas nu zit"
          >
            <div className="flex flex-col gap-5">
              <MethodeSchakelaar kindId={kind.id} aan={ks.volgMethode} />

              {ks.volgMethode && (
                <div className="border-t border-beheer-rand-zacht pt-4">
                  {blokken.length === 0 ? (
                    <p className="text-sm leading-relaxed text-beheer-zacht">
                      Voor groep {kind.groep} zijn bij deze methode nog geen
                      blokken ingesteld. {kind.roepnaam} kan gewoon vrij oefenen;
                      er is niets kapot.
                    </p>
                  ) : (
                    <HuidigBlok
                      kindId={kind.id}
                      blokken={blokken}
                      huidigBlokId={ks.huidigBlokId}
                    />
                  )}
                </div>
              )}
            </div>
          </Uitklap>
        )}
      </div>

      <Beoordeling
        soort="LEGAL REVIEW REQUIRED"
        punten={[
          `Schoollijst: open data van DUO onder ${DUO.licentie}. Hergebruik mag mits bronvermelding; die staat hierboven mét de datum van de laatste import. Controleren of dat volstaat.`,
          "Methodes worden alleen als naam in tekst getoond, met de uitgever als tekst. Geen logo's, omslagen of huisstijl. Toetsen zodra daar iets van bijkomt.",
          "De vaste zin over niet-verbondenheid staat onder elke methodevermelding. Controleren of de formulering juridisch volstaat.",
          "Door ouders opgegeven schoolgegevens zijn zichtbaar voor andere ouders van dezelfde school. Toetsen of dat zo mag, en of er iets herleidbaar is naar de ouder die het opgaf.",
        ]}
      />
    </Pagina>
  );
}
