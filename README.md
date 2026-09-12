# Thuisles

Digitaal leerplatform voor Nederlandse basisschoolkinderen (groep 3 t/m 8).
Fase 1: het startscherm van het kind, vak Rekenen.

De volledige projectcontext staat in `thuisles-projectcontext.md`.

## De app starten

Open Terminal, ga naar deze map en typ:

```bash
npm run dev
```

Open daarna in je browser: **http://localhost:3000**

Je komt meteen binnen — er is geen inlog. Voeg een kind toe bij Instellingen,
dan kan het oefenen beginnen.

Stoppen doe je met `Ctrl` + `C` in hetzelfde Terminal-venster.

## Gekozen techniek (goedgekeurd)

| Onderdeel | Keuze |
| --- | --- |
| Framework | Next.js (React), TypeScript, Tailwind CSS |
| Database | PostgreSQL via Supabase, EU-regio — **nog niet aangesloten** |
| Inloggen | Supabase Auth voor de ouder — **nog niet aangesloten**. Tijdens het bouwen is er **helemaal geen inlog**: alles staat open. Kinderen zijn profielen, geen accounts |
| Hosting | Vercel, EU-regio — **nog niet ingericht** |

De app draait lokaal op SQLite (`data/thuisles.db`), met bewust dezelfde
tabellen als `db/schema.sql`. Er is nog geen internetverbinding of
Supabase-project nodig; alles staat op je eigen computer.

## Hoe het project is opgebouwd

```
src/
  app/
    (toegang)/         Kindprofiel kiezen
    (kind)/            De kindomgeving
      start/           HET STARTSCHERM
      oefenen/ ...     De oefenroute
    ouder/             De ouderomgeving (vijf vaste onderdelen)
    admin/             De beheeromgeving
  components/
    kind/              De blokken van de kinderkant
    ouder/             De vaste bouwstenen van de ouderomgeving
    beheer/            De vaste bouwstenen van de admin
  lib/
    types.ts           De begrippen: ouder, kind, vak, leerdoel, voortgang
    aanbeveling.ts     De regel achter "Voor jou"
    zoeker/
      beleefd.ts       robots.txt, tempo per website, ophalen
      pdf.ts           Tekst uit een PDF halen (eigen lezer, via fflate)
      tekst.ts         HTML lezen, methodenaam en jaartal terugvinden
      NOTITIE.md       Wat er wordt opgehaald en bewaard (legal review)
    auth/
      geheimen.ts      Kindcodes onleesbaar opslaan
      sessie.ts        DE ENIGE plek die weet wie de ouder is en welk kind
                       er actief is
    data/
      ouders.ts        Het ouderaccount: wijzigen, exporteren, wissen
      kinderen.ts      Kindprofielen, altijd binnen één ouder
      scholen.ts       DUO-lijst vernieuwen, zoeken, methodestatus, wachtrij
      zoeker.ts        De methodezoeker: wachtrij, voorstellen, start/pauze
      methodes.ts      Methodes en hun blokken (de afstemmingslaag)
      kindschool.ts    School en methode van één kind
      dashboard.ts     Alles wat het ouderdashboard toont
      seed.ts          De leerdoelstructuur voor een lege database
      queries.ts       DE ENIGE plek die weet waar data vandaan komt
db/
  schema.sql           Het databaseontwerp (Postgres), klaar om in te laden
instrumentation.ts     Draait bij het opstarten: schoollijst inladen als hij leeg is
```

**Het belangrijkste principe:** de schermen praten nooit rechtstreeks met een
database. Ze vragen alles aan `src/lib/data/queries.ts`. Als Supabase straks
wordt aangesloten, verandert alleen dat ene bestand — geen enkel scherm hoeft
opnieuw gebouwd te worden. Datzelfde geldt voor een nieuw vak zoals Taal: dat
is content toevoegen, geen herbouw.

## Regels die in de code zijn vastgelegd

- **Rekenmethode nooit raden.** Is de methode niet betrouwbaar bekend, dan
  toont het scherm letterlijk "Rekenmethode nog niet bekend." De database kan
  een methode niet eens opslaan zonder herkomst (`db/schema.sql`).
- **Door de ouder opgegeven informatie is niet geverifieerd** en wordt op het
  scherm ook zo benoemd.
- **Kinderen hebben geen inlogaccount.** Er wordt geen e-mailadres,
  achternaam of geboortedatum van een kind opgeslagen.
- **"Voor jou" bevat geen AI.** De regel staat in `src/lib/aanbeveling.ts` en
  is in één zin uit te leggen aan een ouder.
