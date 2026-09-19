import "server-only";

/**
 * Instellingen die voor de hele app gelden.
 *
 * Een kleine sleutel-waardetabel. Bewust in de database en niet in code: zo is
 * het ook na livegang aan te passen zonder opnieuw uit te rollen, en het
 * verhuist mee naar Postgres.
 *
 * Elke instelling heeft hier een eigen functiepaar met een eigen grens, zodat
 * er nooit een onmogelijke waarde in belandt — ook niet als er ooit iets
 * rechtstreeks in de tabel wordt gezet.
 */

import { verbinding } from "@/lib/db/sqlite";
import {
  MASCOTTESETS,
  mascotteSleutel,
  mascottesetVan,
} from "@/lib/mascottesets";
import type { Instellingen } from "@/lib/generatoren/soort";
import { HENGELVOS } from "@/lib/generatoren/vissen";
import { MACHINIST } from "@/lib/generatoren/trein";

/** Wat een oefensessie telt als er niets is ingesteld. */
export const STANDAARD_VRAGEN_PER_SESSIE = 10;

/** Grenzen van het aantal vragen per sessie, overal hetzelfde. */
export const MIN_VRAGEN_PER_SESSIE = 1;
export const MAX_VRAGEN_PER_SESSIE = 50;

function lees(sleutel: string): string | null {
  const rij = verbinding()
    .prepare("select waarde from app_instellingen where sleutel = ?")
    .get(sleutel) as { waarde: string } | undefined;
  return rij?.waarde ?? null;
}

function schrijf(sleutel: string, waarde: string): void {
  verbinding()
    .prepare(
      `insert into app_instellingen (sleutel, waarde, bijgewerkt_op)
       values (?, ?, ?)
       on conflict (sleutel) do update set waarde = excluded.waarde,
                                           bijgewerkt_op = excluded.bijgewerkt_op`,
    )
    .run(sleutel, waarde, new Date().toISOString());
}

/** Binnen de grenzen houden; buiten bereik valt terug op de standaard. */
export function begrensAantal(waarde: unknown): number {
  const n = Math.round(Number(waarde));
  if (!Number.isFinite(n)) return STANDAARD_VRAGEN_PER_SESSIE;
  return Math.min(MAX_VRAGEN_PER_SESSIE, Math.max(MIN_VRAGEN_PER_SESSIE, n));
}

/**
 * Het algemene aantal vragen per oefensessie.
 *
 * Geldt voor elk leerdoel dat zelf geen eigen aantal heeft.
 */
export function haalAlgemeenAantalVragen(): number {
  const waarde = lees("vragen_per_sessie");
  return waarde === null ? STANDAARD_VRAGEN_PER_SESSIE : begrensAantal(waarde);
}

export function zetAlgemeenAantalVragen(aantal: number): number {
  const veilig = begrensAantal(aantal);
  schrijf("vragen_per_sessie", String(veilig));
  return veilig;
}

// ---------------------------------------------------------------------------
// De standaardvos
// ---------------------------------------------------------------------------

/** De drie houdingen van de mascotte, elk een bestandsnaam of leeg. */
export type Voshoudingen = {
  vangend: string | null;
  wachtend: string | null;
  blij: string | null;
};

const VOS_SLEUTELS: Record<keyof Voshoudingen, string> = {
  vangend: "vos_vangend",
  wachtend: "vos_wachtend",
  blij: "vos_blij",
};

const LEEG: Voshoudingen = { vangend: null, wachtend: null, blij: null };

/**
 * De vos die elk oefeningstype gebruikt zolang een sjabloon niets eigens heeft.
 *
 * Eén plek voor alle types samen. Zonder dit zou elk nieuw type opnieuw om
 * dezelfde drie uploads vragen, en zou een andere vos overal apart aangepast
 * moeten worden.
 *
 * Staat er hier nog niets, dan worden de afbeeldingen overgenomen van het
 * laatste sjabloon waar ze wél in staan. Zo werken de vosjes die al eerder zijn
 * geüpload meteen in elk nieuw type, zonder dat er iets ingevuld hoeft te
 * worden. Wordt de standaard hieronder wél gezet, dan gaat die voor.
 */
export function haalStandaardvos(): Voshoudingen {
  const gezet: Voshoudingen = {
    vangend: lees(VOS_SLEUTELS.vangend),
    wachtend: lees(VOS_SLEUTELS.wachtend),
    blij: lees(VOS_SLEUTELS.blij),
  };
  if (gezet.vangend) return gezet;

  return uitSjablonen();
}

/**
 * Wat er in de sjablonen zelf al aan vos-afbeeldingen staat.
 *
 * Het laatst aangemaakte sjabloon met een vos wint: dat is de vos waar de
 * eigenaar het recentst mee gewerkt heeft.
 */
function uitSjablonen(): Voshoudingen {
  const rijen = verbinding()
    .prepare(
      `select instellingen from sjablonen
       where instellingen like '%vosVangend%'
       order by aangemaakt_op desc`,
    )
    .all() as { instellingen: string | null }[];

  for (const rij of rijen) {
    let inst: Record<string, unknown>;
    try {
      inst = JSON.parse(rij.instellingen ?? "{}") as Record<string, unknown>;
    } catch {
      continue;
    }
    const naam = (sleutel: string): string | null => {
      const waarde = inst[sleutel];
      return typeof waarde === "string" && waarde !== "" ? waarde : null;
    };
    const vangend = naam("vosVangend");
    if (vangend) {
      return { vangend, wachtend: naam("vosWachtend"), blij: naam("vosBlij") };
    }
  }

  return LEEG;
}

