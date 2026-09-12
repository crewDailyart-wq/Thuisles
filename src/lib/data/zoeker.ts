import "server-only";

/**
 * De methodezoeker.
 *
 * Kijkt per school op de eigen website of daar staat met welke rekenmethode
 * wordt gewerkt. Wat hij vindt is een VOORSTEL voor de beheerder — nooit meer
 * dan dat.
 *
 * De harde regels van dit bestand:
 *   - de zoeker zet NOOIT zelf iets op "geverifieerd";
 *   - ouders zien niets van een voorstel; voor hen blijft de school
 *     "Rekenmethode nog niet bekend" tot Thuisles het bevestigt;
 *   - er wordt nooit geraden. Staat de naam er niet letterlijk, dan is de
 *     uitkomst "niets gevonden";
 *   - er wordt alleen de gevonden zin en de link bewaard, nooit de hele pagina.
 *
 * LEGAL REVIEW REQUIRED — automatisch lezen van schoolwebsites.
 * Zie `src/lib/zoeker/NOTITIE.md` voor wat er precies wordt opgehaald.
 */

import { randomUUID } from "node:crypto";
import { verbinding } from "@/lib/db/sqlite";
import { haalMethodes } from "@/lib/data/methodes";
import { haalSchool } from "@/lib/data/scholen";
import { huidigSchooljaar } from "@/lib/schooljaar";
import { haalOp, host } from "@/lib/zoeker/beleefd";
import { tekstUitPdf } from "@/lib/zoeker/pdf";
import {
  kiesKandidaten,
  linksUitHtml,
  pdfsOpPagina,
  tekstUitHtml,
  vindJaartal,
  zoekMethodes,
} from "@/lib/zoeker/tekst";
import type { School } from "@/lib/types";

type Rij = Record<string, string | number | null>;

export type Zoekstatus =
  | "te_doen"
  | "bezig"
  | "gevonden"
  | "niets"
  | "mislukt"
  | "overgeslagen";

// ---------------------------------------------------------------------------
// Eén school onderzoeken
// ---------------------------------------------------------------------------

export type Zoekuitkomst = {
  status: Zoekstatus;
  reden: string | null;
  gevonden: number;
};

/**
 * Onderzoekt de website van één school.
 *
 * Gaat als volgt: startpagina ophalen, daaruit de kansrijke links kiezen
 * (schoolgids, onderwijs, methodes), die stuk voor stuk lezen en kijken of er
 * een methodenaam uit de admin in staat. Het opgehaalde bestand wordt na het
 * lezen weggegooid.
 */
