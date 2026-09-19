import "server-only";

/**
 * Alle databewerkingen voor vragen in de beheeromgeving.
 *
 * Dit is de enige plek die de vragentabel kent. De schermen roepen deze
 * functies aan en weten verder niets over opslag — dezelfde afspraak als aan
 * de kinderkant. Wisselen naar Postgres betekent later: alleen dit bestand
 * omzetten.
 *
 * Iedere schrijfactie loopt langs `controleerVraag`, zodat het losse formulier
 * en de bulk-upload precies dezelfde regels hanteren.
 */

import { randomUUID } from "node:crypto";
import { bestaatAfbeelding } from "@/lib/data/afbeeldingen";
import {
  haalStandaardvos,
  haalTypemascottes,
  metStandaardmascottes,
} from "@/lib/data/instellingen";
import { hengelVan } from "@/lib/generatoren/vissen";
import { machinistVan } from "@/lib/generatoren/trein";
import { verbinding } from "@/lib/db/sqlite";
import { filterLeerdoelen, LEEG, type Beheerfilter } from "@/lib/beheerfilter";
import {
  VRAAGVORMEN,
  leesOpties,
  type AntwoordOptie,
  type Vraag,
  type VraagInContext,
  type Vraagstatus,
  type Vraagvorm,
} from "@/lib/vraagtypes";

// ---------------------------------------------------------------------------
// Leerdoelen (de keten waaraan een vraag hangt)
// ---------------------------------------------------------------------------

export type LeerdoelRegel = {
  id: string;
  code: string;
  titel: string;
  groepVan: number;
  groepTot: number;
  /** Ids van de plek in de structuur, om er direct iets onder te kunnen maken. */
  subdomeinId: string;
  domeinId: string;
  subdomeinNaam: string;
  subdomeinSlug: string;
  domeinNaam: string;
  domeinSlug: string;
  vakNaam: string;
  vakSlug: string;
  aantalVragen: number;
};

const KETEN = `
  from leerdoelen ld
  join subdomeinen s on s.id = ld.subdomein_id
  join domeinen    d on d.id = s.domein_id
  join vakken      v on v.id = d.vak_id
`;

export function haalLeerdoelen(): LeerdoelRegel[] {
  const db = verbinding();
  const rijen = db
    .prepare(
      `select ld.id, ld.code, ld.titel, ld.groep_van, ld.groep_tot,
              s.id as subdomein_id, d.id as domein_id,
              s.naam as subdomein_naam, s.slug as subdomein_slug,
              d.naam as domein_naam, d.slug as domein_slug,
              v.naam as vak_naam, v.slug as vak_slug,
              (select count(*) from vragen q where q.leerdoel_id = ld.id) as aantal
       ${KETEN}
       order by v.naam, d.volgorde, s.volgorde, ld.volgorde`,
    )
    .all() as Record<string, string | number>[];

  return rijen.map((r) => ({
    id: String(r.id),
    code: String(r.code),
    titel: String(r.titel),
    groepVan: Number(r.groep_van),
    groepTot: Number(r.groep_tot),
    subdomeinId: String(r.subdomein_id),
    domeinId: String(r.domein_id),
    subdomeinNaam: String(r.subdomein_naam),
    subdomeinSlug: String(r.subdomein_slug),
    domeinNaam: String(r.domein_naam),
    domeinSlug: String(r.domein_slug),
    vakNaam: String(r.vak_naam),
    vakSlug: String(r.vak_slug),
    aantalVragen: Number(r.aantal),
  }));
}

// ---------------------------------------------------------------------------
// Vragen ophalen
// ---------------------------------------------------------------------------

export type VraagFilters = {
  zoek?: string;
  vak?: string;
  domein?: string;
  subdomein?: string;
  leerdoel?: string;
  groep?: string;
  vorm?: string;
};

/** De drie houdingen, rechtstreeks uit de vorm van het figuur zelf. */
type Voshoudingen = Extract<
  NonNullable<Vraag["figuur"]>,
  { soort: "plaatjesraster" }
>["vos"];

