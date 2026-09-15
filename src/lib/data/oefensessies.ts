import "server-only";

/**
 * Waar een kind midden in een oefening was gebleven.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit in de database staat en niet meer alleen in de browser
 * ---------------------------------------------------------------------------
 * Het stond in `localStorage`, en dat is per browser op één apparaat. Een kind
 * dat op de laptop bij vraag 8 was en daarna de tablet pakte, begon daar weer
 * bij vraag 1 — met lege bolletjes, in een heel andere serie vragen. Wat het
 * kind op het ene scherm zag, klopte op het andere niet.
 *
 * Nu hangt de stand aan het kind. Elk apparaat dat hetzelfde kindprofiel opent,
 * ziet dezelfde vraag en dezelfde gekleurde bolletjes. De browser houdt nog wel
 * een kopie als vangnet (zie `lib/oefensessie.ts`), maar bij verschil wint de
 * database altijd.
 *
 * ---------------------------------------------------------------------------
 * Alleen de id's van de vragen
 * ---------------------------------------------------------------------------
 * Er wordt bewust niet bewaard wélke som er stond, alleen welk vraag-id. De
 * vraag zelf staat toch al in `vragen`; hem hier nog eens neerzetten zou
 * betekenen dat er van elk kind een tweede kopie van zijn oefeningen ligt, en
 * dat is meer bewaren dan nodig.
 *
 * Gevolg om te weten: wordt een vraag in het beheer aangepast of teruggezet
 * naar concept terwijl een kind er middenin zit, dan verandert die vraag mee of
 * valt hij uit de serie. De rest van de serie blijft gewoon staan.
 *
 * ---------------------------------------------------------------------------
 * Hoe lang het blijft staan
 * ---------------------------------------------------------------------------
 * Een week, net als vroeger in de browser. Kom je na de zomervakantie terug op
 * een som waar je halverwege in bleef steken, dan is verdergaan raarder dan
 * opnieuw beginnen. Een verlopen regel wordt bij het lezen meteen opgeruimd.
 */

import { verbinding } from "@/lib/db/sqlite";
import type { Uitkomst } from "@/lib/data/voortgang";

/** Hoe lang een halve sessie meegaat. */
const HOUDBAAR_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Wat er van één antwoord wordt onthouden zolang de ronde loopt.
 *
 * Dit is met opzet dezelfde vorm als wat er naar `antwoorden` gaat, maar het
 * staat hier los: dit is de stand van déze ronde — waar de bolletjes bovenin
 * hun kleur uit halen — en die verdwijnt zodra de serie af is.
 */
export type SessieAntwoord = {
  leerdoelId: string;
  vraagId: string | null;
  goed: boolean;
  uitkomst: Uitkomst;
  foutpatroon: string | null;
  hintGebruikt: boolean;
  uitlegGebruikt: boolean;
  seconden: number;
  gegokt: boolean;
  beloningsbron: string;
};

export type Oefensessie = {
  rondeId: string;
  /** De serie, in volgorde. Alleen id's; zie de toelichting bovenaan. */
  vraagIds: string[];
  /** Wat er tot nu toe beantwoord is, in dezelfde volgorde als de serie. */
  antwoorden: SessieAntwoord[];
};

/**
 * De halve sessie van dit kind voor dit onderwerp, of `null`.
 *
 * Geeft ook `null` als de serie al af is of te oud is. In allebei die gevallen
 * hoort er een nieuwe serie te beginnen, en wordt de oude regel meteen
 * opgeruimd — anders blijft er van elk kind een spoor van afgelopen rondes
 * liggen dat nergens meer voor dient.
 */
export function haalOefensessie(kindId: string, pad: string): Oefensessie | null {
  const rij = verbinding()
    .prepare(
      `select ronde_id, vraag_ids, antwoorden, bijgewerkt_op
         from oefensessies where kind_id = ? and pad = ?`,
    )
    .get(kindId, pad) as
    | { ronde_id: string; vraag_ids: string; antwoorden: string; bijgewerkt_op: string }
    | undefined;

  if (!rij) return null;

  if (Date.now() - Date.parse(rij.bijgewerkt_op) > HOUDBAAR_MS) {
    wisOefensessie(kindId, pad);
    return null;
  }

  let vraagIds: string[];
  let antwoorden: SessieAntwoord[];
  try {
    vraagIds = JSON.parse(rij.vraag_ids) as string[];
    antwoorden = JSON.parse(rij.antwoorden) as SessieAntwoord[];
  } catch {
    /* Onleesbaar geworden: dan is opnieuw beginnen beter dan vastlopen. */
    wisOefensessie(kindId, pad);
    return null;
  }

  if (!Array.isArray(vraagIds) || vraagIds.length === 0) return null;
  if (!Array.isArray(antwoorden)) return null;

  /* Af: dan hoort er een nieuwe serie te komen. */
  if (antwoorden.length >= vraagIds.length) {
    wisOefensessie(kindId, pad);
    return null;
  }

  return { rondeId: rij.ronde_id, vraagIds, antwoorden };
}

/**
 * De stand wegschrijven.
 *
 * Eén regel per kind per onderwerp; een tweede keer opslaan overschrijft de
 * vorige. Er wordt dus nooit een rij bewaarde sessies opgebouwd.
 */
export function bewaarOefensessie(kindId: string, pad: string, sessie: Oefensessie): void {
  verbinding()
    .prepare(
      `insert into oefensessies
         (kind_id, pad, ronde_id, vraag_ids, antwoorden, bijgewerkt_op)
       values (?, ?, ?, ?, ?, ?)
       on conflict (kind_id, pad) do update set
         ronde_id      = excluded.ronde_id,
         vraag_ids     = excluded.vraag_ids,
         antwoorden    = excluded.antwoorden,
         bijgewerkt_op = excluded.bijgewerkt_op`,
    )
    .run(
      kindId,
      pad,
      sessie.rondeId,
      JSON.stringify(sessie.vraagIds),
      JSON.stringify(sessie.antwoorden),
      new Date().toISOString(),
    );
}

export function wisOefensessie(kindId: string, pad: string): void {
  verbinding()
    .prepare("delete from oefensessies where kind_id = ? and pad = ?")
    .run(kindId, pad);
}