export async function onderzoekSchool(school: School): Promise<Zoekuitkomst> {
  const methodes = haalMethodes(true).map((m) => ({ id: m.id, naam: m.naam }));
  if (methodes.length === 0) {
    return { status: "overgeslagen", reden: "geen methodes in de admin", gevonden: 0 };
  }
  if (!school.website) {
    return { status: "overgeslagen", reden: "geen websiteadres bekend", gevonden: 0 };
  }

  const start = await haalOp(school.website);
  if (!start.ok) {
    return {
      status: start.reden.includes("robots") ? "overgeslagen" : "mislukt",
      reden: start.reden,
      gevonden: 0,
    };
  }

  const eigenHost = host(start.url);
  const bladzijden: { url: string; soort: "schoolgids" | "pagina"; tekst: string }[] = [];

  if (start.soort === "html") {
    const html = new TextDecoder("utf-8").decode(start.inhoud);
    bladzijden.push({ url: start.url, soort: "pagina", tekst: tekstUitHtml(html) });

    /*
      Twee stappen diep, en niet verder. Vanaf de startpagina de kansrijke
      pagina's; staat op zo'n pagina een schoolgids als PDF, dan die er nog bij.
      Dat laatste is nodig omdat een schoolgids zelden rechtstreeks op de
      startpagina staat: daar staat een link naar een pagina "Schoolgids", en
      pas dáár staat het bestand.
    */
    const gezien = new Set<string>([start.url]);
    const wachtrij = kiesKandidaten(linksUitHtml(html, start.url), eigenHost, 5);
    let dieper = 3;

    while (wachtrij.length > 0) {
      const kandidaat = wachtrij.shift()!;
      if (gezien.has(kandidaat.url)) continue;
      gezien.add(kandidaat.url);

      const stuk = await haalOp(kandidaat.url);
      if (!stuk.ok) continue;

      if (stuk.soort === "pdf") {
        const tekst = tekstUitPdf(stuk.inhoud);
        if (tekst) bladzijden.push({ url: stuk.url, soort: "schoolgids", tekst });
        continue;
      }

      const paginaHtml = new TextDecoder("utf-8").decode(stuk.inhoud);
      const tekst = tekstUitHtml(paginaHtml);
      if (tekst) bladzijden.push({ url: stuk.url, soort: kandidaat.soort, tekst });

      // Eén stap dieper, alleen voor PDF's.
      for (const pdf of pdfsOpPagina(paginaHtml, stuk.url)) {
        if (dieper <= 0) break;
        if (gezien.has(pdf.url)) continue;
        wachtrij.push(pdf);
        dieper--;
      }
    }
  } else {
    bladzijden.push({
      url: start.url,
      soort: "schoolgids",
      tekst: tekstUitPdf(start.inhoud),
    });
  }

  // Alles wat gevonden is vastleggen als voorstel — met de zin en de link.
  let gevonden = 0;
  for (const blad of bladzijden) {
    for (const treffer of zoekMethodes(blad.tekst, methodes)) {
      bewaarVoorstel({
        schoolId: school.id,
        methodeId: treffer.methodeId,
        zin: treffer.zin,
        bronLink: blad.url,
        bronSoort: blad.soort,
        jaartal: vindJaartal(blad.url, blad.tekst),
      });
      gevonden++;
    }
  }

  return {
    status: gevonden > 0 ? "gevonden" : "niets",
    reden: null,
    gevonden,
  };
}

// ---------------------------------------------------------------------------
// Voorstellen
// ---------------------------------------------------------------------------

function bewaarVoorstel(v: {
  schoolId: string;
  methodeId: string;
  zin: string;
  bronLink: string;
  bronSoort: "schoolgids" | "pagina";
  jaartal: string | null;
}): void {
  verbinding()
    .prepare(
      `insert into methode_voorstellen
         (id, school_id, methode_id, zin, bron_link, bron_soort, jaartal,
          gevonden_op, status)
       values (?, ?, ?, ?, ?, ?, ?, ?, 'open')
       on conflict (school_id, methode_id, bron_link) do update set
         zin         = excluded.zin,
         jaartal     = excluded.jaartal,
         gevonden_op = excluded.gevonden_op`,
    )
    .run(
      randomUUID(), v.schoolId, v.methodeId, v.zin, v.bronLink, v.bronSoort,
      v.jaartal, new Date().toISOString(),
    );
}

export type Voorstel = {
  id: string;
  schoolId: string;
  methode: { id: string; naam: string } | null;
  zin: string;
  bronLink: string;
  bronSoort: "schoolgids" | "pagina";
  jaartal: string | null;
  gevondenOp: string;
  status: "open" | "bevestigd" | "afgewezen" | "later";
};

function alsVoorstel(r: Rij, methodes: { id: string; naam: string }[]): Voorstel {
  const methodeId = String(r.methode_id);
  return {
    id: String(r.id),
    schoolId: String(r.school_id),
    methode: methodes.find((m) => m.id === methodeId) ?? null,
    zin: String(r.zin),
    bronLink: String(r.bron_link),
    bronSoort: String(r.bron_soort) as "schoolgids" | "pagina",
    jaartal: r.jaartal ? String(r.jaartal) : null,
    gevondenOp: String(r.gevonden_op),
    status: String(r.status) as Voorstel["status"],
  };
}

