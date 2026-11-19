/**
 * ALLE ZINNEN VAN BLIEPO in de EXTRA les Plussommen (squla-plus-bakkerij-1-gouden-extra, 12 november 2026), op één plek,
 * met de FOUTTABEL. De les zelf (squla-plussommen-extra-gouden.tsx) bevat geen eigen zinnen.
 *
 * Besluit Sara (12 november 2026, 22.3): de Synthesis-opdrachten uit het draaiboek Plussommen die niet in de Squla-les
 * zitten, als EXTRA les naast de gouden les. Het zijn de stappen van SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/plussommen.md
 * (Adding below 10) met de getaltegels, met dezelfde getallen (tegels 1 t/m 9, totalen 5 t/m 10, doelen 7 en 10):
 *   stap 1-3  een tegel kiezen en zeggen welk getal het is (3 keer);
 *   stap 4+6  twee tegels samen: wat is het totaal? (2 keer; de bak 1-4 en 3-5);
 *   stap 7    maak samen 7 (1 tegel gekozen, de tegel zoeken die erbij hoort);
 *   stap 8    maak samen 10, de som kiezen (3 sommen), omwisselen ("ik draai ze om; wat is het totaal nu?");
 *   stap 12   nog een manier om 10;
 *   stap 13   einde.
 * Niet gebouwd: de som zelf typen (stap 10): een getal typen kan met het echte invulvak, maar de Squla-les heeft die stap
 * ook niet; de som staat in de keuzevraag. De zijroute na 2 fouten is vervangen door 2 pogingen (15.11).
 * De rijtjes (lof, speciale momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is) zijn die
 * van de gouden klokles (BLIEPO-KARAKTER.md). De FOUTTABEL is EIGEN INVULLING, NIET VAN SYNTHESIS (BOUWREGELS 15.9).
 *
 * 18 november 2026 (Sara, na de proefles Tellen): elke zin nagelopen (warm, kort, gewone woorden, nooit "fout", een getal
 * nooit 2 keer achter elkaar) en elke situatie die terugkomt in varianten. Een lijst = varianten: de les kiest er 1 met de
 * gedeelde kiezer (nooit-dubbel.ts), nooit 2 keer achter elkaar dezelfde. "Rooster" is "veld" geworden en "totaal" is
 * "samen" (WOORDEN-GROEP3.md). Getallen, antwoorden en betekenis zijn niet veranderd. Oud naast nieuw:
 * WIJZIGINGEN-ZINNEN-PLUSSOMMEN.md. Een paar zinnen zijn de tekst van Synthesis (Adding below 10) in het Nederlands
 * (besluit Sara 17 november 2026, BOUWREGELS 15.2): "Kies maar een tegel die jij wilt." (19 nov 2026; was "…, welke je wilt."), "7? Ik tel er meer.",
 * "3 en 5 samen is iets meer dan 7.", "Je hebt de 3 en de 7 naast elkaar gezet.", "Wat gebeurt er als ik de tegels
 * omdraai?", "Je mag de getallen omdraaien.", "Precies, 3 + 4 = 7.".
 *
 * Leesbare versie: FOUTTABEL-squla-plus-bakkerij-1-gouden-extra.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-plussommen-extra-gouden.ts`). {5} = een getal in de kleur van zijn tegel.
 */

import { OND_FOUT, type Fout, type Rijtje } from "./squla-extra-zuiver";
import { deeltStuk, type Kiezer } from "./nooit-dubbel";

export { BEVESTIG, EINDE, LOF, MOMENT, NAAM_LOF, type Rijtje } from "./squla-extra-zuiver";
export { NAAM_GROET } from "./squla-klok-gouden-zinnen";

const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });

/** "{3} + {4} = {7}" met elk getal in de kleur van zijn tegel. */
export const som = (a: number, b: number, t: number) => `{${a}} + {${b}} = {${t}}`;
export const g = (n: number) => `{${n}}`;

/* ---------- vaste zinnen van het verloop ---------- */

