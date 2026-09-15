import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    Wie mag de ontwikkelserver bevragen?

    Next blokkeert sinds versie 16 alle verzoeken naar de bestanden van de
    ontwikkelserver die niet van `localhost` komen. Open je de app op je telefoon
    via het netwerkadres van deze computer, dan komt de pagina wel binnen — die
    wordt op de server opgebouwd — maar worden de JavaScript-bestanden geweigerd.
    Het scherm ziet er dan perfect uit terwijl er niets werkt: geen knop, geen
    animatie, geen geluid.

    Hier staat daarom het hele thuisnetwerk toe. Het geldt alleen tijdens het
    ontwikkelen; aan de echte site verandert het niets. Met sterretjes, zodat het
    blijft werken als de router je computer een ander adres geeft.
  */
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*"],

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