/** De openstaande voorstellen van één school. Meerdere mag: de admin kiest. */
export function voorstellenVanSchool(schoolId: string): Voorstel[] {
  const methodes = haalMethodes().map((m) => ({ id: m.id, naam: m.naam }));
  const rijen = verbinding()
    .prepare(
      `select * from methode_voorstellen
       where school_id = ? and status in ('open','later')
       order by jaartal desc nulls last, gevonden_op desc`,
    )
    .all(schoolId) as Rij[];
  return rijen.map((r) => alsVoorstel(r, methodes));
}

/** Alle scholen met een openstaand voorstel, de belangrijkste eerst. */
export type VoorstelGroep = {
  school: School;
  aantalKinderen: number;
  voorstellen: Voorstel[];
};

export function haalVoorstellen(limiet = 50): VoorstelGroep[] {
  const db = verbinding();
  const methodes = haalMethodes().map((m) => ({ id: m.id, naam: m.naam }));

  const scholen = db
    .prepare(
      `select v.school_id, count(*) as n
       from methode_voorstellen v
       where v.status in ('open','later')
       group by v.school_id
       limit ?`,
    )
    .all(limiet) as { school_id: string; n: number }[];

  const groepen = scholen
    .map(({ school_id }) => {
      const school = haalSchool(school_id);
      if (!school) return null;

      const kinderen = db
        .prepare("select count(*) as n from kind_school where school_id = ?")
        .get(school_id) as { n: number };

      const rijen = db
        .prepare(
          `select * from methode_voorstellen
           where school_id = ? and status in ('open','later')
           order by jaartal desc, gevonden_op desc`,
        )
        .all(school_id) as Rij[];

      return {
        school,
        aantalKinderen: Number(kinderen.n),
        voorstellen: rijen.map((r) => alsVoorstel(r, methodes)),
      };
    })
    .filter((g): g is VoorstelGroep => g !== null);

  // Scholen waar kinderen van Thuisles op zitten, staan bovenaan.
  return groepen.sort(
    (a, b) =>
      b.aantalKinderen - a.aantalKinderen ||
      a.school.naam.localeCompare(b.school.naam),
  );
}

export function haalVoorstel(id: string): Voorstel | null {
  const methodes = haalMethodes().map((m) => ({ id: m.id, naam: m.naam }));
  const r = verbinding()
    .prepare("select * from methode_voorstellen where id = ?")
    .get(id) as Rij | undefined;
  return r ? alsVoorstel(r, methodes) : null;
}

export function zetVoorstelStatus(
  id: string,
  status: "bevestigd" | "afgewezen" | "later",
): void {
  verbinding()
    .prepare("update methode_voorstellen set status = ?, behandeld_op = ? where id = ?")
    .run(status, new Date().toISOString(), id);
}

/** Na een bevestiging hoeven de andere voorstellen van die school niet meer. */
export function sluitOverigeVoorstellen(schoolId: string, behalveId: string): void {
  verbinding()
    .prepare(
      `update methode_voorstellen set status = 'afgewezen', behandeld_op = ?
       where school_id = ? and id <> ? and status in ('open','later')`,
    )
    .run(new Date().toISOString(), schoolId, behalveId);
}

// ---------------------------------------------------------------------------
// De wachtrij
// ---------------------------------------------------------------------------

export type Voortgang = {
  actief: boolean;
  gestartOp: string | null;
  /** Wanneer de lus voor het laatst een school afrondde. */
  laatstActiefOp: string | null;
  teDoen: number;
  gevonden: number;
  niets: number;
  mislukt: number;
  overgeslagen: number;
  gedaan: number;
  /** Hoeveel scholen er in totaal in aanmerking komen. */
  totaal: number;
  openVoorstellen: number;
  /** Hoeveel scholen er een voorstel hebben opgeleverd. */
  scholenMetVoorstel: number;
  /** Ruwe schatting van de resterende tijd in minuten. Null zolang onbekend. */
  minutenTeGaan: number | null;
};