/**
 * De vos-afbeeldingen van een sjabloon, zoals ze er nú in staan.
 *
 * Bewust een aparte vraag aan de database en geen waarde die blijft hangen:
 * verandert de beheerder de upload, dan moet het kind bij de eerstvolgende
 * vraag de nieuwe vos zien. Een cache zou precies dat weer in de weg zitten.
 *
 * `null` betekent: dit sjabloon bestaat niet meer, of het is er een zonder
 * vos-velden. De aanroeper houdt dan wat er in de vraag zelf staat.
 */
function vosVanSjabloon(sjabloonId: string): Voshoudingen | null {
  const rij = sjabloonrij(sjabloonId);
  if (!rij) return null;

  const naam = (sleutel: string): string | null => {
    const eigen = rij.inst[sleutel];
    if (typeof eigen === "string" && eigen !== "") return eigen;
    /* Daarna de standaard van dít type; die staat in het afbeeldingenbeheer. */
    const vanType = haalTypemascottes(rij.soort)[sleutel];
    return vanType && vanType !== "" ? vanType : null;
  };

  /*
    Wat het sjabloon zelf invult gaat voor; dan de standaard van dit type; en
    wat dán nog leeg is, komt van de centrale vos. Zo hoeft een beheerder niet
    bij elk sjabloon opnieuw dezelfde afbeeldingen te kiezen, en kan het per
    sjabloon toch anders.
  */
  const standaard = haalStandaardvos();
  return {
    vangend: naam("vosVangend") ?? standaard.vangend,
    wachtend: naam("vosWachtend") ?? standaard.wachtend,
    blij: naam("vosBlij") ?? standaard.blij,
  };
}

/** Het soort en de instellingen van een sjabloon, of `null`. */
function sjabloonrij(
  sjabloonId: string,
): { soort: string; inst: Record<string, unknown> } | null {
  const rij = verbinding()
    .prepare("select soort, instellingen from sjablonen where id = ?")
    .get(sjabloonId) as { soort: string; instellingen: string | null } | undefined;
  if (!rij) return null;

  try {
    return {
      soort: rij.soort,
      inst: JSON.parse(rij.instellingen ?? "{}") as Record<string, unknown>,
    };
  } catch {
    return null;
  }
}

/**
 * De vissende vos zoals zijn sjabloon hem heeft staan.
 *
 * Hetzelfde verhaal als bij de gewone vos hierboven: welk plaatje het is en
 * waar het hengelpuntje zit, hoort bij het sjabloon en niet bij de som. Zet de
 * beheerder er een andere vos in, of schuift die het puntje een tiende op, dan
 * hoort dat meteen te gelden — ook voor vragen die er al stonden.
 *
 * Wat er niet staat, valt terug op wat de generator als standaard kent.
 */
function hengelVanSjabloon(sjabloonId: string) {
  return uitSjabloon(sjabloonId, hengelVan);
}

/**
 * Een stukje sjablooninstelling ophalen en door de generator laten uitlezen.
 *
 * De generator weet zelf wat er standaard geldt en wat er binnen de grenzen
 * valt; hier wordt alleen opgezocht wat er is opgeslagen.
 */
function uitSjabloon<T>(
  sjabloonId: string,
  lees: (inst: Record<string, never>) => T,
): T | null {
  const rij = sjabloonrij(sjabloonId);
  if (!rij) return null;

  /*
    Eerst de standaard van dit type erbij. Wat het sjabloon zelf heeft staan
    blijft daarbij staan; alleen wat leeg is wordt aangevuld.
  */
  return lees(
    metStandaardmascottes(rij.soort, rij.inst as never) as unknown as Record<string, never>,
  );
}

