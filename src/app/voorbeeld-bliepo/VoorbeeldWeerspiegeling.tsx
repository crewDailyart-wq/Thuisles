"use client";

/**
 * /voorbeeld-bliepo?atelier=1: drie versies van de weerspiegeling in de vloer
 * van het atelier (18 oktober 2026, proef; de echte pagina is niet veranderd).
 *
 * Waar de blokjes vandaan komen: de weerspiegeling wordt nu getekend in een
 * vaste afbeelding van 1024 bij 1024 zonder anti-aliasing (multisample 0, in
 * study-scene.ts), terwijl het atelier op een laptop zo'n 2160 bij 1350
 * pixels groot is.
 *
 * De versies komen één voor één (zodat ze elkaar niet storen bij het meten):
 * per versie de stilstand vanaf het verschijnen tot 1,5 s na klaar, en een foto
 * met de gloed aan en uit. Daarna kun je elke versie los en live bekijken.
 */

import { useEffect, useRef, useState } from "react";
import { AtelierStudy } from "@/components/zappie/atelier/AtelierStudy";
import type { Reflectie, StudyController } from "@/components/zappie/atelier/study-scene";

type Id = "nu" | Reflectie;
const VERSIES: { id: Id; titel: string; uitleg: string; gemeten: string }[] = [
  { id: "nu", titel: "Zoals nu (ter vergelijking)", uitleg: "De weerspiegeling van nu: 1024 bij 1024, zonder anti-aliasing.", gemeten: "Online gemeten: laptop ±0,5 s, nagebootste trage telefoon ±1,8 s (laadt als eerste, en betaalt daardoor iets extra)" },
  { id: "a", titel: "Versie A: scherp en helder", uitleg: "Hoge resolutie (die van het scherm) met anti-aliasing, als een gepolijste glanzende vloer.", gemeten: "Online gemeten: laptop ±0,4 s, nagebootste trage telefoon ±1,45 s" },
  { id: "b", titel: "Versie B: heel licht zacht", uitleg: "Hogere resolutie met anti-aliasing en een heel lichte vervaging: vloeiende randen, vormen goed herkenbaar.", gemeten: "Online gemeten: laptop ±0,4 s, nagebootste trage telefoon ±1,45 s" },
  { id: "c", titel: "Versie C: zacht, vervaagt naar de randen", uitleg: "Zoals B, maar hoe verder van het podium, hoe zachter en vager.", gemeten: "Online gemeten: laptop ±0,4 s, nagebootste trage telefoon ±1,45 s" },
];
const VOLGORDE: Id[] = ["nu", "a", "b", "c"];

