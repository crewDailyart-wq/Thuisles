"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { leesbareLesTekst } from "@/lib/lessen/tekstbewerking";
import { cijfersInTekst } from "@/lib/lessen/cijfertaal";
import type { TekstKeuzeStand } from "./keuzes-bewaren";
import { kiesTekst, pasTekstAan } from "./acties";
import s from "./voorbeelden.module.css";

export function TekstKeuze({ lesId, sleutel, versie, nieuw, start, beheer, nummer }: {
  lesId: string; sleutel: string; versie: string; nieuw: string; start: TekstKeuzeStand; beheer: boolean; nummer: number;
}) {
  const router = useRouter();
  const [stand, setStand] = useState(start);
  const [voorstel, setVoorstel] = useState({ nieuw, versie });
  const [bezig, setBezig] = useState<boolean | null>(null);
  const [bewerken, setBewerken] = useState(false);
  const [invoer, setInvoer] = useState(nieuw);
  const [fout, setFout] = useState("");
  const vergrendeld = useRef(false);
  useEffect(() => {
    if (!vergrendeld.current) {
      setStand(start);
      setVoorstel({ nieuw, versie });
    }
  }, [start, nieuw, versie]);

  async function bewaar(aan: boolean, eigenTekst?: string) {
    if (vergrendeld.current) return;
    vergrendeld.current = true;
    setBezig(aan);
    setFout("");
    try {
      const resultaat = eigenTekst === undefined
        ? await kiesTekst(sleutel, aan, stand.actueel, voorstel.versie)
        : await pasTekstAan(sleutel, eigenTekst, stand.actueel, voorstel.versie);
      if (resultaat.stand) setStand(resultaat.stand);
      if (resultaat.nieuw !== undefined && resultaat.versie) setVoorstel({ nieuw: resultaat.nieuw, versie: resultaat.versie });
      if (resultaat.fout) setFout(resultaat.fout);
      else {
        setBewerken(false);
        router.refresh();
      }
    } catch {
      setFout("Opslaan is niet bevestigd. Je invoer blijft staan. Vernieuw de pagina om de opgeslagen stand te zien. Controleer ook of de beheerstand nog aanstaat.");
    } finally {
      vergrendeld.current = false;
      setBezig(null);
    }
  }

  const leesbaar = (tekst: string) => cijfersInTekst(leesbareLesTekst(tekst));
  const gelijk = !stand.kanTerug && leesbaar(stand.actueel) === voorstel.nieuw;
  const toonVorige = stand.aan && stand.kanTerug && !bewerken;
  const aanpasKnop = beheer && <button type="button" className={s.aanpassen} disabled={bezig !== null}
    onClick={() => { setInvoer(voorstel.nieuw); setFout(""); setBewerken(true); }}>Tekst aanpassen</button>;
  const lesLink = <a className={s.leslink} href={`/voorbeeld/les/${lesId}?beheer=1&uitleg=nee`}
    target="_blank" rel="noopener noreferrer" aria-label={`Bekijk de les bij tekst ${nummer} (nieuw tabblad)`}>Bekijk de les ↗</a>;
  const tekstActies = <div className={s.tekstacties}>{aanpasKnop}{lesLink}</div>;
  const editor = <form className={s.eigenTekst} onSubmit={(event) => { event.preventDefault(); void bewaar(true, invoer); }}>
    <label htmlFor={`${sleutel}-tekst`}>Jouw tekst</label>
    <textarea id={`${sleutel}-tekst`} value={invoer} onChange={(event) => setInvoer(event.target.value)} rows={4} maxLength={1500} required autoFocus disabled={bezig !== null} />
    <p>Pas alleen aan wat je wilt veranderen. Opslaan vervangt deze tekst meteen in de les.</p>
    <div><button type="submit" disabled={bezig !== null || !invoer.trim()}>{bezig !== null ? "Opslaan…" : "Opslaan en gebruiken"}</button>
      <button type="button" className={s.annuleren} disabled={bezig !== null} onClick={() => { setBewerken(false); setFout(""); }}>Annuleren</button></div>
  </form>;

  if (gelijk && !bewerken) return <div className={s.ongewijzigd} aria-label={`Tekst ${nummer}: huidige tekst`}>
    <span>Blijft hetzelfde</span><p>{leesbaar(stand.actueel)}</p>{tekstActies}
    {fout && <p className={s.fout} role="alert">{fout}</p>}
  </div>;

  return <div className={s.tekstkeuze} data-toegepast={stand.aan ? "ja" : "nee"}>
    <div className={s.vergelijking}>
      <section className={s.huidig} aria-label={`Tekst ${nummer}: ${toonVorige ? "vorige tekst" : "huidige tekst"}`}>
        <h3>{toonVorige ? "Vorige tekst · ter vergelijking" : "Nu in de les"}</h3>
        <p className={s.woorden}>{leesbaar(toonVorige ? stand.vorig : stand.actueel)}</p>
      </section>
      <section className={s.nieuw} aria-label={`Tekst ${nummer}: voorstel`}>
        <h3>{bewerken ? "Tekst aanpassen" : stand.aan ? "Gebruikt in de les" : "Voorstel · makkelijker gezegd"}</h3>
        {bewerken ? editor : <>
          <p className={s.woorden}>{voorstel.nieuw}</p>
          <label className={s.vinklabel} htmlFor={sleutel}>
            <input id={sleutel} type="checkbox" checked={bezig ?? stand.aan}
              disabled={!beheer || bezig !== null || (stand.aan && !stand.kanTerug)}
              onChange={(event) => { void bewaar(event.target.checked); }} />
            <span>{bezig !== null ? "Opslaan…" : stand.aan ? "Deze tekst staat in de les" : "Gebruik deze tekst in de les"}</span>
          </label>
          <p className={s.keuzestatus} role="status" aria-live="polite">
            {bezig !== null ? "Even wachten op de bevestiging." : stand.aan ? stand.kanTerug ? "Opgeslagen. Vink uit om de vorige tekst terug te zetten." : "De les gebruikt deze tekst al." : "Aanvinken slaat deze tekst meteen op."}
          </p>
          {tekstActies}
        </>}
        {bewerken && <div className={s.tekstacties}>{lesLink}</div>}
      </section>
    </div>
    {fout && <p className={s.fout} role="alert">{fout}</p>}
  </div>;
}