/**
 * De vos in een telplaatjes-figuur bijwerken vanuit zijn sjabloon.
 *
 * Waarom dit hier gebeurt en niet bij het genereren: bij het genereren wordt
 * alles wat een vraag nodig heeft in de vraag zelf gezet, en daar blijft het
 * staan — ook als de beheerder daarna een andere vos uploadt. Het kind kreeg
 * dan de vos van toen. Voor de vos is dat niet de bedoeling: die hoort bij het
 * sjabloon en niet bij de som, en moet dus meebewegen.
 *
 * Wat in de vraag staat, blijft er gewoon staan en is de terugval: is het
 * sjabloon verwijderd, dan houdt de vraag de vos die er al in zat.
 */
function metVosVanSjabloon(
  figuur: Vraag["figuur"],
  sjabloonId: string | null,
): Vraag["figuur"] {
  /*
    Elk figuur met een mascotte doet mee. Komt er een type bij, dan hoeft hier
    niets veranderd te worden: het herkent zichzelf aan het veld `vos`.
  */
  if (figuur?.soort === "bus" && sjabloonId) {
    const rij = verbinding().prepare("select instellingen from sjablonen where id = ?").get(sjabloonId) as { instellingen: string | null } | undefined;
    try {
      const inst = JSON.parse(rij?.instellingen ?? "{}");
      const maximum = Math.max(20, Number(inst.tot) || 30, Number(inst.van) || 1, figuur.totaal);
      return { ...figuur, animatie: inst.animatie === "wegrijden" ? "wegrijden" : "instappen", plaatsen: Math.ceil(maximum / figuur.perGroep) * figuur.perGroep };
    } catch { return figuur; }
  }
  if (!figuur || !("vos" in figuur) || !sjabloonId) return figuur;

  const vos = vosVanSjabloon(sjabloonId);
  if (!vos) return figuur;

  /*
    De vijver heeft ook een hengelvos; die gaat op dezelfde manier mee.

    Herkend aan de soort en niet aan het veld zelf. Vragen die gemaakt zijn
    voordat dit veld bestond hebben het namelijk helemaal niet staan, en juist
    die horen de hengelvos alsnog te krijgen — anders blijft een kind bij een
    bestaand sjabloon de oude vos zien tot alle vragen opnieuw gemaakt zijn.
  */
  if (figuur.soort === "visvijver") {
    const hengel = hengelVanSjabloon(sjabloonId);
    if (hengel) return { ...figuur, vos, hengel };
  }

  /* En de trein heeft een machinist; om dezelfde reden. */
  if (figuur.soort === "trein") {
    const machinist = uitSjabloon(sjabloonId, machinistVan);
    if (machinist) return { ...figuur, vos, machinist };
  }

  return { ...figuur, vos };
}

function naarVraag(r: Record<string, string | number | null>): VraagInContext {
  const figuur = metVosVanSjabloon(r.figuur ? JSON.parse(String(r.figuur)) as Vraag["figuur"] : null, r.sjabloon_id ? String(r.sjabloon_id) : null);
  const som = r.somgegevens ? JSON.parse(String(r.somgegevens)) as Vraag["somgegevens"] : null;
  if (som && figuur?.soort === "bus") som.extra = { ...som.extra, busPlaatsen: figuur.plaatsen ?? 40 };
  return {
    id: String(r.id),
    leerdoelId: String(r.leerdoel_id),
    groep: Number(r.groep),
    vorm: String(r.vorm) as Vraagvorm,
    vraagtekst: String(r.vraagtekst),
    opties: leesOpties(r.opties === null ? null : String(r.opties)),
    antwoord: String(r.antwoord),
    hint: r.hint ? String(r.hint) : null,
    afbeelding: r.afbeelding ? String(r.afbeelding) : null,
    figuur,
    somgegevens: som,
    uitleg: r.uitleg ? String(r.uitleg) : null,
    uitlegAfbeelding: r.uitleg_afbeelding ? String(r.uitleg_afbeelding) : null,
    sjabloonId: r.sjabloon_id ? String(r.sjabloon_id) : null,
    handtekening: r.handtekening ? String(r.handtekening) : null,
    status: String(r.status) as Vraagstatus,
    aangemaaktOp: String(r.aangemaakt_op),
    uitlegvorm: r.uitlegvorm ? String(r.uitlegvorm) : null,
    leerdoelCode: String(r.code),
    leerdoelTitel: String(r.titel),
    subdomeinNaam: String(r.subdomein_naam),
    domeinNaam: String(r.domein_naam),
    domeinSlug: String(r.domein_slug),
    vakNaam: String(r.vak_naam),
    vakSlug: String(r.vak_slug),
  };
}

