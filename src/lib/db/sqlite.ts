import "server-only";

/**
 * Echte, blijvende opslag voor de beheeromgeving.
 *
 * De keuze was PostgreSQL via Supabase, maar dat project bestaat nog niet.
 * Om te voorkomen dat vragen in het niets verdwijnen, draait de beheerkant nu
 * op SQLite: een database in één bestand (`data/thuisles.db`), ingebouwd in
 * Node, zonder installatie of account. Toegevoegde vragen blijven dus staan,
 * ook na een herstart.
 *
 * Belangrijk: de tabellen hebben BEWUST dezelfde vorm en dezelfde regels als
 * `db/schema.sql`. Overstappen naar Postgres is straks het overzetten van de
 * rijen, niet het herbouwen van de beheerkant.
 *
 * De leerdoelstructuur (vak, domein, subdomein, leerdoel) wordt NIET
 * automatisch gevuld. Er is bewust geen seed: alle content ontstaat doordat de
 * beheerder hem aanmaakt in de beheeromgeving.
 */

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { ALLE_VRAAGVORMEN } from "@/lib/vraagtypes";

/** De toegestane vraagvormen, als SQL-lijst. Eén bron; zie `vraagtypes.ts`. */
const VORMEN_SQL = ALLE_VRAAGVORMEN.map((v) => `'${v}'`).join(",");

/*
  De database staat in `data/thuisles.db`.

  `THUISLES_DB` kan daar een ander bestand van maken. Dat is er voor de
  controlescripts, die op een wegwerpkopie werken en jouw echte database dus
  nooit aanraken. Staat de omgevingsvariabele niet, en dat is overal behalve in
  die scripts, dan verandert er niets.
*/
const BESTAND = process.env.THUISLES_DB ?? path.join(process.cwd(), "data", "thuisles.db");
const MAP = path.dirname(BESTAND);

let db: DatabaseSync | null = null;