export function haalVoortgang(): Voortgang {
  const db = verbinding();
  const stand = db.prepare("select * from zoeker_stand where id = 1").get() as
    | Rij
    | undefined;

  const tellen = (status: Zoekstatus) =>
    Number(
      (db
        .prepare("select count(*) as n from zoekopdrachten where status = ?")
        .get(status) as { n: number }).n,
    );

  const totaal = Number(
    (db
      .prepare("select count(*) as n from scholen where gesloten_op is null and website <> ''")
      .get() as { n: number }).n,
  );

  const open = Number(
    (db
      .prepare("select count(*) as n from methode_voorstellen where status in ('open','later')")
      .get() as { n: number }).n,
  );

  const gevonden = tellen("gevonden");
  const niets = tellen("niets");
  const mislukt = tellen("mislukt");
  const overgeslagen = tellen("overgeslagen");
  const gedaan = gevonden + niets + mislukt + overgeslagen;
  const teDoen = tellen("te_doen") + tellen("bezig");

  const metVoorstel = Number(
    (db
      .prepare("select count(distinct school_id) as n from methode_voorstellen")
      .get() as { n: number }).n,
  );

  /*
    Een ruwe schatting: hoeveel tijd kostte het tot nu toe, gedeeld door wat er
    af is. Alleen zinvol als de zoeker echt heeft gelopen; anders liever niets
    tonen dan een getal dat nergens op slaat.
  */
  let minutenTeGaan: number | null = null;
  if (stand?.gestart_op && stand?.laatst_actief_op && gedaan > 5 && teDoen > 0) {
    const verstreken =
      new Date(String(stand.laatst_actief_op)).getTime() -
      new Date(String(stand.gestart_op)).getTime();
    if (verstreken > 0) {
      minutenTeGaan = Math.round((verstreken / gedaan) * teDoen / 60_000);
    }
  }

  return {
    actief: Number(stand?.actief ?? 0) === 1,
    gestartOp: stand?.gestart_op ? String(stand.gestart_op) : null,
    laatstActiefOp: stand?.laatst_actief_op ? String(stand.laatst_actief_op) : null,
    teDoen,
    gevonden,
    niets,
    mislukt,
    overgeslagen,
    gedaan,
    totaal,
    openVoorstellen: open,
    scholenMetVoorstel: metVoorstel,
    minutenTeGaan,
  };
}

/**
 * Vult de wachtrij aan met scholen die nog niet aan de beurt zijn geweest.
 *
 * Volgorde: eerst de scholen waar kinderen van Thuisles op zitten — daar raakt
 * een gevonden methode meteen een gezin. Daarna de rest.
 */
export function vulWachtrij(): number {
  const db = verbinding();
  const schooljaar = huidigSchooljaar();

  const nieuw = db.prepare(
    `insert or ignore into zoekopdrachten (school_id, status) values (?, 'te_doen')`,
  );

  const scholen = db
    .prepare(
      `select s.id from scholen s
       left join zoekopdrachten z on z.school_id = s.id
       where s.gesloten_op is null and s.website <> '' and z.school_id is null`,
    )
    .all() as { id: string }[];

  for (const s of scholen) nieuw.run(s.id);

  // Eens per schooljaar opnieuw kijken.
  db.prepare(
    `update zoekopdrachten set status = 'te_doen', reden = null
     where schooljaar is not null and schooljaar <> ?
       and status in ('gevonden','niets','mislukt')`,
  ).run(schooljaar);

  return scholen.length;
}

/**
 * De volgende scholen, en meteen op "bezig" gezet.
 *
 * Het claimen gebeurt in dezelfde transactie als het uitkiezen. Zonder dat
 * zouden twee lussen — bijvoorbeeld na een herlaadbeurt tijdens het
 * ontwikkelen — dezelfde school kunnen pakken en die website dubbel belasten.
 *
 * Volgorde: scholen waar kinderen van Thuisles op zitten gaan voor. Daar raakt
 * een gevonden methode meteen een gezin.
 */
