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
 * Leesbare versie: FOUTTABEL-squla-plus-bakkerij-1-gouden-extra.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-plussommen-extra-gouden.ts`). {5} = een getal in de kleur van zijn tegel.
 */

import { OND_FOUT, type Fout, type Rijtje } from "./squla-extra-zuiver";

export { BEVESTIG, EINDE, LOF, MOMENT, NAAM_LOF, type Rijtje } from "./squla-extra-zuiver";
export { NAAM_GROET } from "./squla-klok-gouden-zinnen";

const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });

/** "{3} + {4} = {7}" met elk getal in de kleur van zijn tegel. */
export const som = (a: number, b: number, t: number) => `{${a}} + {${b}} = {${t}}`;
export const g = (n: number) => `{${n}}`;

/* ---------- vaste zinnen van het verloop (eigen woorden) ---------- */

export const ZIN = {
  /** Stap 1: openen (het draaiboek heeft geen startvraag). */
  begin: ["In deze les werk je met tegels.", "Op elke tegel zie je hokjes. Zo weet je welk getal het is."],
  kies1: "Kies een tegel en zet hem in het rooster.",
  kies1Hand: "Tik op een tegel. Tik dan in het rooster.",
  kiesAnder: ["Kies een andere tegel.", "Zet er nog een in.", "Nog een tegel, een andere."],
  kiesHand: "Tik op een tegel. Tik dan in het rooster.",
  /** Stap 2: welk getal? (elke keer anders verwoord, draaiboek stap 2). */
  welkGetal: ["Welk getal is dit?", "Weet je welk getal dit is?", "Welk getal heb je hier gekozen?"],
  getalGoed: (n: number) => `Het is een ${g(n)}.`,
  getalTel: (n: number) => `Ik tel ${g(n)} hokjes. Het is een ${g(n)}.`,
  /** Stap 4 en 6: twee tegels. */
  tweeTegels: ["Zet nu 2 tegels in het rooster.", "Kies zelf welke."],
  tweeTegelsNog: "Kies 2 andere tegels.",
  tweeTegelsHand: "Tik op een tegel. Tik dan in het rooster.",
  vraagTotaal: (a: number, b: number) => [`Je koos de ${g(a)} en de ${g(b)}.`, "Wat is het totaal?"],
  totaalTel: (a: number, b: number, t: number) => `${g(a)} en ${g(b)} is samen ${g(t)}.`,
  /** Stap 7 en 10: maak samen N. */
  zetEen: "Zet een nieuwe tegel in het rooster.",
  maakSamen: (gekozen: number, doel: number) => [`Je koos een ${g(gekozen)}.`, `Maak er samen ${g(doel)} van. Welke tegel moet erbij?`],
  moeilijker: ["{naam}, je krijgt het door.", "Nu maken we het moeilijker.", "Pak een nieuwe tegel."],
  maakSamen10: (gekozen: number) => [`Je koos een ${g(gekozen)}.`, `Zet er een tegel bij, zodat het samen ${g(10)} is.`],
  samenGoed: (a: number, b: number, t: number) => `${som(a, b, t)}.`,
  samenZet: (nr = 0) => ["Kijk, zo'n tegel past erbij. Zet hem in het rooster.", "Zie je de schaduw? Zo'n tegel hoort erbij. Zet hem in het rooster.", "Deze tegel past erbij. Zet hem in het rooster."][nr % 3],
  samenZelf: (a: number, b: number, t: number) => `Kijk, ik zet hem erbij. ${som(a, b, t)}.`,
  /** Stap 9: de som. */
  vraagSom: (a: number, b: number) => [`Ja, ${g(a)} en ${g(b)} maken samen ${g(10)}.`, "Weet je hoe je dat als som schrijft?"],
  somGoed: (a: number, b: number) => `Je schreef ${som(a, b, 10)}.`,
  somUitleg: "Je zet de tegels bij elkaar. Daarom schrijf je een plus.",
  somSamen: (a: number, b: number) => `Kijk, zo schrijf je het: ${som(a, b, 10)}.`,
  /** Stap 11: omwisselen. */
  omdraaien: ["Weet je wat er gebeurt als ik de tegels omdraai?", "Kijk goed mee."],
  nuBovenop: (p: number) => [`Nu ligt de ${g(p)} bovenop.`, "Hoeveel is het nu samen?"],
  omGoed: (a: number, b: number) => `${som(a, b, 10)} en ${som(b, a, 10)}. Je kunt in allebei de volgordes optellen.`,
  omTel: `Het zijn dezelfde tegels. Het is nog steeds ${g(10)}. De volgorde maakt niet uit.`,
  /** Stap 12: nog een manier. */
  nogManier: [`Laten we nog een manier vinden om ${g(10)} te maken.`, "Kies een andere tegel."],
  nogManierHand: "Tik op een tegel. Tik dan in het rooster.",
  /** Stap 13: einde. */
  slot: `Je maakte sommen tot wel ${g(10)}.`,
};

export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit."];

/** Reactie bij goed (draaiboek stap 7: lof met de som erin). */
export const SOMREACTIE = (a: number, b: number, t: number) => rij([`Dat werkt: ${som(a, b, t)}.`, `Ja, ${g(a)} en ${g(b)} maken samen ${g(t)}.`, `${som(a, b, t)}, precies.`, `Je maakte ${g(t)} met de ${g(a)} en de ${g(b)}.`, `Ik heb het nagekeken: ${som(a, b, t)}.`], [4]);
export const SOMREACTIE_ROBOT = 4;

/* ---------- denkfouten (draaiboek Plussommen §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["te-weinig-hokjes", "te-veel-hokjes", "samen-te-weinig", "samen-te-veel", "cijfers-naast-elkaar", "plus-min-verwisseld", "totaal-verandert-bij-omwisselen", "onduidelijk"] as const;

const SCHERM = "vraag en knoppen even weg; Bliepo's scherm 1,5 s rood; met de hint komen de knoppen meteen terug (geen pijl)";

/** Getallen om uit te kiezen: het goede en 2 getallen dichtbij, allemaal van 1 tot en met `max`. */
export function dichtbij(n: number, max: number): number[] {
  const kand = [n - 1, n + 1, n - 2, n + 2].filter((x) => x >= 1 && x <= max);
  return [n, ...kand.slice(0, 2)].sort((a, b) => a - b);
}

/**
 * Stap 2: welk getal? Draaiboek §3 A: de tutor noemt de richting ("ik tel er een paar meer"). Zou de richting maar 1 keuze
 * overlaten (bij 1, 2 of 9), dan noemt Bliepo de richting NIET (15.17): alleen "dichtbij".
 */
export function getalFout(x: number, goed: number, opties: number[], nr = 0): Fout {
  const kant = opties.filter((k) => k !== x && (x < goed ? k > x : k < x));
  const verklapt = kant.length === 1;
  const X = g(x);
  /* 3 hints die per vraag wisselen (niet steeds dezelfde zin). */
  const hint = ["Tel de hokjes van de tegel. Wijs ze een voor een aan.", "Kijk goed naar de tegel en tel de hokjes rustig.", "Tel de hokjes nog eens. Je mag ze met je vinger aanwijzen."][nr % 3];
  if (x < goed)
    return { code: "te-weinig-hokjes", soort: "te-weinig-hokjes", denkfout: "telde er te weinig hokjes (sloeg er een over)", eerste: verklapt ? `${X} is dichtbij.` : `${X} is net iets te weinig.`, hint, uitleg: ["Je hebt een hokje overgeslagen. We tellen ze allemaal.", "Je telde een hokje niet mee. We tellen ze samen.", "Een hokje bleef over. We tellen ze allemaal."][nr % 3], weer: ["Je telde weer een hokje te weinig.", "We tellen ze een voor een."], scherm: SCHERM, ...(verklapt ? { noot: "richting niet genoemd: dan bleef er maar 1 keuze over" } : {}) };
  return { code: "te-veel-hokjes", soort: "te-veel-hokjes", denkfout: "telde er te veel hokjes (telde een hokje 2 keer)", eerste: verklapt ? `${X} is dichtbij.` : `${X} is net iets te veel.`, hint, uitleg: ["Je telde een hokje 2 keer. We tellen ze een voor een.", "Een hokje telde je dubbel. We tellen ze samen.", "Een hokje kreeg 2 keer een getal. We tellen ze een voor een."][nr % 3], weer: ["Je telde weer een hokje te veel.", "We tellen ze een voor een."], scherm: SCHERM, ...(verklapt ? { noot: "richting niet genoemd: dan bleef er maar 1 keuze over" } : {}) };
}

/** Stap 4 en 6: het totaal van 2 tegels. Draaiboek §3 D. */
export function totaalFout(x: number, a: number, b: number, opties: number[], nr = 0): Fout {
  const t = a + b;
  const kant = opties.filter((k) => k !== x && (x < t ? k > x : k < x));
  const verklapt = kant.length === 1;
  const X = g(x);
  const hint = [`Tel de hokjes van de ${g(a)} en de ${g(b)} samen.`, `Tel alle hokjes van de ${g(a)} en de ${g(b)} bij elkaar.`, `Kijk naar allebei de tegels en tel alle hokjes.`][nr % 3];
  if (x < t)
    return { code: "samen-te-weinig", soort: "samen-te-weinig", denkfout: "telde er te weinig bij elkaar", eerste: verklapt ? `${X} is dichtbij.` : `${X} is te weinig.`, hint, uitleg: "Alle hokjes van allebei de tegels tellen mee.", weer: ["Je telde weer te weinig.", "Alle hokjes van allebei de tegels tellen mee."], scherm: SCHERM, ...(verklapt ? { noot: "richting niet genoemd: dan bleef er maar 1 keuze over" } : {}) };
  return { code: "samen-te-veel", soort: "samen-te-veel", denkfout: "telde er te veel bij elkaar", eerste: verklapt ? `${X} is dichtbij.` : `${X} is te veel.`, hint, uitleg: "Elk hokje telt maar {1:wit} keer.", weer: ["Je telde weer te veel.", "Elk hokje telt maar {1:wit} keer."], scherm: SCHERM, ...(verklapt ? { noot: "richting niet genoemd: dan bleef er maar 1 keuze over" } : {}) };
}

/**
 * Stap 7, 8 en 12: de tegel zoeken die er samen met de gekozen tegel `doel` van maakt. Draaiboek §3 C: de tutor laat het
 * kind zelf zien wat het maakte ("je hebt een 1 en een 1; wat maakt dat?").
 */
export function aanvulFout(gekozen: number, k: number, doel: number): Fout {
  const s = gekozen + k;
  const richting = s < doel ? "Dat is te weinig." : "Dat is te veel.";
  const soort = s < doel ? "samen-te-weinig" : "samen-te-veel";
  return { code: soort, soort, denkfout: s < doel ? "de 2 tegels samen zijn te weinig" : "de 2 tegels samen zijn te veel", eerste: `${g(gekozen)} en ${g(k)} is samen ${g(s)}. ${richting}`, hint: `Zoek een tegel, zodat het samen ${g(doel)} wordt.`, uitleg: `Je hebt al ${g(gekozen)} hokjes. Er moeten ${g(doel)} komen.`, weer: [`Weer klopt het niet: ${g(gekozen)} en ${g(k)} is ${g(s)}.`, `Er moeten ${g(doel)} hokjes komen.`], scherm: "de foute tegel verschijnt even en verdwijnt weer; Bliepo's scherm 1,5 s rood; de gekozen tegel blijft liggen; met de hint mag het kind weer een tegel zetten" };
}

/** Stap 9: de som kiezen (3 sommen). Draaiboek §3 E: cijfers naast elkaar, min in plaats van plus. */
export function somKeuzes(p: number, q: number): string[] {
  return [`${p} + ${q} = 10`, `${p} + ${q} = ${p}${q}`, `${Math.max(p, q)} − ${Math.min(p, q)} = 10`];
}
export function somFout(x: string, p: number, q: number): Fout {
  const [, naast, min] = somKeuzes(p, q);
  if (x === naast) return { code: "cijfers-naast-elkaar", soort: "cijfers-naast-elkaar", denkfout: "zette de getallen naast elkaar (3 en 7 werd 37)", eerste: "Je zette de getallen naast elkaar.", hint: "Je telt de tegels bij elkaar op. Wat staat er achter het =?", uitleg: "Het totaal is wat de 2 tegels samen zijn.", weer: ["Je zette de getallen weer naast elkaar.", "Het totaal is wat de 2 tegels samen zijn."], scherm: SCHERM };
  if (x === min) return { code: "plus-min-verwisseld", soort: "plus-min-verwisseld", denkfout: "koos een min in plaats van een plus", eerste: "Kijk goed naar het teken.", hint: "We doen de tegels bij elkaar. Dan hoort er een plus.", uitleg: "Bij elkaar doen is een plus.", weer: ["Je koos weer een min.", "Bij elkaar doen is een plus."], scherm: SCHERM };
  return OND_FOUT("Je doet de tegels bij elkaar. Kies de som met een plus.", ZIN.somUitleg);
}

/** Stap 11: omwisselen (keuzes 10, 9 en 11). Draaiboek §3 F: het totaal blijft hetzelfde. */
export function omwisselFout(x: number): Fout {
  const hint = "Het zijn dezelfde tegels. Ze liggen alleen anders. Tel de hokjes nog eens.";
  return { code: "totaal-verandert-bij-omwisselen", soort: "totaal-verandert-bij-omwisselen", denkfout: "denkt dat het totaal verandert als de tegels omgedraaid liggen", eerste: `Je koos ${g(x)}.`, hint, uitleg: "Ze liggen alleen anders. Het zijn nog steeds dezelfde hokjes.", weer: [`Je koos weer ${g(x)}.`, "Ze liggen alleen anders. Het zijn nog steeds dezelfde hokjes."], scherm: SCHERM };
}
