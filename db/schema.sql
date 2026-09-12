-- ===========================================================================
-- Thuisles — databaseschema (PostgreSQL / Supabase)
--
-- Dit bestand is het ONTWERP van de opslagstructuur en is nog NIET uitgevoerd:
-- het Supabase-project bestaat nog niet. De app draait ondertussen op SQLite
-- (src/lib/db/sqlite.ts, bestand data/thuisles.db) met bewust dezelfde
-- tabellen en dezelfde regels. Overstappen is straks het overzetten van rijen,
-- niet het herbouwen van de app.
--
-- Twee verschillen die daarbij horen, allebei toegelicht bij de tabel zelf:
--   * inloggegevens van de ouder staan hier in auth.users (Supabase Auth).
--     Lokaal is er TIJDELIJK GEEN INLOG: één ouderrij die vanzelf wordt
--     aangemaakt, zonder wachtwoord. Zie src/lib/auth/sessie.ts;
--   * verwijderen van een kind gaat hier via `on delete cascade`, lokaal met
--     de hand, omdat SQLite die verwijzing niet meer kan toevoegen aan
--     tabellen die er al waren.
--
-- Uitgangspunten:
--   * Leerstructuur: vak -> domein -> subdomein -> leerdoel -> oefening -> vraag.
--   * Een leerdoel hoort bij een groepsRANGE, niet bij één vaste groep.
--   * Een kind is GEEN inlogaccount, maar een profiel onder een ouderaccount.
--     Er wordt bewust geen e-mailadres of achternaam van een kind opgeslagen.
--   * Methode-informatie draagt altijd zichtbaar haar herkomst met zich mee.
--     Onbekend blijft onbekend; nooit afleiden of gokken.
--   * Row Level Security staat overal aan: een ouder kan uitsluitend bij de
--     gegevens van de eigen kinderen.
-- ===========================================================================

-- --------------------------------------------------------------------------
-- Typen
-- --------------------------------------------------------------------------

create type mastery_status as enum (
  'nog_niet_gestart',
  'oefent',
  'bijna_beheerst',
  'beheerst'
);

-- Onderscheid dat het project expliciet vraagt: hoe kwam het kind tot goed.
create type poging_uitkomst as enum (
  'direct_goed',
  'goed_na_hulp',
  'goed_na_meerdere_pogingen',
  'nog_niet_beheerst'
);

-- Bepaalt wat de app op het scherm mag beweren over de methode.
create type methode_herkomst as enum (
  'onbekend',
  'opgegeven_door_ouder',
  'geverifieerd'
);

create type blok_status as enum ('voltooid', 'bezig', 'gesloten');

-- --------------------------------------------------------------------------
-- Gebruikers
-- --------------------------------------------------------------------------

-- De taal waarin de OUDER de uitleg leest. De kinderkant blijft Nederlands,
-- want dat is de taal van school.
create type oudertaal as enum ('nl', 'tr', 'ar', 'pl');

-- De ouder is het enige echte account. Koppelt 1-op-1 aan Supabase Auth.
--
-- Let op het verschil met de lokale SQLite-versie (src/lib/db/sqlite.ts):
-- daar staat `email` als optionele kolom in deze tabel en is er helemaal geen
-- inlog. Hier doet Supabase Auth dat werk in `auth.users`. Bij de overstap
-- verhuizen alleen de kolommen hieronder mee; de inloggegevens worden
-- opnieuw aangemaakt via Supabase.
create table ouders (
  id           uuid primary key references auth.users (id) on delete cascade,
  weergavenaam text,
  taal         oudertaal not null default 'nl',
  aangemaakt_op timestamptz not null default now()
);