- Eigen, originele Thuisles-content. Methodes uitsluitend als afstemmingslaag.

## Ouderomgeving

Open **http://localhost:3000/ouder**. Je moet ingelogd zijn; ben je dat niet,
dan kom je vanzelf op het inlogscherm.

De navigatie ligt vast en verandert nooit: **Overzicht, Voortgang, School &
methode, Instellingen, Abonnement**. Op een telefoon staan ze bovenaan, op een
groot scherm links. Bovenin staat altijd de kind-wisselaar, zodat zichtbaar
blijft over wie de pagina gaat.

| Scherm | Wat je er doet | Status |
| --- | --- | --- |
| Overzicht | Sterk / Aandacht / Aanbevolen, en wat je thuis kunt doen | **Werkt** |
| Voortgang | Vaardigheidskaart per onderdeel, vier standen | **Werkt** |
| School & methode | School kiezen, methode opgeven, verificatiestatus | **Werkt** |
| Instellingen | Account, kinderen, groep, kindcode, taal, gegevens | **Werkt** |
| Abonnement | Lege plek, bewust | Later |

### Hoe het kind erin komt

Een kind heeft **geen eigen account**. Er is ook geen inlog voor de ouder:

1. `/ouder/instellingen` — kind toevoegen: roepnaam, groep, avatar en
   eventueel een kindcode van vier cijfers.
2. `/kies` — profiel kiezen. Heeft het kind een code, dan wordt die gevraagd.
3. Daarna is de kinderkant van dat kind actief.

Is er precies één kind **zonder** kindcode, dan wordt dat kind vanzelf gekozen
en sla je stap 2 over. Heeft het kind wel een code, dan wordt daar altijd om
gevraagd — die heeft de ouder zelf ingesteld en die slaan we niet stilzwijgend
over.

Terug naar de ouderomgeving gaat via **Profiel** op de kinderkant.

De kindcode is een drempel tussen broers en zussen, geen beveiliging.

### Wat er vastligt in de code

- **Een kind hoort altijd bij precies één ouder.** Elke opzoeking loopt via
  `ouder.id`; die controle staat in `src/lib/auth/sessie.ts` en
  `src/lib/data/kinderen.ts`, bij de gegevens zelf en niet alleen in het
  scherm. Er is nu één ouder, maar de structuur is er al op gebouwd dat er
  straks meer komen — dan hoeft er niets aan de rest te veranderen.
- **De groep bepaalt wat een kind ziet.** Wijzigen kan altijd; de voortgang
  blijft staan, want die hangt aan het leerdoel en niet aan de groep.
- **Alles is te downloaden en te verwijderen.** `/ouder/gegevens` geeft één
  bestand met alles wat er over het gezin is vastgelegd. Een kindprofiel of het
  hele account verwijderen haalt ook de antwoorden en de voortgang weg.
- **Van een kind bewaren we alleen** roepnaam, groep, avatar en eventueel een
  kindcode (versleuteld). Geen e-mailadres, achternaam of geboortedatum.

### Het voortgangsdashboard

Geen kale percentages. Een ouder moet begrijpen wat er goed gaat, wat aandacht
vraagt, waarom, en wat hij thuis kan doen.

**Sterk / Aandacht / Aanbevolen** staat bovenaan het Overzicht, altijd in die
volgorde, met een vaste kleur én een vast icoon én een vast woord. De regel
erachter staat in `haalWeekstatus` (`src/lib/data/dashboard.ts`) en is in één
zin uit te leggen:

- **Sterk** — deze week geoefend, en het gaat goed.
- **Aandacht** — twee of meer keer dezelfde denkfout, of het kind gaf zelf aan
  het niet te snappen.
- **Aanbevolen** — hooguit twee korte herhalingen: eerst wat aandacht vraagt,
  daarna wat bijna af is.

Er zit geen AI in en er wordt niets voorspeld.

**Wat ging er mis en hoe help ik thuis** staat onder elke som die fout ging,
altijd met dezelfde drie kopjes in dezelfde volgorde: *Wat ging er mis · Zo
leert je kind het op school · Zeg dit thuis*. De tekst komt uit het herkende
foutpatroon, inclusief het Nederlandse schoolwoord, zodat thuis en school
hetzelfde woord gebruiken. Is er geen denkfout herkend, dan staat dat er
gewoon — er wordt nooit een verklaring verzonnen.