function claimVolgende(aantal: number): School[] {
  const db = verbinding();
  const uit: School[] = [];

  db.exec("begin immediate");
  try {
    const rijen = db
      .prepare(
        `select s.id from zoekopdrachten z
         join scholen s on s.id = z.school_id
         left join (select school_id, count(*) as kinderen
                    from kind_school where school_id is not null
                    group by school_id) k on k.school_id = s.id
         where z.status = 'te_doen'
         order by coalesce(k.kinderen, 0) desc, z.pogingen, s.naam
         limit ?`,
      )
      .all(aantal) as { id: string }[];

    const claim = db.prepare(
      "update zoekopdrachten set status = 'bezig' where school_id = ? and status = 'te_doen'",
    );
    for (const r of rijen) {
      claim.run(r.id);
      const school = haalSchool(r.id);
      if (school) uit.push(school);
    }
    db.exec("commit");
  } catch (fout) {
    db.exec("rollback");
    throw fout;
  }

  return uit;
}

/**
 * Zet scholen die halverwege bleven steken terug in de wachtrij.
 *
 * Gebeurt bij het opstarten: stopt de server midden in een school, dan blijft
 * die op "bezig" staan en zou hij nooit meer aan de beurt komen.
 */
export function herstelVastgelopen(): number {
  const db = verbinding();
  const aantal = Number(
    (db.prepare("select count(*) as n from zoekopdrachten where status = 'bezig'")
      .get() as { n: number }).n,
  );
  if (aantal > 0) {
    db.prepare("update zoekopdrachten set status = 'te_doen' where status = 'bezig'").run();
  }
  return aantal;
}

function zetOpdracht(
  schoolId: string,
  status: Zoekstatus,
  reden: string | null,
): void {
  verbinding()
    .prepare(
      `insert into zoekopdrachten
         (school_id, status, reden, laatst_gezocht_op, schooljaar, pogingen)
       values (?, ?, ?, ?, ?, 1)
       on conflict (school_id) do update set
         status            = excluded.status,
         reden             = excluded.reden,
         laatst_gezocht_op = excluded.laatst_gezocht_op,
         schooljaar        = excluded.schooljaar,
         pogingen          = zoekopdrachten.pogingen + 1`,
    )
    .run(schoolId, status, reden, new Date().toISOString(), huidigSchooljaar());
}

/** Eén school opnieuw in de wachtrij zetten. */
export function zoekOpnieuw(schoolId: string): void {
  verbinding()
    .prepare(
      `insert into zoekopdrachten (school_id, status) values (?, 'te_doen')
       on conflict (school_id) do update set status = 'te_doen', reden = null`,
    )
    .run(schoolId);
}

// ---------------------------------------------------------------------------
// Starten, pauzeren en draaien
// ---------------------------------------------------------------------------

function zetStand(actief: boolean): void {
  verbinding()
    .prepare(
      `insert into zoeker_stand (id, actief, gestart_op, laatst_actief_op)
       values (1, ?, ?, ?)
       on conflict (id) do update set
         actief           = excluded.actief,
         gestart_op       = case when excluded.actief = 1
                                 then coalesce(zoeker_stand.gestart_op, excluded.gestart_op)
                                 else zoeker_stand.gestart_op end,
         laatst_actief_op = excluded.laatst_actief_op`,
    )
    .run(actief ? 1 : 0, new Date().toISOString(), new Date().toISOString());
}

export function isActief(): boolean {
  const r = verbinding()
    .prepare("select actief from zoeker_stand where id = 1")
    .get() as { actief: number } | undefined;
  return Number(r?.actief ?? 0) === 1;
}