export const ZIN = {
  /** Stap 1: openen (het draaiboek heeft geen startvraag). Eerst wat we gaan doen (1 van de varianten), dan de tegels. */
  begin: ["Vandaag rekenen we met tegels.", "We gaan samen rekenen met tegels."],
  beginTegels: "Elke tegel heeft vakjes. Tel de vakjes, dan weet je welk getal het is.",
  kies1: "Kies maar een tegel die jij wilt. Zet hem op het veld.",
  kiesAnder: ["Kies een andere tegel.", "Zet er nog {1:wit} op het veld.", "Nu een andere tegel. Kies maar."],
  /** Hulphandje bij een tegel kiezen en zetten (15.19). */
  kiesHand: ["Tik op een tegel. Tik dan op het veld.", "Tik eerst op een tegel. Tik daarna op het veld."],
  /** Stap 2: welk getal? (elke keer anders verwoord, draaiboek stap 2). */
  welkGetal: ["Welk getal is dit?", "Welk getal heb je gekozen?", "Welk getal hoort bij deze tegel?"],
  getalGoed: (n: number) => [`Het is een ${g(n)}.`, `Dit is de ${g(n)}.`, `Klopt, het is een ${g(n)}.`],
  /** Bliepo heeft de vakjes geteld (in beeld). Het getal staat er 1 keer (was: "Ik tel 5 vakjes. Het is een 5."). */
  getalTel: (n: number) => [`Het zijn ${g(n)} vakjes. Dat is het getal van deze tegel.`, `Ik tel ${g(n)} vakjes. Zo weet je welk getal het is.`],
  /** Stap 4 en 6: twee tegels. */
  tweeTegels: ["Zet nu {2:wit} tegels op het veld.", "Kies zelf welke."],
  tweeTegelsNog: "Kies {2:wit} andere tegels.",
  vraagTotaal: (a: number, b: number) => [`Je koos de ${g(a)} en de ${g(b)}.`, "Hoeveel is dat samen?"],
  totaalTel: (a: number, b: number, t: number) => [`${g(a)} en ${g(b)} is samen ${g(t)}.`, `Kijk: ${g(a)} en ${g(b)} is samen ${g(t)}.`],
  /** Stap 7 en 10: maak samen N. */
  zetEen: "Zet een nieuwe tegel op het veld.",
  maakSamen: (gekozen: number, doel: number) => [`Je koos een ${g(gekozen)}.`, `Maak er samen ${g(doel)} van. Welke tegel moet erbij?`],
  moeilijker: ["{naam}, je snapt het al goed.", "Nu maken we het een beetje moeilijker.", "Pak een nieuwe tegel."],
  maakSamen10: (gekozen: number) => [`Je koos een ${g(gekozen)}.`, `Zet er een tegel bij, zodat het samen ${g(10)} is.`],
  samenGoed: (a: number, b: number, t: number) => [`${som(a, b, t)}.`, `Kijk: ${som(a, b, t)}.`, `Zo past het: ${som(a, b, t)}.`],
  samenZet: ["Kijk, zo'n tegel past erbij. Zet hem op het veld.", "Zie je de schaduw? Zo'n tegel hoort erbij. Zet hem op het veld.", "Deze tegel past erbij. Zet hem op het veld."],
  samenZelf: (a: number, b: number, t: number) => [`Kijk, ik zet hem erbij. ${som(a, b, t)}.`, `Kijk, ik leg de tegel erbij. ${som(a, b, t)}.`],
  /** Stap 9: de som. De som zelf is net gezegd ("3 + 7 = 10"), dus hier niet nog een keer de getallen. */
  vraagSom: ["Van deze {2:wit} tegels kun je een som maken.", "Welke som hoort erbij?"],
  somGoed: (a: number, b: number) => [`De som is ${som(a, b, 10)}.`, `Zo schrijf je het: ${som(a, b, 10)}.`],
  somUitleg: "Je zet de tegels bij elkaar. Daarom schrijf je een plus.",
  somSamen: (a: number, b: number) => [`Kijk, zo schrijf je het: ${som(a, b, 10)}.`, `Kijk, dit is de som: ${som(a, b, 10)}.`],
  /** Stap 11: omwisselen. */
  omdraaien: ["Wat gebeurt er als ik de tegels omdraai?", "Kijk goed mee."],
  nuBovenop: (p: number) => [`Nu ligt de ${g(p)} bovenop.`, "Hoeveel is het nu samen?"],
  omGoed: (a: number, b: number) => [`${som(a, b, 10)} en ${som(b, a, 10)}. Je mag de getallen omdraaien.`, `${som(a, b, 10)} en ${som(b, a, 10)}. Omdraaien mag: het blijft evenveel.`],
  omTel: [`Het zijn dezelfde tegels. Het is nog steeds ${g(10)}. Omdraaien maakt niet uit.`, `Het zijn dezelfde vakjes. Samen blijft het ${g(10)}. Je mag de getallen omdraaien.`],
  /** Stap 12: nog een manier. */
  nogManier: [`Laten we nog een manier vinden om ${g(10)} te maken.`, "Kies een andere tegel."],
  /** Stap 13: einde. */
  slot: [`Je hebt sommen gemaakt tot wel ${g(10)}!`, `Wat heb jij goed opgeteld met de tegels: tot wel ${g(10)}!`, `Knap, hoor! Je kunt al optellen tot ${g(10)}.`],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
  /** Aanmoediging bij het hulphandje (het kind moet tikken, niet nadenken; 14.35). */
  aanmoedigTikken: ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."],
  /** Hetzelfde antwoord 2 keer: niet 2 keer dezelfde eerste zin. */
  weerGekozen: (x: string) => [`Je koos weer ${x}.`, `Je tikte weer op ${x}.`, `Weer ${x}, zie ik.`],
};

