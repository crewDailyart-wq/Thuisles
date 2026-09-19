/**
 * Domeinmodel Thuisles.
 *
 * Dit bestand is de enige plek waar de begrippen uit het project worden
 * vastgelegd: Vak -> Domein -> Subdomein -> Leerdoel -> Oefening -> Vraag.
 * De schermen praten alleen met deze types, nooit rechtstreeks met de
 * database. Daardoor kan de opslag later wisselen (nu seed-data, straks
 * Supabase/Postgres) zonder dat er een scherm hoeft te veranderen.
 *
 * Namen zijn bewust Nederlands, gelijk aan de taal van het project.
 */

/**
 * Namen van de eigen pictogrammen (zie `components/kind/Pictogram.tsx`).
 * Bewust een vaste lijst: zo kan er nooit een beeldje worden opgevraagd dat
 * niet bestaat.
 */
export type PictogramNaam =
  | "vak-rekenen"
  | "vak-taal"
  | "vak-spelling"
  | "vak-lezen"
  | "vak-engels"
  | "tellen"
  | "getalbegrip"
  | "grote-getallen"
  | "breuken"
  | "kommagetallen"
  | "schrijven"
  | "vergelijken"
  | "even-oneven"
  | "optellen"
  | "aftrekken"
  | "tafels"
  | "vermenigvuldigen"
  | "delen"
  | "handig"
  | "dorp"
  | "bos"
  | "meer"
  | "berg"
  | "kust"
  | "meten"
  | "tijd"
  | "geld"
  | "meetkunde"
  | "grafiek"
  | "vos";

/** Groep 3 t/m 8 van de Nederlandse basisschool. */
export type Groep = 3 | 4 | 5 | 6 | 7 | 8;

// ---------------------------------------------------------------------------
// Leerstructuur
// ---------------------------------------------------------------------------

export type Vak = {
  id: string;
  slug: string;
  naam: string;
  omschrijving: string;
  /**
   * Welk pictogram het vak krijgt. Bewust een gewone verwijzing en geen vaste
   * lijst met vaknamen: zo kan er een vak bij zonder dat er code moet worden
   * aangepast.
   */
  icoon: PictogramNaam;
  /** Alleen actieve vakken zijn te openen door een kind. */
  actief: boolean;
  volgorde: number;
};

export type Domein = {
  id: string;
  vakId: string;
  /** Stabiel deel van de webadressen, bijv. /oefenen/rekenen/getallen. */
  slug: string;
  naam: string;
  /** Korte uitleg in kindtaal, getoond op de domeintegel. */
  omschrijving: string;
  icoon: PictogramNaam;
  /**
   * Alleen actieve domeinen zijn te openen. Een domein zonder subdomeinen
   * blijft zichtbaar als "binnenkort", zodat de opbouw klopt zonder dat er
   * lege schermen ontstaan.
   */
  actief: boolean;
  volgorde: number;
};

export type Subdomein = {
  id: string;
  domeinId: string;
  /** Stabiel deel van het webadres binnen het domein. */
  slug: string;
  naam: string;
  /** Korte omschrijving in kindtaal, bijv. "Tafels van 1 t/m 10". */
  omschrijving: string;
  icoon: PictogramNaam;
  volgorde: number;
};

