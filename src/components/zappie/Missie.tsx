"use client";

/**
 * Een Zappie-missie: 15 sommen achter elkaar, met Zappie ernaast.
 *
 * Volgens de ontwerpregels:
 * - de som staat op één regel, gegeven getallen in een geel vakje en het
 *   invulvak wit met een lichte rand;
 * - het invulvak is een echt invoerveld met alleen cijfers (HARDE REGEL 5), en
 *   schuift mee omhoog als het toetsenbord van een tablet opengaat;
 * - goed of fout pas na Controleer; nooit "fout", wel "Nog niet helemaal";
 * - de eerste drie sommen tonen de bolletjes meteen; daarna pas als hulp,
 *   na een eerste poging die nog niet goed is.
 *
 * Punten: 10 voor een som die meteen goed is, 5 voor goed bij de tweede keer,
 * en 50 extra voor het afmaken van de missie. Die worden pas aan het eind
 * bewaard, zodat een missie die halverwege stopt niet meetelt.
 */

import Link from "next/link";
import { useRef, useState } from "react";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import { IcoonSter, IcoonTerug } from "@/components/zappie/Iconen";
import { Tekstballon } from "@/components/zappie/Onderdelen";
import { Puntenteller } from "@/components/zappie/Schil";
import { Zappie, type Stemming } from "@/components/zappie/Zappie";
import { VISUELE_SOMMEN, type Som } from "@/lib/zappie/missie";
import { voltooiMissie } from "@/lib/zappie/opslag";
import {
  PUNTEN_DIRECT,
  PUNTEN_MISSIE,
  PUNTEN_TWEEDE_KEER,
  puntenTekst,
} from "@/lib/zappie/voortgang";
import type { WereldId } from "@/lib/zappie/werelden";

type Uitslag = "goed" | "hulp" | "gemist";
type Fase = "vragen" | "nog-niet" | "goed" | "antwoord";

const GOED_ZO = ["Goed zo!", "Ja, dat klopt!", "Knap gedaan!", "Super, je hebt het!", "Helemaal goed!"];

