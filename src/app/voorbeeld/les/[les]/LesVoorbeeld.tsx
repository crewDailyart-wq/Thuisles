"use client";

import { useMemo, useState } from "react";
import { Lesspeler } from "@/components/les/Lesscherm";
import { zoekDraaiboek } from "@/components/les/lessen";
import { metUitlegVoorbeeld } from "./uitlegVoorbeeld";
import { LesBewerker } from "./LesBewerker";
import s from "./bewerken.module.css";

/**
 * `?indeling=synthesis` (28 oktober 2026): de les met de indeling van
 * Synthesis bekijken, ook als het draaiboek die nog niet zelf aanzet.
 */
export function LesVoorbeeld({ id, naam, uitleg = false, bewerken = false }: { id: string; naam: string; uitleg?: boolean; bewerken?: boolean }) {
  const [bewerkZin, setBewerkZin] = useState<string | null>(null);
  const les = useMemo(() => {
    const d = zoekDraaiboek(id);
    if (!d || typeof window === "undefined") return d;
    const voorbeeld = new URLSearchParams(window.location.search).get("indeling") === "synthesis" ? { ...d, indeling: "synthesis" as const } : d;
    return uitleg ? metUitlegVoorbeeld(voorbeeld) : voorbeeld;
  }, [id, uitleg]);
  const magBewerken = bewerken && id.startsWith("squla-");
  return les ? <><Lesspeler les={les} naam={naam} bewerkTekst={magBewerken ? setBewerkZin : undefined} />{magBewerken && <button type="button" className={s.openen} onClick={() => setBewerkZin("")}>Les aanpassen</button>}{magBewerken && bewerkZin !== null && <LesBewerker id={id} bron={bewerkZin} sluit={() => setBewerkZin(null)} />}</> : null;
}