-- Het kind is een profiel binnen het ouderaccount. Dataminimalisatie:
-- alleen een roepnaam en een groep. Geen e-mail, geen achternaam,
-- geen geboortedatum.
create table kinderen (
  id            uuid primary key default gen_random_uuid(),
  ouder_id      uuid not null references ouders (id) on delete cascade,
  roepnaam      text not null check (length(roepnaam) between 1 and 40),
  groep         smallint not null check (groep between 3 and 8),
  -- Naam van een Thuisles-pictogram; zie src/lib/avatars.ts. Geen foto's:
  -- een avatar is een plaatje, geen persoonsgegeven.
  avatar        text not null default 'vos',
  -- Zachte drempel tussen broers en zussen, geen accountbeveiliging.
  -- Vier cijfers, versleuteld opgeslagen, en mag leeg blijven.
  kindcode_hash text,
  aangemaakt_op timestamptz not null default now()
);

create index on kinderen (ouder_id);

-- --------------------------------------------------------------------------
-- Leerstructuur (redactionele content, gelijk voor alle gebruikers)
-- --------------------------------------------------------------------------

create table vakken (
  id       uuid primary key default gen_random_uuid(),
  slug     text not null unique,
  naam     text not null,
  actief   boolean not null default false,
  volgorde smallint not null default 0
);

create table domeinen (
  id           uuid primary key default gen_random_uuid(),
  vak_id       uuid not null references vakken (id) on delete cascade,
  -- Stabiel deel van het webadres: /oefenen/rekenen/<slug>. Uniek binnen een
  -- vak, zodat een link naar een domein nooit ergens anders uitkomt.
  slug         text not null,
  naam         text not null,
  omschrijving text,
  icoon        text,
  -- Alleen actieve domeinen zijn te openen. Een domein zonder subdomeinen
  -- blijft zichtbaar als "binnenkort".
  actief       boolean not null default false,
  volgorde     smallint not null default 0,
  unique (vak_id, slug)
);

create table subdomeinen (
  id            uuid primary key default gen_random_uuid(),
  domein_id     uuid not null references domeinen (id) on delete cascade,
  -- Stabiel deel van het webadres binnen het domein. Uniek binnen een domein.
  slug          text not null,
  naam          text not null,
  omschrijving  text,
  icoon         text,
  volgorde      smallint not null default 0,
  unique (domein_id, slug)
);

create table leerdoelen (
  id            uuid primary key default gen_random_uuid(),
  subdomein_id  uuid not null references subdomeinen (id) on delete cascade,
  code          text not null unique,
  titel         text not null,
  groep_van     smallint not null check (groep_van between 3 and 8),
  groep_tot     smallint not null check (groep_tot between 3 and 8),
  volgorde      smallint not null default 0,
  -- Hoeveel vragen dit leerdoel per oefensessie geeft. Leeg = de algemene
  -- standaard uit app_instellingen.
  vragen_per_sessie smallint check (vragen_per_sessie between 1 and 50),
  constraint groepsrange_klopt check (groep_van <= groep_tot)
);

create index on leerdoelen (subdomein_id);

create table oefeningen (
  id           uuid primary key default gen_random_uuid(),
  leerdoel_id  uuid not null references leerdoelen (id) on delete cascade,
  titel        text not null,
  volgorde     smallint not null default 0
);

create type vraagvorm as enum ('meerkeuze', 'open', 'waar_niet_waar');
create type vraagstatus as enum ('concept', 'gepubliceerd');

/*
  Een vraag hangt altijd rechtstreeks aan een LEERDOEL. Daarmee ligt de hele
  keten vast: via het leerdoel hoort de vraag bij een subdomein, een domein en
  een vak. De database weigert een vraag zonder bestaand leerdoel.

  `oefening_id` mag leeg blijven: het bundelen van vragen tot een oefensessie
  komt later en is geen voorwaarde om vragen te kunnen aanleveren.
*/
create table vragen (
  id            uuid primary key default gen_random_uuid(),
  leerdoel_id   uuid not null references leerdoelen (id) on delete cascade,
  oefening_id   uuid references oefeningen (id) on delete set null,
  groep         smallint not null check (groep between 3 and 8),
  vorm          vraagvorm not null,
  vraagtekst    text not null,
  -- Alleen bij meerkeuze: de keuzemogelijkheden, in volgorde. Elke optie is
  -- {"tekst": "...", "afbeelding": "bestandsnaam of null"}. Tekst en
  -- afbeelding mogen allebei, of één van de twee.
  opties        jsonb,
  -- meerkeuze: index van het goede antwoord. open: antwoorden gescheiden door
  -- "|". waar_niet_waar: "waar" of "niet_waar".
  antwoord      text not null,
  -- Gelaagde hulp: hint eerst, dan uitleg. Nooit alleen "fout".
  hint          text,
  uitleg        text,
  afbeelding    text,
  status        vraagstatus not null default 'concept',
  volgorde      smallint not null default 0,
  aangemaakt_op timestamptz not null default now(),
  -- Een meerkeuzevraag zonder opties mag niet bestaan.
  constraint meerkeuze_heeft_opties
    check (vorm <> 'meerkeuze' or jsonb_array_length(opties) >= 2)
);