export type Leerdoel = {
  id: string;
  subdomeinId: string;
  /** Stabiele, leesbare code voor intern gebruik, bijv. "REK-BEW-TAFELS-01". */
  code: string;
  /** De naam die het kind en de ouder zien. */
  titel: string;
  /**
   * De naam die alleen in het beheer te zien is, of `null`.
   *
   * Waar dit voor is: binnen één onderwerp mogen twee leerdoelen voor een kind
   * hetzelfde heten — "Tel verder met sprongen van 1" — terwijl ze voor de
   * beheerder verschillen in moeilijkheid. De titel mag dan dubbel voorkomen;
   * déze naam moet uniek zijn, anders zijn ze in het beheer niet uit elkaar te
   * houden. Leeg betekent: gebruik de titel, precies zoals het altijd was.
   */
  beheernaam: string | null;
  /**
   * Hoe moeilijk deze vaardigheid is, 1 tot 5, of `null` als het niet is
   * ingevuld. Bij het kind komen er dan bolletjes op de tegel; is het leeg,
   * dan staat er niets.
   */
  moeilijkheid: number | null;
  /**
   * Een leerdoel hoort bij een groepsrange, niet bij één vaste groep.
   * Dat maakt differentiatie binnen dezelfde groep mogelijk.
   */
  groepVan: Groep;
  groepTot: Groep;
  /**
   * Hoeveel vragen dit leerdoel per oefensessie geeft.
   * `null` betekent: volg de algemene standaard uit de beheerinstellingen.
   */
  vragenPerSessie: number | null;
  /**
   * Welke vorm van uitleg-animatie hier hoort. Leeg of afwezig betekent: volg
   * de groep van het kind. Zo kan een kind in groep 5 dat blokjes nodig heeft
   * die toch krijgen.
   */
  uitlegvorm?: string | null;
  volgorde: number;
};

// ---------------------------------------------------------------------------
// Mastery (eenvoudig en uitlegbaar, geen AI)
// ---------------------------------------------------------------------------

export type MasteryStatus =
  | "nog_niet_gestart"
  | "oefent"
  | "bijna_beheerst"
  | "beheerst";

/** Hoe een kind tot een goed antwoord kwam. Bepaalt mee wanneer iets "beheerst" is. */
export type PogingUitkomst =
  | "direct_goed"
  | "goed_na_hulp"
  | "goed_na_meerdere_pogingen"
  | "nog_niet_beheerst";

export type LeerdoelVoortgang = {
  kindId: string;
  leerdoelId: string;
  status: MasteryStatus;
  /** Tellers per uitkomst; hiermee is de status altijd uit te leggen aan een ouder. */
  aantalDirectGoed: number;
  aantalGoedNaHulp: number;
  aantalGoedNaMeerderePogingen: number;
  aantalNogNietBeheerst: number;
  laatstGeoefendOp: string | null;
};

// ---------------------------------------------------------------------------
// Gebruikers
// ---------------------------------------------------------------------------

/**
 * De taal waarin de ouder de uitleg leest. Geldt UITSLUITEND voor de
 * ouderomgeving; wat het kind ziet blijft Nederlands, want dat is de taal
 * van school.
 */
export type Taal = "nl" | "tr" | "ar" | "pl";

