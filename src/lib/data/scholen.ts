import "server-only";

/**
 * Scholen, hun methodestatus en de verificatiewachtrij.
 *
 * De harde regel van dit hele bestand: er wordt NOOIT een methode geraden,
 * afgeleid of automatisch ingevuld. Een school heeft precies drie mogelijke
 * standen, en elke stand komt uit iets wat echt is vastgelegd:
 *
 *   geverifieerd         Thuisles heeft het bevestigd, met bron en datum.
 *   opgegeven_door_ouder Er staat minstens één opgave van een ouder open.
 *   onbekend             Er is niets. Dit is de standaard.
 *
 * De middelste stand wordt AFGELEID uit de openstaande opgaven en nergens
 * apart opgeslagen. Zo kan er geen "opgegeven" blijven hangen nadat de laatste
 * opgave is afgewezen.
 */

import { randomUUID } from "node:crypto";
import { leesCsv } from "@/lib/csv";
import { kern, lijktOpPostcode, normaliseer, postcode } from "@/lib/zoeknaam";
import { verbinding } from "@/lib/db/sqlite";
import { haalMethode } from "@/lib/data/methodes";
import { huidigSchooljaar } from "@/lib/schooljaar";
import type {
  GezienWaar,
  MethodeOpgave,
  School,
  Schoolimport,
  SchoolMethodeStatus,
} from "@/lib/types";

type Rij = Record<string, string | number | null>;

// ---------------------------------------------------------------------------
// De bron
// ---------------------------------------------------------------------------

/**
 * Open onderwijsdata van DUO: alle vestigingen in het basisonderwijs.
 *
 * Gecontroleerd op 6 september 2026: de dataset staat op data.overheid.nl
 * onder licentie Creative Commons Naamsvermelding 4.0 (CC-BY 4.0), uitgegeven
 * door Dienst Uitvoering Onderwijs, maandelijks bijgewerkt. Hergebruik mag,
 * mits de bron wordt vermeld — daarom staat de bron zichtbaar in de
 * ouderomgeving en bij elke geïmporteerde rij.
 */
export const DUO = {
  naam: "DUO Open Onderwijsdata — alle vestigingen basisonderwijs",
  link: "https://data.overheid.nl/dataset/adressen_bo",
  bestand:
    "https://onderwijsdata.duo.nl/dataset/786f12ea-6224-42fd-ab72-de4d7d879535/resource/dcc9c9a5-6d01-410b-967f-810557588ba4/download/vestigingenbo.csv",
  licentie: "Creative Commons Naamsvermelding 4.0 (CC-BY 4.0)",
} as const;

// ---------------------------------------------------------------------------
// Importeren
// ---------------------------------------------------------------------------

function alsSchool(r: Rij): School {
  return {
    id: String(r.id),
    brin: String(r.brin),
    vestigingscode: String(r.vestigingscode),
    naam: String(r.naam),
    plaats: String(r.plaats),
    postcode: String(r.postcode),
    gemeente: String(r.gemeente ?? ""),
    website: String(r.website ?? ""),
    geslotenOp: r.gesloten_op ? String(r.gesloten_op) : null,
    bron: String(r.bron),
    bronDatum: String(r.bron_datum),
  };
}

/**
 * Het websiteadres uit de DUO-lijst netjes maken.
 *
 * DUO schrijft er meestal "www.school.nl" zonder protocol. Leeg blijft leeg;
 * er wordt nooit een adres verzonnen.
 */
function netteWebsite(ruw: string): string {
  const schoon = ruw.trim().replace(/\s+/g, "");
  if (!schoon || schoon === "-") return "";
  return /^https?:\/\//i.test(schoon) ? schoon : `https://${schoon}`;
}

/** "ALTEVEER GEM NOORDENVELD" leest voor een ouder prettiger als plaatsnaam. */
function nettePlaats(ruw: string): string {
  return ruw
    .toLowerCase()
    .split(/([ -])/)
    .map((deel) => (deel.length > 1 ? deel[0].toUpperCase() + deel.slice(1) : deel))
    .join("");
}

export type Importuitkomst = {
  /** Hoeveel scholen er in het bestand stonden. */
  gelezen: number;
  nieuw: number;
  gewijzigd: number;
  gesloten: number;
  ongewijzigd: number;
  overgeslagen: number;
  fout?: string;
};