create index on vragen (leerdoel_id);

-- --------------------------------------------------------------------------
-- Voortgang
-- --------------------------------------------------------------------------

create table leerdoel_voortgang (
  kind_id                        uuid not null references kinderen (id) on delete cascade,
  leerdoel_id                    uuid not null references leerdoelen (id) on delete cascade,
  status                         mastery_status not null default 'nog_niet_gestart',
  aantal_direct_goed             integer not null default 0,
  aantal_goed_na_hulp            integer not null default 0,
  aantal_goed_na_meerdere_pogingen integer not null default 0,
  aantal_nog_niet_beheerst       integer not null default 0,
  laatst_geoefend_op             timestamptz,
  primary key (kind_id, leerdoel_id)
);

-- Elk antwoord van een kind. Bewust GEEN vrije tekst, geen apparaatgegevens
-- en geen profilering: alleen het leerdoel, of het goed was, welk foutpatroon
-- herkend werd, of er hulp is gebruikt en hoe lang het duurde.
--
-- De verwijzing naar `kinderen` met `on delete cascade` doet hier automatisch
-- wat de lokale SQLite-versie met de hand doet bij het verwijderen van een
-- kindprofiel: alles gaat mee.
-- Instellingen die voor de hele app gelden, als sleutel en waarde.
create table app_instellingen (
  sleutel       text primary key,
  waarde        text not null,
  bijgewerkt_op timestamptz not null default now()
);

create table antwoorden (
  id              uuid primary key default gen_random_uuid(),
  kind_id         uuid not null references kinderen (id) on delete cascade,
  leerdoel_id     uuid not null references leerdoelen (id) on delete cascade,
  vraag_id        uuid references vragen (id) on delete set null,
  goed            boolean not null,
  uitkomst        text not null
                  check (uitkomst in ('direct_goed','goed_na_hint','goed_na_uitleg','fout')),
  foutpatroon     text,
  hint_gebruikt   boolean not null default false,
  uitleg_gebruikt boolean not null default false,
  seconden        integer,
  -- Snel achter elkaar fout: telt half mee in de beheersing.
  gegokt          boolean not null default false,
  gemaakt_op      timestamptz not null default now()
);

create index on antwoorden (kind_id, leerdoel_id, gemaakt_op);

-- Sleutels: de enige beloning die het kind bovenaan het scherm ziet.
--
-- Bewust een grootboek en geen enkele teller. Een kind verdient sleutels met
-- goede antwoorden en gaat ze straks uitgeven aan schatkisten op de
-- eilandenkaart. Met alleen een saldo weet je achteraf niet meer waar het
-- vandaan kwam of waaraan het opging; met losse regels wel, en dan is het
-- openen van een kist niets meer dan een regel met een negatief aantal.
--
-- Het unieke paar (reden, bron_id) zorgt ervoor dat hetzelfde antwoord nooit
-- twee keer kan uitbetalen, ook niet als een opdracht opnieuw wordt verstuurd.
create table sleutel_mutaties (
  id         uuid primary key default gen_random_uuid(),
  kind_id    uuid not null references kinderen (id) on delete cascade,
  -- Positief = verdiend, negatief = uitgegeven.
  aantal     integer not null,
  -- Nu alleen 'antwoord_goed'; later ook 'kist_geopend'.
  reden      text not null,
  -- Waar het aan hangt: het antwoord, straks de kist.
  bron_id    uuid,
  gemaakt_op timestamptz not null default now()
);