/** Bewaard voor wie hem nog laadt (nu 5 varianten in ZIN.aanmoedigTikken). */
export const AANMOEDIG_TIKKEN = ZIN.aanmoedigTikken;

/** Reactie bij goed (draaiboek stap 7: lof met de som erin). 5 is de zin van Synthesis ("precies; 2 + 3 = 5"). */
export const SOMREACTIE = (a: number, b: number, t: number) =>
  rij([`Dat klopt: ${som(a, b, t)}.`, `Ja, ${g(a)} en ${g(b)} maken samen ${g(t)}.`, `${som(a, b, t)}, precies.`, `Je hebt ${g(t)} gemaakt met de ${g(a)} en de ${g(b)}.`, `Inderdaad, zo kom je op ${g(t)}.`, `Precies, ${som(a, b, t)}.`], [4]);
export const SOMREACTIE_ROBOT = 4;

/* ---------- denkfouten (draaiboek Plussommen §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["te-weinig-hokjes", "te-veel-hokjes", "samen-te-weinig", "samen-te-veel", "cijfers-naast-elkaar", "plus-min-verwisseld", "totaal-verandert-bij-omwisselen", "onduidelijk"] as const;

/** Alle varianten bij 1 antwoord dat niet goed is (18 nov 2026); de les kiest er steeds 1, nooit 2 keer achter elkaar dezelfde. */
export type Varianten = { eerste: string[]; hint: string[]; uitleg: string[]; weerEerste: string[]; weerUitleg: string[] };
/** Een regel van de fouttabel met zijn varianten. `eerste`, `hint`, `uitleg` en `weer` zijn 1 vaste variant (voor de fouttabel). */
export type FoutV = Fout & { v?: Varianten };

const SCHERM = "vraag en knoppen even weg; Bliepo's scherm 1,5 s rood; met de hint komen de knoppen meteen terug (geen pijl)";
const NOOT = "richting niet genoemd: dan bleef er maar 1 keuze over";

const kaalZin = (z: string) => z.replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1").replace(/\{(\d+)\}/g, "$1");
const getallenIn = (z: string) => kaalZin(z).match(/\d+/g) ?? [];
/** Een getal staat niet 2 keer in 1 variant; blijven er minder dan 2 over, dan blijft het rijtje zoals het was. */
const zonderDubbel = (l: string[]) => {
  const over = l.filter((z) => new Set(getallenIn(z)).size === getallenIn(z).length);
  return over.length >= 2 ? over : l;
};
const metV = (basis: Omit<Fout, "eerste" | "hint" | "uitleg" | "weer">, nr: number, v: Varianten): FoutV => {
  const vast = (l: string[]) => l[nr % l.length] ?? "";
  return { ...basis, eerste: vast(v.eerste), hint: vast(v.hint), uitleg: vast(v.uitleg), weer: v.weerEerste.length ? [vast(v.weerEerste), vast(v.weerUitleg)].filter(Boolean) : [], v };
};