**De vaardigheidskaart** toont alle leerdoelen van de groep van het kind met
vier standen, die niet alleen in kleur maar ook in vorm verschillen (open
rondje → half → bijna vol → vinkje). De legenda staat er altijd bij. Is er een
methode ingesteld, dan volgt de kaart de blokken van die methode en is het
blok waar de klas nu zit gemarkeerd.

**Signalen van je kind** laat zien wat het kind zelf aangaf met "Dit snapte ik
niet", én de comeback-momenten. Een comeback wordt vastgelegd wanneer een
leerdoel dat aandacht vroeg weer op peil is — niet zodra er één goed antwoord
bij komt.

**Oefenritme** toont dagen, minuten en aantal sommen van deze week. Bewust
zonder doel, zonder streak en zonder vergelijking met andere kinderen.

**Oefeningen klaarzetten** is de vervolgactie onderaan de pagina's. Wat de
ouder klaarzet, verschijnt bij het kind in "Voor jou" met de reden erbij, en
verdwijnt daar zodra het geoefend is.

Nog niet gebouwd (fase 2 volgens de opdracht): *Zo leert je kind het* (C4),
*Vraag het je kind* (C5), de *weekbrief* (C8) en de meertalige ouderteksten.

### School en rekenmethode

De rekenmethode van een school heeft **altijd precies één van drie standen**,
en die staat er voor de ouder letterlijk bij:

| Stand | Wanneer |
| --- | --- |
| Geverifieerd door Thuisles | Bevestigd in `/admin/verificaties`, met bron en datum |
| Opgegeven door een ouder, nog niet geverifieerd | Er staat minstens één opgave van een ouder open |
| Rekenmethode nog niet bekend | Er is niets. **Dit is de standaard.** |

Er wordt nooit een methode geraden of automatisch ingevuld. De middelste stand
wordt afgeleid uit de openstaande opgaven en nergens apart opgeslagen — zo kan
er geen "opgegeven" blijven hangen nadat de laatste opgave is afgewezen.

**De methode hangt aan het kind, niet alleen aan de school.** Bij een
geverifieerde school wordt de methode voorgesteld, maar de ouder bevestigt hem
zelf. Is de school onbekend, dan kan een ouder alsnog voor het eigen kind een
methode instellen ("mijn kind werkt uit dit werkboek"). Dat werkt direct op de
kinderkant en is geen bewering over de school.

Zonder methode ziet het kind alleen **Vrij oefenen** en **Voor jou**, met
uitleg erbij. Er is dan niets kapot.

**Waar de klas nu zit** wordt nooit door Thuisles geschat. Dat geeft de ouder
(of het kind) zelf aan; het bepaalt waar "Oefenen volgens methode" begint.

### Waar de schoollijst vandaan komt

Open data van DUO: *alle vestigingen in het basisonderwijs* (ruim 6.000
scholen met naam, plaats, postcode, BRIN en websiteadres).