create index on sleutel_mutaties (kind_id);
create unique index on sleutel_mutaties (reden, bron_id) where bron_id is not null;

-- Losse pogingen, voor uitlegbaarheid richting de ouder. Bewust zonder
-- tijdstempels per toetsaanslag of ander gedragsprofiel: alleen wat nodig is
-- om de mastery-status te kunnen verantwoorden.
create table pogingen (
  id           uuid primary key default gen_random_uuid(),
  kind_id      uuid not null references kinderen (id) on delete cascade,
  vraag_id     uuid not null references vragen (id) on delete cascade,
  leerdoel_id  uuid not null references leerdoelen (id) on delete cascade,
  uitkomst     poging_uitkomst not null,
  gemaakt_op   timestamptz not null default now()
);

create index on pogingen (kind_id, leerdoel_id);

-- --------------------------------------------------------------------------
-- Schoolaansluiting (afstemmingslaag, nooit contentbron)
-- --------------------------------------------------------------------------

create table scholen (
  id             uuid primary key default gen_random_uuid(),
  -- Instellingscode uit BRIN, bijv. "32JK".
  brin           text not null,
  -- Vestigingscode, bijv. "32JK00". Uniek per schoolgebouw.
  vestigingscode text not null unique,
  naam           text not null,
  plaats         text not null,
  postcode       text not null,
  gemeente       text not null default '',
  -- Websiteadres uit de DUO-lijst. Mag leeg zijn.
  website        text not null default '',
  -- De naam zonder hoofdletters, accenten en leestekens, plus dezelfde naam
  -- zonder voorvoegsels als "obs" of "de". Puur om te kunnen zoeken: zo vindt
  -- "regenboog" ook "OBS De Regenboog".
  zoeknaam       text not null default '',
  zoekkern       text not null default '',
  -- Gevuld zodra een school niet meer in de DUO-lijst voorkomt. De rij blijft
  -- staan: er kunnen kinderen aan gekoppeld zijn, en een school die stilletjes
  -- verdwijnt zou het scherm van een ouder leeg achterlaten.
  gesloten_op    date,
  -- Verplicht: waar komen deze gegevens vandaan. Herkomst moet controleerbaar
  -- zijn, dus dit veld mag niet leeg blijven.
  bron           text not null,
  bron_datum     date not null
);

create index on scholen (plaats);
create index on scholen (postcode);
create index on scholen (zoeknaam);

-- Eén rij per uitgevoerde import, zodat bron, licentie en datum navolgbaar
-- blijven. De licentie van de open data van DUO (CC-BY 4.0) verlangt
-- bronvermelding; die wordt hieruit getoond in de ouderomgeving.
create table school_imports (
  id            uuid primary key default gen_random_uuid(),
  bron          text not null,
  bron_link     text not null,
  licentie      text not null,
  uitgevoerd_op timestamptz not null default now(),
  aantal        integer not null,
  -- Wat deze vernieuwing veranderde, zodat te zien is wat er gebeurd is.
  nieuw         integer not null default 0,
  gewijzigd     integer not null default 0,
  gesloten      integer not null default 0
);

-- Rekenmethodes: ALLEEN een naam en een uitgever, allebei als gewone tekst.
-- Dit is de afstemmingslaag. Er staat geen inhoud uit een methode in, en er
-- horen hier nooit logo's, omslagen of huisstijl bij.
-- LEGAL REVIEW REQUIRED zodra hier iets bijkomt.
create table rekenmethodes (
  id            uuid primary key default gen_random_uuid(),
  naam          text not null unique,
  uitgever      text not null default '',
  actief        boolean not null default true,
  aangemaakt_op timestamptz not null default now()
);