/** Getallen om uit te kiezen: het goede en 2 getallen dichtbij, allemaal van 1 tot en met `max`. */
export function dichtbij(n: number, max: number): number[] {
  const kand = [n - 1, n + 1, n - 2, n + 2].filter((x) => x >= 1 && x <= max);
  return [n, ...kand.slice(0, 2)].sort((a, b) => a - b);
}

/** De eerste zin als Bliepo de richting niet noemt (zou het antwoord verklappen, 15.17): alle keuzes liggen dichtbij. */
const DICHTBIJ = (X: string) => [`Je koos ${X}. Je zit er dichtbij.`, `Je koos ${X}. Dat scheelt niet veel.`, `Bijna! ${X} is het net niet.`, `${X}? Dat is heel dichtbij.`, `Je tikte op ${X}. Het scheelt maar een klein beetje.`];

/**
 * Stap 2: welk getal? Draaiboek §3 A: de tutor noemt de richting ("ik tel er een paar meer"). Zou de richting maar 1 keuze
 * overlaten (bij 1, 2 of 9), dan noemt Bliepo de richting NIET (15.17): alleen "dichtbij".
 */
export function getalFout(x: number, goed: number, opties: number[], nr = 0): FoutV {
  const kant = opties.filter((k) => k !== x && (x < goed ? k > x : k < x));
  const verklapt = kant.length === 1;
  const X = g(x);
  const paar = Math.abs(goed - x) === 1 ? "{1:wit} vakje" : "een paar vakjes";
  /* Hints zonder richting (mogen altijd): alleen hoe je telt. */
  const hint = ["Tel de vakjes van de tegel. Wijs ze stuk voor stuk aan.", "Kijk goed naar de tegel en tel de vakjes rustig.", "Tel de vakjes nog eens. Je mag ze met je vinger aanwijzen.", "Probeer het nog eens. Tel de vakjes en tik op het getal."];
  if (x < goed)
    return metV({ code: "te-weinig-hokjes", soort: "te-weinig-hokjes", denkfout: "telde er te weinig vakjes (sloeg er een over)", scherm: SCHERM, ...(verklapt ? { noot: NOOT } : {}) }, nr, {
      eerste: verklapt ? DICHTBIJ(X) : [`Je koos ${X}. De tegel heeft meer vakjes.`, `Bijna! ${X} is nog iets te weinig.`, `${X}? Ik tel er meer.`, `Je tikte op ${X}. Ik zie nog meer vakjes.`],
      hint,
      uitleg: [`Je hebt ${paar} overgeslagen. We tellen ze allemaal.`, `Je hebt ${paar} niet meegeteld. We tellen ze samen.`, `De tegel heeft ${paar} meer. We tellen ze samen.`],
      weerEerste: verklapt ? [] : ["Je telde er weer te weinig.", "Het zijn er weer iets te weinig.", "Weer iets te weinig, zie ik."],
      weerUitleg: verklapt ? [] : ["We tellen ze rustig, stuk voor stuk.", "Elk vakje telt mee. We tellen ze samen."],
    });
  return metV({ code: "te-veel-hokjes", soort: "te-veel-hokjes", denkfout: "telde er te veel vakjes (telde een vakje 2 keer)", scherm: SCHERM, ...(verklapt ? { noot: NOOT } : {}) }, nr, {
    eerste: verklapt ? DICHTBIJ(X) : [`Je koos ${X}. Zo veel vakjes heeft de tegel niet.`, `Bijna! ${X} is iets te veel.`, `${X}? Ik tel er minder.`, `Je tikte op ${X}. Dat zijn er iets te veel.`],
    hint,
    uitleg: [`Je hebt ${paar} {2:wit} keer geteld. We tellen ze stuk voor stuk.`, `De tegel heeft ${paar} minder. We tellen ze samen.`, `Je telde ${paar} te veel. We tellen ze samen.`],
    weerEerste: verklapt ? [] : ["Je telde er weer te veel.", "Het zijn er weer iets te veel.", "Weer iets te veel, zie ik."],
    weerUitleg: verklapt ? [] : ["We tellen ze rustig, stuk voor stuk.", "Elk vakje tel je maar {1:wit} keer. We tellen ze samen."],
  });
}

