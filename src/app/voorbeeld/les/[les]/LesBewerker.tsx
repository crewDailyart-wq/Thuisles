"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { laadLesBewerking, bewaarInLes } from "../../beginschermen/acties";
import s from "./bewerken.module.css";

type Velden = { zin1: string; zin2: string; zin: string; wens: string };

/** De eigenaar bewerkt lokaal de tekst op het scherm; het lesantwoord blijft ongemoeid. */
export function LesBewerker({ id, bron, sluit }: { id: string; bron: string; sluit: () => void }) {
  const dialoog = useRef<HTMLDialogElement>(null);
  const [waarden, setWaarden] = useState<Velden | null>(null);
  const [bewaard, setBewaard] = useState<Velden | null>(null);
  const [melding, setMelding] = useState("");
  const [bezig, setBezig] = useState(false);
  const [isBegin, setIsBegin] = useState(false);

  useEffect(() => {
    let actief = true;
    dialoog.current?.showModal();
    // Het bestaande scherm blijft achter het venster zichtbaar.
    window.speechSynthesis?.pause();
    laadLesBewerking(id, bron).then((data) => {
      if (!actief) return;
      setWaarden(data);
      setBewaard(data);
      setIsBegin(!bron || bron === `${data.zin1} ${data.zin2}` || bron === data.zin1 || bron === data.zin2);
    }).catch(() => { if (actief) setMelding("De tekst kon niet worden geladen. Sluit dit venster en probeer het opnieuw."); });
    return () => { actief = false; window.speechSynthesis?.resume(); };
  }, [id, bron]);

  async function opslaan(veld: keyof Velden) {
    if (!waarden || !bewaard) return;
    setBezig(true);
    setMelding("");
    try {
      const resultaat = await bewaarInLes({ id, bron, veld, tekst: waarden[veld], verwacht: bewaard[veld] });
      if (resultaat.fout) setMelding(resultaat.fout);
      else {
        const tekst = resultaat.tekst ?? waarden[veld];
        setBewaard((vorige) => vorige && { ...vorige, [veld]: tekst });
        setWaarden((vorige) => vorige && { ...vorige, [veld]: tekst });
        setMelding(veld === "wens" ? "Je wens is bij deze les bewaard. De opdracht is nog niet aangepast." : "Opgeslagen. Sluit dit venster om de les te bekijken. Met de herhaalknop kun je de zin opnieuw horen.");
      }
    } catch { setMelding("Opslaan is niet gelukt. Je tekst staat nog in dit venster. Probeer het opnieuw."); }
    finally { setBezig(false); }
  }

  function veld(naam: keyof Velden, label: string, knop: string) {
    return <form onSubmit={(event) => { event.preventDefault(); void opslaan(naam); }}>
      <label htmlFor={`bewerken-${naam}`}>{label}</label>
      <textarea id={`bewerken-${naam}`} value={waarden?.[naam] ?? ""} onChange={(event) => setWaarden((v) => v && { ...v, [naam]: event.target.value })} rows={naam === "wens" ? 3 : 4} maxLength={naam === "wens" ? 5000 : 1500} required={naam !== "wens"} />
      <button type="submit" disabled={bezig}>{bezig ? "Bezig met opslaan…" : knop}</button>
    </form>;
  }

  return createPortal(<dialog ref={dialoog} className={s.dialoog} onCancel={sluit} onClose={sluit} aria-labelledby="lesbewerker-titel">
    <header><div><p>DEZE LES AANPASSEN</p><h2 id="lesbewerker-titel">{isBegin ? "Beginzinnen bewerken" : "Deze zin bewerken"}</h2></div><button type="button" onClick={sluit} aria-label="Bewerken sluiten">Sluiten</button></header>
    <p>Pas de tekst aan en sla hem op. De antwoorden en de manier van nakijken blijven hetzelfde.</p>
    {melding && <p className={s.melding} role="status">{melding}</p>}
    {!waarden ? <p>Tekst laden…</p> : <>
      {isBegin ? <>{veld("zin1", "Zin 1 · Over de les", "Zin 1 opslaan")}{veld("zin2", "Zin 2 · Vraag aan het kind", "Zin 2 opslaan")}</> : <><p className={s.toelichting}>Deze correctie geldt voor deze tekst in deze les, ook wanneer Bliepo hem opnieuw uitspreekt.</p>{veld("zin", "Wat moet Bliepo zeggen?", "Zin opslaan")}</>}
      <section><h3>Iets anders aan deze les veranderen?</h3><p>Schrijf hieronder wat je wilt. Je wens wordt bewaard bij deze les en deze zin; de opdracht verandert hierdoor niet automatisch.</p>{veld("wens", "Jouw wijzigingswens", "Wens bewaren")}</section>
    </>}
  </dialog>, document.body);
}