create table methode_blokken (
  id         uuid primary key default gen_random_uuid(),
  methode_id uuid not null references rekenmethodes (id) on delete cascade,
  groep      smallint not null check (groep between 3 and 8),
  nummer     smallint not null,
  titel      text not null,
  unique (methode_id, groep, nummer)
);

-- Welke eigen Thuisles-leerdoelen sluiten aan bij welk blok. Dit is de
-- afstemming; de inhoud blijft volledig van Thuisles.
create table blok_leerdoelen (
  blok_id     uuid not null references methode_blokken (id) on delete cascade,
  leerdoel_id uuid not null references leerdoelen (id) on delete cascade,
  volgorde    smallint not null default 0,
  primary key (blok_id, leerdoel_id)
);

-- Een bevestiging DOOR THUISLES dat een school met deze methode werkt.
-- Alleen een rij hier mag "Geverifieerd door Thuisles" opleveren. Bron en
-- datum zijn verplicht: zonder controleerbare herkomst geen verificatie.
-- Verificaties verlopen niet vanzelf, maar dragen wel het schooljaar mee
-- waarin ze zijn bevestigd.
create table school_verificatie (
  school_id    uuid primary key references scholen (id) on delete cascade,
  methode_id   uuid not null references rekenmethodes (id) on delete cascade,
  bron         text not null,
  bron_link    text not null default '',
  bevestigd_op timestamptz not null default now(),
  schooljaar   text not null
);

-- Wat ouders opgeven over de methode van een school. Meerdere ouders van
-- dezelfde school mogen hetzelfde opgeven; dat telt op in de wachtrij, maar
-- het wordt pas "geverifieerd" als Thuisles het bevestigt.
--
-- "Waar heb je dit gezien?" is verplicht: zonder herkomst geen opgave. Er
-- wordt bewust GEEN foto gevraagd — op een kaft staat vaak de naam van het
-- kind, en het omslag zelf is beschermd materiaal.
create type gezien_waar as enum ('schoolgids', 'werkboek', 'leerkracht', 'anders');
create type opgave_status as enum ('open', 'bevestigd', 'afgewezen');

create table methode_opgaven (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references scholen (id) on delete cascade,
  ouder_id     uuid not null references ouders (id) on delete cascade,
  -- Leeg betekent "Anders / weet ik niet".
  methode_id   uuid references rekenmethodes (id) on delete cascade,
  anders_tekst text not null default '',
  gezien_waar  gezien_waar not null,
  -- Link of paginanummer bij de schoolgids.
  gezien_link  text not null default '',
  status       opgave_status not null default 'open',
  schooljaar   text not null,
  gemaakt_op   timestamptz not null default now(),
  behandeld_op timestamptz
);

create index on methode_opgaven (school_id, status);

-- --------------------------------------------------------------------------
-- De methodezoeker
--
-- Zoekt op de website van een school of daar staat met welke rekenmethode
-- wordt gewerkt. Wat hij vindt is een VOORSTEL voor de beheerder; ouders zien
-- er niets van en blijven "Rekenmethode nog niet bekend" zien tot Thuisles het
-- met de hand bevestigt. De zoeker zet nooit zelf iets op geverifieerd.
--
-- LEGAL REVIEW REQUIRED — automatisch lezen van schoolwebsites.
-- Zie src/lib/zoeker/NOTITIE.md voor wat er wordt opgehaald en bewaard.
-- --------------------------------------------------------------------------

create type voorstel_status as enum ('open', 'bevestigd', 'afgewezen', 'later');
create type bron_soort as enum ('schoolgids', 'pagina');

create table methode_voorstellen (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references scholen (id) on delete cascade,
  methode_id   uuid not null references rekenmethodes (id) on delete cascade,
  -- ALLEEN de ene zin waarin de naam stond, hooguit 300 tekens. Nooit de hele
  -- pagina of schoolgids.
  zin          text not null check (length(zin) <= 300),
  bron_link    text not null,
  bron_soort   bron_soort not null,
  -- Schooljaar of jaartal van het document, als dat te vinden was.
  jaartal      text,
  gevonden_op  timestamptz not null default now(),
  status       voorstel_status not null default 'open',
  behandeld_op timestamptz,
  unique (school_id, methode_id, bron_link)
);

