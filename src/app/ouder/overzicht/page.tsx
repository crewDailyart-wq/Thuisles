/**
 * Overzicht — de startpagina van de ouder.
 *
 * Vaste opbouw van boven naar beneden (F2):
 *   1. titel + één regel uitleg
 *   2. Sterk / Aandacht / Aanbevolen — altijd deze drie, in deze volgorde
 *   3. details, uitklapbaar en nooit standaard open
 *   4. één duidelijke vervolgactie
 *
 * Taalregel: korte zinnen, gewone woorden, positief geformuleerd. Geen
 * percentages als hoofdinformatie, geen vergelijking met andere kinderen, en
 * nooit een medische of diagnostische term.
 */

import Link from "next/link";
import {
  GeenKind,
  Pagina,
  Statusblok,
  Statusrij,
  Uitklap,
  WatGingErMis,
} from "@/components/ouder/Bouwstenen";
import { Klaargezet, ZetKlaar } from "@/components/ouder/Klaarzetten";
import { Oefenritme, Signalen } from "@/components/ouder/Voortgangblokken";
import { bekekenKind, vereisOuder } from "@/lib/auth/sessie";
import {
  haalFouten,
  haalKlaargezet,
  haalOefenritme,
  haalSignalen,
  haalWeekstatus,
  leerdoelenVanGroep,
  type Weekregel,
} from "@/lib/data/dashboard";

/** Een regel in een statusblok, met een link naar het detail. */
function Regel({ regel }: { regel: Weekregel }) {
  return (
    <Link
      href={`/ouder/voortgang/${regel.domeinSlug}/${regel.code}`}
      className="group block"
    >
      <span className="block font-medium group-hover:underline">{regel.titel}</span>
      <span className="block text-xs opacity-80">{regel.reden}</span>
    </Link>
  );
}

export default async function OverzichtPagina() {
  const ouder = await vereisOuder();
  const kind = await bekekenKind(ouder.id);
  if (!kind) return <GeenKind />;

  const week = haalWeekstatus(kind.id, kind.groep);
  const fouten = haalFouten(kind.id, kind.groep);
  const signalen = haalSignalen(kind.id, kind.groep);
  const ritme = haalOefenritme(kind.id);

  const plekken = leerdoelenVanGroep(kind.groep);
  const klaargezet = haalKlaargezet(kind.id).map((k) => ({
    id: k.id,
    titel:
      plekken.find((p) => p.leerdoel.id === k.leerdoelId)?.leerdoel.titel ??
      "Onbekend onderdeel",
    reden: k.reden,
  }));

  const nogNooitGeoefend = ritme.aantalSommen === 0 && week.sterk.length === 0;

  return (
    <Pagina
      titel="Overzicht"
      uitleg={`Hier zie je in één blik hoe het deze week met ${kind.roepnaam} gaat: wat goed gaat, wat aandacht vraagt en wat je thuis kunt doen.`}
    >
      {/* 2. Het belangrijkste eerst. Altijd deze drie, altijd deze volgorde. */}
      <Statusrij>
        <Statusblok
          soort="sterk"
          regels={week.sterk.map((r) => <Regel key={r.leerdoelId} regel={r} />)}
          leeg={`${kind.roepnaam} heeft deze week nog niet genoeg geoefend om hier iets over te zeggen.`}
        />
        <Statusblok
          soort="aandacht"
          regels={week.aandacht.map((r) => <Regel key={r.leerdoelId} regel={r} />)}
          leeg="Er vraagt op dit moment niets extra aandacht."
        />
        <Statusblok
          soort="aanbevolen"
          regels={week.aanbevolen.map((r) => (
            <Regel key={r.leerdoelId} regel={r} />
          ))}
          leeg={
            nogNooitGeoefend
              ? "Zodra er geoefend is, staat hier wat we voorstellen."
              : "Er staat niets in de weg. Vrij oefenen mag altijd."
          }
        />
      </Statusrij>

      {/* 3. Details, uitklapbaar. Nooit standaard open. */}
      <div className="flex flex-col gap-3">
        {fouten.length > 0 && (
          <Uitklap
            titel="Wat ging er mis en hoe help ik thuis"
            bijschrift={`${fouten.length} som${fouten.length === 1 ? "" : "men"} deze week`}
          >
            <div className="flex flex-col gap-3">
              {fouten.map((fout) => (
                <WatGingErMis
                  key={fout.antwoordId}
                  som={fout.vraagtekst || fout.leerdoelTitel}
                  watGingErMis={
                    fout.patroon ? (
                      fout.patroon.uitleg
                    ) : (
                      <>
                        We konden hier geen bekende denkfout herkennen. Dat
                        gebeurt; soms is het gewoon een verschrijving.
                      </>
                    )
                  }
                  opSchool={
                    <>
                      Op school heet dit <strong>{fout.patroon?.schoolwoord ?? fout.leerdoelTitel.toLowerCase()}</strong>.{" "}
                      {fout.patroon
                        ? "Gebruik thuis hetzelfde woord, dan sluit het op elkaar aan."
                        : "Gebruik thuis hetzelfde woord als op school."}
                    </>
                  }
                  zegDitThuis={
                    <ul className="flex list-disc flex-col gap-1 pl-4">
                      {(fout.patroon?.zinnen ?? [
                        `Vraag ${kind.roepnaam} eens hoe hij of zij deze som heeft aangepakt.`,
                      ]).map((zin, i) => (
                        <li key={i}>&ldquo;{zin}&rdquo;</li>
                      ))}
                    </ul>
                  }
                />
              ))}
            </div>
          </Uitklap>
        )}

        <Uitklap
          titel="Signalen van je kind"
          bijschrift={`Wat ${kind.roepnaam} zelf aangaf, en wat er weer gelukt is`}
        >
          <Signalen signalen={signalen} roepnaam={kind.roepnaam} />
        </Uitklap>

        <Uitklap titel="Oefenritme" bijschrift="Hoe vaak en hoe lang er is geoefend">
          <Oefenritme ritme={ritme} roepnaam={kind.roepnaam} />
        </Uitklap>

        {klaargezet.length > 0 && (
          <Uitklap
            titel="Wat er klaarstaat"
            bijschrift={`${klaargezet.length} oefening${klaargezet.length === 1 ? "" : "en"} bij "Voor jou"`}
          >
            <Klaargezet kindId={kind.id} items={klaargezet} />
          </Uitklap>
        )}
      </div>

      {/* 4. Eén duidelijke vervolgactie. */}
      <div className="border-t border-beheer-rand pt-5">
        {week.aanbevolen.length > 0 ? (
          <ZetKlaar
            kindId={kind.id}
            leerdoelIds={week.aanbevolen.map((r) => r.leerdoelId)}
            reden="Even herhalen — je ouder heeft dit klaargezet"
            label={`Zet deze oefeningen klaar voor ${kind.roepnaam}`}
          />
        ) : (
          <p className="text-sm text-beheer-zacht">
            {nogNooitGeoefend
              ? `${kind.roepnaam} heeft nog niet geoefend. Zodra dat gebeurt, zie je hier wat je thuis kunt doen.`
              : "Er staat niets klaar. Zodra er iets aandacht vraagt, zie je hier een knop."}
          </p>
        )}
      </div>
    </Pagina>
  );
}