function maakTabellen(d: DatabaseSync) {
  d.exec(`
    /*
      De ouder is het enige echte account. Kinderen zijn profielen daaronder,
      zonder eigen inlog. Dataminimalisatie: van de ouder alleen een
      e-mailadres, van het kind alleen een roepnaam en een groep.

      TIJDELIJK GEEN INLOG. Zolang de site niet online staat is er precies
      één ouder, die vanzelf wordt aangemaakt zodra de app voor het eerst
      wordt geopend. Zie src/lib/auth/sessie.ts voor wat dat betekent en wat
      er terug moet vóór livegang.

      Bij de overstap naar Supabase beheert Supabase Auth het e-mailadres en
      het wachtwoord (tabel auth.users); dan vervalt de kolom email hier.
      De rest van de kolommen verhuist ongewijzigd mee. Zie db/schema.sql,
      waar het ontwerp voor online al klopt.
    */
    create table if not exists ouders (
      id              text primary key,
      -- Optioneel zolang er geen inlog is; straks de inlognaam.
      email           text unique,
      weergavenaam    text,
      taal            text not null default 'nl'
                      check (taal in ('nl','tr','ar','pl')),
      aangemaakt_op   text not null
    );

    create table if not exists kinderen (
      id            text primary key,
      ouder_id      text not null references ouders (id) on delete cascade,
      roepnaam      text not null,
      groep         integer not null check (groep between 3 and 8),
      avatar        text not null default 'vos',
      -- Zachte drempel tussen broers en zussen, geen accountbeveiliging.
      kindcode_hash text,
      aangemaakt_op text not null
    );

    create index if not exists kinderen_op_ouder on kinderen (ouder_id);

    create table if not exists scholen (
      id             text primary key,
      brin           text not null,
      vestigingscode text not null unique,
      naam           text not null,
      plaats         text not null,
      postcode       text not null,
      gemeente       text not null default '',
      -- Het websiteadres uit de DUO-lijst. Mag leeg zijn.
      website        text not null default '',
      -- De naam zonder hoofdletters, accenten en leestekens, plus dezelfde
      -- naam zonder voorvoegsels als "obs" of "de". Puur om te kunnen zoeken.
      zoeknaam       text not null default '',
      zoekkern       text not null default '',
      -- Gevuld zodra een school niet meer in de DUO-lijst voorkomt. De rij
      -- blijft staan: er kunnen kinderen aan gekoppeld zijn.
      gesloten_op    text,
      bron           text not null,
      bron_datum     text not null
    );

    create index if not exists scholen_op_plaats on scholen (plaats);
    create index if not exists scholen_op_postcode on scholen (postcode);
    create index if not exists scholen_op_zoeknaam on scholen (zoeknaam);

    /* Eén rij per import, zodat bron, licentie en datum navolgbaar blijven. */
    create table if not exists school_imports (
      id            text primary key,
      bron          text not null,
      bron_link     text not null,
      licentie      text not null,
      uitgevoerd_op text not null,
      aantal        integer not null,
      -- Wat deze vernieuwing veranderde, zodat te zien is wat er gebeurd is.
      nieuw         integer not null default 0,
      gewijzigd     integer not null default 0,
      gesloten      integer not null default 0
    );

    /*
      Rekenmethodes: ALLEEN een naam en een uitgever, allebei als gewone tekst.
      Dit is de afstemmingslaag — er staat geen inhoud uit een methode in, en
      er horen hier nooit logo's, omslagen of huisstijl bij.
      LEGAL REVIEW REQUIRED zodra hier iets bijkomt.
    */
    create table if not exists rekenmethodes (
      id            text primary key,
      naam          text not null unique,
      uitgever      text not null default '',
      actief        integer not null default 1,
      aangemaakt_op text not null
    );

    /* De blokken van een methode, per groep, in volgorde. */
    create table if not exists methode_blokken (
      id         text primary key,
      methode_id text not null references rekenmethodes (id) on delete cascade,
      groep      integer not null check (groep between 3 and 8),
      nummer     integer not null,
      titel      text not null,
      unique (methode_id, groep, nummer)
    );

    /* Welke eigen Thuisles-leerdoelen sluiten aan bij welk blok. */
    create table if not exists blok_leerdoelen (
      blok_id     text not null references methode_blokken (id) on delete cascade,
      leerdoel_id text not null references leerdoelen (id) on delete cascade,
      volgorde    integer not null default 0,
      primary key (blok_id, leerdoel_id)
    );

    /*
      Een bevestiging DOOR THUISLES dat een school met deze methode werkt.
      Alleen rijen hier mogen "Geverifieerd door Thuisles" opleveren. Bron en
      datum zijn verplicht: zonder controleerbare herkomst geen verificatie.
    */
    create table if not exists school_verificatie (
      school_id    text primary key references scholen (id) on delete cascade,
      methode_id   text not null references rekenmethodes (id) on delete cascade,
      bron         text not null,
      bron_link    text not null default '',
      bevestigd_op text not null,
      schooljaar   text not null
    );

    /*
      Wat ouders opgeven over de methode van een school. Meerdere ouders van
      dezelfde school mogen hetzelfde opgeven; dat telt op in de wachtrij, maar
      het wordt pas "geverifieerd" als Thuisles het bevestigt.

      "Waar heb je dit gezien?" is verplicht — zonder herkomst geen opgave.
    */
    create table if not exists methode_opgaven (
      id           text primary key,
      school_id    text not null references scholen (id) on delete cascade,
      ouder_id     text not null references ouders (id) on delete cascade,
      methode_id   text references rekenmethodes (id) on delete cascade,
      anders_tekst text not null default '',
      gezien_waar  text not null
                   check (gezien_waar in ('schoolgids','werkboek','leerkracht','anders')),
      gezien_link  text not null default '',
      status       text not null default 'open'
                   check (status in ('open','bevestigd','afgewezen')),
      schooljaar   text not null,
      gemaakt_op   text not null,
      behandeld_op text
    );

    create index if not exists opgaven_op_school on methode_opgaven (school_id, status);

    /*
      Wat de methodezoeker heeft gevonden op de website van een school.

      Dit is uitdrukkelijk een VOORSTEL, geen bewering. Ouders zien er niets
      van: voor hen blijft de school "Rekenmethode nog niet bekend" totdat
      Thuisles het met de hand bevestigt. De zoeker zet nooit zelf iets op
      geverifieerd.

      Er wordt zo min mogelijk bewaard: alleen de ene zin waarin de naam stond
      en de link ernaartoe. Nooit de hele pagina of schoolgids.

      LEGAL REVIEW REQUIRED — automatisch lezen van schoolwebsites.
      Zie src/lib/zoeker/NOTITIE.md.
    */
    create table if not exists methode_voorstellen (
      id           text primary key,
      school_id    text not null references scholen (id) on delete cascade,
      methode_id   text not null references rekenmethodes (id) on delete cascade,
      zin          text not null,
      bron_link    text not null,
      bron_soort   text not null check (bron_soort in ('schoolgids','pagina')),
      jaartal      text,
      gevonden_op  text not null,
      status       text not null default 'open'
                   check (status in ('open','bevestigd','afgewezen','later')),
      behandeld_op text,
      unique (school_id, methode_id, bron_link)
    );

    create index if not exists voorstellen_op_school
      on methode_voorstellen (school_id, status);

    /* De wachtrij van de zoeker: welke school is wanneer aan de beurt geweest. */
    create table if not exists zoekopdrachten (
      school_id         text primary key references scholen (id) on delete cascade,
      status            text not null default 'te_doen'
                        check (status in
                          ('te_doen','bezig','gevonden','niets','mislukt','overgeslagen')),
      reden             text,
      laatst_gezocht_op text,
      schooljaar        text,
      pogingen          integer not null default 0
    );

    create index if not exists zoekopdrachten_op_status on zoekopdrachten (status);

    /*
      Loopt de zoeker? Bewust in de database en niet alleen in het geheugen,
      zodat starten en pauzeren een herstart overleven.
    */
    create table if not exists zoeker_stand (
      id              integer primary key check (id = 1),
      actief          integer not null default 0,
      gestart_op      text,
      laatst_actief_op text
    );

    /*
      De koppeling per KIND. De methode hangt aan het kind, niet alleen aan de
      school: een ouder kan ook zonder bekende school zeggen "mijn kind werkt
      uit dit werkboek". Dat werkt meteen op de kinderkant en is geen bewering
      over de school.
    */
    create table if not exists kind_school (
      kind_id          text primary key references kinderen (id) on delete cascade,
      school_id        text references scholen (id) on delete set null,
      methode_id       text references rekenmethodes (id) on delete set null,
      -- 'school' = overgenomen van de school, 'eigen' = alleen voor dit kind.
      methode_herkomst text check (methode_herkomst in ('school','eigen')),
      -- B9: oefenen volgens methode aan of uit.
      volg_methode     integer not null default 1,
      -- B8: waar de klas nu zit. Dit vult Thuisles NOOIT zelf in.
      huidig_blok_id   text references methode_blokken (id) on delete set null,
      -- Schooljaar waarin de ouder dit voor het laatst heeft bevestigd.
      schooljaar       text,
      bijgewerkt_op    text not null
    );

    /*
      Signalen van het kind zelf, met een datum erbij.

      Twee soorten, allebei bedoeld voor de ouder:
        zelf_lastig  het kind drukte op "Dit snapte ik niet";
        comeback     een leerdoel dat aandacht vroeg, gaat weer goed.

      Bewust een eigen tabel en geen vlaggetje: een ouder wil kunnen zien
      WANNEER iets gebeurde, en vooruitgang hoort net zo zichtbaar te zijn als
      wat er misging.
    */
    create table if not exists kind_signalen (
      id          text primary key,
      kind_id     text not null,
      leerdoel_id text not null references leerdoelen (id) on delete cascade,
      soort       text not null check (soort in ('zelf_lastig','comeback')),
      gemaakt_op  text not null
    );

    create index if not exists signalen_op_kind on kind_signalen (kind_id, gemaakt_op);

    /*
      Oefeningen die de ouder heeft klaargezet. Die komen bij het kind terug in
      "Voor jou" — met de reden erbij, zodat het kind snapt waarom het er staat.
    */
    create table if not exists klaargezet (
      id            text primary key,
      kind_id       text not null,
      leerdoel_id   text not null references leerdoelen (id) on delete cascade,
      reden         text not null,
      klaargezet_op text not null,
      gedaan_op     text
    );

    create index if not exists klaargezet_op_kind on klaargezet (kind_id, gedaan_op);

    create table if not exists vakken (
      id           text primary key,
      slug         text not null unique,
      naam         text not null,
      omschrijving text,
      icoon        text,
      actief       integer not null default 0,
      volgorde     integer not null default 0
    );

    create table if not exists domeinen (
      id           text primary key,
      vak_id       text not null references vakken (id) on delete cascade,
      slug         text not null,
      naam         text not null,
      omschrijving text,
      icoon        text,
      actief       integer not null default 1,
      volgorde     integer not null default 0,
      unique (vak_id, slug)
    );

    create table if not exists subdomeinen (
      id           text primary key,
      domein_id    text not null references domeinen (id) on delete cascade,
      slug         text not null,
      naam         text not null,
      omschrijving text,
      icoon        text,
      volgorde     integer not null default 0,
      unique (domein_id, slug)
    );

    create table if not exists leerdoelen (
      id           text primary key,
      subdomein_id text not null references subdomeinen (id) on delete cascade,
      code         text not null unique,
      titel        text not null,
      groep_van    integer not null,
      groep_tot    integer not null,
      volgorde     integer not null default 0,
      check (groep_van <= groep_tot)
    );

    /*
      Een vraag hangt altijd aan een leerdoel. Daarmee ligt de hele keten vast:
      via het leerdoel hoort de vraag bij een subdomein, domein en vak.
      De database weigert een vraag zonder bestaand leerdoel.
    */
    create table if not exists vragen (
      id            text primary key,
      leerdoel_id   text not null references leerdoelen (id) on delete cascade,
      groep         integer not null check (groep between 3 and 8),
      vorm          text not null check (vorm in (${VORMEN_SQL})),
      vraagtekst    text not null,
      opties        text,
      antwoord      text not null,
      hint          text,
      afbeelding    text,
      status        text not null default 'concept'
                    check (status in ('concept','gepubliceerd')),
      aangemaakt_op text not null
    );

    create index if not exists vragen_op_leerdoel on vragen (leerdoel_id);

    /*
      Een sjabloon is een recept: welk soort som, met welke instellingen. De
      sommen die eruit komen zijn gewone vragen; ze verwijzen alleen terug naar
      het sjabloon waar ze uit voortkwamen. Verwijder je het sjabloon, dan gaan
      die sommen mee.
    */
    create table if not exists sjablonen (
      id            text primary key,
      leerdoel_id   text not null references leerdoelen (id) on delete cascade,
      naam          text not null,
      soort         text not null,
      instellingen  text not null,
      hint          text,
      groep         integer not null,
      aangemaakt_op text not null
    );

    create index if not exists sjablonen_op_leerdoel on sjablonen (leerdoel_id);

    /*
      Elk antwoord van een kind, met alleen wat nodig is om te leren en om de
      voortgang te tonen. Bewust GEEN vrije tekst, geen apparaatgegevens, geen
      profilering: alleen het leerdoel, of het goed was, welk foutpatroon
      herkend werd, of er hulp is gebruikt en hoe lang het duurde.
    */
    create table if not exists antwoorden (
      id             text primary key,
      kind_id        text not null,
      leerdoel_id    text not null references leerdoelen (id) on delete cascade,
      vraag_id       text,
      goed           integer not null,
      uitkomst       text not null
                     check (uitkomst in ('direct_goed','goed_na_hint','goed_na_uitleg','fout')),
      foutpatroon    text,
      hint_gebruikt  integer not null default 0,
      uitleg_gebruikt integer not null default 0,
      seconden       integer,
      gegokt         integer not null default 0,
      gemaakt_op     text not null
    );

    create index if not exists antwoorden_op_kind on antwoorden (kind_id, leerdoel_id, gemaakt_op);

    /*
      De beheersing per leerdoel. Wordt berekend uit de laatste antwoorden, dus
      één fout maakt nooit meteen iets kapot.
    */
    create table if not exists leerdoel_voortgang (
      kind_id            text not null,
      leerdoel_id        text not null references leerdoelen (id) on delete cascade,
      status             text not null default 'nog_niet_gestart',
      aandacht           integer not null default 0,
      aandacht_patroon   text,
      aantal_direct_goed integer not null default 0,
      aantal_goed_na_hulp integer not null default 0,
      aantal_goed_na_meerdere_pogingen integer not null default 0,
      aantal_nog_niet_beheerst integer not null default 0,
      zelf_lastig        integer not null default 0,
      laatst_geoefend_op text,
      primary key (kind_id, leerdoel_id)
    );

    /*
      Sleutels: de enige beloning die het kind bovenaan het scherm ziet.

      Bewust een grootboek en geen enkele teller. Een kind verdient sleutels
      met goede antwoorden en gaat ze straks uitgeven aan schatkisten op de
      eilandenkaart. Met alleen een saldo weet je na afloop niet meer waar het
      vandaan kwam of waaraan het opging; met losse regels wel, en dan is het
      openen van een kist niets meer dan een regel met een negatief aantal.

      aantal   positief = verdiend, negatief = uitgegeven.
      reden    waarom; nu alleen 'antwoord_goed', later ook 'kist_geopend'.
      bron_id  waar het aan hangt (het antwoord, straks de kist). Uniek per
               reden, zodat hetzelfde antwoord nooit twee keer kan uitbetalen.
    */
    create table if not exists sleutel_mutaties (
      id         text primary key,
      kind_id    text not null,
      aantal     integer not null,
      reden      text not null,
      bron_id    text,
      gemaakt_op text not null
    );

    /*
      Welke eenmalige stappen al gedaan zijn.

      Nodig omdat sommige stappen bij een uitbreiding precies één keer moeten
      draaien. Zonder deze administratie zou zo'n stap bij elke start opnieuw
      gaan, en dat is precies hoe een veld dat jij hebt leeggemaakt vanzelf
      weer gevuld raakt.
    */
    /*
      Instellingen die voor de hele app gelden, als sleutel en waarde. Bewust
      een tabel en geen bestand: dan is het ook na livegang aan te passen zonder
      opnieuw uit te rollen, en verhuist het mee naar Postgres.
    */
    create table if not exists app_instellingen (
      sleutel    text primary key,
      waarde     text not null,
      bijgewerkt_op text not null
    );

    create table if not exists migraties (
      naam       text primary key,
      gedaan_op  text not null
    );

    create index if not exists sleutels_op_kind on sleutel_mutaties (kind_id);
    create unique index if not exists sleutels_per_bron
      on sleutel_mutaties (reden, bron_id) where bron_id is not null;
  `);
}