create index on methode_voorstellen (school_id, status);

create type zoek_status as enum
  ('te_doen', 'bezig', 'gevonden', 'niets', 'mislukt', 'overgeslagen');

create table zoekopdrachten (
  school_id         uuid primary key references scholen (id) on delete cascade,
  status            zoek_status not null default 'te_doen',
  reden             text,
  laatst_gezocht_op timestamptz,
  schooljaar        text,
  pogingen          integer not null default 0
);

create index on zoekopdrachten (status);

-- Loopt de zoeker? Bewust in de database en niet alleen in het geheugen,
-- zodat starten en pauzeren een herstart overleven.
create table zoeker_stand (
  id               smallint primary key check (id = 1),
  actief           boolean not null default false,
  gestart_op       timestamptz,
  laatst_actief_op timestamptz
);

-- De koppeling per KIND. De methode hangt aan het kind, niet alleen aan de
-- school: een ouder kan ook zonder bekende school zeggen "mijn kind werkt uit
-- dit werkboek". Dat werkt meteen op de kinderkant en is uitdrukkelijk geen
-- bewering over de school.
create type methode_bron as enum ('school', 'eigen');

create table kind_school (
  kind_id          uuid primary key references kinderen (id) on delete cascade,
  school_id        uuid references scholen (id) on delete set null,
  methode_id       uuid references rekenmethodes (id) on delete set null,
  methode_herkomst methode_bron,
  -- Oefenen volgens methode aan of uit. Uit = alleen vrij oefenen en Voor jou.
  volg_methode     boolean not null default true,
  -- Waar de klas nu zit. Dit vult Thuisles NOOIT zelf in; het komt van de
  -- ouder of het kind.
  huidig_blok_id   uuid references methode_blokken (id) on delete set null,
  -- Schooljaar waarin de ouder dit voor het laatst heeft bevestigd.
  schooljaar       text,
  bijgewerkt_op    timestamptz not null default now(),
  -- Een methode zonder herkomst mag niet bestaan.
  constraint methode_vereist_herkomst
    check (methode_id is null or methode_herkomst is not null)
);

-- --------------------------------------------------------------------------
-- Wereld en beloningen (visuele laag; mechaniek nog niet vastgesteld)
-- --------------------------------------------------------------------------

create table wereld_gebieden (
  id       uuid primary key default gen_random_uuid(),
  naam     text not null,
  icoon    text not null,
  volgorde smallint not null default 0
);

create table kind_gebied_status (
  kind_id           uuid not null references kinderen (id) on delete cascade,
  gebied_id         uuid not null references wereld_gebieden (id) on delete cascade,
  ontgrendeld       boolean not null default false,
  voortgang_procent smallint not null default 0 check (voortgang_procent between 0 and 100),
  primary key (kind_id, gebied_id)
);

create table kind_beloningen (
  kind_id       uuid primary key references kinderen (id) on delete cascade,
  streak_dagen  integer not null default 0,
  munten        integer not null default 0,
  edelstenen    integer not null default 0,
  laatste_actieve_dag date
);

-- ===========================================================================
-- Row Level Security
--
-- Content (vakken t/m vragen, scholen, methodes) is leesbaar voor iedereen
-- die is ingelogd. Alles wat over een kind gaat, is uitsluitend bereikbaar
-- voor de ouder die eigenaar is van dat kindprofiel.
-- ===========================================================================

alter table ouders                 enable row level security;
alter table kinderen               enable row level security;
alter table leerdoel_voortgang     enable row level security;
alter table sleutel_mutaties       enable row level security;
alter table antwoorden             enable row level security;
alter table pogingen               enable row level security;
alter table kind_school            enable row level security;
alter table methode_opgaven        enable row level security;
alter table kind_gebied_status     enable row level security;
alter table kind_beloningen        enable row level security;

