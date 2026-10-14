"use client";

/**
 * Waar de Zappie-voortgang bewaard wordt: TIJDELIJK in de browser.
 *
 * Eerste fase, op verzoek van de eigenaar: zolang Zappie nog niet aan de
 * database hangt, staan de punten en missies in `localStorage`, per kind. Er
 * komt dus niets in de database en niets in de voortgang van een echt kind.
 *
 * Gevolg: de punten gelden alleen op dit apparaat, in deze browser. Wordt de
 * browsergeschiedenis gewist, dan begint Zappie weer bij nul. Gaat Zappie naar
 * de database, dan verandert alleen dit bestand: de schermen gebruiken
 * `useVoortgang` en `voltooiMissie` en weten niet waar het staat.
 *
 * Elke lees- en schrijfactie staat in try/catch: in een privévenster of met
 * geblokkeerde opslag gooit `localStorage` een fout, en dan werkt alles gewoon
 * verder zonder te bewaren.
 */

import { useSyncExternalStore } from "react";
import {
  LEGE_VOORTGANG,
  metVoltooideMissie,
  type Voortgang,
} from "@/lib/zappie/voortgang";
import type { WereldId } from "@/lib/zappie/werelden";
import { LEEG_LEERPAD, normaliseerLeerpad, rondStapAf, type Bewijs, type Toetsperiode } from "@/lib/leerpad/model";
import { PUNTEN_MISSIE } from "@/lib/zappie/voortgang";

const VERSIE = "zappie:v1";

let sleutel = `${VERSIE}:gast`;
let cache: { sleutel: string; ruw: string | null; waarde: Voortgang } | null = null;
const luisteraars = new Set<() => void>();

/** Welk kind er speelt; bepaalt onder welke sleutel de voortgang staat. */
export function zetSpeler(kindId: string | null) {
  const nieuw = `${VERSIE}:${kindId ?? "gast"}`;
  if (nieuw === sleutel) return;
  sleutel = nieuw;
  cache = null;
  luisteraars.forEach((f) => f());
}

function lees(): Voortgang {
  let ruw: string | null = null;
  try {
    ruw = window.localStorage.getItem(sleutel);
  } catch {
    /* geen opslag beschikbaar: dan blijft het bij wat er in het geheugen staat */
    if (cache && cache.sleutel === sleutel) return cache.waarde;
  }
  if (cache && cache.sleutel === sleutel && cache.ruw === ruw) return cache.waarde;
  let waarde = LEGE_VOORTGANG;
  if (ruw) {
    try {
      const v = JSON.parse(ruw) as Partial<Voortgang>;
      waarde = {
        leerpad: normaliseerLeerpad(v.leerpad),
        punten: Number(v.punten) || 0,
        getoond: Number(v.getoond) || 0,
        missies: { ...LEGE_VOORTGANG.missies, ...(v.missies ?? {}) },
        gebeurtenis: v.gebeurtenis ?? null,
        vandaag:
          v.vandaag && typeof v.vandaag.datum === "string" && Array.isArray(v.vandaag.klaar)
            ? { datum: v.vandaag.datum, klaar: v.vandaag.klaar }
            : LEGE_VOORTGANG.vandaag,
      };
    } catch {
      waarde = LEGE_VOORTGANG;
    }
  }
  cache = { sleutel, ruw, waarde };
  return waarde;
}

function schrijf(v: Voortgang) {
  const ruw = JSON.stringify(v);
  try {
    window.localStorage.setItem(sleutel, ruw);
  } catch {
    /* niet te bewaren; in het geheugen werkt het tot de pagina sluit */
  }
  cache = { sleutel, ruw, waarde: v };
  luisteraars.forEach((f) => f());
}

function abonneer(f: () => void) {
  luisteraars.add(f);
  const bijOpslag = (e: StorageEvent) => {
    if (e.key === sleutel) f();
  };
  window.addEventListener("storage", bijOpslag);
  return () => {
    luisteraars.delete(f);
    window.removeEventListener("storage", bijOpslag);
  };
}

/** De voortgang van het kind. Op de server en bij de eerste tekening: leeg. */
export function useVoortgang(): Voortgang {
  return useSyncExternalStore(abonneer, lees, () => LEGE_VOORTGANG);
}

/** Missie af: tokens erbij en de missie telt mee (een vrije missie alleen tokens). */
export function voltooiMissie(wereld: WereldId, verdiend: number, vrij = false) {
  schrijf(metVoltooideMissie(lees(), wereld, verdiend, vrij));
}

/** De startpagina heeft laten zien wat er verdiend is. */
export function wisGebeurtenis() {
  const v = lees();
  if (v.gebeurtenis) schrijf({ ...v, gebeurtenis: null });
}

/** De teller heeft dit aantal punten laten zien. */
export function onthoudGetoond(punten: number) {
  const v = lees();
  if (v.getoond !== punten) schrijf({ ...v, getoond: punten });
}

/** Begeleider heeft de concrete opdracht gecontroleerd. Een herhaling betaalt niet nogmaals. */
export function voltooiLeerstap(id: string, bewijs: Bewijs) {
  const v=lees();
  const oud=v.leerpad ?? LEEG_LEERPAD;
  const nieuw=rondStapAf(oud,id,bewijs,new Date().toISOString());
  if(nieuw===oud) return false;
  schrijf({...v,leerpad:nieuw,punten:v.punten+PUNTEN_MISSIE});
  return true;
}

export function bewaarToetsperiodes(toetsperiodes: Toetsperiode[]) {
  const v=lees();
  schrijf({...v,leerpad:normaliseerLeerpad({...v.leerpad,toetsperiodes})});
}

/** Uitgestelde nieuwe stof alsnog oefenen, zonder de eerdere herhaalbeloning te verdubbelen. */
export function voltooiInhaalstap(id: string, bewijs: Bewijs) {
  const v=lees();
  const stand=v.leerpad??LEEG_LEERPAD;
  const oud=stand.resultaten[id];
  if(!oud?.toetsvoorbereiding || !['zelfstandig','met_hulp'].includes(bewijs)) return false;
  schrijf({...v,leerpad:{...stand,resultaten:{...stand.resultaten,[id]:{bewijs,datum:new Date().toISOString(),geoefendeStap:id,toetsvoorbereiding:false}}}});
  return true;
}