/**
 * Voegt een kolom toe als die nog niet bestaat.
 *
 * Nodig voor databases die zijn aangemaakt vóór een uitbreiding: `create table
 * if not exists` laat een bestaande tabel namelijk ongemoeid.
 */
function voegKolomToe(d: DatabaseSync, tabel: string, kolom: string, definitie: string) {
  const kolommen = d.prepare(`pragma table_info(${tabel})`).all() as { name: string }[];
  if (kolommen.some((k) => k.name === kolom)) return;
  d.exec(`alter table ${tabel} add column ${kolom} ${definitie}`);
}

/**
 * Haalt een kolom weg als die er nog is.
 *
 * Nodig voor databases die zijn aangemaakt vóór een wijziging: `create table
 * if not exists` laat een bestaande tabel namelijk ongemoeid.
 */
function haalKolomWeg(d: DatabaseSync, tabel: string, kolom: string) {
  const kolommen = d.prepare(`pragma table_info(${tabel})`).all() as { name: string }[];
  if (!kolommen.some((k) => k.name === kolom)) return;
  d.exec(`alter table ${tabel} drop column ${kolom}`);
}

/**
 * Zorgt dat de tabel `ouders` de huidige vorm heeft.
 *
 * Een oudere database heeft daar nog `wachtwoord_hash` in staan, en een
 * verplicht e-mailadres. Allebei zijn ze weg: er is geen inlog meer, en
 * bewaren wat je niet gebruikt is precies wat dataminimalisatie verbiedt.
 *
 * SQLite kan een kolom niet van verplicht naar optioneel zetten, dus wordt de
 * tabel opnieuw opgebouwd met de rijen erbij.
 */
