"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { VosFiguur } from "@/components/oefenen/VosFiguur";
import { zeg, stopPraten } from "@/lib/stem";
import styles from "./HuisjesVoorbeeld.module.css";

/** Los speelvoorbeeld. Schrijft geen vragen, resultaten of beloningen naar de database. */
export function HuisjesVoorbeeld() {
  const [midden, setMidden] = useState(8);
  const [erna, setErna] = useState(false);
  const [invoer, setInvoer] = useState("");
  const [hulp, setHulp] = useState(false);
  const [fase, setFase] = useState<"bezig" | "opnieuw" | "goed">("bezig");
  const [bezorgd, setBezorgd] = useState(0);
  const [klaar, setKlaar] = useState(false);
  const veld = useRef<HTMLInputElement>(null);
  const volgende = useRef<HTMLButtonElement>(null);
  const antwoord = midden + (erna ? 1 : -1);
  const doel = erna ? 2 : 0;
  const vraag = `Welk getal komt ${erna ? "na" : "vóór"} ${midden}?`;

  useEffect(() => () => stopPraten(), []);
  useEffect(() => {
    if (fase === "goed") volgende.current?.focus();
  }, [fase]);

  function controleer() {
    if (!invoer || fase === "goed") return;
    if (Number(invoer) === antwoord) {
      setFase("goed");
      setBezorgd((aantal) => aantal + 1);
    } else {
      setFase("opnieuw");
      setHulp(true);
      veld.current?.select();
    }
  }

  function nieuweVraag() {
    stopPraten();
    if (bezorgd === 5) {
      setKlaar(true);
      return;
    }
    // Nieuwe getallen in de browser, uitsluitend voor dit losse speelvoorbeeld.
    setMidden((oud) => 2 + ((oud - 2 + 1 + Math.floor(Math.random() * 17)) % 18));
    setErna((waarde) => !waarde);
    setInvoer("");
    setHulp(false);
    setFase("bezig");
    veld.current?.focus();
  }

  function opnieuw() {
    stopPraten();
    setBezorgd(0);
    setKlaar(false);
    setMidden(8);
    setErna(false);
    setInvoer("");
    setHulp(false);
    setFase("bezig");
  }

  return (
    <main className={styles.pagina}>
      <header className={styles.balk}>
        <Link href="/start" className={styles.terug}>← Thuisles</Link>
        <span className={styles.voorbeeld}>Speelvoorbeeld</span>
        <span className={styles.teller} aria-label={`${bezorgd} van 5 pakketjes bezorgd`}>📦 {bezorgd} / 5</span>
      </header>
      {klaar ? (
        <section className={styles.klaar}>
          <span className={styles.klein}>DE HUISJESPOST</span>
          <VosFiguur houding="juichend" beweging="juichen" className="size-36" />
          <h1>Alles bezorgd!</h1>
          <p>Vijf pakketjes, vijf blije buren.</p>
          <button className={styles.hoofdknop} onClick={opnieuw}>Nog een rondje ↻</button>
        </section>
      ) : (
        <>
          <section className={styles.kop}>
            <span className={styles.klein}>DE HUISJESPOST</span>
            <div className={styles.vraagrij}>
              <h1>{vraag}</h1>
              <button className={styles.rond} onClick={() => zeg(vraag)} aria-label="Lees de vraag voor" title="Voorlezen">🔊</button>
            </div>
          </section>
          <form onSubmit={(event) => { event.preventDefault(); controleer(); }}>
            <div className={styles.dorp}>
              <div className={styles.zon} aria-hidden="true" />
              <div className={styles.wolk} aria-hidden="true">☁</div>
              <div className={styles.heuvel} aria-hidden="true" />
              <div className={styles.huisjes}>
                {[midden - 1, midden, midden + 1].map((nummer, index) => (
                  <div key={index} className={`${styles.huis} ${styles[`huis${index}`]} ${index === doel ? styles.doel : ""}`}>
                    <div className={styles.dak} aria-hidden="true" />
                    <div className={styles.gevel}>
                      {index === doel ? (
                        <input ref={veld} className={`${styles.nummer} ${styles.invoer}`} aria-label="Ontbrekend huisnummer"
                          inputMode="numeric" autoComplete="off" maxLength={2} placeholder="?"
                          readOnly={fase === "goed"} value={invoer} aria-invalid={fase === "opnieuw"}
                          aria-describedby="huisjes-feedback"
                          onChange={(event) => { setInvoer(event.target.value.replace(/[^0-9]/g, "").slice(0, 2)); setFase("bezig"); }} />
                      ) : <span className={styles.nummer}>{nummer}</span>}
                      <span className={styles.raam} aria-hidden="true" />
                      <div className={`${styles.deur} ${fase === "goed" && index === doel ? styles.open : ""}`} aria-hidden="true">
                        {fase === "goed" && index === doel ? "🐰" : <span />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`${styles.bezorger} ${fase === "goed" ? (erna ? styles.naarRechts : styles.naarLinks) : ""}`} aria-hidden="true">
                <VosFiguur houding={fase === "goed" ? "juichend" : "blij"} className={styles.vos} />
                <span className={styles.pakket}>📦</span>
              </div>
              <span className={styles.bloem1} aria-hidden="true">✿</span>
              <span className={styles.bloem2} aria-hidden="true">✿</span>
            </div>
            <div className={styles.bediening}>
              <p id="huisjes-feedback" className={styles.feedback} role="status">
                {fase === "goed" ? "Bezorgd! Goed gedaan." : fase === "opnieuw" ? "Nog een stapje. Kijk naar de getallenlijn." : "Vul het lege bordje in."}
              </p>
              {hulp && fase !== "goed" && (
                <div className={styles.hulp}>
                  <p>Eén stapje {erna ? "vooruit →" : "← terug"}</p>
                  <div className={styles.getallenlijn} aria-label={`Getallenlijn van ${Math.max(0, midden - 2)} tot ${Math.min(20, midden + 2)}`}>
                    {Array.from({ length: 5 }, (_, i) => midden - 2 + i).filter((n) => n >= 0 && n <= 20).map((n) => (
                      <span key={n} className={n === midden ? styles.anker : ""}>{n}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className={styles.knoppen}>
                {fase === "goed" ? (
                  <button ref={volgende} type="button" className={styles.hoofdknop} onClick={nieuweVraag}>{bezorgd === 5 ? "Klaar! ★" : "Volgend pakketje →"}</button>
                ) : (
                  <>
                    <button type="button" className={styles.hulpknop} aria-expanded={hulp} onClick={() => setHulp(!hulp)}>💡 Hulp</button>
                    <button type="submit" className={styles.hoofdknop} disabled={!invoer}>Bezorgen →</button>
                  </>
                )}
              </div>
            </div>
          </form>
        </>
      )}
      <footer className={styles.voet}>Voorbeeld · voortgang wordt niet opgeslagen</footer>
    </main>
  );
}
