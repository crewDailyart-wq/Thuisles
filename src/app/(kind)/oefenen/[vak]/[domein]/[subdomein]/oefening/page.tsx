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
 * tien stuks, en een volgende keer krijgt het kind andere sommen uit dezelfde
 * verzameling. Dat is nodig zodra een leerdoel honderden gegenereerde sommen
 * heeft.
 *
 * Dezelfde som komt binnen één oefening alleen terug als er niet genoeg
 * verschillende zijn, en dan nooit twee keer achter elkaar; zie
 * `greepMetVariatie` en `uitElkaar` hieronder.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Icoon } from "@/components/kind/Icoon";
import { OefenSpeler } from "@/components/oefenen/OefenSpeler";
import { haalHuidigKind, haalOefenStart, haalSleutelstand } from "@/lib/data/queries";
import { bestaatAfbeelding } from "@/lib/data/afbeeldingen";
import { haalGepubliceerdeVragen, haalGepubliceerdeVragenOpIds } from "@/lib/data/vragen";
import { haalOefensessie } from "@/lib/data/oefensessies";
import { haalAlgemeenAantalVragen } from "@/lib/data/instellingen";
import { haalAandachtLeerdoelen, haalEerderGemaakt } from "@/lib/data/voortgang";
import type { OefenVraag, VraagInContext } from "@/lib/vraagtypes";

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

/** Twee vragen met dezelfde handtekening zijn dezelfde som. */
function somsleutel(v: VraagInContext): string {
  return v.handtekening ?? v.id;
}

/**
 * Een greep waarin zo weinig mogelijk dezelfde som zit.
 *
 * Sinds een sjabloon altijd het gevraagde aantal sommen maakt, kunnen er van
 * dezelfde som meerdere exemplaren in de database staan. Zonder dit zou een
 * kind er zomaar twee of drie van dezelfde achter elkaar kunnen krijgen.
 *
 * Daarom worden de vragen eerst op som gegroepeerd en wordt er per ronde één
 * uit elke groep gepakt: pas als elke som één keer aan de beurt is geweest,
 * komt er een tweede exemplaar bij. Zijn er meer verschillende sommen dan er
 * nodig zijn, dan komt er niets dubbel in de oefening.
 */
function greepMetVariatie(lijst: VraagInContext[], hoeveel: number): VraagInContext[] {
  if (hoeveel <= 0 || lijst.length === 0) return [];

  const groepen = new Map<string, VraagInContext[]>();
  for (const v of lijst) {
    const sleutel = somsleutel(v);
    const groep = groepen.get(sleutel);
    if (groep) groep.push(v);
    else groepen.set(sleutel, [v]);
  }

  /* Binnen een som telt de volgorde niet, en de sommen zelf ook door elkaar. */
  const rijtjes = greepUit(
    [...groepen.values()].map((g) => greepUit(g, g.length)),
    groepen.size,
  );

  const uit: VraagInContext[] = [];
  for (let ronde = 0; uit.length < hoeveel; ronde++) {
    const dezeRonde = rijtjes.filter((g) => g.length > ronde);
    if (dezeRonde.length === 0) break;
    for (const g of greepUit(dezeRonde, dezeRonde.length)) {
      if (uit.length >= hoeveel) break;
      uit.push(g[ronde]);
    }
  }
  return uit;
}

/**
 * Dezelfde som nooit twee keer achter elkaar.
 *
 * Komt een som toch twee keer in de reeks voor, dan wordt het tweede exemplaar
 * verderop tussengeschoven. Lukt dat niet — bijvoorbeeld als er maar één som
 * bestaat — dan blijft de volgorde zoals hij is; doorgaan is beter dan een
 * lege oefening.
 */
function uitElkaar(reeks: VraagInContext[]): VraagInContext[] {
  const uit = [...reeks];
  for (let i = 1; i < uit.length; i++) {
    if (somsleutel(uit[i]) !== somsleutel(uit[i - 1])) continue;
    const ruil = uit.findIndex(
      (v, j) =>
        j > i &&
        somsleutel(v) !== somsleutel(uit[i - 1]) &&
        somsleutel(v) !== somsleutel(uit[j - 1]) &&
        (j + 1 >= uit.length || somsleutel(uit[i]) !== somsleutel(uit[j + 1])),
    );
    if (ruil === -1) continue;
    [uit[i], uit[ruil]] = [uit[ruil], uit[i]];
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

  /*
    Was dit kind hier al mee bezig?

    De halve sessie staat in de database, bij het kind — niet in de browser.
    Daardoor pakt elk apparaat dezelfde draad op: dezelfde serie, dezelfde
    vraag, dezelfde gekleurde bolletjes.

    Het leerdoel hoort in het pad. Onder één onderwerp hangen meerdere
    leerdoelen die allemaal op deze pagina uitkomen; zonder het leerdoel deelden
    ze één halve sessie en kreeg een kind dat op "Bus tellen" klikte de serie
    van "Telrij stapstenen" voorgeschoteld. `herhaal=1` telt niet mee: dat is
    dezelfde oefening, alleen met andere vragen eruit gekozen.

    Dit gebeurt hier op de server en niet pas in de browser. Zou de browser het
    doen, dan ziet het kind eerst vraag 1 in beeld springen voordat het bij
    vraag 8 staat — en op een langzame telefoon is dat goed te zien.
  */
  const oefenpad = `${terugHref}/oefening${
    gekozenLeerdoel ? `?leerdoel=${gekozenLeerdoel}` : ""
  }`;
  const bewaard = haalOefensessie(kind.id, oefenpad);

  /*
    Van een bewaarde sessie zijn alleen de vraag-id's onthouden. Vragen die
    intussen zijn weggehaald of teruggezet naar concept, vallen eruit; de
    antwoorden die erbij hoorden gaan met dezelfde zeef mee, zodat de bolletjes
    bij de juiste vragen blijven horen.
  */
  const hervatRijen = bewaard ? haalGepubliceerdeVragenOpIds(bewaard.vraagIds) : [];
  const hervat =
    bewaard && hervatRijen.length > 0
      ? {
          rondeId: bewaard.rondeId,
          antwoorden: bewaard.antwoorden.filter((a) =>
            hervatRijen.some((v) => v.id === a.vraagId),
          ),
        }
      : null;

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
  const verseGreep = uitElkaar(
    [
      ...greepMetVariatie(nieuw, perSessie),
      ...greepMetVariatie(rest, Math.max(0, perSessie - nieuw.length)),
    ].slice(0, perSessie),
  );

  /* Verdergaan gaat voor: een nieuwe greep zou de halve serie weggooien. */
  const rijen = hervat ? hervatRijen : verseGreep;

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
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-huisstijl-diep px-6 py-3 text-base font-extrabold text-white transition hover:bg-huisstijl-donker"
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
      herhaalHref={oefenpad}
      beginsaldo={sleutels.saldo}
      kindId={kind.id}
      oefenpad={oefenpad}
      hervat={hervat}
    />
  );
}