/**
 * Hoeveel scholen er tegelijk worden bekeken.
 *
 * Elke school is een andere website, dus het tempo per site blijft precies
 * gelijk: hooguit één verzoek per drie seconden. Wat sneller gaat, is de hele
 * ronde — bij ruim zesduizend scholen scheelt dat dagen.
 */
const GELIJKTIJDIG = 3;

/*
  Draait er in dit proces al een lus? Bewust op `globalThis` en niet als gewone
  variabele: tijdens het ontwikkelen laadt Next een gewijzigde module opnieuw,
  en dan zou een nieuwe lus naast de oude gaan lopen.
*/
const SLEUTEL = Symbol.for("thuisles.zoeker.lus");
type MetLus = typeof globalThis & { [SLEUTEL]?: boolean };

function lusLoopt(): boolean {
  return (globalThis as MetLus)[SLEUTEL] === true;
}

function zetLus(waarde: boolean): void {
  (globalThis as MetLus)[SLEUTEL] = waarde;
}

/**
 * De achtergrondlus.
 *
 * Pakt telkens één school, onderzoekt die, en kijkt daarna of hij nog door mag.
 * Het tempo per website wordt bewaakt in `beleefd.ts`; hier zit alleen een
 * korte adempauze tussen scholen.
 */
async function draaiLus(): Promise<void> {
  if (lusLoopt()) return;
  zetLus(true);

  try {
    while (isActief()) {
      const scholen = claimVolgende(GELIJKTIJDIG);
      if (scholen.length === 0) {
        // Niets meer te doen: netjes stoppen.
        zetStand(false);
        break;
      }

      await Promise.all(scholen.map(verwerkSchool));

      // Een levensteken, zodat in de admin te zien is dat hij echt loopt.
      raakAan();
      await new Promise((klaar) => setTimeout(klaar, 500));
    }
  } finally {
    zetLus(false);
  }
}

/** Eén school afhandelen. Een fout hier zet nooit de rest stil. */
async function verwerkSchool(school: School): Promise<void> {
  try {
    const uitkomst = await onderzoekSchool(school);
    zetOpdracht(school.id, uitkomst.status, uitkomst.reden);
  } catch (fout) {
    const reden = fout instanceof Error ? fout.message.slice(0, 120) : "onbekende fout";
    zetOpdracht(school.id, "mislukt", reden);
  }
}

/** Levensteken van de lus. */
function raakAan(): void {
  verbinding()
    .prepare("update zoeker_stand set laatst_actief_op = ? where id = 1")
    .run(new Date().toISOString());
}

/**
 * Pakt de lus weer op na een herstart van de server.
 *
 * "Starten" en "pauzeren" staan in de database, zodat die keuze een herstart
 * overleeft. Maar de lus zelf leeft in het geheugen van het serverproces en is
 * na een herstart weg. Zonder dit zou de admin zeggen dat de zoeker loopt
 * terwijl er niets gebeurt.
 *
 * Wordt aangeroepen bij het opstarten; zie `src/instrumentation.ts`.
 */
export function hervatZoekerAlsActief(): void {
  // Wat halverwege bleef steken, gaat terug de wachtrij in.
  herstelVastgelopen();
  if (!isActief()) return;
  void draaiLus();
}

export function startZoeker(): void {
  vulWachtrij();
  zetStand(true);
  void draaiLus();
}

export function pauzeerZoeker(): void {
  zetStand(false);
}

/**
 * Doet een vaste hoeveelheid scholen en wacht tot het klaar is.
 *
 * Bedoeld voor een proefronde: je weet dan zeker dat het klaar is voordat je
 * naar de uitkomst kijkt.
 */
export async function draaiBatch(aantal: number): Promise<Voortgang> {
  vulWachtrij();

  let gedaan = 0;
  while (gedaan < aantal) {
    const scholen = claimVolgende(Math.min(GELIJKTIJDIG, aantal - gedaan));
    if (scholen.length === 0) break;

    await Promise.all(scholen.map(verwerkSchool));
    gedaan += scholen.length;
  }

  return haalVoortgang();
}