alter table vakken          enable row level security;
alter table domeinen        enable row level security;
alter table subdomeinen     enable row level security;
alter table leerdoelen      enable row level security;
alter table oefeningen      enable row level security;
alter table vragen          enable row level security;
alter table scholen         enable row level security;
alter table rekenmethodes   enable row level security;
alter table methode_blokken enable row level security;
alter table blok_leerdoelen enable row level security;
alter table school_verificatie enable row level security;

-- Voorstellen en de wachtrij van de zoeker zijn UITSLUITEND voor de beheerder.
-- Geen enkele policy geeft een ouder toegang; ze zijn alleen bereikbaar met de
-- service-sleutel vanuit de beheerkant.
alter table methode_voorstellen enable row level security;
alter table zoekopdrachten      enable row level security;
alter table zoeker_stand        enable row level security;
alter table school_imports  enable row level security;
alter table wereld_gebieden enable row level security;

-- Hulpfunctie: is het ingelogde account de ouder van dit kind?
create or replace function is_mijn_kind(kind uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from kinderen k
    where k.id = kind and k.ouder_id = auth.uid()
  );
$$;

create policy "ouder ziet eigen profiel"
  on ouders for all
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "ouder beheert eigen kinderen"
  on kinderen for all
  using (ouder_id = auth.uid())
  with check (ouder_id = auth.uid());

-- Dezelfde regel voor elke tabel die aan een kind hangt.
create policy "alleen eigen kind" on leerdoel_voortgang     for all using (is_mijn_kind(kind_id)) with check (is_mijn_kind(kind_id));
create policy "alleen eigen kind" on sleutel_mutaties       for all using (is_mijn_kind(kind_id)) with check (is_mijn_kind(kind_id));
create policy "alleen eigen kind" on antwoorden             for all using (is_mijn_kind(kind_id)) with check (is_mijn_kind(kind_id));
create policy "alleen eigen kind" on pogingen               for all using (is_mijn_kind(kind_id)) with check (is_mijn_kind(kind_id));
create policy "alleen eigen kind" on kind_school            for all using (is_mijn_kind(kind_id)) with check (is_mijn_kind(kind_id));

-- Een ouder mag zijn eigen opgave zien en wijzigen, maar niet die van een
-- ander. De TELLING per school is wel openbaar: die staat in de ouderomgeving
-- als "3 ouders hebben dit doorgegeven", zonder wie dat zijn.
create policy "eigen opgave" on methode_opgaven
  for all using (ouder_id = auth.uid()) with check (ouder_id = auth.uid());
create policy "alleen eigen kind" on kind_gebied_status     for all using (is_mijn_kind(kind_id)) with check (is_mijn_kind(kind_id));
create policy "alleen eigen kind" on kind_beloningen        for all using (is_mijn_kind(kind_id)) with check (is_mijn_kind(kind_id));

-- Content is leesbaar voor ingelogde gebruikers; aanpassen gebeurt uitsluitend
-- via de beheerkant met de service-sleutel, nooit vanuit de browser.
create policy "content leesbaar" on vakken          for select using (auth.role() = 'authenticated');
create policy "content leesbaar" on domeinen        for select using (auth.role() = 'authenticated');
create policy "content leesbaar" on subdomeinen     for select using (auth.role() = 'authenticated');
create policy "content leesbaar" on leerdoelen      for select using (auth.role() = 'authenticated');
create policy "content leesbaar" on oefeningen      for select using (auth.role() = 'authenticated');
create policy "content leesbaar" on vragen          for select using (auth.role() = 'authenticated');
create policy "content leesbaar" on scholen         for select using (auth.role() = 'authenticated');
create policy "content leesbaar" on rekenmethodes   for select using (auth.role() = 'authenticated');
create policy "content leesbaar" on methode_blokken for select using (auth.role() = 'authenticated');
create policy "content leesbaar" on blok_leerdoelen for select using (auth.role() = 'authenticated');
create policy "content leesbaar" on school_verificatie for select using (auth.role() = 'authenticated');
create policy "content leesbaar" on school_imports  for select using (auth.role() = 'authenticated');
create policy "content leesbaar" on wereld_gebieden for select using (auth.role() = 'authenticated');