/** Stap 4 en 6: wat 2 tegels samen zijn. Draaiboek §3 D ("3 en 5 samen is iets meer dan 7; tel nog eens"). */
export function totaalFout(x: number, a: number, b: number, opties: number[], nr = 0): FoutV {
  const t = a + b;
  const kant = opties.filter((k) => k !== x && (x < t ? k > x : k < x));
  const verklapt = kant.length === 1;
  const X = g(x);
  const hint = zonderDubbel([`Tel de vakjes van de ${g(a)} en de ${g(b)} samen.`, "Tel de vakjes van allebei de tegels.", "Probeer het nog eens. Tel de vakjes en tik op het getal.", `Begin bij de ${g(a)} en tel de vakjes van de ${g(b)} erbij.`]);
  if (x < t)
    return metV({ code: "samen-te-weinig", soort: "samen-te-weinig", denkfout: "telde er te weinig bij elkaar", scherm: SCHERM, ...(verklapt ? { noot: NOOT } : {}) }, nr, {
      eerste: verklapt ? DICHTBIJ(X) : zonderDubbel([`Je koos ${X}. Samen zijn het er meer.`, `Bijna! ${X} is nog iets te weinig.`, `${g(a)} en ${g(b)} samen is iets meer dan ${X}.`, `${X}? Ik tel meer vakjes.`]),
      hint,
      uitleg: ["Alle vakjes van allebei de tegels tellen mee.", "Je hebt nog niet alle vakjes geteld.", "Samen hebben de tegels meer vakjes."],
      weerEerste: verklapt ? [] : ["Je telde weer te weinig.", "Het is weer te weinig.", "Weer te weinig, zie ik."],
      weerUitleg: verklapt ? [] : ["Alle vakjes van allebei de tegels tellen mee.", "We tellen de vakjes van de {2:wit} tegels samen."],
    });
  return metV({ code: "samen-te-veel", soort: "samen-te-veel", denkfout: "telde er te veel bij elkaar", scherm: SCHERM, ...(verklapt ? { noot: NOOT } : {}) }, nr, {
    eerste: verklapt ? DICHTBIJ(X) : zonderDubbel([`Je koos ${X}. Samen zijn het er minder.`, `Bijna! ${X} is iets te veel.`, `${g(a)} en ${g(b)} samen is iets minder dan ${X}.`, `${X}? Ik tel minder vakjes.`]),
    hint,
    uitleg: ["Elk vakje telt maar {1:wit} keer.", "Je hebt vakjes {2:wit} keer geteld.", "Samen hebben de tegels minder vakjes."],
    weerEerste: verklapt ? [] : ["Je telde weer te veel.", "Het is weer te veel.", "Weer te veel, zie ik."],
    weerUitleg: verklapt ? [] : ["Elk vakje telt maar {1:wit} keer.", "We tellen elk vakje precies {1:wit} keer."],
  });
}

/**
 * Stap 7, 8 en 12: de tegel zoeken die er samen met de gekozen tegel `doel` van maakt. Draaiboek §3 C: de tutor laat het
 * kind zelf zien wat het maakte ("je hebt een 1 en een 1; wat maakt dat?").
 */
