/**
 * Zo vind je de goede mand.
 *
 * Eerst weten wat je zoekt, dan pas kijken. Dat is bij dit type de hele kunst:
 * kinderen beginnen te tellen voordat ze weten welk getal ze zoeken, en komen
 * dan uit bij de mand die ze toevallig het eerst hebben geteld.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

const opKaart = (som: Somgegevens) => som.extra?.kaart ?? som.goed;

export const mandenAanpak: Aanpak = {
  zin: (som) => {
    const kaart = opKaart(som);
    if (kaart === som.goed) {
      return {
        "34": "Tel elke mand na.",
        "56": "Zoek de mand waar er precies zoveel in zitten.",
        "78": "Tel per mand en vergelijk met het gevraagde getal.",
      };
    }
    const meer = som.goed > kaart;
    return {
      "34": meer ? "Eentje meer dan er staat." : "Eentje minder dan er staat.",
      "56": meer
        ? `Je zoekt er eentje meer dan ${kaart}, dus ${som.goed}.`
        : `Je zoekt er eentje minder dan ${kaart}, dus ${som.goed}.`,
      "78": meer
        ? `Bepaal eerst het gezochte aantal: ${kaart} + 1 = ${som.goed}. Tel daarna de manden.`
        : `Bepaal eerst het gezochte aantal: ${kaart} − 1 = ${som.goed}. Tel daarna de manden.`,
    };
  },

  stappen: (som) => {
    const kaart = opKaart(som);
    const stappen = [{ tekst: "Kijk welk getal er staat.", som: `${kaart}` }];
    if (kaart !== som.goed) {
      stappen.push({
        tekst: som.goed > kaart ? "Doe er eentje bij." : "Haal er eentje af.",
        som: `${som.goed}`,
      });
    }
    stappen.push({ tekst: "Tel de manden tot je er zoveel vindt.", som: `${som.goed}` });
    return stappen;
  },

  controle: (som) =>
    `Het goede antwoord is de mand met ${som.goed} erin.`,
};