export function Missie({
  wereld,
  wereldnaam,
  nummer,
  titel,
  sommen,
}: {
  wereld: WereldId;
  wereldnaam: string;
  nummer: number;
  titel: string;
  sommen: Som[];
}) {
  const [index, zetIndex] = useState(0);
  const [invoer, zetInvoer] = useState("");
  const [fase, zetFase] = useState<Fase>("vragen");
  const [uitslagen, zetUitslagen] = useState<Uitslag[]>([]);
  const [tik, zetTik] = useState(0);
  const [klaar, zetKlaar] = useState<{ punten: number } | null>(null);
  const veld = useRef<HTMLInputElement>(null);
  const { bijAandacht, bijWeggaan } = useInBeeld();

  const som = sommen[index];
  const toonBolletjes = index < VISUELE_SOMMEN || fase !== "vragen";

  const bericht: { tekst: string; stemming: Stemming } =
    fase === "goed"
      ? { tekst: GOED_ZO[index % GOED_ZO.length], stemming: "juich" }
      : fase === "nog-niet"
        ? { tekst: "Nog niet helemaal. Tel de bolletjes en probeer het nog eens.", stemming: "kijk" }
        : fase === "antwoord"
          ? { tekst: `Het is ${som.antwoord}. Kijk maar naar de bolletjes.`, stemming: "kijk" }
          : index === 0
            ? { tekst: "Vul het antwoord in en druk op Controleer.", stemming: "blij" }
            : { tekst: "Vul in.", stemming: "blij" };

  function controleer() {
    if (invoer === "") {
      veld.current?.focus();
      return;
    }
    const goed = Number(invoer) === som.antwoord;
    zetTik((n) => n + 1);
    if (goed) {
      zetUitslagen((u) => [...u, fase === "nog-niet" ? "hulp" : "goed"]);
      zetFase("goed");
    } else if (fase === "vragen") {
      zetFase("nog-niet");
      veld.current?.select();
    } else {
      zetUitslagen((u) => [...u, "gemist"]);
      zetFase("antwoord");
    }
  }

  function volgende() {
    if (index + 1 >= sommen.length) {
      const punten =
        uitslagen.reduce((t, u) => t + (u === "goed" ? PUNTEN_DIRECT : u === "hulp" ? PUNTEN_TWEEDE_KEER : 0), 0) +
        PUNTEN_MISSIE;
      voltooiMissie(wereld, punten);
      zetKlaar({ punten });
      zetTik((n) => n + 1);
      return;
    }
    zetIndex((i) => i + 1);
    zetInvoer("");
    zetFase("vragen");
    /* Het volgende invulvak is meteen actief. */
    requestAnimationFrame(() => veld.current?.focus());
  }

  if (klaar) {
    const goed = uitslagen.filter((u) => u !== "gemist").length;
    const sterren = goed >= 14 ? 3 : goed >= 10 ? 2 : 1;
    return (
      <main className="zp-missie">
        <div className="zp-missieveld">
          <section className="zp-klaar zp-glaspaneel" style={{ padding: "28px 24px", maxWidth: "36rem", width: "100%" }}>
            <Zappie stemming="juich" praat tik={tik} />
            <h1 className="zp-kop zp-titel">Missie klaar!</h1>
            <div className="zp-sterren" aria-label={`${sterren} van de 3 sterren`}>
              {[1, 2, 3].map((n) => (
                <span key={n} data-aan={n <= sterren ? "ja" : "nee"}>
                  <IcoonSter />
                </span>
              ))}
            </div>
            <p className="zp-zin" style={{ margin: 0 }}>
              Je had er {goed} van de {sommen.length} goed.
              <br />
              Je verdient <strong>{puntenTekst(klaar.punten)} Zappie-punten</strong>!
            </p>
            <Puntenteller />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              <Link href="/zappie" className="zp-knop zp-titel">
                Terug naar start
              </Link>
              <Link href="/zappie/wereld" className="zp-knop zp-knop-glas zp-titel">
                Bekijk de {wereldnaam}
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const stand = fase === "goed" ? "goed" : fase === "nog-niet" ? "nog-niet" : undefined;
  const bezig = fase === "vragen" || fase === "nog-niet";

  return (
    <main className="zp-missie">
      <div className="zp-missiebalk">
        <Link href="/zappie" className="zp-knop zp-knop-glas" style={{ fontSize: 18, minHeight: 48, padding: "0 16px" }}>
          <IcoonTerug className="size-6" />
          <span>Stoppen</span>
        </Link>
        <ol className="zp-stippenrij" aria-label={`Som ${index + 1} van ${sommen.length}`}>
          {sommen.map((_, i) => (
            <li
              key={i}
              className="zp-stip"
              data-stand={i < uitslagen.length ? (uitslagen[i] === "goed" ? "goed" : uitslagen[i] === "hulp" ? "hulp" : "gemist") : i === index ? "nu" : undefined}
            />
          ))}
        </ol>
        <Puntenteller klein />
      </div>

      <div className="zp-missieveld">
        <p className="zp-titel" style={{ margin: 0, fontSize: 18, opacity: 0.9 }}>
          {wereldnaam} · Missie {nummer} · {titel}
        </p>

        <form
          className="zp-somkaart"
          onSubmit={(e) => {
            e.preventDefault();
            if (bezig) controleer();
            else volgende();
          }}
        >
          <p className="zp-vraagzin zp-titel">Vul in.</p>
          <div className="zp-som zp-titel">
            <span className="zp-somvak">{som.a}</span>
            <span aria-hidden="true">{som.teken}</span>
            <span className="sr-only">{som.teken === "+" ? "plus" : "min"}</span>
            <span className="zp-somvak">{som.b}</span>
            <span>=</span>
            <input
              ref={veld}
              className="zp-invul zp-titel"
              data-stand={stand}
              value={fase === "antwoord" ? String(som.antwoord) : invoer}
              onChange={(e) => {
                if (!bezig) return;
                zetInvoer(e.target.value.replace(/[^0-9]/g, "").slice(0, 2));
              }}
              onFocus={(e) => bijAandacht(e.currentTarget)}
              onBlur={bijWeggaan}
              readOnly={!bezig}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              autoFocus
              aria-label="Antwoord"
            />
          </div>

          {toonBolletjes && <Bolletjes som={som} />}

          <button type="submit" className="zp-knop zp-titel" data-controleer style={{ minWidth: 220 }}>
            {bezig ? "Controleer" : index + 1 >= sommen.length ? "Klaar!" : "Volgende"}
          </button>
        </form>

        <div className="zp-missiezappie">
          <Zappie stemming={bericht.stemming} praat={fase !== "vragen"} tik={tik} />
          <Tekstballon tekst={bericht.tekst} />
        </div>
      </div>
    </main>
  );
}

/**
 * De bolletjes bij een som, in rijtjes van 5.
 * Plus: twee groepjes, blauw en geel. Min: één groepje; wat eraf gaat is grijs
 * en half doorzichtig, wat overblijft is fel.
 */
function Bolletjes({ som }: { som: Som }) {
  if (som.teken === "+") {
    return (
      <div className="zp-bolletjes" aria-label={`${som.a} blauwe bolletjes en ${som.b} gele bolletjes`}>
        <Groep aantal={som.a} />
        <Groep aantal={som.b} kleur="geel" />
      </div>
    );
  }
  return (
    <div className="zp-bolletjes" aria-label={`${som.a} bolletjes, daarvan gaan er ${som.b} af`}>
      <Groep aantal={som.a} weg={som.b} />
    </div>
  );
}

function Groep({ aantal, kleur, weg = 0 }: { aantal: number; kleur?: "geel"; weg?: number }) {
  return (
    <div className="zp-bolletjesgroep" aria-hidden="true">
      {Array.from({ length: aantal }, (_, i) => (
        <span key={i} className="zp-bolletje" data-kleur={kleur} data-weg={i >= aantal - weg ? "ja" : undefined} />
      ))}
    </div>
  );
}