export function aanvulFout(gekozen: number, k: number, doel: number): FoutV {
  const s = gekozen + k;
  const wat = s < doel ? "te weinig" : "te veel";
  const soort = s < doel ? "samen-te-weinig" : "samen-te-veel";
  const G = g(gekozen);
  const Kk = g(k);
  const S = g(s);
  const D = g(doel);
  return metV(
    { code: soort, soort, denkfout: s < doel ? "de 2 tegels samen zijn te weinig" : "de 2 tegels samen zijn te veel", scherm: "de foute tegel verschijnt even en verdwijnt weer; Bliepo's scherm 1,5 s rood; de gekozen tegel blijft liggen; met de hint mag het kind weer een tegel zetten" },
    0,
    {
      eerste: [`${G} en ${Kk} is samen ${S}. Dat is ${wat}.`, `Met de ${Kk} erbij wordt het ${S}. Dat is ${wat}.`, `Je koos de ${Kk}. Samen met de ${G} is dat ${S}. Dat is ${wat}.`],
      hint: [`Zoek een tegel, zodat het samen ${D} wordt.`, `Welke tegel maakt er samen ${D} van?`, `Probeer het nog eens. Zoek de tegel die er samen ${D} van maakt.`],
      uitleg: [`Je hebt al ${G} vakjes. Er moeten ${D} komen.`, `Bij de ${G} moeten nog vakjes komen, tot het er ${D} zijn.`],
      weerEerste: [`Dat is weer ${wat}: ${G} en ${Kk} is samen ${S}.`, `Weer ${wat}, zie ik. ${G} en ${Kk} is samen ${S}.`, `Het is weer ${wat}. Met de ${Kk} wordt het ${S}.`],
      weerUitleg: [`Er moeten ${D} vakjes komen.`, `Samen moet het ${D} zijn.`],
    },
  );
}

/** Stap 9: de som kiezen (3 sommen). Draaiboek §3 E: cijfers naast elkaar, min in plaats van plus. */
export function somKeuzes(p: number, q: number): string[] {
  return [`${p} + ${q} = 10`, `${p} + ${q} = ${p}${q}`, `${Math.max(p, q)} − ${Math.min(p, q)} = 10`];
}
export function somFout(x: string, p: number, q: number): FoutV {
  const [, naast, min] = somKeuzes(p, q);
  if (x === naast)
    return metV({ code: "cijfers-naast-elkaar", soort: "cijfers-naast-elkaar", denkfout: "zette de getallen naast elkaar (3 en 7 werd 37)", scherm: SCHERM }, 0, {
      eerste: ["Je zette de getallen naast elkaar.", `Je hebt de ${g(p)} en de ${g(q)} naast elkaar gezet.`, "In deze som staan de getallen naast elkaar."],
      hint: ["Je telt de tegels bij elkaar op. Hoeveel is dat samen?", "Achter het is-teken staat hoeveel het samen is. Welke som hoort erbij?", "Tel de vakjes van de tegels. Dat getal komt achter het is-teken."],
      uitleg: ["Achter het is-teken staat hoeveel de tegels samen zijn.", "Naast elkaar is een ander getal. We tellen de tegels juist bij elkaar op."],
      weerEerste: ["Je zette de getallen weer naast elkaar.", "Dat zijn weer de getallen naast elkaar.", "Weer naast elkaar, zie ik."],
      weerUitleg: ["Achter het is-teken staat hoeveel de tegels samen zijn.", "We tellen de tegels bij elkaar op."],
    });
  if (x === min)
    return metV({ code: "plus-min-verwisseld", soort: "plus-min-verwisseld", denkfout: "koos een min in plaats van een plus", scherm: SCHERM }, 0, {
      /* Was "Kijk goed naar het teken.": dat is een opdracht, geen reactie op wat het kind koos. */
      eerste: ["Je koos een som met een min.", "In deze som staat een min.", "Je tikte op de som met een min."],
      hint: ["We doen de tegels bij elkaar. Kies de som met een plus.", "De tegels komen bij elkaar. Zoek een som met een plus.", "Bij een min gaat er iets weg. Hier komt er iets bij. Welke som hoort erbij?"],
      uitleg: ["Bij elkaar doen is een plus.", "Bij een min gaat er iets weg. Hier komt er een tegel bij."],
      weerEerste: ["Je koos weer een min.", "Dat is weer de som met een min.", "Weer de min, zie ik."],
      weerUitleg: ["Bij elkaar doen is een plus.", "Erbij schrijf je met een plus."],
    });
  return OND_FOUT("Je doet de tegels bij elkaar. Kies de som met een plus.", ZIN.somUitleg);
}