- Dataset: [data.overheid.nl/dataset/adressen_bo](https://data.overheid.nl/dataset/adressen_bo)
- Uitgever: Dienst Uitvoering Onderwijs (Rijk), maandelijks bijgewerkt
- Licentie: **Creative Commons Naamsvermelding 4.0 (CC-BY 4.0)** — hergebruik
  mag, mits de bron wordt vermeld

Die bronvermelding staat daarom in de ouderomgeving, met de datum van de
laatste vernieuwing, en bij elke rij in de database.

**De lijst wordt bij de eerste start automatisch ingeladen** (zie
`src/instrumentation.ts`) en blijft daarna staan. Je hoeft er nooit aan te
denken. Is de lijst er al, dan gebeurt er bij een herstart niets.

**Vernieuwen** doe je in `/admin/scholen` met de knop *Schoollijst vernieuwen
bij DUO*. Dat duurt ongeveer een halve minuut. Daarna zie je wat er veranderd
is: hoeveel nieuw, hoeveel gewijzigd, en hoeveel er niet meer in de lijst staan.

Wat een vernieuwing **niet** doet:

- bestaande scholen weggooien. Ze worden bijgewerkt op vestigingscode, dus
  koppelingen van ouders, opgaven en verificaties blijven staan;
- scholen verwijderen die uit de lijst verdwijnen. Die krijgen een datum in
  `gesloten_op` en blijven bestaan — er kan een kind aan gekoppeld zijn.

Lukt het ophalen niet, dan kun je hetzelfde CSV-bestand met de hand kiezen.

> Verwijder je `data/thuisles.db`, dan gaat de schoollijst mee. Dat is geen
> ramp: bij de volgende start wordt hij vanzelf opnieuw opgehaald.

### Zoeken naar een school

Ouders typen de naam zelden precies zoals hij bij DUO staat. Daarom wordt elke
naam ook opgeslagen in een genormaliseerde vorm: kleine letters, geen accenten,
geen leestekens. En nog een keer zonder voorvoegsels als *obs*, *bs*,
*basisschool*, *de*, *het* of *'t*.

Daardoor werkt dit allemaal:

| Je typt | Je vindt |
| --- | --- |
| `regenboog` | OBS De Regenboog, BS De Regenboog, … |
| `DE REGENBOOG` | hetzelfde — hoofdletters maken niets uit |
| `ariens` | Dr. Ariëns Daltonschool |
| `1071` of `1071 AB` | scholen met die postcode |
| `Utrecht` | scholen in die plaats |

Exacte treffers staan bovenaan, daarna wat ermee begint, daarna de rest.
Gesloten scholen staan onderaan maar verdwijnen niet: een ouder moet zijn eigen
school kunnen blijven vinden.

### De methodezoeker — LEGAL REVIEW REQUIRED

De zoeker kijkt per school op de eigen website of daar staat met welke
rekenmethode wordt gewerkt. Te vinden in **/admin/zoeker**.

**Wat hij doet.** Via het websiteadres uit de DUO-lijst: de startpagina lezen,
daar de kansrijke links uit halen (schoolgids, onderwijs, methodes, vakken) en
hooguit zes pagina's of PDF's lezen. Daarin wordt gezocht naar de namen van de
methodes die jij in `/admin/methodes` hebt aangemaakt — letterlijk, als heel
woord. Zonder methodes in de admin weet de zoeker niet waar hij naar moet
zoeken.

**Wat hij oplevert.** Een *voorstel*, met vier dingen: de methode, de zin
waarin de naam staat, de link naar de pagina of PDF, en het schooljaar van dat
document als dat te vinden was. Meer wordt er niet bewaard — nooit de hele
pagina of schoolgids.

**Wat hij nooit doet.** Zelf iets op "geverifieerd" zetten. Een voorstel is
alleen voor jou zichtbaar, in de verificatiewachtrij onder *Voorstel van de
zoeker*. Voor ouders blijft de school **"Rekenmethode nog niet bekend"** tot jij
het met één klik bevestigt. Bij bevestigen worden bron, link en datum
automatisch overgenomen. Je kunt ook *Afwijzen* of *Later*.

Vindt de zoeker meerdere methodes op één site — bijvoorbeeld een oude en een
nieuwe schoolgids — dan staan ze allebei onder elkaar met hun jaartal, en kies
jij.

**Netjes zoeken.** Dit is vastgelegd in `src/lib/zoeker/beleefd.ts`:

- robots.txt wordt gelezen en gevolgd; zegt een site nee, dan slaan we hem over;
- is robots.txt niet te bereiken, dan slaan we de site ook over — bij twijfel niet;
- hooguit één verzoek per drie seconden per website;
- een herkenbare user-agent, een tijdslimiet van 20 seconden en maximaal 12 MB;
- fouten worden stil gelogd en blokkeren de rest niet.

**Volgorde en tempo.** Scholen waar kinderen van Thuisles op zitten gaan voor,
daarna de rest. Starten en pauzeren doe je in `/admin/zoeker`; daar zie je ook
de voortgang (gedaan, gevonden, niets gevonden, mislukt, overgeslagen) en de
laatst bekeken scholen. Een school opnieuw laten zoeken kan met één knop; dat
gebeurt bovendien vanzelf één keer per schooljaar.

Start of pauze staat in de database en overleeft dus een herstart: staat de
zoeker aan, dan pakt hij bij het opstarten vanzelf weer op
(`src/instrumentation.ts`). Het levensteken op de zoekerpagina laat zien wanneer
hij voor het laatst een school afrondde.

**Wat een proefronde over 50 scholen opleverde** (september 2026, met tien
bekende methodenamen in de admin): 11 scholen met een vondst, 32 zonder,
7 overgeslagen omdat robots.txt het niet toestond, 0 mislukt. Samen 14
voorstellen — de meeste uit de schoolgids-PDF, een paar van een pagina over het
onderwijsaanbod. Doorlooptijd ongeveer 14 minuten.

**Wat er precies wordt opgehaald en bewaard** staat in
`src/lib/zoeker/NOTITIE.md`, samen met de vragen die nog juridisch beoordeeld
moeten worden.

### Methodes en uitgevers — LEGAL REVIEW REQUIRED
### Methodes en uitgevers — LEGAL REVIEW REQUIRED

Van een methode leggen we **alleen de naam en de uitgever** vast, allebei als
gewone tekst. Er staat geen inhoud uit een methode in Thuisles: geen opgaven,
teksten, uitleg of beeld. Geen logo's, omslagen of huisstijl.

Onder elke vermelding van een methode staat een vaste zin, die op één plek
wordt onderhouden (`nietVerbondenZin` in `src/lib/data/methodes.ts`):

> Thuisles is niet verbonden aan [uitgever / methode]. De oefeningen zijn van
> Thuisles zelf; de methode wordt alleen gebruikt om de volgorde af te stemmen.

De markering **LEGAL REVIEW REQUIRED** staat op de plekken waar dit speelt:
`/admin/methodes`, `/admin/schoolacties.ts`, en onderaan School & methode in de
ouderomgeving.

### Beheerschermen voor scholen en methodes

| Scherm | Wat je er doet |
| --- | --- |
| /admin/scholen | DUO-import met bron en datum, zoeken, methodestatus per school, verificatie intrekken |
| /admin/methodes | Methodes aanmaken; per methode en per groep de blokken in volgorde, elk gekoppeld aan eigen Thuisles-leerdoelen |
| /admin/verificaties | De wachtrij: voorstellen van de zoeker én wat ouders opgaven, met teller per methode en waar ze het zagen. Bevestigen, afwijzen, of laten staan. Gesorteerd op aantal kinderen per school |
| /admin/zoeker | De methodezoeker starten en pauzeren, de voortgang zien, en een school opnieuw laten bekijken |

### Nog niet af — vóór livegang regelen

**Er is tijdelijk geen inlog. Alles staat open.** Zolang Thuisles niet online
staat, is iedereen die de app opent meteen de ouder. Er is één ouderaccount,
dat vanzelf wordt aangemaakt. Dat scheelt gedoe tijdens het bouwen, maar het is
geen beveiliging: wie bij de app kan, kan bij alle gegevens. Onderaan elke
pagina in de ouderomgeving staat dat er ook met zoveel woorden bij.

Wat er terug moet vóór livegang staat bovenaan in `src/lib/auth/sessie.ts`,
kort samengevat:

1. Supabase Auth aansluiten — die neemt e-mailadres, wachtwoord en
   wachtwoordherstel over. Dat is de al goedgekeurde keuze.
2. `huidigeOuder` haalt de ouder dan uit de sessie van Supabase in plaats van
   "de enige die er is". Dat is het enige wat hoeft te veranderen; alles wat
   die functie gebruikt, blijft werken.
3. Schermen om te registreren en in te loggen terugzetten.
4. De beheeromgeving (`/admin`) moet er óók achter; die is nu voor iedereen
   bereikbaar.

Het databaseontwerp voor online (`db/schema.sql`) klopt hier al: daar beheert
Supabase Auth de inloggegevens in `auth.users`, buiten onze eigen tabellen om.
Er hoeft dus niets aan dat ontwerp te veranderen.

## Beheeromgeving

Open **http://localhost:3000/admin**. Je komt uit bij het overzicht van het
eerste zichtbare vak.

Alles is ingedeeld **per vak**. Het webadres begint daarom met het vak:
`/admin/rekenen/...`. Bovenin de zijbalk staat een vakkiezer; daaronder de
schermen binnen dat vak.

| Scherm | Wat je er doet |
| --- | --- |
| Overzicht | Cijfers per vak en, belangrijk, welke leerdoelen nog géén vraag hebben |
| Domeinen & leerdoelen | De structuur beheren: domein → onderwerp → leerdoel |
| Vragen | Alle vragen van dit vak zoeken, filteren, publiceren en verwijderen |
| Afbeeldingen | Plaatjes uploaden en beheren (gedeeld met alle vakken) |
| Uploaden | Veel vragen tegelijk toevoegen met een CSV-bestand |

Daarnaast **/admin/vakken**: hier maak je een nieuw vak aan (bijvoorbeeld Taal)
met eigen naam, omschrijving, pictogram en of het zichtbaar is voor kinderen.
Een vak is gewoon een rij in de database — er hoeft niets aan de code te
gebeuren om er een bij te maken.

Elk detailscherm is hetzelfde opgebouwd: kruimelpad bovenaan, dan de gegevens
met een knop Bewerken, en daaronder een tabel met wat eronder hangt.

### Waar de vragen worden bewaard

De afgesproken database is PostgreSQL via Supabase, maar dat project bestaat nog
niet. Om te voorkomen dat toegevoegde vragen in het niets verdwijnen, draait de
beheerkant nu op **SQLite**: een database in één bestand,
`data/thuisles.db`. Die is ingebouwd in Node, dus er is niets te installeren en
er is geen account nodig. Vragen blijven staan, ook na een herstart.

De tabellen hebben bewust dezelfde vorm en dezelfde regels als
`db/schema.sql`. Overstappen naar Postgres is straks het overzetten van de
rijen, niet het herbouwen van de beheerkant.

Wil je opnieuw beginnen: verwijder `data/thuisles.db`. Bij de volgende start
wordt de leerdoelstructuur opnieuw ingelezen uit `src/lib/data/seed.ts`.

### Vraagtypes

- **Meerkeuze** — twee tot zes antwoorden, één ervan is goed.
- **Open vraag** — het kind typt het antwoord; meerdere schrijfwijzen mogen goed zijn.
- **Waar / niet waar** — een stelling.

### Afbeeldingen

Alle plaatjes staan in **`public/vragen`** en worden gekoppeld op bestandsnaam.
Je hoeft daar nooit zelf bestanden heen te slepen; dat gaat via het beheer:

- **Scherm Afbeeldingen** (`/admin/afbeeldingen`) — overzicht met voorbeeldjes,
  bestandsgrootte en in hoeveel vragen elke afbeelding wordt gebruikt. Daar kun
  je ook in één keer veel plaatjes uploaden: meerdere bestanden kiezen, een hele
  map kiezen, of bestanden en mappen naar het scherm slepen.
- **Knop "Uploaden"** naast elk afbeeldingsveld bij een vraag of antwoord —
  kiest een bestand van je computer, slaat het op en vult de naam meteen in.

Regels die vanzelf worden toegepast:

| | |
| --- | --- |
| Formaten | png, jpg, svg, webp |
| Maximum | 5 MB per afbeelding |
| Bestandsnaam | wordt automatisch opgeschoond: `Halve Pizza (1).PNG` wordt `halve-pizza-1.png` |
| Dubbele naam | krijgt er een nummer bij (`appel-2.png`), niets wordt overschreven |
| Controle | er wordt in het bestand zelf gekeken, niet alleen naar de extensie |
| SVG met scripts | wordt geweigerd |

Een afbeelding die nog in een vraag wordt gebruikt, kun je niet verwijderen.

Een meerkeuzevraag kan per antwoord een afbeelding hebben, naast of in plaats
van tekst. Staat een bestand er niet (bijvoorbeeld na het handmatig weggooien),
dan zie je in het beheer een rood vraagteken en wordt de vraag niet opgeslagen.

Op de kinderkant geldt: heeft minstens één antwoord een afbeelding, dan worden
het aanklikbare kaarten met het plaatje groot in beeld en de tekst eronder.
Heeft geen enkel antwoord een afbeelding, dan blijven het gewone tekstknoppen.
Een mengeling mag ook.

### Bulk-upload

De upload accepteert **Excel-bestanden (.xlsx)** en CSV.
Download het voorbeeldbestand op het uploadscherm. De kolommen zijn: vak,
domein, subdomein, leerdoel, groep, vraagtype, vraagtekst, antwoord, hint,
afbeelding. Elke regel wordt apart gecontroleerd; goede regels worden
opgeslagen, foute regels overgeslagen met de reden erbij.

Voor afbeeldingen bij de antwoorden zijn er de kolommen
`optie_a_afbeelding` tot en met `optie_f_afbeelding`; die horen bij het eerste
tot en met het zesde antwoord. Wil je een antwoord zonder tekst, laat het
tekstdeel dan leeg maar houd de streepjes staan, bijvoorbeeld `|*||` voor vier
antwoorden waarvan het tweede goed is.

De koppeling loopt via de **leerdoelcode** (bijvoorbeeld `REK-BEW-TAF-02`) of
de exacte titel. Kloppen vak, domein of subdomein daar niet mee, dan is dat een
fout — er wordt nooit iets aangenomen.

## Uitleg-animaties en de vos

Bij een fout antwoord kan Vos de som voordoen met een animatie. Bekijken doe je
in het beheer: open een sjabloon en klik in het paneel **Uitleg bij een fout
antwoord** op **Bekijk uitleg**. Daar kies je de groepsvorm en de strategie.

### De stem

Thuisles kiest per apparaat automatisch de best beschikbare Nederlandse
vrouwenstem. Open **/admin/stemtest** op elk apparaat waarop kinderen werken:
daar zie je welke stemmen dat apparaat heeft, welke gekozen wordt en waarom, en
kun je ze beluisteren.

Alles rond de stem zit in `src/lib/stem.ts`. Wil je later een echte
voorleesstem van een stemdienst, dan is dat één schakelaar in dat bestand
(`BRON`).

### Plaatjes van Vos aanleveren

Zet ze in **`public/vos`** met deze namen:

| Bestand | Houding |
| --- | --- |
| `blij.png` | gewoon vrolijk, standaardhouding |
| `wijzend.png` | wijst naar iets, arm vooruit |
| `denkend.png` | denkt na, poot bij de kin |
| `juichend.png` | juicht, armen omhoog |
| `verrast.png` | verrast, ogen groot |

Eisen:

- **Mond dicht** op alle plaatjes. De mond wordt met code eroverheen getekend
  en beweegt mee terwijl Vos praat.
- **PNG met transparante achtergrond**, ongeveer 600 tot 900 pixels hoog.
- Vos ongeveer in het midden, kop in de bovenste helft.

Na het aanleveren stel je de plek van mond en ogen bij in
`src/lib/vosposities.ts` — dat bestand bevat alleen getallen (percentages),
geen code. Zolang er nog geen plaatjes zijn, tekent Vos zichzelf: alles werkt
dan al, met dezelfde bewegende mond en knipperende ogen.

## Sjablonen: sommen laten maken

Ga naar **/admin/rekenen/sjablonen**. Een sjabloon is een recept: je stelt in
wat voor sommen je wilt, en de app maakt ze.

Zo werkt het:

1. Kies een leerdoel en een groep.
2. Kies wat voor sommen: Tafels, Optellen, Aftrekken of Splitsen.
3. Stel wat in. Rechts zie je meteen tien voorbeeldsommen met het antwoord
   erbij. Verander je een instelling, dan ververst het voorbeeld direct. Er is
   nog niets opgeslagen.
4. Geef het sjabloon een naam en een hint, typ een aantal en klik op opslaan.
5. De sommen komen als **concept** bij het leerdoel te staan. Op het
   sjabloonscherm publiceer je ze in één klik allemaal.

Later kun je hetzelfde sjabloon opnieuw gebruiken om er meer bij te maken —
dat worden altijd andere sommen. Verwijder je een sjabloon, dan gaan zijn
sommen mee.

Wat er automatisch wordt bewaakt:

- **Antwoorden worden berekend**, nooit geraden.
- **Geen dubbele sommen** binnen een sjabloon, en ook niet met sommen die al
  bij dat leerdoel staan.
- **Natuurlijk maximum.** Tafels 3, 4 en 6 leveren precies 30 verschillende
  sommen op. Vraag je er 100, dan krijg je er 30 en zegt het scherm dat erbij.
- **Geloofwaardige foute antwoorden** bij meerkeuze: dichtbij het goede
  antwoord, nooit toevallig ook goed.
- **Sommen met inhoud.** Geen `97 + 1 + 1` bij bereik 100, en geen
  `35 = 1 + 34` bij splitsen tot 100.

Gegenereerde sommen zijn gewone vragen: zelfde vraagscherm, zelfde feedback,
zelfde confetti, en ze tellen mee voor het leerdoel. Een kind krijgt per
oefening tien sommen uit de verzameling, elke keer andere.

Handgemaakte vragen met een eigen afbeelding blijven gewoon via het formulier
en de bulk-upload gaan; sjablonen komen daar naast.

## Leerdoelstructuur beheren

Ga naar **/admin/leerdoelen**. Links de boom met domeinen en onderwerpen,
rechts de leerdoelen van het gekozen onderwerp.

Wat je niet hoeft in te vullen, omdat het automatisch gaat:

- de **code** van een leerdoel (`REK-BEW-TAF-03`) wordt gemaakt uit vak, domein
  en onderwerp plus een volgnummer;
- het **webadres** van een domein of onderwerp wordt afgeleid uit de naam;
- de **volgorde** krijgt het eerstvolgende nummer.

Handig bij veel werk achter elkaar:

- **Meerdere tegelijk** — één leerdoel per regel. Achter een streepje mag een
  afwijkende groep: `Tafels van 7, 8 en 9 | 5-6`. Elke regel wordt apart
  beoordeeld.
- **Kopiëren** — maakt een kopie van een leerdoel als startpunt.
- **Cmd/Ctrl + Enter** slaat een formulier op zonder de muis.
- Na toevoegen blijft het formulier open en staat de cursor alweer klaar.
- De groepsrange blijft staan binnen een onderwerp.

Wat wordt tegengehouden:

- twee domeinen, onderwerpen of leerdoelen met dezelfde naam op dezelfde plek
  (hoofdletters en extra spaties tellen niet mee);
- een domein of onderwerp verwijderen waar nog iets onder hangt;
- een leerdoel verwijderen waar nog vragen aan hangen.

Vanuit **Nieuwe vraag** kun je hetzelfde doen zonder het formulier te verlaten:
klik op "Staat het er niet bij? Maak het hier aan". Het nieuwe leerdoel is
meteen geselecteerd.

### Waar de structuur staat

De leerdoelstructuur staat in de database (`data/thuisles.db`) en wordt door
zowel de beheerkant als de kinderkant gelezen. Wat je aanmaakt, is dus meteen
zichtbaar bij het kind. `src/lib/data/seed.ts` vult die structuur alleen bij een
lege database — daarna is de beheeromgeving de baas en wordt de seed genegeerd.

## Zelf een domein of onderwerp toevoegen (via de code)

De hele klikroute (vak → domein → onderwerp → oefening) leest één en dezelfde
leerdoelstructuur. Er is geen aparte lijst voor het menu: voeg je een onderwerp
toe, dan verschijnt het vanzelf in de navigatie, in de tellingen en op het
startscherm. Alles staat nu in `src/lib/data/seed.ts`.

### Een nieuw domein

Zoek `export const domeinen` en plak er een blok bij:

```ts
{
  id: "dom-meten",           // uniek, verandert nooit meer
  vakId: "vak-rekenen",      // onder welk vak het hangt
  slug: "meten",             // deel van het webadres: /oefenen/rekenen/meten
  naam: "Meten",             // wat het kind ziet
  omschrijving: "Lengte, gewicht en inhoud",
  icoon: "meten",            // naam uit components/kind/Pictogram.tsx
  actief: true,              // false = zichtbaar, maar nog niet te openen
  volgorde: 3,               // plek in de rij tegels
},
```

### Een nieuw onderwerp binnen dat domein

Zoek `export const subdomeinen`:

```ts
{
  id: "sub-lengte",
  slug: "lengte",            // /oefenen/rekenen/meten/lengte
  domeinId: "dom-meten",     // het domein hierboven
  naam: "Lengte",
  omschrijving: "Meter, centimeter en millimeter",
  icoon: "meten",
  volgorde: 1,
},
```

### Leerdoelen eronder

Zonder leerdoelen blijft een onderwerp leeg en wordt het niet getoond. Zoek
`export const leerdoelen`:

```ts
{
  id: "ld-len-01",
  subdomeinId: "sub-lengte",
  code: "REK-MET-LEN-01",    // stabiele, leesbare code voor intern gebruik
  titel: "Meten met hele centimeters",
  groepVan: 4,               // een RANGE, geen vaste groep
  groepTot: 5,
  volgorde: 1,
},
```

Sla op en ververs de pagina. Het domein staat er meteen.

### Waarom dit straks ook via de admin-kant werkt

Deze velden zijn precies de kolommen die in `db/schema.sql` staan. Een
beheerscherm doet later hetzelfde als wat je hierboven met de hand doet: een
rij toevoegen aan `domeinen`, `subdomeinen` of `leerdoelen`. De schermen
hoeven daarvoor niet te veranderen, omdat ze alles via
`src/lib/data/queries.ts` opvragen en niets zelf weten over waar de gegevens
vandaan komen.

Twee regels die de database zelf bewaakt:

- `slug` is uniek binnen zijn ouder, zodat een link nooit ergens anders uitkomt.
- `groep_van` mag niet hoger zijn dan `groep_tot`.

## Voorbeelddata

`src/lib/data/seed.ts` bevat alleen nog de **leerdoelstructuur** (vakken,
domeinen, onderwerpen, leerdoelen) en de visuele wereldlaag. Die structuur
wordt eenmalig ingeladen in een lege database; daarna is de beheeromgeving de
baas.

Kinderen, ouders, school en methode staan er bewust **niet** meer in. Een kind
is een echt profiel onder een echt ouderaccount, en school en methode beginnen
altijd op "nog niet bekend" — dat wordt nooit geraden of vast ingevuld.

Wil je opnieuw beginnen met een lege database: verwijder `data/thuisles.db`.
Let op: daarmee verdwijnen ook je ouderaccount en je kindprofielen.