/**
 * Vernieuwt de schoollijst uit de DUO-gegevens.
 *
 * Belangrijk: dit is een BIJWERKING, geen vervanging. De vestigingscode is de
 * sleutel. Wat een ouder of Thuisles aan een school heeft gekoppeld — het kind,
 * de opgaven, de verificatie — blijft dus staan, ook na een vernieuwing.
 *
 * Scholen die niet meer in de lijst staan worden gemarkeerd als gesloten en
 * NIET verwijderd: er kunnen kinderen aan hangen, en een school die stilletjes
 * verdwijnt zou het scherm van een ouder leeg achterlaten.
 */
export function importeerScholen(csv: string): Importuitkomst {
  const leeg: Importuitkomst = {
    gelezen: 0, nieuw: 0, gewijzigd: 0, gesloten: 0, ongewijzigd: 0, overgeslagen: 0,
  };

  const { rijen } = leesCsv(csv);
  if (rijen.length === 0) {
    return { ...leeg, fout: "Het bestand bevat geen regels." };
  }

  const eerste = rijen[0];
  if (!("vestigingscode" in eerste) || !("vestigingsnaam" in eerste)) {
    return {
      ...leeg,
      fout:
        "Dit lijkt geen DUO-bestand met vestigingen. Verwacht worden de kolommen VESTIGINGSCODE en VESTIGINGSNAAM.",
    };
  }

  const nu = new Date().toISOString();
  const datum = nu.slice(0, 10);
  const db = verbinding();

  // Wat er nu in staat, om te kunnen zien wat er verandert.
  const bestaand = new Map(
    (
      db
        .prepare(
          `select vestigingscode, naam, plaats, postcode, gemeente, website,
                  brin, gesloten_op
           from scholen`,
        )
        .all() as Rij[]
    ).map((r) => [String(r.vestigingscode), r]),
  );

  const invoegen = db.prepare(
    `insert into scholen
       (id, brin, vestigingscode, naam, plaats, postcode, gemeente, website,
        zoeknaam, zoekkern, gesloten_op, bron, bron_datum)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null, ?, ?)
     on conflict (vestigingscode) do update set
       brin        = excluded.brin,
       naam        = excluded.naam,
       plaats      = excluded.plaats,
       postcode    = excluded.postcode,
       gemeente    = excluded.gemeente,
       website     = excluded.website,
       zoeknaam    = excluded.zoeknaam,
       zoekkern    = excluded.zoekkern,
       -- Staat de school weer in de lijst, dan is hij niet meer gesloten.
       gesloten_op = null,
       bron        = excluded.bron,
       bron_datum  = excluded.bron_datum`,
  );

  const uitkomst: Importuitkomst = { ...leeg };
  const gezien = new Set<string>();

  db.exec("begin");
  try {
    for (const r of rijen) {
      const vestigingscode = (r.vestigingscode ?? "").trim();
      const naam = (r.vestigingsnaam ?? "").trim();
      if (!vestigingscode || !naam) {
        uitkomst.overgeslagen++;
        continue;
      }

      uitkomst.gelezen++;
      gezien.add(vestigingscode);

      const plaats = nettePlaats((r.plaatsnaam ?? "").trim());
      const gemeente = nettePlaats((r.gemeentenaam ?? "").trim());
      const pc = (r.postcode ?? "").trim().toUpperCase();
      const brin = (r.instellingscode ?? "").trim();
      const website = netteWebsite((r.internetadres ?? "").trim());

      const oud = bestaand.get(vestigingscode);
      if (!oud) uitkomst.nieuw++;
      else if (
        String(oud.naam) !== naam ||
        String(oud.plaats) !== plaats ||
        String(oud.postcode) !== pc ||
        String(oud.gemeente ?? "") !== gemeente ||
        String(oud.website ?? "") !== website ||
        String(oud.brin) !== brin ||
        oud.gesloten_op !== null
      ) {
        uitkomst.gewijzigd++;
      } else {
        uitkomst.ongewijzigd++;
      }

      invoegen.run(
        vestigingscode, brin, vestigingscode, naam, plaats, pc, gemeente,
        website, normaliseer(naam), kern(naam), DUO.naam, datum,
      );
    }

    // Wat niet meer in de lijst staat, is gesloten. Niet weggooien.
    const sluiten = db.prepare(
      "update scholen set gesloten_op = ? where vestigingscode = ? and gesloten_op is null",
    );
    for (const [code, rij] of bestaand) {
      if (gezien.has(code) || rij.gesloten_op !== null) continue;
      sluiten.run(datum, code);
      uitkomst.gesloten++;
    }

    db.prepare(
      `insert into school_imports
         (id, bron, bron_link, licentie, uitgevoerd_op, aantal, nieuw, gewijzigd, gesloten)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      randomUUID(), DUO.naam, DUO.link, DUO.licentie, nu,
      uitkomst.gelezen, uitkomst.nieuw, uitkomst.gewijzigd, uitkomst.gesloten,
    );

    db.exec("commit");
  } catch (fout) {
    db.exec("rollback");
    throw fout;
  }

  return uitkomst;
}

/**
 * Haalt de lijst op bij DUO en werkt hem bij.
 *
 * Staat apart van `importeerScholen` zodat zowel de knop in de admin als het
 * automatisch inladen bij de eerste start dezelfde weg volgen.
 */
export async function vernieuwUitDuo(): Promise<Importuitkomst> {
  const leeg: Importuitkomst = {
    gelezen: 0, nieuw: 0, gewijzigd: 0, gesloten: 0, ongewijzigd: 0, overgeslagen: 0,
  };

  let csv: string;
  try {
    const antwoord = await fetch(DUO.bestand, {
      cache: "no-store",
      signal: AbortSignal.timeout(180_000),
    });
    if (!antwoord.ok) {
      return {
        ...leeg,
        fout: `DUO antwoordde met code ${antwoord.status}. Probeer het later nog eens, of kies het bestand met de hand.`,
      };
    }
    csv = await antwoord.text();
  } catch {
    return {
      ...leeg,
      fout: "Het bestand kon niet worden opgehaald. Controleer de internetverbinding, of kies het bestand met de hand.",
    };
  }

  return importeerScholen(csv);
}

/**
 * Laadt de schoollijst één keer in, als hij nog leeg is.
 *
 * Wordt bij het opstarten van de server aangeroepen (zie `src/instrumentation.ts`).
 * Staat er al iets, dan gebeurt er niets: vernieuwen is een aparte, bewuste
 * handeling in de admin.
 */
export async function vulSchoollijstAlsLeeg(): Promise<void> {
  if (aantalScholen() > 0) return;

  const uitkomst = await vernieuwUitDuo();
  if (uitkomst.fout) {
    // Stil falen: zonder internet moet de app gewoon starten. De admin toont
    // dat de lijst leeg is en heeft een knop om het alsnog te doen.
    console.warn(`[thuisles] schoollijst niet geladen: ${uitkomst.fout}`);
    return;
  }
  console.log(`[thuisles] schoollijst geladen: ${uitkomst.nieuw} scholen`);
}

/** De laatste import, voor "bron en datum" in de ouderomgeving. */
export function laatsteImport(): Schoolimport | null {
  const r = verbinding()
    .prepare("select * from school_imports order by uitgevoerd_op desc limit 1")
    .get() as Rij | undefined;
  if (!r) return null;

  return {
    id: String(r.id),
    bron: String(r.bron),
    bronLink: String(r.bron_link),
    licentie: String(r.licentie),
    uitgevoerdOp: String(r.uitgevoerd_op),
    aantal: Number(r.aantal),
    nieuw: Number(r.nieuw ?? 0),
    gewijzigd: Number(r.gewijzigd ?? 0),
    gesloten: Number(r.gesloten ?? 0),
  };
}

export function aantalScholen(): number {
  const r = verbinding().prepare("select count(*) as n from scholen").get() as {
    n: number;
  };
  return Number(r.n);
}

/** Scholen die niet meer in de DUO-lijst staan. Ze blijven wel bewaard. */
export function aantalGesloten(): number {
  const r = verbinding()
    .prepare("select count(*) as n from scholen where gesloten_op is not null")
    .get() as { n: number };
  return Number(r.n);
}

// ---------------------------------------------------------------------------
// Zoeken
// ---------------------------------------------------------------------------

/**
 * Zoeken op naam, plaats of postcode — wat een ouder maar weet.
 *
 * De naam wordt vergeleken op de genormaliseerde vorm: zonder hoofdletters,
 * accenten en leestekens. Daarnaast op de "kern": de naam zonder voorvoegsels
 * als "obs" of "de". Zo vindt "regenboog" ook "OBS De Regenboog", en
 * "de regenboog" net zo goed.
 *
 * Gesloten scholen staan onderaan, maar verdwijnen niet: er kan een ouder aan
 * gekoppeld zijn die zijn eigen school terug moet kunnen vinden.
 */
export function zoekScholen(zoekterm: string, limiet = 25): School[] {
  const ruw = zoekterm.trim();
  if (ruw.length < 2) return [];

  const term = normaliseer(ruw);
  const termKern = kern(ruw);
  const pc = postcode(ruw);

  // Een postcode zoekt anders dan een naam: die begint altijd vooraan.
  if (lijktOpPostcode(ruw)) {
    const rijen = verbinding()
      .prepare(
        `select * from scholen
         where replace(upper(postcode), ' ', '') like ?
         order by gesloten_op is not null, naam
         limit ?`,
      )
      .all(`${pc}%`, limiet) as Rij[];
    return rijen.map(alsSchool);
  }

  const rijen = verbinding()
    .prepare(
      `select * from scholen
       where zoeknaam like ?
          or zoekkern like ?
          or lower(plaats) like ?
          or replace(upper(postcode), ' ', '') like ?
       order by
         gesloten_op is not null,
         case
           when zoekkern = ? then 0
           when zoeknaam = ? then 1
           when zoekkern like ? then 2
           when zoeknaam like ? then 3
           when lower(plaats) = ? then 4
           else 5
         end,
         naam
       limit ?`,
    )
    .all(
      `%${term}%`, `%${termKern}%`, `%${term}%`, `${pc}%`,
      termKern, term, `${termKern}%`, `${term}%`, term,
      limiet,
    ) as Rij[];

  return rijen.map(alsSchool);
}

export function haalSchool(id: string): School | null {
  const r = verbinding().prepare("select * from scholen where id = ?").get(id) as
    | Rij
    | undefined;
  return r ? alsSchool(r) : null;
}

// ---------------------------------------------------------------------------
// De methodestatus van een school
// ---------------------------------------------------------------------------

/**
 * De stand van één school. Nooit geraden, altijd afgeleid uit wat er staat.
 */
export function methodestatus(schoolId: string): SchoolMethodeStatus {
  const db = verbinding();

  const bevestigd = db
    .prepare("select * from school_verificatie where school_id = ?")
    .get(schoolId) as Rij | undefined;

  if (bevestigd) {
    return {
      herkomst: "geverifieerd",
      methode: haalMethode(String(bevestigd.methode_id)),
      bron: String(bevestigd.bron),
      bronLink: String(bevestigd.bron_link ?? "") || null,
      bevestigdOp: String(bevestigd.bevestigd_op),
      schooljaar: String(bevestigd.schooljaar),
      aantalOpgaven: 0,
    };
  }

  /*
    Geen bevestiging: dan telt wat ouders hebben opgegeven. De methode die het
    vaakst is opgegeven staat vooraan — maar blijft uitdrukkelijk
    "nog niet geverifieerd" tot Thuisles hem bevestigt.
  */
  const leidend = db
    .prepare(
      `select methode_id, count(*) as n from methode_opgaven
       where school_id = ? and status = 'open' and methode_id is not null
       group by methode_id
       order by n desc
       limit 1`,
    )
    .get(schoolId) as { methode_id: string; n: number } | undefined;

  if (leidend) {
    return {
      herkomst: "opgegeven_door_ouder",
      methode: haalMethode(String(leidend.methode_id)),
      bron: null,
      bronLink: null,
      bevestigdOp: null,
      schooljaar: null,
      aantalOpgaven: Number(leidend.n),
    };
  }

  return {
    herkomst: "onbekend",
    methode: null,
    bron: null,
    bronLink: null,
    bevestigdOp: null,
    schooljaar: null,
    aantalOpgaven: 0,
  };
}

// ---------------------------------------------------------------------------
// Opgaven van ouders
// ---------------------------------------------------------------------------

export type Opgaveinvoer = {
  schoolId: string;
  ouderId: string;
  /** Leeg betekent: "Anders / weet ik niet". */
  methodeId: string | null;
  andersTekst: string;
  gezienWaar: GezienWaar;
  gezienLink: string;
};

/** Geeft een foutmelding in gewone taal terug, of null als alles klopt. */
export function controleerOpgave(g: Opgaveinvoer): string | null {
  if (!haalSchool(g.schoolId)) return "Kies eerst een school.";
  if (g.methodeId && !haalMethode(g.methodeId)) return "Kies een methode uit de lijst.";
  if (!g.methodeId && !g.andersTekst.trim()) {
    return "Vul in welke methode je kind gebruikt, of laat het veld leeg als je het echt niet weet.";
  }
  if (!["schoolgids", "werkboek", "leerkracht", "anders"].includes(g.gezienWaar)) {
    return "Vul in waar je dit hebt gezien.";
  }
  if (g.gezienWaar === "schoolgids" && !g.gezienLink.trim()) {
    return "Vul de link naar de schoolgids in, of het paginanummer.";
  }
  return null;
}

/**
 * Een ouder geeft de methode op.
 *
 * Per ouder en school telt alleen de laatste opgave: een eerdere openstaande
 * opgave van dezelfde ouder wordt vervangen. Anders zou één ouder die twee
 * keer op verzenden drukt de teller in de wachtrij vervuilen.
 */
export function bewaarOpgave(g: Opgaveinvoer): void {
  const db = verbinding();
  db.exec("begin");
  try {
    db.prepare(
      "delete from methode_opgaven where school_id = ? and ouder_id = ? and status = 'open'",
    ).run(g.schoolId, g.ouderId);

    db.prepare(
      `insert into methode_opgaven
         (id, school_id, ouder_id, methode_id, anders_tekst, gezien_waar,
          gezien_link, status, schooljaar, gemaakt_op)
       values (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
    ).run(
      randomUUID(),
      g.schoolId,
      g.ouderId,
      g.methodeId,
      g.andersTekst.trim(),
      g.gezienWaar,
      g.gezienLink.trim(),
      huidigSchooljaar(),
      new Date().toISOString(),
    );
    db.exec("commit");
  } catch (fout) {
    db.exec("rollback");
    throw fout;
  }
}

function alsOpgave(r: Rij): MethodeOpgave {
  return {
    id: String(r.id),
    schoolId: String(r.school_id),
    methode: r.methode_id ? haalMethode(String(r.methode_id)) : null,
    andersTekst: String(r.anders_tekst ?? ""),
    gezienWaar: String(r.gezien_waar) as GezienWaar,
    gezienLink: String(r.gezien_link ?? ""),
    status: String(r.status) as MethodeOpgave["status"],
    schooljaar: String(r.schooljaar),
    gemaaktOp: String(r.gemaakt_op),
  };
}

/** Wat deze ouder zelf heeft opgegeven voor deze school. */
export function opgaveVanOuder(
  schoolId: string,
  ouderId: string,
): MethodeOpgave | null {
  const r = verbinding()
    .prepare(
      `select * from methode_opgaven
       where school_id = ? and ouder_id = ?
       order by gemaakt_op desc limit 1`,
    )
    .get(schoolId, ouderId) as Rij | undefined;
  return r ? alsOpgave(r) : null;
}

// ---------------------------------------------------------------------------
// De verificatiewachtrij (admin)
// ---------------------------------------------------------------------------

export type WachtrijSchool = {
  school: School;
  status: SchoolMethodeStatus;
  /** Hoeveel kinderen er aan deze school hangen. Bepaalt de volgorde. */
  aantalKinderen: number;
  /** Per opgegeven methode: hoe vaak, en waar ouders het zagen. */
  opgaven: {
    methode: { id: string; naam: string } | null;
    andersTekst: string;
    aantal: number;
    bewijzen: { gezienWaar: GezienWaar; gezienLink: string; gemaaktOp: string }[];
  }[];
};

/**
 * De wachtrij: scholen met openstaande opgaven, de belangrijkste eerst.
 *
 * "Belangrijkste" = het meeste aantal kinderen op die school, want daar raakt
 * een bevestiging de meeste gezinnen. Bij gelijk aantal telt het aantal
 * opgaven.
 */
export function haalWachtrij(): WachtrijSchool[] {
  const db = verbinding();

  const scholen = db
    .prepare(
      `select distinct s.* from scholen s
       join methode_opgaven o on o.school_id = s.id and o.status = 'open'`,
    )
    .all() as Rij[];

  const lijst = scholen.map((rij) => {
    const school = alsSchool(rij);

    const kinderen = db
      .prepare("select count(*) as n from kind_school where school_id = ?")
      .get(school.id) as { n: number };

    const rijen = db
      .prepare(
        `select * from methode_opgaven
         where school_id = ? and status = 'open'
         order by gemaakt_op`,
      )
      .all(school.id) as Rij[];

    // Groeperen op methode, zodat de teller per methode klopt.
    const perMethode = new Map<string, WachtrijSchool["opgaven"][number]>();
    for (const r of rijen) {
      const methodeId = r.methode_id ? String(r.methode_id) : "";
      const sleutel = methodeId || `anders:${String(r.anders_tekst ?? "").toLowerCase()}`;
      const bestaand = perMethode.get(sleutel);
      const bewijs = {
        gezienWaar: String(r.gezien_waar) as GezienWaar,
        gezienLink: String(r.gezien_link ?? ""),
        gemaaktOp: String(r.gemaakt_op),
      };

      if (bestaand) {
        bestaand.aantal++;
        bestaand.bewijzen.push(bewijs);
      } else {
        const methode = methodeId ? haalMethode(methodeId) : null;
        perMethode.set(sleutel, {
          methode: methode ? { id: methode.id, naam: methode.naam } : null,
          andersTekst: String(r.anders_tekst ?? ""),
          aantal: 1,
          bewijzen: [bewijs],
        });
      }
    }

    return {
      school,
      status: methodestatus(school.id),
      aantalKinderen: Number(kinderen.n),
      opgaven: [...perMethode.values()].sort((a, b) => b.aantal - a.aantal),
    };
  });

  return lijst.sort(
    (a, b) =>
      b.aantalKinderen - a.aantalKinderen ||
      b.opgaven.reduce((n, o) => n + o.aantal, 0) -
        a.opgaven.reduce((n, o) => n + o.aantal, 0) ||
      a.school.naam.localeCompare(b.school.naam),
  );
}

/**
 * Thuisles bevestigt een methode bij een school.
 *
 * Bron is verplicht: zonder controleerbare herkomst geen verificatie. De
 * openstaande opgaven voor deze school worden afgehandeld, zodat de wachtrij
 * leeg raakt.
 */
export function bevestigMethode(
  schoolId: string,
  methodeId: string,
  bron: string,
  bronLink: string,
): string | null {
  if (!haalSchool(schoolId)) return "Die school bestaat niet.";
  if (!haalMethode(methodeId)) return "Die methode bestaat niet.";
  if (!bron.trim()) return "Vul in waar je dit hebt gecontroleerd.";

  const db = verbinding();
  const nu = new Date().toISOString();

  db.exec("begin");
  try {
    db.prepare(
      `insert into school_verificatie
         (school_id, methode_id, bron, bron_link, bevestigd_op, schooljaar)
       values (?, ?, ?, ?, ?, ?)
       on conflict (school_id) do update set
         methode_id   = excluded.methode_id,
         bron         = excluded.bron,
         bron_link    = excluded.bron_link,
         bevestigd_op = excluded.bevestigd_op,
         schooljaar   = excluded.schooljaar`,
    ).run(schoolId, methodeId, bron.trim(), bronLink.trim(), nu, huidigSchooljaar());

    db.prepare(
      `update methode_opgaven
       set status = case when methode_id = ? then 'bevestigd' else 'afgewezen' end,
           behandeld_op = ?
       where school_id = ? and status = 'open'`,
    ).run(methodeId, nu, schoolId);

    db.exec("commit");
  } catch (fout) {
    db.exec("rollback");
    throw fout;
  }
  return null;
}

/** Afwijzen: de opgaven verdwijnen uit de wachtrij, de school blijft onbekend. */
export function wijsOpgavenAf(schoolId: string): void {
  verbinding()
    .prepare(
      `update methode_opgaven set status = 'afgewezen', behandeld_op = ?
       where school_id = ? and status = 'open'`,
    )
    .run(new Date().toISOString(), schoolId);
}

/** Een eerdere verificatie intrekken. De school valt terug op wat er nog staat. */
export function trekVerificatieIn(schoolId: string): void {
  verbinding()
    .prepare("delete from school_verificatie where school_id = ?")
    .run(schoolId);
}
