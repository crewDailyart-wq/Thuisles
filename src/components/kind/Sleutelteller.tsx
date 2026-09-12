"use client";

/**
 * De sleutelteller rechtsboven.
 *
 * Eén getal, want dat is ook precies één regel om uit te leggen: elk goed
 * antwoord is één sleutel. De drie tellers die hier eerder stonden (dagen op
 * rij, munten, edelstenen) zeiden alle drie iets anders en geen ervan was
 * ergens voor te gebruiken.
 *
 * Het getal is het SALDO, niet het totaal ooit verdiend. Zodra de kisten op de
 * eilandenkaart er zijn, gaat dit getal dus ook omlaag als er iets geopend
 * wordt, en dat is de bedoeling: het is wat je nú kunt uitgeven.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit een clientcomponent is
 * ---------------------------------------------------------------------------
 * Tijdens een oefenronde moet de teller meteen omhoog kunnen, op het moment
 * dat de vliegende sleutel hier aankomt. Wachten op een nieuwe serverronde zou
 * betekenen dat de sleutel landt op een getal dat nog niet veranderd is.
 *
 * `beginsaldo` is wat de server bij het opbouwen van de pagina wist. Zodra er
 * in deze sessie iets verdiend is, is `sleutelwinkel` leidend.
 */

import Image from "next/image";
import { useEffect, useSyncExternalStore } from "react";
import {
  SLEUTEL_DOEL_ID,
  abonneer,
  leesStand,
  leesStandOpServer,
  zetBeginsaldo,
} from "@/lib/sleutelwinkel";

export function Sleutelteller({
  beginsaldo,
  klein = false,
}: {
  beginsaldo: number;
  /**
   * Kleinere uitvoering voor de oefenbalk.
   *
   * Daar telt elke pixel hoogte: op een telefoon in liggende stand is het
   * scherm maar een paar honderd pixels hoog, en alles wat de balk inneemt
   * gaat van de vraag af. Op het startscherm blijft de sleutel groot.
   */
  klein?: boolean;
}) {
  const stand = useSyncExternalStore(abonneer, leesStand, leesStandOpServer);

  /*
    De eerste tekening in de browser moet gelijk zijn aan die op de server,
    anders klaagt React over hydratatie. Daarom pas ná het opbouwen de winkel
    vullen, en tot dat moment tonen wat de server meegaf.
  */
  useEffect(() => {
    zetBeginsaldo(beginsaldo);
  }, [beginsaldo]);

  const saldo = stand.gevuld ? stand.saldo : beginsaldo;

  return (
    /*
      `relative z-50`: het feestscherm na een goed antwoord ligt op z-40 binnen
      dezelfde kolom. De teller moet daar bovenop blijven, anders vliegt de
      sleutel naar een doel dat achter de laag verdwenen is.
    */
    <div
      className={`relative z-50 flex items-center rounded-full border border-white/70 bg-kaart text-amber shadow-zacht ${
        klein ? "gap-1.5 py-1 pl-2 pr-3" : "gap-2 py-1.5 pl-2.5 pr-4"
      }`}
    >
      {/*
        De getekende sleutel in plaats van een lijnicoontje. Geen gekleurde
        cirkel eromheen: de tekening heeft eigen kleur en glans, en een vlak
        erachter maakt het alleen maar onrustig.

        `width` en `height` zijn de echte afmetingen van het bestand, dus de
        verhouding komt daaruit en er wordt nooit uitgerekt. `h-11 w-auto`
        bepaalt hoe groot hij in beeld staat; de breedte volgt vanzelf.

        Het bestand is 300px breed, ruim vier keer de weergavegrootte, zodat
        hij ook op een scherm met hoge pixeldichtheid scherp blijft.

        Dit is ook het mikpunt van de vliegende sleutel: `SLEUTEL_DOEL_ID`
        staat op de omhulling hieronder.

        Decoratief: `alt=""`. Wat er staat, staat hieronder al als tekst voor
        een voorleesprogramma.
      */}
      <span id={SLEUTEL_DOEL_ID} className="block shrink-0">
        <Image
          src="/sleutel.png"
          alt=""
          width={300}
          height={332}
          className={klein ? "h-7 w-auto sm:h-8" : "h-11 w-auto"}
        />
      </span>

      {/*
        `key` op het getal: bij elke bijgeschreven sleutel begint de
        pop-animatie opnieuw, ook als er twee snel achter elkaar binnenkomen.
      */}
      <span
        key={stand.stoot}
        className={`font-extrabold tabular-nums motion-safe:animate-teller-pop ${
          klein ? "text-sm" : "text-base"
        }`}
      >
        {saldo}
      </span>

      {/*
        Voorgelezen wordt "3 sleutels", niet los "3". Enkelvoud bij precies
        één, want "1 sleutels" klinkt raar als je het hoort.
      */}
      <span className="sr-only" aria-live="polite">
        {saldo === 1 ? "1 sleutel" : `${saldo} sleutels`} verdiend
      </span>
    </div>
  );
}
