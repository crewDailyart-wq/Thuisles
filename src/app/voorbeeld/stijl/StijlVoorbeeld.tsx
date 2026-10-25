"use client";

/**
 * Het opdrachtscherm van /voorbeeld/stijl, met de echte onderdelen. De
 * stijlkiezer stuurt de stijl waaraan je werkt met postMessage; die vervangt
 * hier zolang de bewaarde stijl, zodat je ziet hoe het wordt vóór je bewaart.
 */

import { useEffect, useState } from "react";
import { BliepoVloer } from "@/components/oefenen/BliepoVloer";
import { OpdrachtDecor } from "@/components/oefenen/OpdrachtDecor";
import { Voortgangskop } from "@/components/oefenen/Voortgangskop";
import type { Bolstand } from "@/components/oefenen/Oefenbalk";
import { maakStijl, stijlCss } from "@/lib/stijl";
import "@/components/oefenen/opdracht-nieuw.css";
import "@/components/gesprek/gesprek.css";

const STANDEN: Bolstand[] = [
  "goed",
  "goed",
  "fout",
  "nu",
  ...Array<Bolstand>(11).fill("open"),
];
const KORT = "Hoeveel stippen zie je samen?";
const LANG =
  "Kijk eens goed naar de twee groepjes stippen op het bord. Links zie je een groepje rode stippen en rechts een groepje blauwe stippen. Tel eerst de rode stippen, dan de blauwe stippen, en bedenk dan hoeveel stippen het samen zijn. Je mag ze aanwijzen met je vinger als dat helpt. Welk getal hoort erbij?";

export function StijlVoorbeeld({
  lang,
  langeTekst,
  fase: beginFase,
  godot = false,
}: {
  lang: boolean;
  langeTekst: boolean;
  fase: "bezig" | "goed" | "fout";
  godot?: boolean;
}) {
  const [css, zetCss] = useState<string | null>(null);
  const [fase, zetFase] = useState(beginFase);
  const [woord, zetWoord] = useState(0);
  const zin = (langeTekst ? LANG : KORT).split(" ");

  /* De stijl uit de stijlkiezer (alleen van dezelfde site). */
  useEffect(() => {
    const op = (e: MessageEvent) => {
      if (
        e.origin !== window.location.origin ||
        !e.data ||
        typeof e.data !== "object"
      )
        return;
      if (e.data.soort === "stijl") zetCss(stijlCss(maakStijl(e.data.stijl)));
      if (e.data.soort === "fase") {
        zetFase(e.data.fase);
        window.setTimeout(() => zetFase("bezig"), 1700);
      }
    };
    window.addEventListener("message", op);
    window.parent?.postMessage(
      { soort: "voorbeeld-klaar" },
      window.location.origin,
    );
    return () => window.removeEventListener("message", op);
  }, []);

  /* Zolang er een proefstijl is, telt de bewaarde stijl even niet. */
  useEffect(() => {
    const bewaard =
      document.querySelector<HTMLStyleElement>("style[data-stijl]");
    if (bewaard) bewaard.disabled = css !== null;
  }, [css]);

  /* Zoals een Godot-ronde: met het oude donkere thema op <html> (de controle kijkt of Bliepo dan nog goed staat). */
  useEffect(() => {
    if (!godot) return;
    const html = document.documentElement;
    html.dataset.stijl = "nacht";
    return () => {
      delete html.dataset.stijl;
    };
  }, [godot]);

  /* Het meelezen loopt steeds rond. */
  useEffect(() => {
    const klok = window.setInterval(
      () => zetWoord((w) => (w + 1) % (zin.length + 4)),
      380,
    );
    return () => window.clearInterval(klok);
  }, [zin.length]);

  return (
    <>
      {css !== null && <style data-stijl-proef="">{css}</style>}
      <OpdrachtDecor />
      <div className="opdracht-nieuw" data-fase={fase}>
        <Voortgangskop
          terugHref="#"
          titel="Groepjes samen tellen"
          standen={STANDEN}
          index={3}
        />
        <div
          className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10"
          data-godotronde={godot ? "" : undefined}
        >
          <div
            data-oefenkaart=""
            className="relative rounded-groot border border-rand bg-kaart p-5 shadow-op sm:p-8"
          >
            <h1 className="text-center text-2xl font-extrabold sm:text-3xl">
              {lang
                ? "Tel de stippen in alle groepjes en kies het goede getal."
                : "Hoeveel is 5 + 3?"}
            </h1>
            <div className="mt-6 flex flex-col items-center gap-4">
              {(lang ? [5, 3, 4, 2, 6] : [5, 3]).map((n, i) => (
                <div
                  key={i}
                  className="flex gap-2 rounded-2xl bg-kaart px-4 py-3"
                >
                  {Array.from({ length: n }, (_, j) => (
                    <span
                      key={j}
                      className="size-6 rounded-full"
                      style={{ background: i % 2 ? "#4f8dff" : "#ff6b6b" }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="gs-knoppen mt-6 justify-center">
              {[7, 8, 9].map((n) => (
                <button key={n} type="button" className="gs-knop" tabIndex={-1}>
                  {n}
                </button>
              ))}
            </div>
            <div
              data-knoppen=""
              className="mt-6 flex flex-wrap items-center justify-center gap-3"
            >
              <button
                type="button"
                data-controleer=""
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-extrabold"
                tabIndex={-1}
              >
                Controleer
              </button>
            </div>
          </div>
          {/* Net als in een echte opdracht (Maatje) staat Bliepo in hetzelfde vak als het bord. */}
          <BliepoVloer
            plek="vast"
            onNogEens={() => {}}
            naast={
              <div className="gs-praat">
                <button
                  type="button"
                  className="gs-praatknop"
                  aria-label="Tik om iets te zeggen"
                  tabIndex={-1}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="gs-microfoon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <rect
                      x="9"
                      y="3"
                      width="6"
                      height="11"
                      rx="3"
                      fill="currentColor"
                    />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                  </svg>
                </button>
              </div>
            }
          >
            <p className="bliepo-tekst bliepo-tekst-meelezen">
              {zin.map((w, i) => (
                <span
                  key={i}
                  className={`bliepo-tekst-woord ${woord > i ? "bliepo-tekst-gezegd" : woord === i ? "bliepo-tekst-nu" : "bliepo-tekst-nog"}`}
                >
                  {w}
                  {i < zin.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          </BliepoVloer>
        </div>
      </div>
    </>
  );
}
