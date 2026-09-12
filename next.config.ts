import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /*
      Afbeeldingen worden via een serveractie geüpload. Standaard accepteert
      Next daar maar 1 MB; met een maximum van 5 MB per afbeelding is 8 MB een
      ruime marge voor de rest van het formulier.
    */
    serverActions: { bodySizeLimit: "8mb" },
  },

  images: {
    /*
      De keuzekaarten op /oefenen/[vak] zijn illustraties met getekende tekst
      erin. Op de standaardkwaliteit (75) worden die letters bij het omzetten
      naar WebP net iets zacht. 90 is hier dus geen luxe maar leesbaarheid.
      Sinds Next 16 moet elke gebruikte waarde vooraf worden toegestaan.
    */
    qualities: [75, 90],
  },
};

export default nextConfig;