export const TALEN: { code: Taal; naam: string }[] = [
  { code: "nl", naam: "Nederlands" },
  { code: "tr", naam: "T\u00fcrk\u00e7e (Turks)" },
  { code: "ar", naam: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629 (Arabisch)" },
  { code: "pl", naam: "Polski (Pools)" },
];

/**
 * De ouder is het enige echte account: meerdere kinderen eronder, en verder
 * zo min mogelijk gegevens. Zolang de site niet online staat is er geen inlog
 * en precies één ouder; zie `src/lib/auth/sessie.ts`.
 */
export type Ouder = {
  id: string;
  /** Optioneel zolang er geen inlog is; straks de inlognaam. */
  email: string | null;
  /** Optioneel; alleen om de ouder aan te spreken. Nooit verplicht. */
  weergavenaam: string | null;
  taal: Taal;
  aangemaaktOp: string;
};

/**
 * Het kind is GEEN eigen inlogaccount. Het is een profiel onder het account
 * van de ouder. Er wordt bewust geen e-mailadres, achternaam of
 * geboortedatum van een kind vastgelegd.
 */
export type Kind = {
  id: string;
  ouderId: string;
  roepnaam: string;
  groep: Groep;
  avatar: PictogramNaam;
  /**
   * Zachte drempel tussen broers en zussen, geen accountbeveiliging. Vier
   * cijfers, en het mag leeg blijven.
   */
  heeftKindcode: boolean;
};

// ---------------------------------------------------------------------------
// Schoolaansluiting
// ---------------------------------------------------------------------------

/**
 * Herkomst van de methode-informatie. Bepaalt wat we op het scherm mogen
 * beweren. Nooit invullen op basis van een aanname.
 */
export type MethodeHerkomst =
  | "onbekend"
  | "opgegeven_door_ouder"
  | "geverifieerd";

export type School = {
  id: string;
  /** Instellingscode uit BRIN, bijv. "32JK". */
  brin: string;
  /** Vestigingscode, bijv. "32JK00". Uniek per schoolgebouw. */
  vestigingscode: string;
  naam: string;
  plaats: string;
  postcode: string;
  gemeente: string;
  /** Websiteadres uit de DUO-lijst. Leeg als DUO er geen heeft. */
  website: string;
  /**
   * Gevuld zodra de school niet meer in de DUO-lijst voorkomt. De rij blijft
   * bestaan: er kunnen kinderen aan gekoppeld zijn.
   */
  geslotenOp: string | null;
  /** Bron van de schoolgegevens. Altijd navolgbaar, nooit verzonnen. */
  bron: string;
  /** Datum van de import waar deze rij uit komt. */
  bronDatum: string;
};

/** Eén uitgevoerde import van de schoollijst, met bron en licentie erbij. */
export type Schoolimport = {
  id: string;
  bron: string;
  bronLink: string;
  licentie: string;
  uitgevoerdOp: string;
  aantal: number;
  /** Wat deze vernieuwing veranderde. */
  nieuw: number;
  gewijzigd: number;
  gesloten: number;
};

/**
 * Een rekenmethode. ALLEEN naam en uitgever, allebei als gewone tekst.
 *
 * LEGAL REVIEW REQUIRED zodra hier iets bijkomt dat verder gaat dan een naam:
 * geen logo's, geen omslagen, geen huisstijl, geen inhoud uit de methode.
 */
export type Rekenmethode = {
  id: string;
  naam: string;
  /** Naam van de uitgever, als tekst. Mag leeg zijn. */
  uitgever: string;
  actief: boolean;
};

/** Waar een ouder de methode heeft gezien. Verplicht bij een opgave. */
export type GezienWaar = "schoolgids" | "werkboek" | "leerkracht" | "anders";

export const GEZIEN_WAAR: { code: GezienWaar; label: string }[] = [
  { code: "schoolgids", label: "In de schoolgids" },
  { code: "werkboek", label: "Op de kaft van het rekenwerkboek" },
  { code: "leerkracht", label: "Van de leerkracht gehoord" },
  { code: "anders", label: "Anders" },
];

export type OpgaveStatus = "open" | "bevestigd" | "afgewezen";

/** Wat een ouder over de methode van een school heeft doorgegeven. */
export type MethodeOpgave = {
  id: string;
  schoolId: string;
  methode: Rekenmethode | null;
  /** Ingevuld als de ouder "Anders / weet ik niet" koos. */
  andersTekst: string;
  gezienWaar: GezienWaar;
  /** Link of paginanummer bij de schoolgids. */
  gezienLink: string;
  status: OpgaveStatus;
  schooljaar: string;
  gemaaktOp: string;
};

/**
 * De methodestatus van een SCHOOL, zoals de ouder hem te zien krijgt.
 *
 * Deze drie standen zijn de enige die mogen bestaan, en ze worden afgeleid uit
 * wat er echt is vastgelegd — nooit uit een aanname:
 *   geverifieerd         er is een bevestiging door Thuisles, met bron en datum
 *   opgegeven_door_ouder er is minstens één openstaande opgave van een ouder
 *   onbekend             er is niets. Dit is de standaard.
 */
export type SchoolMethodeStatus = {
  herkomst: MethodeHerkomst;
  methode: Rekenmethode | null;
  /** Alleen bij "geverifieerd": waar Thuisles het heeft gecontroleerd. */
  bron: string | null;
  bronLink: string | null;
  bevestigdOp: string | null;
  /** Schooljaar waarin de bevestiging is gedaan. Verloopt niet vanzelf. */
  schooljaar: string | null;
  /** Hoeveel ouders deze methode hebben opgegeven. Alleen bij "opgegeven". */
  aantalOpgaven: number;
};

export type MethodeKoppeling = {
  kindId: string;
  school: School | null;
  methode: Rekenmethode | null;
  herkomst: MethodeHerkomst;
  /**
   * Staat "Oefenen volgens methode" aan voor dit kind? Uit betekent: alleen
   * vrij oefenen en Voor jou.
   */
  volgMethode: boolean;
};

export type MethodeBlokStatus = "voltooid" | "bezig" | "gesloten";

export type MethodeBlok = {
  id: string;
  methodeId: string;
  groep: Groep;
  nummer: number;
  titel: string;
  status: MethodeBlokStatus;
};

/**
 * Een methodeblok met de Thuisles-onderwerpen die eraan gekoppeld zijn.
 *
 * De vragen zijn exact dezelfde als bij vrij oefenen — er bestaat maar één
 * vragendatabase. Het enige verschil is de VOLGORDE: bij vrij oefenen kiest
 * het kind zelf, hier bepaalt de koppeling `blok_leerdoelen` welke onderwerpen
 * bij welk blok horen en in welke volgorde ze langskomen.
 *
 * Is er geen koppeling ingevuld, dan is `onderwerpen` leeg. Er wordt nooit
 * geraden welk onderwerp bij een blok zou kunnen horen.
 */
export type MethodeBlokMetOnderwerpen = MethodeBlok & {
  onderwerpen: SubdomeinMetVoortgang[];
};

// ---------------------------------------------------------------------------
// Wereld en sleutels
// ---------------------------------------------------------------------------

export type WereldGebied = {
  id: string;
  naam: string;
  icoon: PictogramNaam;
  volgorde: number;
  ontgrendeld: boolean;
  /** Alleen tonen bij ontgrendelde gebieden. */
  voortgangProcent: number;
};

/**
 * De sleutels van één kind.
 *
 * Elk goed antwoord levert één sleutel op. Straks zijn ze uit te geven aan
 * schatkisten op de eilandenkaart; daarom staat naast het saldo ook wat er
 * ooit verdiend en uitgegeven is. Zie `src/lib/data/sleutels.ts`.
 */
export type Sleutelstand = {
  verdiend: number;
  uitgegeven: number;
  /** Wat er nu te besteden is. Dit is het getal dat het kind ziet. */
  saldo: number;
};

// ---------------------------------------------------------------------------
// Samengestelde weergaven voor het startscherm
// ---------------------------------------------------------------------------

/** Uitkomst van de aanbevelingsregel voor het blok "Voor jou". */
export type Aanbeveling = {
  leerdoel: Leerdoel;
  subdomein: Subdomein;
  status: MasteryStatus;
  /** In kindtaal uit te leggen waarom juist dit wordt voorgesteld. */
  waarom: string;
};

export type SubdomeinMetVoortgang = {
  subdomein: Subdomein;
  domein: Domein;
  aantalLeerdoelen: number;
  aantalBeheerst: number;
};

// --- Weergaven voor de oefen-navigatie -------------------------------------

export type DomeinMetVoortgang = {
  domein: Domein;
  aantalSubdomeinen: number;
  aantalLeerdoelen: number;
  aantalBeheerst: number;
};

export type LeerdoelMetStatus = {
  leerdoel: Leerdoel;
  status: MasteryStatus;
};

/** Alles wat het startpunt van een oefening nodig heeft. */
export type OefenStart = {
  vak: Vak;
  domein: Domein;
  subdomein: Subdomein;
  leerdoelen: LeerdoelMetStatus[];
  aantalBeheerst: number;
};

export type Startscherm = {
  kind: Kind;
  vakken: Vak[];
  aanbeveling: Aanbeveling | null;
  subdomeinen: SubdomeinMetVoortgang[];
  methode: MethodeKoppeling;
  methodeBlokken: MethodeBlok[];
  wereld: WereldGebied[];
};
