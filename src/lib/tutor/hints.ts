/**
 * Praten met Bliepo: standaardvragen en de hintladder (22 oktober 2026).
 *
 * Veel vragen van kinderen zijn steeds dezelfde: "ik snap het niet", "wat moet
 * ik doen?", "kun je het nog eens zeggen?", "is dit goed?", "help". Die worden
 * hier herkend en krijgen een vooraf gemaakt antwoord, zonder AI. Die zinnen
 * worden één keer ingesproken met Ruth en daarna bewaard (app/api/stem), dus
 * ze kosten na de eerste keer niets meer.
 *
 * De hintladder: per soort som drie hints, van makkelijk naar duidelijk, en
 * daarna een korte uitleg. Geen enkele hint noemt het antwoord. Heeft de
 * opgave eigen teksten van het maatje (tip en uitleg), dan gaan die voor.
 *
 * Dit bestand mag zowel in de browser als op de server gebruikt worden.
 */

export type Vraagsoort = "herhaal" | "watdoen" | "isgoed" | "snapniet" | "help" | "vrij";

/** Herkent een standaardvraag in wat het kind zei. "vrij" = iets anders: dat gaat naar de AI. */
export function herkenVraag(tekst: string): Vraagsoort {
  const t = ` ${tekst.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ")} `;
  if (/ (nog (een )?(keer|eens)|herhaal|opnieuw zeggen|wat zei je|nog een keer zeggen|ik hoorde (het|je) niet) /.test(t)) return "herhaal";
  if (/ (is (dit|dat|het|mijn antwoord) (goed|juist|fout|klopt)|klopt (dit|dat|het|mijn antwoord)|heb ik (het|dit) goed|is het zo goed|goed zo of niet) /.test(t)) return "isgoed";
  if (/ (wat moet ik (doen|hier doen)?|wat moet je doen|hoe moet (ik|dit|het)|wat is de bedoeling|wat moet ik invullen|wat is de opdracht) /.test(t)) return "watdoen";
  if (/ (ik (snap|begrijp|weet) (het|dit|er)? ?(niks|niets|niet)|snap (het|dit) niet|begrijp (het|dit) niet|geen idee|te moeilijk|dit is moeilijk|ik weet het niet) /.test(t)) return "snapniet";
  if (/^ (help|hulp|helpen)( me| mij)? $/.test(t) || / (help me|help mij|kun je me helpen|kan je me helpen|wil je me helpen) /.test(t)) return "help";
  return "vrij";
}

export type Ladder = { hints: [string, string, string]; uitleg: string };

/*
  Per domein (de soort som). Kort, eenvoudig, zonder het antwoord. Dezelfde
  soort vraag staat overal op dezelfde manier.
*/
const LADDERS: Record<string, Ladder> = {
  getallen: {
    hints: [
      "Kijk nog eens goed naar het getal. Hoeveel tientallen zie je?",
      "Tel eerst de tientallen, en dan de losse eenheden erbij.",
      "Zeg de getallen hardop. Welk getal komt er steeds na het vorige?",
    ],
    uitleg: "Een getal bestaat uit tientallen en eenheden. Eerst tel je de tientallen, en dan de losse eenheden erbij.",
  },
  splitsen: {
    hints: [
      "Welk getal moet je splitsen? Kijk naar het grote getal.",
      "Je hebt al één deel. Hoeveel heb je nog nodig om het hele getal te maken?",
      "Tel vanaf het deel dat je hebt verder, tot je bij het grote getal bent.",
    ],
    uitleg: "Splitsen is een getal in twee stukjes verdelen. Samen zijn de twee stukjes weer het hele getal.",
  },
  optellen: {
    hints: [
      "Er komt iets bij. Wordt het antwoord dan meer of minder?",
      "Begin bij het grootste getal en tel er de rest bij.",
      "Maak eerst de tien vol, en tel daarna de rest erbij.",
    ],
    uitleg: "Bij optellen komt er iets bij. Begin bij het grootste getal, en tel de andere er stap voor stap bij.",
  },
  aftrekken: {
    hints: [
      "Er gaat iets af. Wordt het antwoord dan meer of minder?",
      "Begin bij het eerste getal en tel terug.",
      "Ga eerst terug naar het tiental, en haal daarna de rest eraf.",
    ],
    uitleg: "Bij aftrekken gaat er iets af. Begin bij het eerste getal, en tel stap voor stap terug.",
  },
  tafels: {
    hints: [
      "Welke tafel is dit? Kijk naar de getallen in de som.",
      "Keer betekent: zoveel keer hetzelfde getal. Tel in sprongen.",
      "Weet je een som uit dezelfde tafel die er dichtbij ligt? Reken vanaf daar verder.",
    ],
    uitleg: "Keer is steeds hetzelfde getal erbij. Tel in sprongen, of begin bij een som die je al weet.",
  },
  delen: {
    hints: [
      "Hoeveel moet je verdelen, en in hoeveel groepjes?",
      "Verdeel het eerlijk: in elk groepje evenveel.",
      "Denk aan de tafel. Hoe vaak past het kleine getal in het grote getal?",
    ],
    uitleg: "Delen is eerlijk verdelen. Je kijkt hoe vaak het kleine getal in het grote getal past.",
  },
  verhoudingen: {
    hints: [
      "Wat hoort bij elkaar? Kijk naar de eerste rij.",
      "Wat gebeurt er met het eerste getal? Doe hetzelfde met het andere getal.",
      "Maak het in stapjes: eerst één keer, dan nog een keer.",
    ],
    uitleg: "Bij verhoudingen doe je met allebei de getallen hetzelfde. Wordt het ene twee keer zo groot, dan het andere ook.",
  },
  meten: {
    hints: [
      "Welke maat wordt er gevraagd? Kijk goed naar het woord achter het getal.",
      "Vergelijk met iets wat je kent, zoals je hand of een liniaal.",
      "Moet je omrekenen? Denk aan hoeveel er in één meter of één kilo gaan.",
    ],
    uitleg: "Bij meten kijk je eerst welke maat er gevraagd wordt. Daarna vergelijk je, of reken je om naar dezelfde maat.",
  },
  tijd: {
    hints: [
      "Kijk eerst naar de kleine wijzer. Bij welk uur staat hij?",
      "Kijk dan naar de grote wijzer. Staat hij op heel, half of kwart?",
      "Tel in stapjes van vijf minuten, met de grote wijzer mee.",
    ],
    uitleg: "De kleine wijzer wijst het uur aan, de grote wijzer de minuten. Kijk eerst naar de kleine, dan naar de grote.",
  },
  geld: {
    hints: [
      "Hoeveel geld is het? Tel eerst de briefjes, dan de munten.",
      "Begin bij het grootste bedrag en tel de rest erbij.",
      "Tel de euro's en de centen apart, en zet ze dan samen.",
    ],
    uitleg: "Bij geld tel je eerst de briefjes en de grote munten, en daarna de kleine munten erbij.",
  },
  meetkunde: {
    hints: [
      "Kijk goed naar de vorm. Hoeveel hoeken en zijden heeft hij?",
      "Vergelijk de vormen met elkaar. Wat is hetzelfde, en wat is anders?",
      "Draai de vorm in gedachten om. Past hij dan?",
    ],
    uitleg: "Bij vormen kijk je naar de hoeken, de zijden en hoe de vorm eruitziet als je hem draait.",
  },
  "tabellen-grafieken": {
    hints: [
      "Lees eerst wat er boven de tabel of grafiek staat.",
      "Zoek de juiste rij of kolom, en volg die met je vinger.",
      "Vergelijk de getallen. Welke is het grootst, en welke het kleinst?",
    ],
    uitleg: "Bij een tabel of grafiek lees je eerst de titel. Dan zoek je de goede rij of kolom en lees je het getal af.",
  },
  verhaaltjessommen: {
    hints: [
      "Lees het verhaaltje nog eens rustig. Wat wil je weten?",
      "Komt er iets bij, of gaat er iets af?",
      "Schrijf de som op met de getallen uit het verhaal.",
    ],
    uitleg: "Bij een verhaaltjessom zoek je eerst wat je wilt weten. Dan kijk je of er iets bij komt of af gaat, en maak je de som.",
  },
  algemeen: {
    hints: [
      "Lees de vraag nog eens rustig. Wat wordt er gevraagd?",
      "Kijk goed naar het plaatje en de getallen. Wat valt je op?",
      "Doe het in kleine stapjes. Wat is de eerste stap?",
    ],
    uitleg: "Lees eerst rustig wat er gevraagd wordt. Doe het daarna stap voor stap, en kijk aan het eind of het klopt.",
  },
};