/** Stap 11: omwisselen (keuzes 10, 9 en 11). Draaiboek §3 F: het blijft evenveel ("11? dat is net te hoog; tel ze nog eens"). */
export function omwisselFout(x: number): FoutV {
  const wat = x < 10 ? "te weinig" : "te veel";
  return metV({ code: "totaal-verandert-bij-omwisselen", soort: "totaal-verandert-bij-omwisselen", denkfout: "denkt dat het totaal verandert als de tegels omgedraaid liggen", scherm: SCHERM }, x, {
    eerste: [`${g(x)}? Dat is net ${wat}.`, `Je koos ${g(x)}. Dat is iets ${wat}.`, `Bijna! ${g(x)} is net ${wat}.`],
    hint: ["Tel de vakjes nog eens, stuk voor stuk.", "Probeer het nog eens. Tel de vakjes van de tegels.", "Kijk goed naar de tegels en tel de vakjes rustig."],
    uitleg: ["Ze liggen alleen anders. Het zijn nog steeds dezelfde vakjes.", "De tegels zijn alleen omgedraaid. Er kwam geen vakje bij en er ging er geen weg."],
    /* 9 en daarna 11 is niet "weer hetzelfde": dan de gewone eerste zin met de uitleg. */
    weerEerste: [],
    weerUitleg: [],
  });
}

/* ---------- kiezen uit de varianten (zuiver: de les en het fouttabel-script gebruiken allebei deze functies) ---------- */

/** Hebben 2 zinnen een getal gemeen? (Dan liever een andere variant: een getal niet 2 keer achter elkaar.) */
export const deeltGetal = (p: string, q: string) => {
  const P = new Set(getallenIn(p));
  return getallenIn(q).some((n) => P.has(n));
};
/** Woorden waarmee Bliepo zegt dat het bijna goed was. Bij 1 vraag komt zo'n woord hooguit 1 keer (geleerd bij Tellen). */
const KERN = /dichtbij|bijna|scheelt/gi;
export const zelfdeKern = (a: string, b: string) => {
  const A = new Set((a.match(KERN) ?? []).map((w) => w.toLowerCase()));
  return (b.match(KERN) ?? []).some((w) => A.has(w.toLowerCase()));
};
export function tweedeEerste(alle: string[], eersteZin: string): string[] {
  const over = alle.filter((z) => !zelfdeKern(eersteZin, z));
  return over.length ? over : alle;
}

/**
 * Kiest per antwoord dat niet goed is de zinnen uit de varianten van de fouttabel: precies de 2 zinnen die Bliepo gaat
 * zeggen. 1e keer: eerste zin + hint. 2e keer: eerste zin + uitleg; of "weer" + een andere uitleg bij dezelfde denkfout
 * (alleen als Bliepo de 1e keer al zei wat er mis was); of "Je koos weer …" bij hetzelfde antwoord. Eén kiezer per vraag:
 * hij onthoudt de 1e keer. De regel die hij teruggeeft heeft geen `weer` meer: `eerste` en `uitleg` zijn dan al de goede
 * zinnen (squla-extra-basis zegt bij de 2e keer `eerste` + `uitleg`).
 */
export function maakFoutKiezer(K: Kiezer, weerGekozen: (x: string) => string[]) {
  let eerder: { x: string; f: FoutV; zin: string } | null = null;
  const past = (e: string) => (z: string) => !deeltStuk(e, z) && !deeltGetal(e, z);
  return (x: string, f: FoutV): Fout => {
    const v = f.v;
    if (!v || !v.eerste.length) {
      eerder ??= { x, f, zin: f.eerste };
      return f;
    }
    if (!eerder) {
      const eerste = K.kies("eerste", v.eerste);
      eerder = { x, f, zin: eerste };
      return { ...f, eerste, hint: K.kies("hint", v.hint, past(eerste)), weer: [] };
    }
    if (eerder.f.soort === f.soort && !eerder.f.noot && !f.noot && v.weerEerste.length) {
      const weer = K.kies("weer", v.weerEerste);
      return { ...f, eerste: weer, uitleg: K.kies("uitleg", v.weerUitleg, (z) => !deeltStuk(weer, z)), weer: [] };
    }
    const eerste = x === eerder.x ? K.kies("weerGekozen", weerGekozen(x)) : K.kies("eerste", tweedeEerste(v.eerste, eerder.zin));
    return { ...f, eerste, uitleg: K.kies("uitleg", v.uitleg, past(eerste)), weer: [] };
  };
}