/** Staat de standaardvos hier echt vast, of komt hij nog uit een sjabloon? */
export function vosIsVastgezet(): boolean {
  return lees(VOS_SLEUTELS.vangend) !== null && lees(VOS_SLEUTELS.vangend) !== "";
}

// ---------------------------------------------------------------------------
// De standaardmascotte per oefeningstype
// ---------------------------------------------------------------------------

/**
 * De mascotte die een type gebruikt als een sjabloon zelf niets invult.
 *
 * Waarom dit er bovenop de centrale vos is: die centrale vos kent maar drie
 * houdingen, en niet elk type gebruikt dezelfde. De stapstenen willen een
 * springende vos, de trein een machinist met een pet, het vissen een vos met
 * een hengel. Eén trio voor alles betekende dus dat je bij elk nieuw sjabloon
 * tóch weer ging invullen — precies wat dit moet oplossen.
 *
 * De sleutels zijn dezelfde als de velden bij het sjabloon; zie
 * `src/lib/mascottesets.ts`. Daardoor is de terugval één regel: wat het
 * sjabloon leeg laat, komt hiervandaan.
 *
 * De volgorde is: sjabloon → standaard van dit type → de centrale vos.
 */
export function haalTypemascottes(type: string): Record<string, string> {
  const set = mascottesetVan(type);
  if (!set) return {};

  const uit: Record<string, string> = {};
  for (const veld of set.velden) {
    const waarde = lees(mascotteSleutel(type, veld.sleutel));
    if (waarde) uit[veld.sleutel] = waarde;
  }
  return uit;
}

/** Alles in één keer, voor het beheerscherm. */
export function haalAlleTypemascottes(): Record<string, Record<string, string>> {
  const uit: Record<string, Record<string, string>> = {};
  for (const set of MASCOTTESETS) uit[set.type] = haalTypemascottes(set.type);
  return uit;
}

/**
 * De standaardmascotte van één type vastzetten.
 *
 * Een lege waarde wist die plek; dan geldt weer wat er centraal staat. Er wordt
 * niet gecontroleerd of het bestand er is — dezelfde afspraak als bij een
 * afbeelding bij een vraag, waar een verwijderd bestand ook gewoon leeg blijft.
 */
export function zetTypemascottes(type: string, waarden: Record<string, string>): void {
  const set = mascottesetVan(type);
  if (!set) return;
  for (const veld of set.velden) {
    schrijf(mascotteSleutel(type, veld.sleutel), (waarden[veld.sleutel] ?? "").trim());
  }
}

/**
 * Wat er geldt als een mascotteveld bij een sjabloon leeg blijft.
 *
 * Voor het sjabloonscherm: daar staat het erbij met een voorbeeldje, zodat een
 * beheerder ziet dát er iemand staat en het niet voor de zekerheid nog een keer
 * invult. Dezelfde volgorde als bij het tonen: de standaard van dit type, en
 * anders de centrale vos.
 */
export function haalTerugvalmascottes(type: string): Record<string, string> {
  const set = mascottesetVan(type);
  if (!set) return {};

  const eigen = haalTypemascottes(type);
  const centraal = haalStandaardvos();
  const centraalPer: Record<string, string | null> = {
    vosVangend: centraal.vangend,
    vosWachtend: centraal.wachtend,
    vosBlij: centraal.blij,
    /* Deze twee hebben geen centrale tegenhanger; zie de generatoren. */
    vosHengel: HENGELVOS.afbeelding,
    vosMachinist: MACHINIST.afbeelding,
  };

  const uit: Record<string, string> = {};
  for (const veld of set.velden) {
    const waarde = eigen[veld.sleutel] ?? centraalPer[veld.sleutel] ?? null;
    if (waarde) uit[veld.sleutel] = waarde;
  }
  return uit;
}

/** Voor het scherm Nieuw sjabloon: alle types tegelijk, want de keuze valt daar. */
export function haalAlleTerugvalmascottes(): Record<string, Record<string, string>> {
  const uit: Record<string, Record<string, string>> = {};
  for (const set of MASCOTTESETS) uit[set.type] = haalTerugvalmascottes(set.type);
  return uit;
}

/**
 * De instellingen van een sjabloon aangevuld met de standaard van zijn type.
 *
 * Wordt toegepast vlak voordat een generator aan het werk gaat. Wat het
 * sjabloon zelf heeft ingevuld blijft staan — daar wordt nooit overheen
 * geschreven, ook niet als de standaard iets anders zegt.
 */
export function metStandaardmascottes(type: string, inst: Instellingen): Instellingen {
  const standaard = haalTypemascottes(type);
  if (Object.keys(standaard).length === 0) return inst;

  const uit: Instellingen = { ...inst };
  for (const [sleutel, waarde] of Object.entries(standaard)) {
    const eigen = uit[sleutel];
    if (typeof eigen === "string" && eigen.trim() !== "") continue;
    uit[sleutel] = waarde;
  }
  return uit;
}

/**
 * De standaardvos vastzetten.
 *
 * Een lege waarde wist de instelling; dan geldt weer wat er in de sjablonen
 * staat. Er wordt niets gecontroleerd op bestaan: dezelfde afspraak als bij een
 * afbeelding bij een vraag, waar een verwijderd bestand ook gewoon leeg blijft.
 */
export function zetStandaardvos(houdingen: Voshoudingen): void {
  for (const [houding, sleutel] of Object.entries(VOS_SLEUTELS)) {
    const waarde = houdingen[houding as keyof Voshoudingen] ?? "";
    schrijf(sleutel, waarde);
  }
}