/**
 * Welke ladder hoort bij deze opgave. Eerst de som zelf: een minsom kan in het
 * onderwerp Optellen staan, en dan klopt "er komt iets bij" niet. Daarna het
 * domein, en anders wat er in het les-id of leerdoel staat.
 */
export function ladderVoor(domein: string | null | undefined, extra = "", opgaveTekst = ""): Ladder {
  const som = opgaveTekst.toLowerCase();
  if (/\d\s*[−–-]\s*\d|\bmin\b/.test(som)) return LADDERS.aftrekken;
  if (/\d\s*\+\s*\d|\bplus\b/.test(som)) return LADDERS.optellen;
  if (/\d\s*[×x*]\s*\d|\bkeer\b/.test(som)) return LADDERS.tafels;
  if (/\d\s*[:÷]\s*\d|gedeeld door/.test(som)) return LADDERS.delen;
  if (domein && LADDERS[domein]) return LADDERS[domein];
  const t = `${domein ?? ""} ${extra}`.toLowerCase();
  for (const sleutel of Object.keys(LADDERS)) if (sleutel !== "algemeen" && t.includes(sleutel.split("-")[0])) return LADDERS[sleutel];
  if (/klok|uur|tijd/.test(t)) return LADDERS.tijd;
  if (/tiental|tellen|getal/.test(t)) return LADDERS.getallen;
  if (/vergelijk/.test(t)) return LADDERS.getallen;
  return LADDERS.algemeen;
}

/** Alle vooraf gemaakte zinnen, zodat ze vooraf met Ruth ingesproken kunnen worden. */
export function alleHintZinnen(): string[] {
  const uit = new Set<string>(Object.values(VASTE_ANTWOORDEN));
  for (const l of Object.values(LADDERS)) {
    for (const h of l.hints) uit.add(h);
    uit.add(l.uitleg);
  }
  return [...uit];
}

/** De vaste antwoorden die geen hint zijn. */
export const VASTE_ANTWOORDEN = {
  nietGehoord: "Ik hoorde je niet goed. Wil je het nog een keer zeggen?",
  isGoed: "Dat zie je zo! Druk op Controleer, dan kijken we het samen na.",
  watDoen: "Vul je antwoord in, en druk dan op Controleer.",
  limiet: "Ik moet even opladen! Morgen kun je me weer vragen stellen. De hints werken wel gewoon.",
  kanNiet: "Ik kan nu even niet goed nadenken. Probeer eerst een hint, door te zeggen: ik snap het niet.",
  laatsteHint: "Je hebt alle hints gehad. Probeer het nu zelf, je kunt het!",
  /* Meteen na het loslaten, als het antwoord nog even duurt: dan wacht het kind niet op stilte. */
  denken: "Hmm, even nadenken.",
} as const;
