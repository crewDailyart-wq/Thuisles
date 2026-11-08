/**
 * ALLE ZINNEN VAN BLIEPO in de gouden klokles (squla-klok-hoelaat-1-gouden), op één plek, zodat ze makkelijk te
 * vervangen zijn (opdracht Sara, 8 november 2026). De les zelf (squla-klok-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, speciale momenten, naam, goed na een fout, snel, begin en einde, eerste zin als de denkfout niet
 *     duidelijk is, aanmoedigen, overgang, reactie bij de klok) komen letterlijk uit BLIEPO-KARAKTER.md (§3, §4, §5,
 *     §10, §11, §12). Robotzinnen zijn gemarkeerd; de les gebruikt ze spaarzaam (nooit 2 robotzinnen kort na elkaar).
 *   - De FOUTTABEL (BOUWREGELS 15.9): per vraag, per fout antwoord, de denkfout (een naam uit de vaste lijst in
 *     FOUTTABEL-squla-klok-gouden.md §1, die in de voortgang komt), Bliepo's eerste zin, de hint en wat er op het scherm
 *     gebeurt. Denkfout niet duidelijk: eerste zin uit BLIEPO-KARAKTER.md §10 en een algemene hint; geen reden verzonnen.
 *   - Per soort denkfout een uitleg voor de 2e fout (zonder het antwoord) en een ANDERE uitleg als het kind dezelfde
 *     denkfout nog eens maakt.
 *
 * Leesbare versie: FOUTTABEL-squla-klok-gouden.md (die volgt dit bestand). {naam} = de naam van het kind (alleen op het
 * scherm en met de browserstem; zonder naam valt hij weg). {3:oranje} = kleur van de kleine wijzer, {12:paars} = kleur
 * van de grote wijzer.
 */

/* ---------- een rijtje: zinnen, waarvan sommige robotzinnen ---------- */

export type Rijtje = { zinnen: string[]; robot: number[] };
const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });

/** §3.1 Gewone lofzinnen. Zin 4 ("Dat heb je goed gezien.") alleen bij een kijkvraag. Robot: 31 t/m 40. */
export const LOF = rij(
  ["Ja, dat is goed!", "Helemaal goed!", "Super gedaan!", "Dat heb je goed gezien.", "Knap gedaan!", "Ja, zo is het!", "Heel goed!", "Wauw, goed zeg!", "Dat zit goed!", "Jij weet het!", "Precies goed!", "Goed zo!", "Ja, die klopt!", "Mooi zo!", "Ja, die is het!", "Prima gedaan!", "Netjes!", "Klopt helemaal!", "Ja hoor, goed!", "Wat goed van jou!", "Top!", "Heel knap!", "Zo doe je dat!", "Lekker bezig!", "Dat ging goed!", "Goed gekozen!", "Ja, dat is het goede antwoord!", "Helemaal raak!", "Dat weet jij al goed!", "Fijn, die is goed!", "Kijk, mijn scherm wordt er groen van!", "Mijn scherm is helemaal groen. Goed zo!", "Nagekeken: helemaal goed!", "Ik heb het nagekeken. Het klopt!", "Groen scherm! Die is goed.", "Dat stop ik in mijn geheugen: jij kunt dit!", "Mijn scherm straalt groen!", "Even nakijken… ja, goed!", "Die bewaar ik in mijn geheugen. Goed zo!", "Mijn scherm kleurt groen. Knap!"],
  [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
);
export const LOF_KIJK_INDEX = 3;

/** §3.2 Lof voor speciale momenten (per les hooguit 1 keer per soort). */
export const MOMENT = {
  drieOpRij: rij(["Al 3 goed achter elkaar!", "3 keer op rij goed. Wauw!", "Het gaat steeds beter: al 3 goed!", "3 keer goed! Dat zet ik in mijn geheugen."], [3]),
  moeilijk: rij(["Dit was een moeilijke, en jij weet het!", "Wauw, ook de lastige is goed!", "Die was echt lastig. Knap van jou!", "Moeilijke vraag, groen scherm. Super!"], [3]),
  eerste: rij(["Goed begin!", "De eerste is al goed!", "Zo, wat een goede start!", "De eerste is nagekeken: goed!"], [3]),
  laatste: rij(["En de laatste is ook goed!", "Goed tot het eind!", "Ook de laatste klopt. Knap!", "De laatste vraag, en weer een groen scherm!"], [3]),
};

/** §3.3 Lof met de naam (nooit bij een fout of na een fout; minstens 3 vragen ertussen; hooguit 2 keer per les). */
export const NAAM_LOF = rij(["Goed zo, {naam}!", "Knap gedaan, {naam}!", "{naam}, dat is helemaal goed!", "Ja {naam}, zo is het!", "Wat goed, {naam}!", "Jij weet het, {naam}!", "{naam}, mijn scherm wordt groen van jou!", "Dat onthoud ik, {naam}: jij kunt dit!"], [6, 7]);
export const NAAM_GROET = "Hoi {naam}! Fijn dat je er bent.";

/** §3.4 Goed na een fout: alleen een korte bevestiging. */
export const BEVESTIG = rij(["Ja, nu is het goed.", "Nu heb je hem.", "Die is goed.", "Zo is het.", "Ja, nu klopt het.", "Gevonden!", "Nu zit het goed.", "Ja, deze is het.", "Nu wordt mijn scherm groen.", "Nagekeken: nu is het goed."], [8, 9]);

/** §3.5 Heel snel geantwoord. */
export const SNEL = rij(["Dat ging snel!", "Wat was jij snel!", "Snel en goed!"]);

/** §4 Reactie op wat het kind koos, bij de klok (zin 4, half, past niet bij hele uren). */
export const KLOKREACTIE = (uur: number) => rij([`Ja, de kleine wijzer staat op de {${uur}:oranje}.`, "Ja, de grote wijzer staat bovenaan, dus het is een heel uur.", `Ja, het is precies {${uur}:oranje} uur.`, `Nagekeken: de kleine wijzer wijst naar de {${uur}:oranje}. Klopt!`], [3]);

/** §5 Einde. Zin 6 alleen na veel fouten (4 of meer vragen met een fout). */
export const EINDE = rij(["Goed gedaan! Tot de volgende keer.", "De les is klaar. Wat heb jij goed gewerkt!", "Klaar! Je hebt veel geoefend vandaag.", "Dat was de laatste. Fijn dat je meedeed!", "Je bent klaar. Ik vond het leuk met jou!", "Klaar! Wat heb je goed je best gedaan.", "Dat was de les. Tot snel!", "Alles nagekeken. De les is klaar!", "Deze les bewaar ik in mijn geheugen. Tot de volgende keer!"], [7, 8]);
export const EINDE_VEEL_FOUTEN = "Je hebt goed doorgezet. Volgende keer gaat het nog beter.";

/** §10 Eerste zin als de denkfout niet duidelijk is (binnen 1 vraag nooit 2 keer dezelfde). */
export const ONDUIDELIJK = rij(["Die is lastig, hè.", "We zoeken het samen.", "Ik help je een stukje.", "Goed dat je het probeert.", "Kom, we kijken samen.", "Ik geef je een tip.", "Ik bedoelde een andere.", "Dat geeft niks, zo leer je het.", "Rustig maar, we doen het stap voor stap.", "Er is nog een betere keuze.", "Probeer het nog 1 keer, met een tip.", "Ik heb het nagekeken. Er past een andere beter.", "Even in mijn geheugen kijken… ik heb een tip!", "Mijn geheugen zegt: samen lukt dit vast.", "Ik heb nagekeken en ik weet een hulpje."], [11, 12, 13, 14]);

/** §11 Aanmoedigen bij een opdracht waar het kind na het hulphandje nog steeds niets doet (± 15 s; 1 keer per opdracht). */
export const AANMOEDIG = rij(["Neem rustig de tijd.", "Je mag goed kijken.", "Denk maar even na.", "Je bent goed bezig.", "Geen haast, hoor.", "Rustig kijken mag.", "Ik wacht wel even.", "Jij kunt dit.", "Ik sta klaar om na te kijken.", "Als je kiest, kijk ik het meteen na."], [8, 9]);

/** §12 Overgang tussen vragen (af en toe, niet na elke vraag). */
export const OVERGANG = rij(["Daar komt de volgende.", "Op naar de volgende!", "Hier is er weer een.", "Nu de volgende.", "Kijk, een nieuwe.", "We gaan door.", "Daar gaan we weer.", "En nu deze.", "Dan de volgende vraag.", "Let goed op bij deze.", "Hop, verder!", "Nieuwe vraag!", "Kijk mee naar de volgende.", "Deze is voor jou.", "Verder maar weer.", "Die is nagekeken. Nu de volgende.", "Opgeslagen in mijn geheugen. Verder!", "Klaar met nakijken. Daar komt er weer een.", "Mijn geheugen heeft nog een vraag voor jou.", "Nagekeken en bewaard. Door naar de volgende!"], [15, 16, 17, 18, 19]);

/** {naam} invullen; zonder naam valt hij netjes weg (BOUWREGELS 3.17). */
export function metNaam(zin: string, naam: string | undefined): string {
  const n = (naam ?? "").trim();
  if (n) return zin.replace(/\{naam\}/g, n);
  return zin.replace(/\s+\{naam\}!/g, "!").replace(/,\s*\{naam\}/g, "").replace(/\{naam\},\s*/g, "").replace(/\s*\{naam\}/g, "").replace(/^\s*(\p{Ll})/u, (m) => m.toUpperCase());
}

/* ---------- vaste zinnen van het verloop (draaiboek klokkijken §1.1; eigen beginzin per les, BOUWREGELS 4.3) ---------- */

export const ZIN = {
  start: "In deze les lees je op de klok hoe laat het is. Je kijkt naar de wijzers en kiest het hele uur. Weet jij al hoe dat moet?",
  proefBegin: "Fijn! Dan kijken we eerst of het lukt.",
  proefLastig: ["Dit is nog lastig.", "We gaan het eerst samen bekijken."],
  proefGoed: "Mooi, dat kun je al!",
  samenBeginnen: "Dat geeft niks. We gaan het samen bekijken.",
  pijlUitleg: "Klaar met kijken? Tik dan op de blauwe pijl.",
  lijnKijk: "Kijk eens wat de klok nu doet.",
  tikGetal: "Tik op een van de getallen.",
  tikGetalHand: "Kies maar een getal op de lijn en tik erop.",
  metDeKlokMee: "Deze kant op heet: met de klok mee.",
  tweeWijzers: "Kijk, er staan nu 2 wijzers op de klok.",
  urenUitleg: ["Met de kleine wijzer lees je het uur.", "Kijk maar hoe hij werkt."],
  urenKlaar: "Je kunt het uur lezen met de kleine wijzer.",
  groteWijzerKijk: "Nu gaan we kijken wat de grote wijzer doet.",
  na2: "Kijk: de grote wijzer draaide een rondje. Hij wijst recht omhoog, naar de {12:paars}.",
  na3: "Weer een rondje. De grote wijzer staat weer op de {12:paars}.",
  heelUur: ["Bij elk heel uur wijst de grote wijzer naar de {12:paars}.", "Dan begint er een nieuw uur.", "Zo'n tijd heet een heel uur."],
  oefenBegin: "Nu mag jij de klokken lezen.",
  oefenVerder: "Nu nog meer klokken.",
  terug1: "Er komt nog 1 klok van net terug.",
  terugN: (n: number) => `Er komen nog ${n} klokken van net terug.`,
  terugLastig: "Deze klokken oefen je een andere keer nog eens.",
  slot: "Nu kun je het uur lezen met de kleine wijzer.",
  zetOpdracht: (n: number) => `Zet de kleine wijzer op de {${n}:oranje}.`,
  zetKop: (n: number) => `Kleine wijzer op de ${n}`,
  zetHand: (n: number) => `Tik op de {${n}:oranje}, of sleep de kleine wijzer erheen.`,
  zetSamen: (n: number) => [`Hier is de {${n}:oranje}, in de ring.`, `Tik maar op de {${n}:oranje}.`],
};

/* ---------- denkfouten ---------- */

/** De vaste namen voor de voortgang (FOUTTABEL-squla-klok-gouden.md §1; elke les gebruikt dezelfde lijst). */
export const DENKFOUTEN = ["verkeerde-wijzer", "andere-kant", "getal-ernaast", "een-te-veel", "een-te-weinig", "plus-min-verwisseld", "groter-kleiner-verwisseld", "verkeerde-richting", "doortellen-na-12", "boven-onder-verwisseld", "wijzers-verwisseld", "uur-minuten-verwisseld", "geen-heel-uur", "beeld-van-net", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

/** Wat er op het scherm gebeurt bij een hint (de les zet dit om in beeld). */
export type Scherm = "licht-uur" | "licht-minuut" | "driehoek-12" | "driehoek-6" | "pijl-6-7" | "pijl-12-1" | "ring-hand" | "lijn" | "rondje-getallen" | "geen";

export const SCHERM_TEKST: Record<Scherm, string> = {
  "licht-uur": "de kleine wijzer licht op, de grote wordt vaag",
  "licht-minuut": "de grote wijzer licht op, de kleine wordt vaag",
  "driehoek-12": "blauw driehoekje boven de 12",
  "driehoek-6": "blauw driehoekje onder de 6",
  "pijl-6-7": "blauwe pijl van de 6 naar de 7 (met de klok mee)",
  "pijl-12-1": "blauwe pijl van de 12 naar de 1 (met de klok mee)",
  "ring-hand": "oranje ring om het doel blijft, het hulphandje wijst naar het doel",
  lijn: "de getallenlijn blijft recht in beeld",
  "rondje-getallen": "de klok blijft in beeld, getallen in een rondje",
  geen: "niets extra",
};

export type Fout = {
  /** De naam van de denkfout uit de vaste lijst (komt in de voortgang). */
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (sleutel in UITLEG; kan per vraag preciezer zijn dan de naam). */
  soort: string;
  /** De waarschijnlijke denkfout in gewone woorden. */
  denkfout: string;
  /** Bliepo's eerste zin (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  /** De hint die precies die denkfout aanpakt (zonder het antwoord te noemen). */
  hint: string;
  scherm: Scherm;
};

/** Uitleg na de 2e fout per soort denkfout (zonder het antwoord), en een andere uitleg als dezelfde denkfout nog eens komt. */
export const UITLEG: Record<string, { uitleg: string[]; weer: string[] }> = {
  "lange-wijzer": {
    uitleg: ["De lange wijzer staat bij een heel uur altijd op de {12:paars}.", "Het uur zie je aan de korte wijzer."],
    weer: ["Je keek weer naar de lange wijzer. Dat gebeurt heel vaak!", "Zoek nu de korte, dikke wijzer en volg hem tot zijn punt."],
  },
  "andere-kant": {
    uitleg: ["Een wijzer begint in het midden.", "Het uur staat bij zijn punt, niet aan de andere kant."],
    weer: ["Weer de andere kant. Geen probleem!", "Leg je vinger in het midden en schuif langs de korte wijzer naar buiten."],
  },
  ernaast: {
    uitleg: ["Bij een heel uur wijst de kleine wijzer recht naar 1 getal.", "Kijk welk getal precies voor zijn punt staat."],
    weer: ["Weer het getal ernaast. Je bent er bijna!", "Kijk heel goed: welk getal raakt de punt bijna?"],
  },
  onduidelijk: {
    uitleg: ["Kijk eerst naar de grote wijzer: die staat bovenaan. Dan is het een heel uur.", "Volg dan de kleine wijzer vanaf het midden naar buiten, tot aan de punt."],
    weer: ["Begin in het midden van de klok.", "Ga langs de oranje wijzer naar buiten. Welk getal staat bij de punt?"],
  },
  "uur-minuten": {
    uitleg: ["Bij een heel uur zeg je het getal van de kleine wijzer.", "Daarna zeg je het woord uur, niet minuten."],
    weer: ["Weer de minuten. Het is een heel uur, want de grote wijzer staat bovenaan.", "Dan noem je het getal van de kleine wijzer, met het woord uur erachter."],
  },
  "korte-wijzer": {
    uitleg: ["Nu gaat het om de lange paarse wijzer.", "Kijk waar die steeds stopte: bovenaan of onderaan?"],
    weer: ["Je keek weer naar de korte wijzer.", "Kijk alleen naar de paarse wijzer die licht geeft. Wijst hij omhoog of omlaag?"],
  },
  "geen-heel-uur": {
    uitleg: ["Bij een heel uur wijst de grote wijzer recht omhoog.", "Kijk waar de grote wijzer nu staat."],
    weer: ["De kleine wijzer staat vlak bij de {7:oranje}, dat klopt.", "Maar de grote wijzer wijst naar beneden. Dan is het nog geen heel uur."],
  },
  "klok-van-net": {
    uitleg: ["Een klok is rond.", "Kijk of deze getallen in een rondje staan of op een rechte lijn."],
    weer: ["Je denkt weer aan de klok van net. Dat snap ik, de getallen zijn hetzelfde.", "Maar dit is recht, net als een liniaal. Hoe heet zo'n rij getallen?"],
  },
  "lijn-van-net": {
    uitleg: ["De getallen zijn in een rondje gaan staan.", "Zo'n rondje met de getallen 1 tot en met 12 hangt vaak aan de muur."],
    weer: ["Je denkt nog aan de lijn van net.", "Maar de lijn is rond geworden. Waarop kijk je hoe laat het is?"],
  },
  "boven-onder": {
    uitleg: ["Boven is de kant van het plafond, onder de kant van de vloer.", "Kijk waar het blauwe driehoekje staat."],
    weer: ["Weer de andere kant op.", "Zoek eerst het blauwe driehoekje. Het getal ernaast is het antwoord."],
  },
  "net-niet-hoogst": {
    uitleg: ["Je zocht hoog, goed zo.", "Volg de rand van de klok omhoog, tot je niet hoger kunt. Daar staat het driehoekje."],
    weer: ["Weer net naast de top.", "Het hoogste getal staat recht boven het midden van de klok."],
  },
  laagste: {
    uitleg: ["Ga langs de rand naar beneden, tot je niet lager kunt.", "Daar staat het blauwe driehoekje."],
    weer: ["Zoek eerst het blauwe driehoekje onder de klok.", "Het getal vlak erboven staat het laagst."],
  },
  "voor-na": {
    uitleg: ["Ervoor en erna lijken op elkaar.", "Erna betekent: de kant op van de blauwe pijl."],
    weer: ["Weer de kant van ervoor.", "Zet je vinger op het begin van de pijl en volg hem 1 stap."],
  },
  "te-ver": {
    uitleg: ["Je telde een stap te veel.", "Erna is maar 1 stap, de kant op van de pijl."],
    weer: ["Weer een stap te ver.", "Tel maar mee: begin bij het getal en zet precies 1 stap."],
  },
  "door-na-12": {
    uitleg: ["Op een getallenlijn tel je steeds verder.", "Op een klok begin je na het hoogste getal weer opnieuw. Volg de pijl."],
    weer: ["Je telde weer verder, zoals op een getallenlijn.", "Zoek op de klok waar de pijl eindigt. Daar staat het getal."],
  },
  "lang-is-uur": {
    uitleg: ["Een uur is lang, dus dat lijkt logisch.", "Maar de lange wijzer gaat snel rond. Hij telt iets dat kort duurt."],
    weer: ["Ik snap dat het raar is.", "De lange wijzer draait een heel rondje in 1 uur. Hij telt dus de kleine stukjes tijd."],
  },
  namen: {
    uitleg: ["Er is een grote en een kleine wijzer.", "Een lange wijzer is groot, een korte wijzer is klein."],
    weer: ["Je koos weer de andere naam.", "Vergelijk de 2 wijzers. Is deze de langste of de kortste?"],
  },
  "zet-12": {
    uitleg: ["De kleine wijzer moet naar het getal in de oranje ring.", "Kijk waar de ring staat en draai de punt daarheen."],
    weer: ["Weer bij de {12:paars}. Daar woont de grote wijzer.", "Pak de korte wijzer en zet zijn punt in de oranje ring."],
  },
  "zet-andere-kant": {
    uitleg: ["De punt van de wijzer moet bij het getal.", "Draai de wijzer rond tot zijn punt in de oranje ring staat."],
    weer: ["Weer de andere kant. Geen probleem!", "Kijk waar de ring is, en draai de punt die kant op."],
  },
  "zet-ernaast": {
    uitleg: ["Je was er heel dichtbij.", "Kijk goed: de punt moet precies in de oranje ring staan."],
    weer: ["Weer net ernaast. Je bent er bijna!", "Tik gewoon op het getal in de ring."],
  },
  "zet-ring": {
    uitleg: ["De oranje ring wijst het getal aan.", "Zet de punt van de kleine wijzer precies in de ring."],
    weer: ["Weer een ander getal.", "Kijk naar het handje. Tik op het getal waar het naar wijst."],
  },
};

/* ---------- de fouttabel per vraag ---------- */

export type Vraag = {
  id: string;
  /** Waar in de les (draaiboekstap of klok in het oefenblok). */
  waar: string;
  vraag: string[];
  opties: string[];
  goed: string;
  fouten: Record<string, Fout>;
  /** De vraag bij de 2e en 3e poging (anders dezelfde). */
  opnieuw?: string[];
  /** Na de lof of bevestiging. */
  naGoed?: string[];
  /** Samen voordoen na de 3e fout (nu pas het antwoord). */
  samen?: string[];
  /** Kijkvraag: het kind moest iets zien of vinden ("Dat heb je goed gezien" mag). */
  kijk?: boolean;
  /** Een vraag die in de les als lastig staat (lof voor een moeilijke vraag mag). */
  lastig?: boolean;
};

const o = (n: number) => `{${n}:oranje}`;
const F = (code: Denkfoutnaam, soort: string, denkfout: string, eerste: string, hint: string, scherm: Scherm): Fout => ({ code, soort, denkfout, eerste, hint, scherm });

/** Een klok lezen (hele uren): de foute keuze → de denkfout. `metUur`: de keuzes zijn "3 uur" (anders "3"). */
export function klokFout(gekozen: number, uur: number, metUur: boolean): Fout {
  if (gekozen === 12 && uur !== 12) return F("verkeerde-wijzer", "lange-wijzer", "keek naar de grote (lange) wijzer in plaats van de kleine", "Je keek naar de lange wijzer.", "Bij een heel uur kijken we naar de korte wijzer.", "licht-uur");
  if (gekozen === ((uur + 5) % 12) + 1) return F("andere-kant", "andere-kant", "nam het getal aan de andere kant van de klok", "Je keek naar de andere kant van de klok.", "Kijk waar de punt van de kleine wijzer is.", "licht-uur");
  if (Math.abs(gekozen - uur) === 1 || Math.abs(gekozen - uur) === 11) return F("getal-ernaast", "ernaast", "nam het getal vlak naast het goede", "Je zat er vlak naast.", "Volg de kleine wijzer tot het getal waar hij precies naar wijst.", "licht-uur");
  return F("onduidelijk", "onduidelijk", "niet duidelijk (geen reden verzonnen)", "", metUur ? "Kijk naar de kleine wijzer. Waar wijst zijn punt naar?" : "Volg de kleine wijzer vanaf het midden tot aan de punt.", "licht-uur");
}

/** Een fout getal bij "zet de kleine wijzer op de …" (de meest voorkomende fouten). */
export function zetFout(gekozen: number, doel: number): Fout {
  if (gekozen === 12 && doel !== 12) return F("verkeerde-wijzer", "zet-12", "zette de kleine wijzer waar de grote hoort (bij de 12)", "Bij de {12:paars} hoort de grote wijzer.", `Zet de kleine wijzer bij de ${o(doel)}.`, "ring-hand");
  if (gekozen === ((doel + 5) % 12) + 1) return F("andere-kant", "zet-andere-kant", "zette de punt aan de andere kant van de klok", "De punt staat nu aan de andere kant.", `Draai de punt naar de ${o(doel)}.`, "ring-hand");
  if (Math.abs(gekozen - doel) === 1 || Math.abs(gekozen - doel) === 11) return F("getal-ernaast", "zet-ernaast", "zette de wijzer vlak naast het doel", `Je zette hem vlak naast de ${o(doel)}.`, "Draai een klein stukje verder of terug, naar de ring.", "ring-hand");
  return F("onduidelijk", "zet-ring", "niet duidelijk (geen reden verzonnen)", "", "Kijk naar de ring: daar moet de punt heen.", "ring-hand");
}

const heleKlok = (uur: number, opties: number[], metUur: boolean): Record<string, Fout> =>
  Object.fromEntries(opties.filter((n) => n !== uur).map((n) => [metUur ? `${n} uur` : String(n), klokFout(n, uur, metUur)]));

/** De vragen van de uitleg (draaiboek stap 4 t/m 18), in volgorde. */
export const UITLEGVRAGEN: Vraag[] = [
  {
    id: "stap4-hoe-heet", waar: "uitleg, stap 4 (de klok is een getallenlijn geworden)", kijk: true, vraag: ["Weet jij hoe dit heet?"], opties: ["een getallenlijn", "een klok"], goed: "een getallenlijn",
    samen: ["Kijk, de getallen staan op een rechte lijn. Dat is een getallenlijn."],
    fouten: { "een klok": F("beeld-van-net", "klok-van-net", "noemde wat er net nog op het scherm stond (de klok)", "Net was het nog een klok, ja.", "Nu staan de getallen op een rij.", "lijn") },
  },
  {
    id: "stap6-hoe-heet-nu", waar: "uitleg, stap 6 (de lijn is weer rond)", kijk: true, vraag: ["Zo houd je een getallenlijn wel heel raar vast!", "Hoe heet dit nu?"], opties: ["een klok", "een getallenlijn"], goed: "een klok",
    opnieuw: ["Hoe heet dit nu?"], samen: ["De getallen staan in een rondje. Dat is een klok."],
    fouten: { "een getallenlijn": F("beeld-van-net", "lijn-van-net", "noemde wat er net nog op het scherm stond (de getallenlijn)", "Net was het een getallenlijn, ja.", "Kijk: nu staan de getallen in een rondje.", "rondje-getallen") },
  },
  {
    id: "stap7-hoogste", waar: "uitleg, stap 7 (het hoogste punt)", kijk: true, vraag: ["Kijk naar het hoogste punt van de klok.", "Welk getal staat daar?"], opties: ["1", "6", "12"], goed: "12",
    opnieuw: ["Welk getal staat helemaal bovenaan?"], naGoed: ["De 12 staat helemaal bovenaan."], samen: ["Kijk, in de ring: de 12 staat helemaal bovenaan."],
    fouten: {
      "1": F("getal-ernaast", "net-niet-hoogst", "nam een getal dat hoog staat, maar net naast de top", "De 1 staat hoog, vlak naast de top.", "Kijk bij het blauwe driehoekje.", "driehoek-12"),
      "6": F("boven-onder-verwisseld", "boven-onder", "haalde bovenaan en onderaan door elkaar", "De 6 staat juist helemaal onderaan.", "Kijk naar het hoogste punt, bij het driehoekje.", "driehoek-12"),
    },
  },
  {
    id: "stap8-laagste", waar: "uitleg, stap 8 (het laagste punt)", kijk: true, vraag: ["Volg de klok helemaal rond.", "Welk getal staat onderaan?"], opties: ["3", "6", "12"], goed: "6",
    opnieuw: ["Welk getal staat helemaal onderaan?"], naGoed: ["De 6 staat helemaal onderaan."], samen: ["Kijk, in de ring: de 6 staat helemaal onderaan."],
    fouten: {
      "3": F("onduidelijk", "laagste", "niet duidelijk (geen reden verzonnen)", "", "Ga helemaal naar beneden, naar het driehoekje.", "driehoek-6"),
      "12": F("boven-onder-verwisseld", "boven-onder", "haalde bovenaan en onderaan door elkaar", "De 12 staat juist bovenaan.", "Ga helemaal naar beneden, naar het driehoekje.", "driehoek-6"),
    },
  },
  {
    id: "stap9-na-6", waar: "uitleg, stap 9 (wat komt na de 6?)", vraag: ["Kijk naar de 6.", "Welk getal komt erna?"], opties: ["5", "7", "8"], goed: "7",
    opnieuw: ["Welk getal komt na de 6?"], naGoed: ["Van de 6 ga je deze kant op, naar de 7."], samen: ["Van de 6 ga je 1 getal verder, naar de 7 in de ring."],
    fouten: {
      "5": F("verkeerde-richting", "voor-na", "nam het getal ervoor in plaats van erna", "De 5 komt vóór de 6.", "Erna betekent: deze kant op. Volg de blauwe pijl.", "pijl-6-7"),
      "8": F("een-te-veel", "te-ver", "telde 1 te veel (2 getallen verder)", "Je ging 2 getallen verder.", "Na de 6 ga je maar 1 getal verder. Volg de blauwe pijl.", "pijl-6-7"),
    },
  },
  {
    id: "stap10-na-12", waar: "uitleg, stap 10 (wat komt na de 12?)", lastig: true, vraag: ["Nu een lastige.", "Welk getal komt na de 12?"], opties: ["1", "11", "13"], goed: "1",
    opnieuw: ["Welk getal komt na de 12?"], naGoed: ["Na de 12 begint de klok weer bij de 1."], samen: ["Na de 12 begint de klok weer opnieuw, bij de 1 in de ring."],
    fouten: {
      "13": F("doortellen-na-12", "door-na-12", "telde door zoals op een getallenlijn (13 na 12)", "Op een getallenlijn komt de 13 na de 12, dat snap ik.", "Op deze klok staat geen 13. Volg de pijl.", "pijl-12-1"),
      "11": F("verkeerde-richting", "voor-na", "nam het getal ervoor in plaats van erna", "De 11 komt vóór de 12.", "We zoeken het getal erna. Volg de pijl.", "pijl-12-1"),
    },
  },
  {
    id: "stap11-lange-telt", waar: "uitleg, stap 11 (wat telt de lange wijzer?)", vraag: ["De ene wijzer telt de minuten. De andere wijst het uur aan.", "Wat telt de lange wijzer?"], opties: ["de minuten", "de uren"], goed: "de minuten",
    opnieuw: ["Wat telt de lange wijzer?"], naGoed: ["De lange wijzer telt de minuten."], samen: ["De lange wijzer gaat snel rond. Hij telt de minuten."],
    fouten: { "de uren": F("wijzers-verwisseld", "lang-is-uur", "dacht: een uur duurt lang, dus de lange wijzer telt de uren", "Dat klinkt logisch: een uur duurt lang.", "Maar op de klok is het andersom. Kijk hoe snel de lange wijzer straks draait.", "licht-minuut") },
  },
  {
    id: "stap12-lange-naam", waar: "uitleg, stap 12 (hoe heet de lange wijzer?)", vraag: ["Deze lange paarse wijzer telt de minuten.", "Hoe heet hij?"], opties: ["de grote wijzer", "de kleine wijzer"], goed: "de grote wijzer",
    opnieuw: ["Hoe heet de lange wijzer?"], samen: ["De lange wijzer heet de grote wijzer."],
    fouten: { "de kleine wijzer": F("wijzers-verwisseld", "namen", "haalde de namen van de wijzers door elkaar", "De kleine wijzer is de korte.", "Deze wijzer is lang.", "licht-minuut") },
  },
  {
    id: "stap12-korte-naam", waar: "uitleg, stap 12 (hoe heet de korte wijzer?)", vraag: ["En deze korte oranje wijzer?", "Hoe heet die?"], opties: ["de kleine wijzer", "de grote wijzer"], goed: "de kleine wijzer",
    opnieuw: ["Hoe heet de korte wijzer?"], samen: ["De korte wijzer heet de kleine wijzer."],
    fouten: { "de grote wijzer": F("wijzers-verwisseld", "namen", "haalde de namen van de wijzers door elkaar", "De grote wijzer is de lange.", "Deze wijzer is kort.", "licht-uur") },
  },
  ...[3, 7, 11].map((uur, i): Vraag => ({
    id: `stap13-wijst-${uur}`, waar: `uitleg, stap 13 (de kleine wijzer draait naar de ${uur})`, kijk: true,
    vraag: [["Naar welk getal wijst de kleine wijzer?"], ["Hij draait weer.", "Waar wijst hij nu naar?"], ["Nog 1 keer.", "Naar welk getal wijst hij nu?"]][i],
    opnieuw: ["Naar welk getal wijst de kleine wijzer?"],
    opties: [String(uur), String(((uur + 5) % 12) + 1), "12"], goed: String(uur), fouten: heleKlok(uur, [uur, ((uur + 5) % 12) + 1, 12], false),
  })),
  {
    id: "stap15-grote-steeds", waar: "uitleg, stap 15 (waar stond de grote wijzer steeds?)", kijk: true, vraag: ["Waar stond de grote wijzer elke keer?"], opties: ["6", "12"], goed: "12",
    opnieuw: ["Waar stopte de grote wijzer?"], naGoed: ["Elke keer recht omhoog, naar de {12:paars}."], samen: ["De grote wijzer wijst recht omhoog, naar de {12:paars} in de ring."],
    fouten: { "6": F("verkeerde-wijzer", "korte-wijzer", "keek naar de kleine wijzer, die nu bij de 6 staat", "Bij de 6 staat nu de kleine wijzer.", "Let goed op de grote wijzer.", "licht-minuut") },
  },
  /* Stap 16: de 2 uitlegvragen van de oude les squla-klok-hoelaat-1 (uitlegHeel), met dezelfde keuzes. */
  { id: "stap16-wijst-3", waar: "uitleg, stap 16 (klok op 3 uur; vraag uit de oude les)", kijk: true, vraag: ["Naar welk getal wijst de kleine wijzer?"], opties: ["12", "3", "6"], goed: "3", fouten: heleKlok(3, [12, 3, 6], false) },
  { id: "stap16-hoe-laat", waar: "uitleg, stap 16 (klok op 3 uur; vraag uit de oude les)", vraag: ["Hoe laat is het dus?"], opties: ["12 uur", "6 uur", "3 uur"], goed: "3 uur", naGoed: ["De kleine wijzer wijst naar de {3:oranje} en de grote staat op de {12:paars}."], fouten: heleKlok(3, [12, 6, 3], true) },
  {
    id: "stap17-6-uur", waar: "uitleg, stap 17 (klok op 6 uur)", vraag: ["Hoe laat is het nu?"], opties: ["6 uur", "12 uur", "6 minuten"], goed: "6 uur",
    fouten: {
      "12 uur": klokFout(12, 6, true),
      "6 minuten": F("uur-minuten-verwisseld", "uur-minuten", "zag de 6 goed, maar zei minuten in plaats van uur", "Je vond de 6, dat zag je goed.", "Welke wijzer wijst naar de 6? Die vertelt het uur.", "licht-uur"),
    },
  },
  {
    id: "stap18-strik", waar: "uitleg, stap 18 (half 8: is het 7 uur?)", lastig: true, vraag: ["Let op, deze is lastig.", "Is het nu 7 uur?"], opties: ["Ja", "Nee"], goed: "Nee",
    opnieuw: ["Is het nu 7 uur?"],
    naGoed: ["Bij een heel uur wijst de grote wijzer recht omhoog. Deze wijst naar beneden.", "De kleine wijzer is de {7:oranje} al voorbij, maar nog niet bij de {8:oranje}."],
    samen: ["Bij een heel uur wijst de grote wijzer recht omhoog. Deze wijst naar beneden.", "De kleine wijzer is de {7:oranje} al voorbij, maar nog niet bij de {8:oranje}.", "Dus het is nog geen {7:oranje} uur."],
    fouten: { Ja: F("geen-heel-uur", "geen-heel-uur", "keek alleen naar de kleine wijzer bij de 7, niet naar de grote", "Je keek naar de kleine wijzer bij de 7.", "Bij een heel uur wijst de grote wijzer recht omhoog. Deze wijst naar beneden.", "licht-minuut") },
  },
];

/** De 13 klokken van het oefenblok (inhoud van squla-klok-hoelaat-1). */
export const KLOKKEN = [
  { uur: 1, opties: [1, 9, 8], zin: "De bezorgbus staat klaar bij de bakkerij.", ding: "bezorgbus", plek: "naast", naspeel: "laden" },
  { uur: 12, opties: [12, 10, 11], zin: "De zon staat hoog. De bus rijdt weg.", ding: "zon", plek: "hoog" },
  { uur: 1, opties: [2, 12, 1], zin: "De bus rijdt weer terug.", ding: "bezorgbus", plek: "naast", naspeel: "rijden" },
  { uur: 4, opties: [6, 4, 5], zin: "De zon staat al lager.", ding: "zon", plek: "laag" },
  { uur: 11, opties: [11, 7, 8], zin: "De bus haalt nieuwe broodjes bij de bakkerij.", ding: "bakkerij", plek: "sfeer" },
  { uur: 7, opties: [7, 11, 6], zin: "De bezorgbus staat klaar bij de bakkerij.", ding: "bezorgbus", plek: "naast", naspeel: "laden", weetje: "Vroeg in de ochtend begint de dag." },
  { uur: 8, opties: [8, 9, 1], zin: "De bezorgbus vertrekt.", ding: "bezorgbus", plek: "naast", naspeel: "wegrijden" },
  { uur: 9, opties: [9, 3, 10], zin: "De zon schijnt. De bus rijdt naar de eerste halte.", ding: "zon", plek: "sfeer", weetje: "De zon schijnt overdag." },
  { uur: 10, opties: [10, 2, 11], zin: "De bus komt bij de eerste halte.", ding: "bezorgbus", plek: "naast", naspeel: "rijden" },
  { uur: 2, opties: [2, 10, 1], zin: "De bus rijdt weer weg.", ding: "bezorgbus", plek: "naast", naspeel: "wegrijden" },
  { uur: 3, opties: [3, 9, 4], zin: "De bus komt bij de tweede halte.", ding: "bezorgbus", plek: "naast", naspeel: "rijden" },
  { uur: 5, opties: [5, 4, 11], zin: "De bus is terug bij de bakkerij.", ding: "bakkerij", plek: "sfeer" },
  { uur: 6, opties: [6, 5, 12], zin: "Het wordt donker. De maan komt op.", ding: "maan", plek: "sfeer", weetje: "De maan zie je als het donker wordt." },
] as const;

export const KLOKVRAGEN: Vraag[] = KLOKKEN.map((k, i) => {
  const fouten = heleKlok(k.uur, [...k.opties], true);
  /* Klok 2 (12 uur): beide wijzers staan op de 12; "verkeerde wijzer" kan daar niet. Algemene hint die naar 1 keuze wijst (14.31). */
  if (k.uur === 12) for (const f of Object.values(fouten)) if (f.code === "onduidelijk") f.hint = "Beide wijzers wijzen naar hetzelfde getal.";
  return {
    id: `klok${i + 1}-${k.uur}uur`,
    waar: `oefenblok, klok ${i + 1} (${k.uur} uur)`,
    vraag: [`${k.zin} Hoe laat is het?`],
    opties: k.opties.map((n) => `${n} uur`),
    goed: `${k.uur} uur`,
    opnieuw: ["Hoe laat is het?"],
    ...("weetje" in k ? { naGoed: [k.weetje] } : {}),
    fouten,
  };
});

/** Samen voordoen na de 3e fout (nu pas het antwoord). */
export const VOORDOEN = {
  klok: (uur: number) => [`Kijk, de kleine wijzer wijst naar de ${o(uur)}, in de ring.`, `De grote wijzer staat op de {12:paars}. Dus het is ${o(uur)} uur.`],
  klokTik: (uur: number) => `Tik nu zelf op ${o(uur)} uur.`,
  getal: (uur: number) => `De punt van de kleine wijzer staat bij de ${o(uur)}, in de ring.`,
  getalTik: (n: number, kleur: "oranje" | "paars" | null = "oranje") => (kleur ? `Tik nu zelf op de {${n}:${kleur}}.` : `Tik nu zelf op de ${n}.`),
  woordTik: (w: string) => `Tik nu zelf op: ${w}.`,
};

export function vraagMet(id: string): Vraag {
  const v = [...UITLEGVRAGEN, ...KLOKVRAGEN].find((x) => x.id === id);
  if (!v) throw new Error(`Geen vraag met id ${id}`);
  return v;
}
