"use client";

/**
 * De andere Zappie-schermen, eerste versie: de werelden met hun missies, de
 * beloningen en jouw eigen wereld. Bewust eenvoudig: hier komt later meer.
 */

import Link from "next/link";
import { IcoonKasteel, IcoonSlot, IcoonSter } from "@/components/zappie/Iconen";
import { Tekstballon, Wereldbeeld } from "@/components/zappie/Onderdelen";
import { Zappie } from "@/components/zappie/Zappie";
import { useVoortgang } from "@/lib/zappie/opslag";
import { puntenTekst, volgendeMissie, wereldStanden } from "@/lib/zappie/voortgang";
import { ASSETS, WERELDEN } from "@/lib/zappie/werelden";

/** Wereld: de drie werelden, met per wereld de missies als stenen. */
export function WereldScherm() {
  const v = useVoortgang();
  const standen = wereldStanden(v);
  const volgende = volgendeMissie(v);

  return (
    <main className="zp-pagina">
      <h1 className="zp-kop zp-titel">Wereld</h1>
      <p className="zp-zin">Met elke missie kom je verder. Maak alle missies, dan gaat de volgende wereld open.</p>
      <div className="zp-wereldrij">
        {standen.map(({ wereld, open, klaar, huidig, nogNodig }) => (
          <section key={wereld.id} className="zp-wereldkaart zp-glaspaneel" data-open={open ? "ja" : "nee"}>
            <h2 className="zp-titel">
              {!open && <IcoonSlot className="size-7" />}
              {wereld.naam}
            </h2>
            <Wereldbeeld beeld={wereld.beeld} className="zp-wereldbol" laden="lazy" />
            {open ? (
              <>
                <p className="zp-titel" style={{ margin: 0, fontSize: 20 }}>
                  {klaar} van de {wereld.missies} missies
                </p>
                <ol className="zp-missiestenen" aria-label={`Missies in de ${wereld.naam}`}>
                  {Array.from({ length: wereld.missies }, (_, i) => {
                    const nummer = i + 1;
                    const stand = nummer <= klaar ? "klaar" : huidig && nummer === volgende.nummer ? "nu" : "later";
                    const steen = (
                      <span className="zp-missiesteen" data-stand={stand}>
                        {stand === "klaar" ? <IcoonSter className="size-7" /> : nummer}
                      </span>
                    );
                    return (
                      <li key={nummer} aria-label={`Missie ${nummer}${stand === "klaar" ? ", klaar" : stand === "nu" ? ", nu aan de beurt" : ""}`}>
                        {stand === "nu" ? (
                          <Link href={`/zappie/oefenen?wereld=${wereld.id}&missie=${nummer}`}>{steen}</Link>
                        ) : (
                          steen
                        )}
                      </li>
                    );
                  })}
                </ol>
                {huidig && (
                  <Link href={`/zappie/oefenen?wereld=${wereld.id}&missie=${volgende.nummer}`} className="zp-knop zp-titel">
                    Start missie {volgende.nummer}
                  </Link>
                )}
              </>
            ) : (
              <p className="zp-titel" style={{ margin: 0, fontSize: 20 }}>
                Nog {nogNodig} {nogNodig === 1 ? "missie" : "missies"}, dan gaat deze wereld open.
              </p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}

/** Beloningen: de punten en de verdiende sterren per wereld. */
export function BeloningenScherm() {
  const v = useVoortgang();
  const missies = WERELDEN.reduce((t, w) => t + (v.missies[w.id] ?? 0), 0);

  return (
    <main className="zp-pagina">
      <h1 className="zp-kop zp-titel">Beloningen</h1>
      <p className="zp-zin">Elke som die je goed hebt, geeft punten. Elke missie geeft een ster.</p>
      <div className="zp-beloningrij">
        <section className="zp-beloning zp-glaspaneel">
          <IcoonSter className="size-16" />
          <span className="zp-beloning-getal zp-titel">{puntenTekst(v.punten)}</span>
          <span className="zp-titel" style={{ fontSize: 20 }}>Zappie-punten</span>
        </section>
        <section className="zp-beloning zp-glaspaneel">
          <IcoonSter className="size-16" />
          <span className="zp-beloning-getal zp-titel">{missies}</span>
          <span className="zp-titel" style={{ fontSize: 20 }}>{missies === 1 ? "missie klaar" : "missies klaar"}</span>
        </section>
        {WERELDEN.map((w) => (
          <section key={w.id} className="zp-beloning zp-glaspaneel">
            <Wereldbeeld beeld={w.beeld} className="size-24" laden="lazy" />
            <span className="zp-titel" style={{ fontSize: 22 }}>{w.naam}</span>
            <span className="zp-titel" style={{ fontSize: 18, opacity: 0.85 }}>
              {v.missies[w.id] ?? 0} van de {w.missies} sterren
            </span>
          </section>
        ))}
      </div>
    </main>
  );
}

/**
 * Jouw wereld: de eigen bouwplek. Eerste versie: het eiland met lege plekken
 * waar later gebouwen komen. Er is nog niets te bouwen; dat zegt Zappie ook.
 */
const BOUWPLEKKEN = [
  { x: 36, y: 71 },
  { x: 67, y: 81 },
  { x: 89, y: 63 },
];

export function MijnWereldScherm() {
  return (
    <main className="zp-pagina">
      <h1 className="zp-kop zp-titel" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IcoonKasteel className="size-12" />
        Jouw wereld
      </h1>
      <p className="zp-zin">Dit is jouw eigen eiland. Hier ga je straks bouwen.</p>
      <div className="zp-eiland zp-glaspaneel">
        <picture>
          <source type="image/avif" srcSet={`${ASSETS}/my-world-island.avif`} />
          <img src={`${ASSETS}/my-world-island.webp`} alt="Een eiland met huisjes, bomen, een vuurtoren en een steiger" />
        </picture>
        {BOUWPLEKKEN.map((p, i) => (
          <span key={i} className="zp-bouwplek" style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-hidden="true">
            <IcoonSlot />
          </span>
        ))}
      </div>
      <div className="zp-missiezappie" style={{ marginTop: 20 }}>
        <Zappie stemming="blij" />
        <Tekstballon tekst="Bouwen kan nog niet. Op de lege plekken komen straks gebouwen. Oefen alvast, dan heb je punten om te bouwen!" />
      </div>
    </main>
  );
}
