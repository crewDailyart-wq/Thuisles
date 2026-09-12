/**
 * Voortgang › onderdeel › één leerdoel.
 *
 * Het diepste niveau: de stand van dit ene onderdeel, en per fout gemaakte som
 * het uitklapblok met de drie vaste kopjes.
 */

import { notFound } from "next/navigation";
import {
  GeenKind,
  Kaart,
  Pagina,
  Standmerk,
  WatGingErMis,
} from "@/components/ouder/Bouwstenen";
import { ZetKlaar } from "@/components/ouder/Klaarzetten";
import { bekekenKind, vereisOuder } from "@/lib/auth/sessie";
import { haalFouten, leerdoelenVanGroep } from "@/lib/data/dashboard";
import { haalVoortgang } from "@/lib/data/voortgang";

const STANDWOORD = {
  nog_niet_gestart: "Nog niet gestart",
  oefent: "Oefent",
  bijna_beheerst: "Bijna beheerst",
  beheerst: "Beheerst",
} as const;

export default async function LeerdoelPagina({
  params,
}: {
  params: Promise<{ domein: string; leerdoel: string }>;
}) {
  const ouder = await vereisOuder();
  const kind = await bekekenKind(ouder.id);
  if (!kind) return <GeenKind />;

  const { domein: domeinSlug, leerdoel: code } = await params;
  const plek = leerdoelenVanGroep(kind.groep).find(
    (p) => p.domein.slug === domeinSlug && p.leerdoel.code === code,
  );
  if (!plek) notFound();

  const v = haalVoortgang(kind.id).find((x) => x.leerdoelId === plek.leerdoel.id);
  const stand = v?.status ?? "nog_niet_gestart";
  const vraagtAandacht = Boolean(v?.aandacht || v?.zelfLastig);

  // Alleen de fouten van dit leerdoel; ruimer venster dan op het overzicht,
  // want hier zoekt een ouder gericht.
  const fouten = haalFouten(kind.id, kind.groep, 30, 40).filter(
    (f) => f.leerdoelId === plek.leerdoel.id,
  );

  return (
    <Pagina
      kruimels={[
        { label: "Voortgang", href: "/ouder/voortgang" },
        { label: plek.domein.naam, href: `/ouder/voortgang/${domeinSlug}` },
        { label: plek.leerdoel.titel },
      ]}
      titel={plek.leerdoel.titel}
      uitleg={`Wat er bij dit onderdeel misging, hoe het op school wordt uitgelegd en wat je thuis kunt zeggen.`}
    >
      <Kaart>
        <div className="flex items-start gap-3">
          <Standmerk stand={stand} className="mt-0.5 size-6 shrink-0" />
          <div className="min-w-0 text-sm">
            <p className="font-medium">{STANDWOORD[stand]}</p>
            <p className="text-beheer-zacht">
              {plek.subdomein.naam}
              {v?.laatstGeoefendOp && (
                <>
                  {" · laatst geoefend op "}
                  {new Date(v.laatstGeoefendOp).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "long",
                  })}
                </>
              )}
            </p>
            {v?.zelfLastig && (
              <p className="mt-1.5 text-beheer-inkt">
                {kind.roepnaam} gaf zelf aan dit nog niet te snappen.
              </p>
            )}
          </div>
        </div>
      </Kaart>

      {fouten.length === 0 ? (
        <Kaart>
          <p className="text-sm leading-relaxed text-beheer-zacht">
            {stand === "nog_niet_gestart"
              ? `${kind.roepnaam} is hier nog niet aan begonnen.`
              : `Er zijn hier de afgelopen maand geen fouten gemaakt. Mooi zo.`}
          </p>
        </Kaart>
      ) : (
        <div className="flex flex-col gap-3">
          {fouten.map((fout) => (
            <WatGingErMis
              key={fout.antwoordId}
              som={fout.vraagtekst || plek.leerdoel.titel}
              watGingErMis={
                fout.patroon ? (
                  fout.patroon.uitleg
                ) : (
                  <>
                    We konden hier geen bekende denkfout herkennen. Dat gebeurt;
                    soms is het gewoon een verschrijving.
                  </>
                )
              }
              opSchool={
                <>
                  Op school heet dit{" "}
                  <strong>
                    {fout.patroon?.schoolwoord ?? plek.leerdoel.titel.toLowerCase()}
                  </strong>
                  . Gebruik thuis hetzelfde woord, dan sluit het op elkaar aan.
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
      )}

      <div className="border-t border-beheer-rand pt-5">
        {stand === "beheerst" && !vraagtAandacht ? (
          <p className="text-sm text-beheer-zacht">
            Dit gaat goed. Je hoeft hier niets voor klaar te zetten.
          </p>
        ) : (
          <ZetKlaar
            kindId={kind.id}
            leerdoelIds={[plek.leerdoel.id]}
            reden={`Even herhalen: ${plek.leerdoel.titel.toLowerCase()}`}
            label={`Zet deze oefening klaar voor ${kind.roepnaam}`}
          />
        )}
      </div>
    </Pagina>
  );
}
