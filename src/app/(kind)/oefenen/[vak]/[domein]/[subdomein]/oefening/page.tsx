/**
 * De oefening: haalt de gepubliceerde vragen op en geeft ze aan de speler.
 *
 * Zonder `?leerdoel=` oefent het kind met alle leerdoelen van dit onderwerp
 * die bij zijn of haar groep horen. Met `?leerdoel=` alleen met dat ene
 * leerdoel.
 *
 * Conceptvragen komen hier nooit terecht: die zijn nog niet af.
 *
 * Uit de beschikbare vragen wordt een willekeurige greep gedaan van hoogstens
 * tien stuks. Binnen één oefening komt niets dubbel voor, en een volgende keer
 * krijgt het kind andere sommen uit dezelfde verzameling. Dat is nodig zodra
 * een leerdoel honderden gegenereerde sommen heeft.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Icoon } from "@/components/kind/Icoon";
import { OefenSpeler } from "@/components/oefenen/OefenSpeler";
import { haalHuidigKind, haalOefenStart, haalSleutelstand } from "@/lib/data/queries";
import { bestaatAfbeelding } from "@/lib/data/afbeeldingen";
import { haalGepubliceerdeVragen } from "@/lib/data/vragen";
import { haalAlgemeenAantalVragen } from "@/lib/data/instellingen";
import { haalAandachtLeerdoelen, haalEerderGemaakt } from "@/lib/data/voortgang";
import type { OefenVraag } from "@/lib/vraagtypes";

/**
 * Hoeveel vragen deze oefensessie telt.
 *
 * Per leerdoel in te stellen; staat daar niets, dan geldt de algemene
 * standaard uit de beheerinstellingen. Oefent een kind aan meerdere leerdoelen
 * tegelijk (het hele onderwerp), dan wint het hoogste ingestelde aantal: dan
 * krijgt elk leerdoel tenminste wat het vraagt.
 *
 * Zijn er minder gepubliceerde vragen dan gevraagd, dan komen ze gewoon
 * allemaal langs — dat is geen fout, er is dan simpelweg niet meer.
 */
function aantalVragenVoor(
  leerdoelen: { leerdoel: { vragenPerSessie: number | null } }[],
  algemeen: number,
): number {
  const aantallen = leerdoelen.map((l) => l.leerdoel.vragenPerSessie ?? algemeen);
  return aantallen.length === 0 ? algemeen : Math.max(...aantallen);
}

/** Willekeurige greep zonder herhaling. */
function greepUit<T>(lijst: T[], hoeveel: number): T[] {
  if (lijst.length <= hoeveel) return [...lijst].sort(() => Math.random() - 0.5);
  const kopie = [...lijst];
  const uit: T[] = [];
  while (uit.length < hoeveel && kopie.length > 0) {
    uit.push(kopie.splice(Math.floor(Math.random() * kopie.length), 1)[0]);
  }
  return uit;
}

export default async function OefeningPagina({
  params,
  searchParams,
}: {
  params: Promise<{ vak: string; domein: string; subdomein: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { vak: vakSlug, domein: domeinSlug, subdomein: subSlug } = await params;
  const zoek = await searchParams;
  const gekozenLeerdoel = Array.isArray(zoek.leerdoel) ? zoek.leerdoel[0] : zoek.leerdoel;

  const kind = await haalHuidigKind();
  const data = await haalOefenStart(vakSlug, domeinSlug, subSlug, kind.id);
  if (!data) notFound();

  const terugHref = `/oefenen/${vakSlug}/${domeinSlug}/${subSlug}`;

  const leerdoelen = gekozenLeerdoel
    ? data.leerdoelen.filter((l) => l.leerdoel.id === gekozenLeerdoel)
    : data.leerdoelen;

  const alleVragen = haalGepubliceerdeVragen(leerdoelen.map((l) => l.leerdoel.id));
  const perSessie = aantalVragenVoor(leerdoelen, haalAlgemeenAantalVragen());

  /*
    Met ?herhaal=1 komt het kind uit de knop "Oefen wat nog lastig was".
    Dan krijgt het bij voorkeur vragen die het nog niet eerder heeft gehad —
    nooit precies dezelfde als zojuist. Zijn die op, dan vullen we aan met de
    rest, want doorgaan is beter dan een leeg scherm.
  */
  const isHerhaling = (Array.isArray(zoek.herhaal) ? zoek.herhaal[0] : zoek.herhaal) === "1";
  const alGehad = isHerhaling ? haalEerderGemaakt(kind.id) : new Set<string>();

  const nieuw = alleVragen.filter((v) => !alGehad.has(v.id));
  const rest = alleVragen.filter((v) => alGehad.has(v.id));
  const rijen = [
    ...greepUit(nieuw, perSessie),
    ...greepUit(rest, Math.max(0, perSessie - nieuw.length)),
  ].slice(0, perSessie);

  const vragen: OefenVraag[] = rijen.map((v) => ({
    id: v.id,
    vorm: v.vorm,
    vraagtekst: v.vraagtekst,
    /*
      Een afbeelding die niet bestaat wordt hier weggelaten. Dan valt de optie
      terug op alleen tekst, in plaats van dat een kind een gebroken plaatje
      te zien krijgt.
    */
    opties:
      v.opties?.map((o) => ({
        tekst: o.tekst,
        afbeelding: bestaatAfbeelding(o.afbeelding) ? o.afbeelding : null,
      })) ?? null,
    antwoord: v.antwoord,
    hint: v.hint,
    afbeelding: bestaatAfbeelding(v.afbeelding) ? v.afbeelding : null,
    figuur: v.figuur,
    somgegevens: v.somgegevens,
    uitleg: v.uitleg,
    uitlegAfbeelding: bestaatAfbeelding(v.uitlegAfbeelding) ? v.uitlegAfbeelding : null,
    uitlegvorm: v.uitlegvorm,
    leerdoelId: v.leerdoelId,
    leerdoelTitel: v.leerdoelTitel,
  }));

  // Geen gepubliceerde vragen: eerlijk melden in plaats van een leeg scherm.
  if (vragen.length === 0) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-groot border border-rand bg-kaart p-8 text-center shadow-op">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-room text-inkt-zacht">
          <Icoon naam="oefenen" className="size-8" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold">
          Nog geen oefeningen beschikbaar
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-inkt-zacht">
          Voor {data.subdomein.naam.toLowerCase()} staan nog geen vragen klaar.
          Kies zolang een ander onderwerp — daar valt vast wel iets te oefenen.
        </p>

        <Link
          href={terugHref}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-viool px-6 py-3 text-base font-extrabold text-white transition hover:bg-viool-diep"
        >
          Terug naar {data.subdomein.naam}
        </Link>
      </div>
    );
  }

  // Welke leerdoelen stonden vóór deze ronde al op "aandacht"? Daarmee kan
  // aan het eind een comeback worden gevierd.
  const aandachtVooraf = [...haalAandachtLeerdoelen(kind.id)];

  // De teller in de oefenbalk begint bij wat er nu staat en telt van daaraf op.
  const sleutels = await haalSleutelstand(kind.id);

  return (
    <OefenSpeler
      vragen={vragen}
      terugHref={terugHref}
      terugLabel={data.subdomein.naam}
      groep={kind.groep}
      aandachtVooraf={aandachtVooraf}
      herhaalHref={`${terugHref}/oefening`}
      beginsaldo={sleutels.saldo}
      kindId={kind.id}
    />
  );
}
