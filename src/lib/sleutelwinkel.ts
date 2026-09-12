"use client";

/**
 * De stand van de sleutelteller, tijdens het spelen.
 *
 * De teller staat in de header van de kindomgeving (`KindHeader`), de sleutels
 * worden verdiend in de oefening (`OefenSpeler`). Die twee staan ver uit
 * elkaar in de boom: de oefening is een kind van de layout, niet van de header.
 * Het saldo als prop doorgeven zou dus door de hele layout heen moeten.
 *
 * Vandaar deze kleine winkel ernaast, in dezelfde stijl als de geluidsvoorkeur
 * in `src/lib/geluid.ts`: een waarde, een setje luisteraars, en verder niets.
 * De oefening roept `zetSaldo` aan zodra de server een sleutel heeft
 * bijgeschreven; de teller in de header luistert en telt op.
 *
 * `stoot` telt hoe vaak het saldo omhoog ging. De teller gebruikt dat als
 * `key` op het getal, zodat de "pop"-animatie bij elke sleutel opnieuw start —
 * ook als het kind twee keer snel achter elkaar goed antwoordt.
 */

export type Sleutelstand = {
  saldo: number;
  stoot: number;
  /**
   * Of de winkel al een waarde heeft. Zolang dit `false` is, toont de teller
   * wat de server meegaf. Nodig om te voorkomen dat de eerste tekening in de
   * browser afwijkt van die op de server (hydratatie).
   */
  gevuld: boolean;
};

/**
 * Waar de vliegende sleutel naartoe moet.
 *
 * De teller in de header draagt dit id; `Sleutelvlucht` zoekt het op om te
 * weten waar hij moet landen. Via het id en niet via een ref, omdat de twee
 * componenten in verschillende takken van de boom staan.
 */
export const SLEUTEL_DOEL_ID = "sleutelteller-doel";

const LEEG: Sleutelstand = { saldo: 0, stoot: 0, gevuld: false };

let stand: Sleutelstand = LEEG;
const luisteraars = new Set<() => void>();

function meld(): void {
  for (const f of luisteraars) f();
}

/** De stand zoals hij nu is. Altijd hetzelfde object bij dezelfde stand. */
export function leesStand(): Sleutelstand {
  return stand;
}

/** Op de server is er nog niets verdiend; daar geldt wat de pagina meegaf. */
export function leesStandOpServer(): Sleutelstand {
  return LEEG;
}

/**
 * De beginwaarde uit de database, één keer.
 *
 * Latere aanroepen doen niets: zodra er in deze sessie een sleutel is
 * verdiend, is de winkel leidend. Anders zou een pagina die met een ouder
 * saldo opnieuw wordt opgebouwd de teller weer omlaag zetten.
 */
export function zetBeginsaldo(saldo: number): void {
  if (stand.gevuld) return;
  stand = { saldo, stoot: 0, gevuld: true };
  meld();
}

/** Een nieuw saldo van de server. Zet de "pop" van de teller in gang. */
export function zetSaldo(saldo: number): void {
  if (stand.gevuld && saldo === stand.saldo) return;
  stand = { saldo, stoot: stand.stoot + 1, gevuld: true };
  meld();
}

export function abonneer(herteken: () => void): () => void {
  luisteraars.add(herteken);
  return () => {
    luisteraars.delete(herteken);
  };
}