/** De vragen die uit één sjabloon zijn voortgekomen. */
export function haalVragenVanSjabloon(sjabloonId: string): VraagInContext[] {
  const rijen = verbinding()
    .prepare(
      `select q.*, ld.code, ld.titel, ld.uitlegvorm,
              s.naam as subdomein_naam, d.naam as domein_naam, d.slug as domein_slug,
              v.naam as vak_naam, v.slug as vak_slug
       from vragen q
       join leerdoelen  ld on ld.id = q.leerdoel_id
       join subdomeinen s  on s.id = ld.subdomein_id
       join domeinen    d  on d.id = s.domein_id
       join vakken      v  on v.id = d.vak_id
       where q.sjabloon_id = ?
       order by q.aangemaakt_op, q.rowid`,
    )
    .all(sjabloonId) as Record<string, string | number | null>[];
  return rijen.map(naarVraag);
}

export function haalVragen(filters: VraagFilters = {}): VraagInContext[] {
  const db = verbinding();
  const waar: string[] = [];
  const args: (string | number)[] = [];

  if (filters.zoek?.trim()) {
    waar.push("(lower(q.vraagtekst) like ? or lower(ld.titel) like ? or lower(ld.code) like ?)");
    const t = `%${filters.zoek.trim().toLowerCase()}%`;
    args.push(t, t, t);
  }
  if (filters.vak) {
    waar.push("v.slug = ?");
    args.push(filters.vak);
  }
  if (filters.domein) {
    waar.push("d.slug = ?");
    args.push(filters.domein);
  }
  if (filters.subdomein) {
    waar.push("s.slug = ?");
    args.push(filters.subdomein);
  }
  if (filters.leerdoel) {
    waar.push("ld.id = ?");
    args.push(filters.leerdoel);
  }
  /*
    Op groep filteren gaat via de groepsrange van het LEERDOEL, niet via de
    groep van de vraag zelf. Zo betekent "groep 4" overal in de beheeromgeving
    hetzelfde: alles wat bij groep 4 hoort. Een leerdoel van groep 4 tot en met
    6 valt dus onder groep 4, 5 én 6.
  */
  if (filters.groep) {
    waar.push("ld.groep_van <= ? and ld.groep_tot >= ?");
    args.push(Number(filters.groep), Number(filters.groep));
  }
  if (filters.vorm) {
    waar.push("q.vorm = ?");
    args.push(filters.vorm);
  }

  const rijen = db
    .prepare(
      `select q.*, ld.code, ld.titel, ld.uitlegvorm,
              s.naam as subdomein_naam, d.naam as domein_naam, d.slug as domein_slug,
              v.naam as vak_naam, v.slug as vak_slug
       from vragen q
       join leerdoelen  ld on ld.id = q.leerdoel_id
       join subdomeinen s  on s.id = ld.subdomein_id
       join domeinen    d  on d.id = s.domein_id
       join vakken      v  on v.id = d.vak_id
       ${waar.length ? `where ${waar.join(" and ")}` : ""}
       order by q.aangemaakt_op desc`,
    )
    .all(...args) as Record<string, string | number | null>[];

  return rijen.map(naarVraag);
}

export function telVragen(): number {
  const db = verbinding();
  const r = db.prepare("select count(*) as n from vragen").get() as { n: number };
  return Number(r.n);
}

// ---------------------------------------------------------------------------
// Controleren en opslaan
// ---------------------------------------------------------------------------

export type NieuweVraag = {
  leerdoelId: string;
  groep: number;
  vorm: Vraagvorm;
  vraagtekst: string;
  opties: AntwoordOptie[];
  /** meerkeuze: index als tekst. open: antwoorden met "|". waar/niet waar: "waar". */
  antwoord: string;
  hint?: string;
  afbeelding?: string;
  /** Hoe je deze som oplost. Wordt getoond bij een fout antwoord. */
  uitleg?: string;
  uitlegAfbeelding?: string;
  status?: Vraagstatus;
};

