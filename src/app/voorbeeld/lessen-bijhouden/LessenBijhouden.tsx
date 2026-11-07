"use client";

import { useEffect, useMemo, useState } from "react";
import s from "./bijhouden.module.css";

type Stappen = { hulp: boolean; zinnen: boolean; controleur: boolean; speel: boolean };
type Les = { id: string; titel: string; onderwerp: string; stappen: Stappen };
type Mijn = { bekeken?: boolean; akkoord?: boolean; opmerking?: string };

const OPSLAG = "thuisles-lessen-bijhouden";
const KOLOMMEN: [keyof Stappen, string][] = [["hulp", "Hulp omgezet"], ["zinnen", "Zinnen herschreven"], ["controleur", "Controleur"], ["speel", "Speelcontrole"]];

export function LessenBijhouden({ lessen, uitleg, bijgewerkt }: { lessen: Les[]; uitleg: Record<string, string>; bijgewerkt: string }) {
  const [mijn, setMijn] = useState<Record<string, Mijn>>({});
  const [zoek, setZoek] = useState("");
  const [onderwerp, setOnderwerp] = useState("");
  const [toon, setToon] = useState<"alles" | "open" | "akkoord">("alles");

  useEffect(() => {
    try {
      setMijn(JSON.parse(localStorage.getItem(OPSLAG) ?? "{}"));
    } catch {}
  }, []);

  function zet(id: string, wijziging: Mijn) {
    setMijn((vorig) => {
      const nieuw = { ...vorig, [id]: { ...vorig[id], ...wijziging } };
      try {
        localStorage.setItem(OPSLAG, JSON.stringify(nieuw));
      } catch {}
      return nieuw;
    });
  }

  const onderwerpen = useMemo(() => [...new Set(lessen.map((l) => l.onderwerp))].sort(), [lessen]);
  const zichtbaar = lessen.filter((l) => {
    const m = mijn[l.id] ?? {};
    if (onderwerp && l.onderwerp !== onderwerp) return false;
    if (zoek && !`${l.titel} ${l.id}`.toLowerCase().includes(zoek.toLowerCase())) return false;
    if (toon === "open" && m.akkoord) return false;
    if (toon === "akkoord" && !m.akkoord) return false;
    return true;
  });
  const aantalAkkoord = lessen.filter((l) => mijn[l.id]?.akkoord).length;
  const aantalBekeken = lessen.filter((l) => mijn[l.id]?.bekeken).length;

  return (
    <main className={s.pagina}>
      <header className={s.kop}>
        <p className={s.boven}>Alleen op deze laptop · bijgewerkt {bijgewerkt}</p>
        <h1>Lessen bijhouden</h1>
        <p>
          Hier zie je per Squla-les wat er is gedaan, en kun je zelf bijhouden welke je hebt bekeken en goedgekeurd. Jouw vinkjes en opmerkingen worden
          alleen in deze browser bewaard, niet in de database.
        </p>
        <p className={s.tellers}>
          <strong>{aantalBekeken}</strong> van {lessen.length} bekeken · <strong>{aantalAkkoord}</strong> goedgekeurd
        </p>
        <details className={s.uitleg}>
          <summary>Wat betekenen de kolommen?</summary>
          <ul>
            {KOLOMMEN.map(([k, naam]) => (
              <li key={k}>
                <strong>{naam}:</strong> {uitleg[k]}
              </li>
            ))}
          </ul>
        </details>
      </header>

      <div className={s.filters}>
        <label>
          Zoeken
          <input value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Bijvoorbeeld klok" />
        </label>
        <label>
          Onderwerp
          <select value={onderwerp} onChange={(e) => setOnderwerp(e.target.value)}>
            <option value="">Alles</option>
            {onderwerpen.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label>
          Tonen
          <select value={toon} onChange={(e) => setToon(e.target.value as typeof toon)}>
            <option value="alles">Alle lessen</option>
            <option value="open">Nog niet goedgekeurd</option>
            <option value="akkoord">Goedgekeurd</option>
          </select>
        </label>
        <p>{zichtbaar.length} lessen</p>
      </div>

      <ul className={s.lijst}>
        {zichtbaar.map((l) => {
          const m = mijn[l.id] ?? {};
          return (
            <li key={l.id} className={m.akkoord ? s.akkoord : s.les}>
              <div className={s.titelregel}>
                <div>
                  <h2>{l.titel}</h2>
                  <p className={s.id}>
                    {l.onderwerp} · {l.id}
                  </p>
                </div>
                <a className={s.open} href={`/voorbeeld/les/${l.id}?naam=Testkind`} target="_blank" rel="noreferrer">
                  Les openen
                </a>
              </div>
              <ul className={s.stappen}>
                {KOLOMMEN.map(([k, naam]) => (
                  <li key={k} className={l.stappen[k] ? s.klaar : s.nietklaar}>
                    <span aria-hidden="true">{l.stappen[k] ? "✓" : "○"}</span> {naam}
                    <span className={s.verborgen}>{l.stappen[k] ? ": klaar" : ": nog niet"}</span>
                  </li>
                ))}
              </ul>
              <div className={s.mijn}>
                <label>
                  <input type="checkbox" checked={!!m.bekeken} onChange={(e) => zet(l.id, { bekeken: e.target.checked })} /> Ik heb deze les bekeken
                </label>
                <label>
                  <input type="checkbox" checked={!!m.akkoord} onChange={(e) => zet(l.id, { akkoord: e.target.checked, bekeken: e.target.checked || m.bekeken })} /> Akkoord
                </label>
                <label className={s.opmerking}>
                  Opmerking
                  <textarea value={m.opmerking ?? ""} onChange={(e) => zet(l.id, { opmerking: e.target.value })} placeholder="Wat moet er anders?" />
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
