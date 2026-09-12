import "server-only";

/**
 * Antwoorden opslaan en daaruit de beheersing per leerdoel afleiden.
 *
 * Uitgangspunten uit het project:
 *   - één fout betekent nooit meteen "niet beheerst". Er wordt gekeken naar de
 *     laatste acht tot tien antwoorden;
 *   - pas bij twee of meer fouten met hetzelfde patroon in korte tijd krijgt
 *     een leerdoel "aandacht";
 *   - snel achter elkaar gegokte antwoorden tellen minder zwaar mee;
 *   - er wordt alleen bewaard wat nodig is om te leren en om voortgang te
 *     tonen. Geen vrije tekst, geen apparaatgegevens, geen profilering.
 */

import { randomUUID } from "node:crypto";
import { verbinding } from "@/lib/db/sqlite";
import { beloonGoedeAntwoorden } from "@/lib/data/sleutels";
import type { MasteryStatus } from "@/lib/types";

/** Hoeveel antwoorden er worden meegewogen. */
const VENSTER = 10;

export type Uitkomst = "direct_goed" | "goed_na_hint" | "goed_na_uitleg" | "fout";

export type AntwoordInvoer = {
  kindId: string;
  leerdoelId: string;
  vraagId: string | null;
  goed: boolean;
  uitkomst: Uitkomst;
  foutpatroon: string | null;
  hintGebruikt: boolean;
  uitlegGebruikt: boolean;
  seconden: number;
  /** Snel achter elkaar fout: telt minder zwaar mee. */
  gegokt: boolean;
  /*
    Waar de sleutel voor dit antwoord aan hangt: "<rondeId>:<vraagId>".

    Dit is met opzet NIET het antwoord-id. De sleutel wordt al tijdens het
    oefenen uitbetaald — meteen na het goede antwoord, want het kind ziet hem
    dan naar de teller vliegen — terwijl het antwoord zelf pas aan het eind van
    de ronde wordt weggeschreven. Twee momenten, dus twee kansen om uit te
    betalen.

    Door beide keren dezelfde bron te gebruiken, vangt de unieke index op
    (reden, bron_id) het dubbele geval af: de tweede poging wordt genegeerd.
    Zo is de uitbetaling aan het eind van de ronde een vangnet voor een
    mislukte live-aanroep, en nooit een tweede sleutel.
  */
  beloningsbron: string;
};