/**
 * Eén set regels voor zowel het formulier als de CSV-import.
 * Geeft een lijst met fouten terug; leeg betekent goedgekeurd.
 */
export function controleerVraag(v: Partial<NieuweVraag>): string[] {
  const fouten: string[] = [];
  const db = verbinding();

  if (!v.vorm || !VRAAGVORMEN.includes(v.vorm)) {
    fouten.push("Onbekend vraagtype.");
  }
  if (!v.vraagtekst?.trim()) {
    fouten.push("De vraagtekst is leeg.");
  } else if (v.vraagtekst.trim().length < 3) {
    fouten.push("De vraagtekst is te kort.");
  }

  const leerdoel = v.leerdoelId
    ? (db
        .prepare("select id, groep_van, groep_tot, titel from leerdoelen where id = ?")
        .get(v.leerdoelId) as
        | { groep_van: number; groep_tot: number; titel: string }
        | undefined)
    : undefined;

  if (!leerdoel) {
    fouten.push("Het leerdoel bestaat niet.");
  } else if (v.groep === undefined || Number.isNaN(v.groep)) {
    fouten.push("De groep ontbreekt.");
  } else if (v.groep < leerdoel.groep_van || v.groep > leerdoel.groep_tot) {
    fouten.push(
      `Groep ${v.groep} valt buiten dit leerdoel (groep ${leerdoel.groep_van} tot en met ${leerdoel.groep_tot}).`,
    );
  }

  if (v.vorm === "meerkeuze") {
    // Een optie telt mee zodra er tekst OF een afbeelding bij staat.
    const opties = schoneOpties(v.opties ?? []);

    if (opties.length < 2) {
      fouten.push("Een meerkeuzevraag heeft minstens twee antwoorden nodig.");
    }
    if (opties.length > 6) {
      fouten.push("Een meerkeuzevraag heeft er hoogstens zes.");
    }

    const kenmerken = opties.map((o) =>
      `${o.tekst.toLowerCase()}|${o.afbeelding ?? ""}`,
    );
    if (new Set(kenmerken).size !== kenmerken.length) {
      fouten.push("Twee antwoorden zijn hetzelfde.");
    }

    const ontbrekend = opties.filter(
      (o) => o.afbeelding && !bestaatAfbeelding(o.afbeelding),
    );
    for (const o of ontbrekend) {
      fouten.push(
        `De afbeelding "${o.afbeelding}" staat niet in de map public/vragen.`,
      );
    }

    const i = Number(v.antwoord);
    if (Number.isNaN(i) || i < 0 || i >= opties.length) {
      fouten.push("Er is niet aangegeven welk antwoord goed is.");
    }
  }

  if (v.vorm === "open") {
    const antwoorden = (v.antwoord ?? "").split("|").map((a) => a.trim()).filter(Boolean);
    if (antwoorden.length === 0) fouten.push("Het goede antwoord ontbreekt.");
  }

  if (v.vorm === "waar_niet_waar" && !["waar", "niet_waar"].includes(v.antwoord ?? "")) {
    fouten.push("Kies of de stelling waar of niet waar is.");
  }

  return fouten;
}

/** Lege opties weglaten en spaties opruimen. Volgorde blijft gelijk. */
function schoneOpties(opties: AntwoordOptie[]): AntwoordOptie[] {
  return opties
    .map((o) => ({
      tekst: (o.tekst ?? "").trim(),
      afbeelding: (o.afbeelding ?? "").trim() || null,
    }))
    .filter((o) => o.tekst !== "" || o.afbeelding !== null);
}

