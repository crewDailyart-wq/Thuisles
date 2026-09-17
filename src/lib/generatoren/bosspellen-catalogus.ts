/** Eigen spelontwerpen per vaardigheid. Geen vragen of database-inhoud. */
export type Bosmodus = "tellen" | "maken" | "rest" | "rij" | "kiezen" | "ordenen" | "hoeveelheid";
export type Bosthema = "kralen" | "trein" | "appels" | "blaadjes" | "blokken" | "huisjes" | "waterlelies" | "sterren";
export type Bosontwerp = {
  id: string; naam: string; vaardigheid: string; idee: string;
  modus: Bosmodus; thema: Bosthema; tot?: number; keuze?: boolean;
  sprong?: number; leeg?: "eind" | "buren" | "midden" | "ervoorerna";
  richting?: "omhoog" | "omlaag"; meerMinder?: boolean; evenOneven?: boolean;
};

export const BOSONTWERPEN: Bosontwerp[] = [
  { id: "bos-kralen", naam: "De kralenslinger", vaardigheid: "Kralen tellen", idee: "Tel de lichtjes aan de feestelijke kralenslinger.", modus: "tellen", thema: "kralen" },
  { id: "bos-trein", naam: "De dierentrein", vaardigheid: "Passagiers tellen", idee: "Tel de reizigers in wagonnetjes van vijf.", modus: "tellen", thema: "trein" },
  { id: "bos-kralenmand", naam: "Vul de kralenmand", vaardigheid: "Een gevraagde hoeveelheid neerleggen", idee: "Leg precies genoeg kralen in de mand.", modus: "maken", thema: "kralen" },
  { id: "bos-herfst", naam: "De herfstboom", vaardigheid: "Tellen wat overblijft", idee: "De wind blaast blaadjes weg. Tel wat blijft.", modus: "rest", thema: "blaadjes", keuze: true },
  { id: "bos-kralenpot", naam: "De kralenpotjes", vaardigheid: "Een hoeveelheid koppelen aan een getal", idee: "Kies het potje met precies genoeg kralen.", modus: "hoeveelheid", thema: "kralen" },
  { id: "bos-springpad", naam: "Het springpad", vaardigheid: "Doortellen met één", idee: "Maak het pad van waterlelies af.", modus: "rij", thema: "waterlelies", sprong: 1, leeg: "eind" },
  { id: "bos-appels10", naam: "De kleine appeloogst", vaardigheid: "Plaatjes tellen tot 10", idee: "Tel de appels voor de picknick.", modus: "tellen", thema: "appels", tot: 10, keuze: true },
  { id: "bos-bouwkeuze", naam: "De bouwplaats", vaardigheid: "Blokjes tellen met antwoordkeuze", idee: "Hoeveel bouwblokken liggen klaar? Kies het getal.", modus: "tellen", thema: "blokken", keuze: true },
  { id: "bos-spoor1", naam: "Maak het spoor af", vaardigheid: "Een telrij aanvullen met sprongen van één", idee: "Vul de laatste wagonnetjes met de juiste getallen.", modus: "rij", thema: "trein", sprong: 1, leeg: "eind" },
  { id: "bos-buren", naam: "De burenpost", vaardigheid: "Beide buurgetallen vinden", idee: "Bezorg bij de buren: vul beide huisnummers in.", modus: "rij", thema: "huisjes", sprong: 1, leeg: "buren" },
  { id: "bos-picknick", naam: "De picknickmanden", vaardigheid: "Een getal herkennen in een hoeveelheid", idee: "Kies de mand met het gevraagde aantal appels.", modus: "hoeveelheid", thema: "appels" },
  { id: "bos-lichtjes", naam: "De lichtjesroute", vaardigheid: "Ontbrekende getallen aanvullen", idee: "Laat de ontbrekende sterren van de route weer stralen.", modus: "rij", thema: "sterren", sprong: 1, leeg: "midden" },
  { id: "bos-huisjes", naam: "De huisjespost", vaardigheid: "Het getal ervoor of erna vinden", idee: "Vul het ontbrekende huisnummer in voor de post.", modus: "rij", thema: "huisjes", sprong: 1, leeg: "ervoorerna" },
  { id: "bos-sterrenteller", naam: "Sterren verzamelen", vaardigheid: "Plaatjes tellen zonder antwoordkeuze", idee: "Tel de sterren en vul zelf het aantal in.", modus: "tellen", thema: "sterren" },
  { id: "bos-appels20", naam: "De grote appeloogst", vaardigheid: "Plaatjes tellen tot 20", idee: "Tel de appels in groepjes van vijf.", modus: "tellen", thema: "appels", keuze: true },
  { id: "bos-bouwteller", naam: "De blokkenvoorraad", vaardigheid: "Blokjes tellen zonder antwoordkeuze", idee: "Tel de bouwvoorraad en vul het aantal in.", modus: "tellen", thema: "blokken" },
  { id: "bos-schat", naam: "De schatpoort", vaardigheid: "Het grootste of kleinste getal vinden", idee: "Open de poort met het grootste of kleinste getal.", modus: "kiezen", thema: "huisjes" },
  { id: "bos-kikker2", naam: "De kikkersprongen", vaardigheid: "Een telrij aanvullen met sprongen van twee", idee: "Spring steeds twee verder over de waterlelies.", modus: "rij", thema: "waterlelies", sprong: 2, leeg: "eind" },
  { id: "bos-treinop", naam: "De klimtrein", vaardigheid: "Getallen van laag naar hoog ordenen", idee: "Zet de wagonnetjes van klein naar groot.", modus: "ordenen", thema: "trein", richting: "omhoog" },
  { id: "bos-treinaf", naam: "De daaltrein", vaardigheid: "Getallen van hoog naar laag ordenen", idee: "Zet de wagonnetjes van groot naar klein.", modus: "ordenen", thema: "trein", richting: "omlaag" },
  { id: "bos-extra-appel", naam: "Eentje erbij, eentje eraf", vaardigheid: "Een hoeveelheid met één meer of minder vinden", idee: "Kies de mand met één appel meer of minder.", modus: "hoeveelheid", thema: "appels", meerMinder: true },
  { id: "bos-tweesprong", naam: "Het tweesprongenpad", vaardigheid: "Vorige of volgende even of oneven getal", idee: "Blijf op het even of oneven pad: spring twee.", modus: "rij", thema: "waterlelies", sprong: 2, leeg: "ervoorerna", evenOneven: true },
];

export type Bosfiguur = {
  soort: "bosspel"; ontwerp: string; modus: Bosmodus; thema: Bosthema;
  getallen: number[]; leeg: number[]; keuzes: number[];
  doel: number; weg: number; stap: number;
};