function werkOudersBij(d: DatabaseSync) {
  haalKolomWeg(d, "ouders", "wachtwoord_hash");

  const kolommen = d.prepare("pragma table_info(ouders)").all() as {
    name: string;
    notnull: number;
  }[];
  const email = kolommen.find((k) => k.name === "email");
  if (!email || email.notnull === 0) return;

  d.exec(`
    create table ouders_nieuw (
      id              text primary key,
      email           text unique,
      weergavenaam    text,
      taal            text not null default 'nl'
                      check (taal in ('nl','tr','ar','pl')),
      aangemaakt_op   text not null
    );
    insert into ouders_nieuw (id, email, weergavenaam, taal, aangemaakt_op)
      select id, email, weergavenaam, taal, aangemaakt_op from ouders;
    drop table ouders;
    alter table ouders_nieuw rename to ouders;
  `);
}

/**
 * De toegestane vraagvormen in een bestaande database bijwerken.
 *
 * `create table if not exists` laat een tabel die er al staat met rust, dus een
 * database die eerder is aangemaakt houdt de oude lijst. Kwam er een vorm bij,
 * dan viel elke vraag van die vorm stuk op de controle in de tabel — precies
 * wat er met "sleepgetallen" gebeurde.
 *
 * SQLite kan zo'n controle niet aanpassen, dus wordt de tabel opnieuw opgebouwd.
 * De nieuwe definitie is de oude met alleen die ene lijst vervangen: zo blijven
 * alle kolommen exact zoals ze waren, ook de kolommen die er later bij zijn
 * gekomen. Draait alleen als er echt iets ontbreekt.
 */