type Uitslag = { stil: string; aan: string | null; uit: string | null };
const sec = (ms: number) => (ms / 1000).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function VoorbeeldWeerspiegeling() {
  const [actief, zetActief] = useState<Id | null>(null);
  const [live, zetLive] = useState(false);
  const [uitslag, zetUitslag] = useState<Partial<Record<Id, Uitslag>>>({});
  const gaten = useRef<{ t: number; duur: number }[]>([]);
  const begin = useRef(0);

  /* De teller: elk gat tussen twee beeldjes van meer dan 50 ms. */
  useEffect(() => {
    let frame = 0;
    let vorige = performance.now();
    const tel = (nu: number) => {
      if (nu - vorige > 50) gaten.current.push({ t: vorige, duur: nu - vorige });
      vorige = nu;
      frame = requestAnimationFrame(tel);
    };
    frame = requestAnimationFrame(tel);
    return () => cancelAnimationFrame(frame);
  }, []);

  /* Eerst de 3D-motor en de code van het atelier laden, zodat de eerste versie niet in het nadeel is. */
  useEffect(() => {
    const wacht = window.setTimeout(async () => {
      await Promise.all([import("three"), import("@/components/zappie/atelier/study-scene")]);
      await new Promise((r) => setTimeout(r, 1500));
      begin.current = performance.now();
      zetActief("nu");
    }, 1000);
    return () => window.clearTimeout(wacht);
  }, []);

  const klaar = (id: Id, c: StudyController) => {
    if (live) return;
    window.setTimeout(() => {
      const van = begin.current;
      const stil = gaten.current.filter((g) => g.t >= van - 1).reduce((a, g) => a + g.duur, 0);
      const aan = c.foto?.(true) ?? null;
      const uit = c.foto?.(false) ?? null;
      zetUitslag((u) => ({ ...u, [id]: { stil: sec(stil), aan, uit } }));
      const volgende = VOLGORDE[VOLGORDE.indexOf(id) + 1];
      zetActief(null);
      window.setTimeout(() => {
        begin.current = performance.now();
        zetActief(volgende ?? null);
      }, 800);
    }, 1500);
  };

  const klaarMetMeten = VOLGORDE.every((id) => uitslag[id]);

  return (
    <main className="min-h-svh bg-[#0d2a6b] px-4 py-8 text-white sm:px-8">
      <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-bold">Voorbeeld: weerspiegeling in het atelier</h1>
      <p className="mt-2 max-w-3xl text-white/80">
        Testpagina, staat in geen menu. De echte Beloningen-pagina is niet veranderd. Waar de blokjes vandaan komen: de
        weerspiegeling wordt nu in een vaste afbeelding van 1024 bij 1024 getekend, zonder anti-aliasing, terwijl het
        atelier op een laptop ongeveer twee keer zo veel pixels breed is. Elk blokje is dus een uitgerekte pixel van die
        afbeelding.
      </p>
      <p className="mt-2 max-w-3xl text-sm text-white/70">
        De versies laden één voor één en worden gemeten op dit apparaat. Daarna staan er per versie foto&apos;s met de gloed
        aan en uit, een uitvergroting van de vloer, en kun je hem live bekijken (met de knoppen van het atelier, ook
        &quot;Gloed aan/uit&quot;). Op een telefoon wordt de weerspiegeling in een iets lagere resolutie getekend.
      </p>

      <ol className="mt-6 grid gap-8">
        {VERSIES.map((v) => {
          const u = uitslag[v.id];
          const hier = actief === v.id;
          return (
            <li key={v.id} className="rounded-3xl border border-white/20 bg-white/5 p-4">
              <h2 className="text-xl font-bold">{v.titel}</h2>
              <p className="text-sm text-white/70">{v.uitleg}</p>
              <p className="mt-2 text-sm font-semibold" data-uitslag={v.id}>
                {u ? `Stilstand op dit apparaat: ${u.stil} s` : hier ? "Meten…" : "Wacht op zijn beurt…"}
                {v.gemeten && <span className="font-normal text-white/80"> · {v.gemeten}</span>}
              </p>

              {hier && (
                <div className="zs-live-atelier mt-3 !w-full">
                  <AtelierStudy embedded reflectie={v.id === "nu" ? null : v.id} onKlaar={(c) => klaar(v.id, c)} />
                </div>
              )}

              {u && !hier && (
                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  {(
                    [
                      ["Gloed aan", u.aan, false],
                      ["Gloed uit", u.uit, false],
                      ["Vloer uitvergroot (gloed aan)", u.aan, true],
                    ] as const
                  ).map(([label, src, groot]) => (
                    <figure key={label} className="m-0">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/20 bg-[#071731]">
                        {src && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={src}
                            alt={`${v.titel}, ${label}`}
                            className={groot ? "absolute inset-0 h-full w-full origin-[35%_80%] scale-[3] object-cover" : "absolute inset-0 h-full w-full object-cover"}
                          />
                        )}
                      </div>
                      <figcaption className="mt-1 text-sm text-white/80">{label}</figcaption>
                    </figure>
                  ))}
                </div>
              )}

              {u && !hier && klaarMetMeten && (
                <button
                  type="button"
                  onClick={() => {
                    zetLive(true);
                    zetActief(v.id);
                  }}
                  className="mt-3 rounded-full border border-white/40 px-4 py-1.5 text-sm font-semibold hover:bg-white/10"
                >
                  Live bekijken
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
