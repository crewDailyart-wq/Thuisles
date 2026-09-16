/**
 * De denkfouten bij tientallen en eenheden.
 *
 * Vier stuks. Drie ervan staan ook echt als keuze op het scherm — zie `keuzes`
 * in `blokken.ts` — en de vierde, de staaf als één blokje tellen, komt erbij
 * zodra een van de andere drie samenvalt met het goede antwoord.
 *
 * Ze gaan alle vier over hetzelfde: wat een staaf wáárd is. Een kind dat 24
 * ziet liggen en "vier" zegt, telt prima; het weet alleen nog niet dat die twee
 * staven twintig betekenen. Daarom staat er in elke uitleg een staaf die wordt
 * afgeteld, en niet een rijtje regels over plaatswaarde.
 *
 * De volgorde telt: specifieke patronen eerst. "Omgedraaid" staat bovenaan,
 * want dat getal is het meest herkenbaar en zou bij kleine getallen anders
 * onder een algemener patroon vallen.
 */

import type { Foutpatroon, Somgegevens } from "@/lib/generatoren/foutpatroon";

const tientallenVan = (som: Somgegevens) => som.extra?.tientallen ?? Math.floor(som.goed / 10);
const eenhedenVan = (som: Somgegevens) => som.extra?.eenheden ?? som.goed % 10;

/** De cijfers omgedraaid: 24 wordt 42. */
function omgedraaid(som: Somgegevens): number {
  return eenhedenVan(som) * 10 + tientallenVan(som);
}

export const blokkenPatronen: Foutpatroon[] = [
  {
    id: "omgedraaid",
    naam: "Tientallen en eenheden omgedraaid",
    herkent: (som, gegeven) => gegeven === omgedraaid(som) && gegeven !== som.goed,
    kindtekst: {
      "34": "Je hebt de getallen omgedraaid.",
      "56": "Je hebt tientallen en eenheden verwisseld. Kijk nog eens: hoeveel staven zijn het?",
      "78": "Je hebt de cijfers omgedraaid. Het eerste cijfer zegt hoeveel staven er liggen, het tweede hoeveel losse blokjes.",
    },
    hint: "Tel eerst de staven. Elke staaf is tien.",
    uitleg: (som) => {
      const t = tientallenVan(som);
      const e = eenhedenVan(som);
      return [
        { tekst: `Tel de staven: ${t} staven.`, som: `${t} × 10 = ${t * 10}` },
        { tekst: `Tel de losse blokjes: ${e}.`, som: `${e}` },
        { tekst: "De staven zeg je eerst.", som: `${t * 10} + ${e} = ${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "Het kind ziet de goede hoeveelheden maar zet ze in de verkeerde volgorde neer. Dat is geen telfout: het weet nog niet zeker welk cijfer waar hoort. In het Nederlands helpt de taal ook niet mee — we zeggen „vierentwintig”, dus de vier eerst, terwijl je 24 schrijft.",
      zinnen: [
        "Leg de staven links en de losse blokjes rechts, en schrijf het getal er zo onder.",
        "Zeg samen: twee staven is twintig, en nog vier, dat is vierentwintig.",
      ],
      schoolwoord: "plaatswaarde",
    },
  },
  {
    id: "alleen-eenheden",
    naam: "Alleen de losse blokjes geteld",
    herkent: (som, gegeven) => gegeven === eenhedenVan(som) && gegeven !== som.goed,
    kindtekst: {
      "34": "Je vergat de staven.",
      "56": "Je hebt alleen de losse blokjes geteld. De staven tellen ook mee.",
      "78": "Je telde alleen de eenheden. Elke staaf is er tien, dus die moeten er eerst bij.",
    },
    hint: "Begin bij de staven: tien, twintig. Tel dan de losse erbij.",
    uitleg: (som) => {
      const t = tientallenVan(som);
      const e = eenhedenVan(som);
      return [
        { tekst: "Eerst de staven, links.", som: `${t} × 10 = ${t * 10}` },
        { tekst: "Dan de losse blokjes erbij.", som: `${t * 10} + ${e}` },
        { tekst: "Samen is dat het antwoord.", som: `${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "Het kind telt alleen wat er los ligt en slaat de staven over. Meestal weet het wel dat een staaf tien is, maar begint het te tellen bij wat het makkelijkst te tellen valt.",
      zinnen: [
        "Laat het kind eerst de staven aanwijzen en hardop tien, twintig tellen.",
        "Pak samen één staaf en tel de blokjes erin, zodat het ziet dat het er tien zijn.",
      ],
      schoolwoord: "tientallen en eenheden",
    },
  },
  {
    id: "staaf-vergeten",
    naam: "Een staaf vergeten",
    herkent: (som, gegeven) => gegeven === som.goed - 10 && tientallenVan(som) >= 1,
    kindtekst: {
      "34": "Je bent één staaf vergeten.",
      "56": "Je hebt er één staaf te weinig geteld. Tel de staven nog eens.",
      "78": "Je zit er precies tien onder: er is één staaf niet meegeteld.",
    },
    hint: "Wijs elke staaf aan terwijl je telt: tien, twintig, dertig.",
    uitleg: (som) => {
      const t = tientallenVan(som);
      const e = eenhedenVan(som);
      return [
        { tekst: "Wijs elke staaf aan.", som: `${t} staven` },
        {
          tekst: "Tel met sprongen van tien.",
          som: Array.from({ length: t }, (_, i) => `${(i + 1) * 10}`).join(" → "),
        },
        { tekst: "En de losse erbij.", som: `${t * 10} + ${e} = ${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "Precies tien te laag: één staaf is niet meegeteld. Het kind telt goed met sprongen van tien, maar raakt kwijt welke staaf het al had — een overzichtsprobleem, geen rekenprobleem.",
      zinnen: [
        "Laat het kind elke staaf aanraken terwijl het tien, twintig, dertig zegt.",
        "Schuif de getelde staven opzij, dan is te zien wat er nog ligt.",
      ],
      schoolwoord: "tienstructuur",
    },
  },
  {
    id: "staaf-als-blokje",
    naam: "Elke staaf als één blokje geteld",
    herkent: (som, gegeven) =>
      gegeven === tientallenVan(som) + eenhedenVan(som) && gegeven !== som.goed,
    kindtekst: {
      "34": "Eén staaf is tien blokjes.",
      "56": "Je telde elke staaf als één. Maar in één staaf zitten tien blokjes.",
      "78": "Je hebt de staven als losse blokjes geteld. Elke staaf telt voor tien, niet voor één.",
    },
    hint: "Tel de blokjes in één staaf. Het zijn er tien.",
    uitleg: (som) => {
      const t = tientallenVan(som);
      const e = eenhedenVan(som);
      return [
        { tekst: "Kijk in één staaf: tien blokjes.", som: "10" },
        { tekst: `Dus ${t} staven is:`, som: `${t} × 10 = ${t * 10}` },
        { tekst: "En de losse erbij.", som: `${t * 10} + ${e} = ${som.goed}` },
      ];
    },
    ouder: {
      uitleg:
        "Het kind telt de voorwerpen die het ziet: drie staven en vier blokjes worden zeven dingen. Het is nog niet zover dat één voorwerp voor tien kan staan; dat is de kern van het tientallig stelsel.",
      zinnen: [
        "Tel samen de blokjes in één staaf, hardop tot tien.",
        "Leg tien losse blokjes naast een staaf, zodat het kind ziet dat het evenveel is.",
      ],
      schoolwoord: "tientallig stelsel",
    },
  },
];