function werkVraagvormenBij(d: DatabaseSync) {
  const rij = d.prepare("select sql from sqlite_master where type='table' and name='vragen'").get() as
    | { sql?: string }
    | undefined;
  const oud = rij?.sql;
  if (!oud) return;

  const patroon = /check \(vorm in \(([^)]*)\)\)/;
  const gevonden = oud.match(patroon);
  if (!gevonden) return;

  const nu = gevonden[1].split(",").map((v) => v.trim().replace(/'/g, ""));
  if (ALLE_VRAAGVORMEN.every((v) => nu.includes(v))) return;

  const nieuw = oud
    .replace(/create table\s+"?vragen"?/i, "create table vragen_nieuw")
    .replace(patroon, `check (vorm in (${VORMEN_SQL}))`);

  /* In één keer, zodat er geen half omgebouwde tabel kan blijven staan. */
  d.exec("begin");
  try {
    d.exec(nieuw);
    d.exec("insert into vragen_nieuw select * from vragen");
    d.exec("drop table vragen");
    d.exec("alter table vragen_nieuw rename to vragen");
    /* De indexen gingen mee met de oude tabel. */
    d.exec("create index if not exists vragen_op_leerdoel on vragen (leerdoel_id)");
    d.exec(
      "create index if not exists vragen_op_handtekening on vragen (leerdoel_id, handtekening)",
    );
    d.exec("commit");
  } catch (e) {
    d.exec("rollback");
    throw e;
  }
}

function werkTabellenBij(d: DatabaseSync) {
  werkOudersBij(d);
  // De sessietabel is niet meer in gebruik nu er geen inlog is.
  d.exec("drop table if exists sessies");

  voegKolomToe(d, "vakken", "omschrijving", "text");
  voegKolomToe(d, "vakken", "icoon", "text");
  voegKolomToe(d, "vakken", "volgorde", "integer not null default 0");
  voegKolomToe(d, "domeinen", "omschrijving", "text");
  voegKolomToe(d, "domeinen", "icoon", "text");
  voegKolomToe(d, "domeinen", "actief", "integer not null default 1");
  voegKolomToe(d, "subdomeinen", "omschrijving", "text");
  voegKolomToe(d, "subdomeinen", "icoon", "text");
  /*
    Welke vorm van uitleg-animatie bij dit leerdoel hoort. Leeg betekent: volg
    gewoon de groep van het kind.
  */
  voegKolomToe(d, "leerdoelen", "uitlegvorm", "text");
  /*
    Hoeveel vragen dit leerdoel per oefensessie geeft. Leeg betekent: volg de
    algemene standaard uit `app_instellingen`. Zo hoeft een leerdoel alleen een
    eigen getal te hebben als het écht afwijkt.
  */
  voegKolomToe(d, "leerdoelen", "vragen_per_sessie", "integer");

  // Uit welk sjabloon een vraag komt (leeg bij handgemaakte vragen).
  voegKolomToe(d, "vragen", "sjabloon_id", "text references sjablonen (id) on delete cascade");
  // Tekening bij de vraag (klok, splitsboom, breukfiguur ...) als JSON.
  voegKolomToe(d, "vragen", "figuur", "text");
  /*
    Korte, genormaliseerde omschrijving van de som ("tafels:6x4"). Hiermee
    wordt voorkomen dat dezelfde som twee keer bij een leerdoel belandt.
  */
  voegKolomToe(d, "vragen", "handtekening", "text");
  /*
    De getallen achter de som, als JSON. Hiermee kan bij een fout antwoord
    worden gekeken welke denkfout er waarschijnlijk is gemaakt.
  */
  voegKolomToe(d, "vragen", "somgegevens", "text");
  /* Optionele uitleg bij een handgemaakte vraag. */
  voegKolomToe(d, "vragen", "uitleg", "text");
  voegKolomToe(d, "vragen", "uitleg_afbeelding", "text");

  // Uitbreidingen van de schoollijst (websiteadres, zoekvelden, sluiting).
  voegKolomToe(d, "scholen", "website", "text not null default ''");
  voegKolomToe(d, "scholen", "zoeknaam", "text not null default ''");
  voegKolomToe(d, "scholen", "zoekkern", "text not null default ''");
  voegKolomToe(d, "scholen", "gesloten_op", "text");
  voegKolomToe(d, "school_imports", "nieuw", "integer not null default 0");
  voegKolomToe(d, "school_imports", "gewijzigd", "integer not null default 0");
  voegKolomToe(d, "school_imports", "gesloten", "integer not null default 0");
  d.exec("create index if not exists scholen_op_zoeknaam on scholen (zoeknaam)");
  d.exec(
    "create index if not exists vragen_op_handtekening on vragen (leerdoel_id, handtekening)",
  );

  /*
    Hier stond een stap die lege omschrijvingen en iconen aanvulde vanuit
    `seed.ts`. Die is verwijderd: niets in deze app vult content meer aan of
    maakt het aan. Wat er in een omschrijving staat, staat er omdat jij het
    erin hebt gezet. De tabel `migraties` blijft bestaan als verslag van wat er
    ooit eenmalig gedraaid heeft.
  */

  /* Als laatste: alle kolommen staan er dan, en die gaan één op één mee. */
  werkVraagvormenBij(d);
}

/*
  ---------------------------------------------------------------------------
  BEWUST GEEN SEED MEER
  ---------------------------------------------------------------------------
  Hier stond `vulStructuur()`: die schreef bij een lege database alle vakken,
  domeinen, subdomeinen en leerdoelen uit `seed.ts` weg. Dat is verwijderd.

  Reden: content hoort uitsluitend te ontstaan doordat de beheerder hem
  aanmaakt — via het formulier in de beheeromgeving of via een upload die zij
  zelf start. Een database die zichzelf vult, betekent dat er onderwerpen en
  leerdoelen kunnen opduiken die niemand heeft ingevoerd, en dat je bij het
  opruimen nooit zeker weet of iets echt weg blijft.

  Een nieuwe, lege database begint dus ook echt leeg. Vakken maak je aan in
  Beheer (`nieuwVak`), en van daaruit domeinen, subdomeinen en leerdoelen.
*/

export function verbinding(): DatabaseSync {
  if (db) return db;

  fs.mkdirSync(MAP, { recursive: true });
  const d = new DatabaseSync(BESTAND);
  // Zonder deze regel bewaakt SQLite de koppelingen niet.
  d.exec("pragma foreign_keys = on");
  maakTabellen(d);
  werkTabellenBij(d);
  // Geen seed: een lege database blijft leeg tot de beheerder zelf iets aanmaakt.
  db = d;
  return d;
}