export function bewaarVraag(v: NieuweVraag): { ok: true; id: string } | { ok: false; fouten: string[] } {
  const fouten = controleerVraag(v);
  if (fouten.length) return { ok: false, fouten };

  const db = verbinding();
  const id = randomUUID();
  const opties =
    v.vorm === "meerkeuze" ? JSON.stringify(schoneOpties(v.opties)) : null;

  db.prepare(
    `insert into vragen
       (id, leerdoel_id, groep, vorm, vraagtekst, opties, antwoord, hint, afbeelding,
        uitleg, uitleg_afbeelding, status, aangemaakt_op)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    v.leerdoelId,
    v.groep,
    v.vorm,
    v.vraagtekst.trim(),
    opties,
    v.antwoord,
    v.hint?.trim() || null,
    v.afbeelding?.trim() || null,
    v.uitleg?.trim() || null,
    v.uitlegAfbeelding?.trim() || null,
    v.status ?? "concept",
    new Date().toISOString(),
  );

  return { ok: true, id };
}

export function verwijderVraag(id: string): void {
  verbinding().prepare("delete from vragen where id = ?").run(id);
}

export function wisselStatus(id: string): void {
  const db = verbinding();
  const r = db.prepare("select status from vragen where id = ?").get(id) as
    | { status: string }
    | undefined;
  if (!r) return;
  db.prepare("update vragen set status = ? where id = ?").run(
    r.status === "gepubliceerd" ? "concept" : "gepubliceerd",
    id,
  );
}

// ---------------------------------------------------------------------------
// Vragen voor de kinderkant
// ---------------------------------------------------------------------------

/**
 * De vragen waarmee een kind kan oefenen.
 *
 * Alleen gepubliceerde vragen: concepten zijn nog niet af en horen niet bij
 * een kind terecht te komen.
 *
 * Er wordt bewust NIET op de groep van het kind gefilterd. De leerdoelen zijn
 * al op groep geselecteerd, en een vraag kan alleen binnen het groepsbereik
 * van zijn leerdoel bestaan. Extra filteren zou vragen verbergen die er wel
 * degelijk bij horen.
 */
export function haalGepubliceerdeVragen(leerdoelIds: string[]): VraagInContext[] {
  if (leerdoelIds.length === 0) return [];

  const db = verbinding();
  const plaatshouders = leerdoelIds.map(() => "?").join(",");

  const rijen = db
    .prepare(
      `select q.*, ld.code, ld.titel, ld.uitlegvorm,
              s.naam as subdomein_naam, d.naam as domein_naam, d.slug as domein_slug,
              v.naam as vak_naam, v.slug as vak_slug
       from vragen q
       join leerdoelen  ld on ld.id = q.leerdoel_id
       join subdomeinen s  on s.id = ld.subdomein_id
       join domeinen    d  on d.id = s.domein_id
       join vakken      v  on v.id = d.vak_id
       where q.status = 'gepubliceerd' and q.leerdoel_id in (${plaatshouders})
       order by ld.volgorde, q.groep, q.aangemaakt_op`,
    )
    .all(...leerdoelIds) as Record<string, string | number | null>[];

  return rijen.map(naarVraag);
}

/**
 * Gepubliceerde vragen opzoeken op id, in de volgorde die je meegeeft.
 *
 * Nodig om een halve oefensessie te hervatten: daarvan zijn alleen de id's
 * bewaard, niet de vragen zelf. De volgorde is die van de bewaarde serie, want
 * "vraag 4 van 15" moet ook echt dezelfde vierde vraag zijn als gisteren.
 *
 * Een id dat er niet meer is, of dat intussen terug op concept staat, valt er
 * gewoon uit. De serie wordt dan korter; dat is beter dan een kind een vraag
 * voorschotelen die niet meer bestaat.
 */
export function haalGepubliceerdeVragenOpIds(ids: string[]): VraagInContext[] {
  if (ids.length === 0) return [];

  const db = verbinding();
  const plaatshouders = ids.map(() => "?").join(",");

  const rijen = db
    .prepare(
      `select q.*, ld.code, ld.titel, ld.uitlegvorm,
              s.naam as subdomein_naam, d.naam as domein_naam, d.slug as domein_slug,
              v.naam as vak_naam, v.slug as vak_slug
       from vragen q
       join leerdoelen  ld on ld.id = q.leerdoel_id
       join subdomeinen s  on s.id = ld.subdomein_id
       join domeinen    d  on d.id = s.domein_id
       join vakken      v  on v.id = d.vak_id
       where q.status = 'gepubliceerd' and q.id in (${plaatshouders})`,
    )
    .all(...ids) as Record<string, string | number | null>[];

  const opId = new Map(rijen.map((r) => [String(r.id), naarVraag(r)]));
  return ids.map((id) => opId.get(id)).filter((v): v is VraagInContext => v !== undefined);
}

/** Hoeveel gepubliceerde vragen er per leerdoel klaarstaan. */
export function telGepubliceerdPerLeerdoel(
  leerdoelIds: string[],
): Record<string, number> {
  if (leerdoelIds.length === 0) return {};

  const db = verbinding();
  const plaatshouders = leerdoelIds.map(() => "?").join(",");
  const rijen = db
    .prepare(
      `select leerdoel_id, count(*) as n from vragen
       where status = 'gepubliceerd' and leerdoel_id in (${plaatshouders})
       group by leerdoel_id`,
    )
    .all(...leerdoelIds) as { leerdoel_id: string; n: number }[];

  return Object.fromEntries(rijen.map((r) => [String(r.leerdoel_id), Number(r.n)]));
}

/** Hoe lang een leerdoel het label "Nieuw" draagt. */
const NIEUW_DAGEN = 14;

/**
 * Welke leerdoelen recent nieuwe vragen hebben gekregen.
 *
 * Hiermee krijgt een oefening het label "Nieuw". Bewust gebaseerd op wanneer
 * de vragen zijn toegevoegd en niet op of het kind er al mee heeft geoefend:
 * dat laatste staat al in de statusindicatie ("Nog niet begonnen"), en twee
 * keer hetzelfde zeggen helpt niemand.
 */
export function nieuwPerLeerdoel(leerdoelIds: string[]): Record<string, boolean> {
  if (leerdoelIds.length === 0) return {};

  const grens = new Date(Date.now() - NIEUW_DAGEN * 24 * 60 * 60 * 1000).toISOString();
  const plaatshouders = leerdoelIds.map(() => "?").join(",");
  const rijen = verbinding()
    .prepare(
      `select distinct leerdoel_id from vragen
       where status = 'gepubliceerd'
         and aangemaakt_op >= ?
         and leerdoel_id in (${plaatshouders})`,
    )
    .all(grens, ...leerdoelIds) as { leerdoel_id: string }[];

  return Object.fromEntries(rijen.map((r) => [String(r.leerdoel_id), true]));
}

/**
 * Hoe vaak elke afbeelding wordt gebruikt: bij de vraag zelf of bij een van de
 * antwoorden. Wordt gebruikt om te voorkomen dat je een plaatje weggooit dat
 * nog ergens in beeld staat.
 */
// ---------------------------------------------------------------------------
// Cijfers voor het overzichtsscherm
// ---------------------------------------------------------------------------

export type VakCijfers = {
  domeinen: number;
  subdomeinen: number;
  leerdoelen: number;
  vragen: number;
  concept: number;
  gepubliceerd: number;
  leerdoelenZonderVragen: number;
};

export function haalVakCijfers(vakId: string): VakCijfers {
  const db = verbinding();

  const een = (sql: string) =>
    Number((db.prepare(sql).get(vakId) as { n: number }).n);

  const domeinen = een("select count(*) as n from domeinen where vak_id = ?");
  const subdomeinen = een(
    `select count(*) as n from subdomeinen s
     join domeinen d on d.id = s.domein_id where d.vak_id = ?`,
  );
  const leerdoelen = een(
    `select count(*) as n from leerdoelen ld
     join subdomeinen s on s.id = ld.subdomein_id
     join domeinen d on d.id = s.domein_id where d.vak_id = ?`,
  );
  const vragen = een(
    `select count(*) as n from vragen q
     join leerdoelen ld on ld.id = q.leerdoel_id
     join subdomeinen s on s.id = ld.subdomein_id
     join domeinen d on d.id = s.domein_id where d.vak_id = ?`,
  );
  const gepubliceerd = een(
    `select count(*) as n from vragen q
     join leerdoelen ld on ld.id = q.leerdoel_id
     join subdomeinen s on s.id = ld.subdomein_id
     join domeinen d on d.id = s.domein_id
     where d.vak_id = ? and q.status = 'gepubliceerd'`,
  );
  const zonder = een(
    `select count(*) as n from leerdoelen ld
     join subdomeinen s on s.id = ld.subdomein_id
     join domeinen d on d.id = s.domein_id
     where d.vak_id = ?
       and not exists (select 1 from vragen q where q.leerdoel_id = ld.id)`,
  );

  return {
    domeinen,
    subdomeinen,
    leerdoelen,
    vragen,
    concept: vragen - gepubliceerd,
    gepubliceerd,
    leerdoelenZonderVragen: zonder,
  };
}

/** Dekking per domein: waar staat nog niets klaar? */
export type DomeinDekking = {
  domeinId: string;
  domeinSlug: string;
  domeinNaam: string;
  actief: boolean;
  subdomeinen: number;
  leerdoelen: number;
  vragen: number;
  leerdoelenZonderVragen: number;
};

export function haalDekkingPerDomein(vakId: string): DomeinDekking[] {
  const db = verbinding();
  const rijen = db
    .prepare(
      `select d.id, d.slug, d.naam, d.actief, d.volgorde,
              (select count(*) from subdomeinen s where s.domein_id = d.id) as subs,
              (select count(*) from leerdoelen ld
                 join subdomeinen s on s.id = ld.subdomein_id
                 where s.domein_id = d.id) as doelen,
              (select count(*) from vragen q
                 join leerdoelen ld on ld.id = q.leerdoel_id
                 join subdomeinen s on s.id = ld.subdomein_id
                 where s.domein_id = d.id) as vragen,
              (select count(*) from leerdoelen ld
                 join subdomeinen s on s.id = ld.subdomein_id
                 where s.domein_id = d.id
                   and not exists (select 1 from vragen q where q.leerdoel_id = ld.id)) as leeg
       from domeinen d
       where d.vak_id = ?
       order by d.volgorde, d.naam`,
    )
    .all(vakId) as Record<string, string | number>[];

  return rijen.map((r) => ({
    domeinId: String(r.id),
    domeinSlug: String(r.slug),
    domeinNaam: String(r.naam),
    actief: Number(r.actief) === 1,
    subdomeinen: Number(r.subs),
    leerdoelen: Number(r.doelen),
    vragen: Number(r.vragen),
    leerdoelenZonderVragen: Number(r.leeg),
  }));
}

/**
 * De leerdoelen waar nog geen enkele vraag aan hangt. Hier begint het werk.
 *
 * `filter` is de stapsgewijze beheerfilter (groep, domein, subdomein,
 * leerdoel). Leeg laten betekent: het hele vak.
 */
export function haalLeerdoelenZonderVragen(
  vakSlug: string,
  filter: Beheerfilter = LEEG,
): LeerdoelRegel[] {
  const zonder = haalLeerdoelen().filter(
    (l) => l.aantalVragen === 0 && l.vakSlug === vakSlug,
  );
  return filterLeerdoelen(zonder, filter);
}

export function telAfbeeldingGebruik(namen: string[]): Record<string, number> {
  if (namen.length === 0) return {};

  const db = verbinding();
  const uit: Record<string, number> = {};

  const tellen = db.prepare(
    `select count(*) as n from vragen
     where afbeelding = ? or instr(coalesce(opties, ''), ?) > 0`,
  );

  for (const naam of namen) {
    const r = tellen.get(naam, `"${naam}"`) as { n: number };
    uit[naam] = Number(r.n);
  }

  return uit;
}

export function haalVraag(id: string): VraagInContext | null {
  const rijen = haalVragen();
  return rijen.find((v) => v.id === id) ?? null;
}