export function bewaarAntwoorden(antwoorden: AntwoordInvoer[]): void {
  if (antwoorden.length === 0) return;

  const db = verbinding();
  const invoegen = db.prepare(
    `insert into antwoorden
       (id, kind_id, leerdoel_id, vraag_id, goed, uitkomst, foutpatroon,
        hint_gebruikt, uitleg_gebruikt, seconden, gegokt, gemaakt_op)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const nu = new Date().toISOString();
  // De bronnen van de goede antwoorden; die leveren elk één sleutel op.
  const goedeBronnen: string[] = [];

  for (const a of antwoorden) {
    const antwoordId = randomUUID();
    invoegen.run(
      antwoordId, a.kindId, a.leerdoelId, a.vraagId,
      a.goed ? 1 : 0, a.uitkomst, a.foutpatroon,
      a.hintGebruikt ? 1 : 0, a.uitlegGebruikt ? 1 : 0,
      Math.max(0, Math.round(a.seconden)), a.gegokt ? 1 : 0, nu,
    );
    if (a.goed) goedeBronnen.push(a.beloningsbron);
  }

  /*
    Eén sleutel per goed antwoord — als vangnet.

    Normaal is er hier niets meer te doen: elke sleutel is tijdens het oefenen
    al uitbetaald, direct nadat het antwoord goed bleek. Ging die aanroep mis
    (even geen verbinding, tabblad gesloten en later hervat), dan gebeurt het
    alsnog hier. `insert or ignore` op de bron zorgt dat het nooit dubbel is.

    "Goed" is hier `a.goed`, niet de uitkomst. Een antwoord dat pas na een
    hint of na uitleg goed was, telt dus gewoon mee — precies zoals afgesproken.
  */
  beloonGoedeAntwoorden(antwoorden[0].kindId, goedeBronnen);

  for (const leerdoelId of new Set(antwoorden.map((a) => a.leerdoelId))) {
    werkVoortgangBij(antwoorden[0].kindId, leerdoelId);
  }
}

// ---------------------------------------------------------------------------
// Beheersing berekenen
// ---------------------------------------------------------------------------

type Rij = Record<string, string | number | null>;

export type LeerdoelStand = {
  status: MasteryStatus;
  /** Twee of meer fouten met hetzelfde patroon: dit vraagt aandacht. */
  aandacht: boolean;
  aandachtPatroon: string | null;
};

/**
 * Kijkt naar de laatste antwoorden en bepaalt de stand.
 *
 * Gegokte antwoorden tellen half mee, zodat een reeks snelle klikken de
 * beheersing niet onderuit haalt.
 */
export function berekenStand(kindId: string, leerdoelId: string): LeerdoelStand {
  const db = verbinding();
  const rijen = db
    .prepare(
      `select goed, uitkomst, foutpatroon, gegokt, gemaakt_op
       from antwoorden
       where kind_id = ? and leerdoel_id = ?
       order by gemaakt_op desc, rowid desc
       limit ${VENSTER}`,
    )
    .all(kindId, leerdoelId) as Rij[];

  if (rijen.length === 0) {
    return { status: "nog_niet_gestart", aandacht: false, aandachtPatroon: null };
  }

  let gewichtGoed = 0;
  let gewichtTotaal = 0;
  const patroonTeller = new Map<string, number>();

  for (const r of rijen) {
    const gewicht = Number(r.gegokt) === 1 ? 0.5 : 1;
    gewichtTotaal += gewicht;
    if (Number(r.goed) === 1) gewichtGoed += gewicht;
    else if (r.foutpatroon) {
      const naam = String(r.foutpatroon);
      patroonTeller.set(naam, (patroonTeller.get(naam) ?? 0) + 1);
    }
  }

  const deel = gewichtTotaal > 0 ? gewichtGoed / gewichtTotaal : 0;
  const herhaald = [...patroonTeller.entries()].find(([, n]) => n >= 2);

  // Beheerst vraagt om genoeg antwoorden; anders blijft het "oefent".
  let status: MasteryStatus;
  if (rijen.length >= 4 && deel >= 0.9) status = "beheerst";
  else if (deel >= 0.7) status = "bijna_beheerst";
  else status = "oefent";

  return {
    status,
    aandacht: Boolean(herhaald),
    aandachtPatroon: herhaald ? herhaald[0] : null,
  };
}

function werkVoortgangBij(kindId: string, leerdoelId: string): void {
  const stand = berekenStand(kindId, leerdoelId);
  const db = verbinding();

  /*
    Vroeg dit leerdoel eerder aandacht en gaat het nu weer goed? Dan is dat een
    comeback-moment. Dat wordt hier vastgelegd, zodat een ouder ook de
    vooruitgang ziet en niet alleen de problemen.

    "Weer goed" vraagt méér dan alleen dat de herhaalde denkfout weg is: de
    beheersing moet ook echt op peil zijn. Anders zou een kind dat na twee
    fouten nog twee sommen maakt al gevierd worden, en dat is niet eerlijk.

    Telt ook mee: het kind dat zélf "dit snapte ik niet" aangaf. Juist dat weer
    onder de knie krijgen mag gevierd worden.
  */
  const vorige = db
    .prepare(
      "select aandacht, zelf_lastig from leerdoel_voortgang where kind_id = ? and leerdoel_id = ?",
    )
    .get(kindId, leerdoelId) as { aandacht: number; zelf_lastig: number } | undefined;

  const vroegEerderAandacht =
    Number(vorige?.aandacht ?? 0) === 1 || Number(vorige?.zelf_lastig ?? 0) === 1;
  const gaatWeerGoed =
    !stand.aandacht &&
    (stand.status === "bijna_beheerst" || stand.status === "beheerst");

  if (vroegEerderAandacht && gaatWeerGoed) {
    db.prepare(
      `insert into kind_signalen (id, kind_id, leerdoel_id, soort, gemaakt_op)
       values (?, ?, ?, 'comeback', ?)`,
    ).run(randomUUID(), kindId, leerdoelId, new Date().toISOString());
  }

  const tellers = db
    .prepare(
      `select
         sum(case when uitkomst = 'direct_goed' then 1 else 0 end) as direct,
         sum(case when uitkomst in ('goed_na_hint','goed_na_uitleg') then 1 else 0 end) as hulp,
         sum(case when uitkomst = 'fout' then 1 else 0 end) as fout
       from antwoorden where kind_id = ? and leerdoel_id = ?`,
    )
    .get(kindId, leerdoelId) as Rij;

  db.prepare(
    `insert into leerdoel_voortgang
       (kind_id, leerdoel_id, status, aandacht, aandacht_patroon,
        aantal_direct_goed, aantal_goed_na_hulp, aantal_nog_niet_beheerst, laatst_geoefend_op)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?)
     on conflict (kind_id, leerdoel_id) do update set
       status = excluded.status,
       aandacht = excluded.aandacht,
       aandacht_patroon = excluded.aandacht_patroon,
       aantal_direct_goed = excluded.aantal_direct_goed,
       aantal_goed_na_hulp = excluded.aantal_goed_na_hulp,
       aantal_nog_niet_beheerst = excluded.aantal_nog_niet_beheerst,
       laatst_geoefend_op = excluded.laatst_geoefend_op`,
  ).run(
    kindId, leerdoelId, stand.status, stand.aandacht ? 1 : 0, stand.aandachtPatroon,
    Number(tellers.direct ?? 0), Number(tellers.hulp ?? 0), Number(tellers.fout ?? 0),
    new Date().toISOString(),
  );

  /*
    Gaat het weer goed, dan is "dit snapte ik niet" afgehandeld. Zonder dit
    zou dat vlaggetje voor altijd blijven staan en zou de ouder een leerdoel
    dat allang beheerst wordt eindeloos onder "Aandacht" blijven zien.
  */
  if (gaatWeerGoed) {
    db.prepare(
      "update leerdoel_voortgang set zelf_lastig = 0 where kind_id = ? and leerdoel_id = ?",
    ).run(kindId, leerdoelId);
  }
}

/**
 * Markeert dat een kind zelf aangaf dit lastig te vinden.
 *
 * Naast de vlag wordt er een signaal met datum vastgelegd, zodat de ouder in
 * het dashboard kan zien wat het kind wanneer aangaf.
 */
export function meldZelfLastig(kindId: string, leerdoelId: string): void {
  const db = verbinding();
  db.prepare(
    `insert into leerdoel_voortgang (kind_id, leerdoel_id, zelf_lastig, aandacht)
     values (?, ?, 1, 1)
     on conflict (kind_id, leerdoel_id) do update set zelf_lastig = 1, aandacht = 1`,
  ).run(kindId, leerdoelId);

  db.prepare(
    `insert into kind_signalen (id, kind_id, leerdoel_id, soort, gemaakt_op)
     values (?, ?, ?, 'zelf_lastig', ?)`,
  ).run(randomUUID(), kindId, leerdoelId, new Date().toISOString());
}

// ---------------------------------------------------------------------------
// Uitlezen
// ---------------------------------------------------------------------------

export type Voortgangsregel = {
  leerdoelId: string;
  status: MasteryStatus;
  aandacht: boolean;
  aandachtPatroon: string | null;
  zelfLastig: boolean;
  aantalDirectGoed: number;
  aantalGoedNaHulp: number;
  aantalNogNietBeheerst: number;
  laatstGeoefendOp: string | null;
};

export function haalVoortgang(kindId: string): Voortgangsregel[] {
  const rijen = verbinding()
    .prepare("select * from leerdoel_voortgang where kind_id = ?")
    .all(kindId) as Rij[];

  return rijen.map((r) => ({
    leerdoelId: String(r.leerdoel_id),
    status: String(r.status) as MasteryStatus,
    aandacht: Number(r.aandacht) === 1,
    aandachtPatroon: r.aandacht_patroon ? String(r.aandacht_patroon) : null,
    zelfLastig: Number(r.zelf_lastig) === 1,
    aantalDirectGoed: Number(r.aantal_direct_goed),
    aantalGoedNaHulp: Number(r.aantal_goed_na_hulp),
    aantalNogNietBeheerst: Number(r.aantal_nog_niet_beheerst),
    laatstGeoefendOp: r.laatst_geoefend_op ? String(r.laatst_geoefend_op) : null,
  }));
}

/** Welke vragen dit kind al eens heeft beantwoord. Voor de herhaalronde. */
export function haalEerderGemaakt(kindId: string): Set<string> {
  const rijen = verbinding()
    .prepare("select distinct vraag_id from antwoorden where kind_id = ? and vraag_id is not null")
    .all(kindId) as { vraag_id: string }[];
  return new Set(rijen.map((r) => String(r.vraag_id)));
}

/** Stond dit leerdoel vóór deze ronde op "aandacht"? Voor het comeback-moment. */
export function haalAandachtLeerdoelen(kindId: string): Set<string> {
  const rijen = verbinding()
    .prepare("select leerdoel_id from leerdoel_voortgang where kind_id = ? and aandacht = 1")
    .all(kindId) as { leerdoel_id: string }[];
  return new Set(rijen.map((r) => String(r.leerdoel_id)));
}
