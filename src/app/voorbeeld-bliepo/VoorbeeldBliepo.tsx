"use client";

/**
 * De drie versies van Bliepo naast elkaar, met wat ze kosten.
 *
 * Meten: een teller kijkt de hele tijd hoe lang het duurt tussen twee
 * beeldjes van de browser. Duurt dat langer dan 50 ms, dan "staat de pagina
 * stil" (je kunt dan niet scrollen of tikken). De versies komen één voor één
 * in beeld; per versie tellen we de stilstand op vanaf het moment dat hij
 * verschijnt tot 1,5 seconde nadat hij klaar is.
 *
 * Three.js (de 3D-motor) is nodig voor links en midden. Die wordt eerst apart
 * geladen en apart gemeten, zodat de eerste 3D-versie niet in het nadeel is.
 * Met ?alleen=links, ?alleen=midden of ?alleen=rechts staat er maar één
 * versie, gemeten vanaf een lege pagina (inclusief Three.js).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Bliepo3D } from "@/components/zappie/bliepo/Bliepo3D";
import { BliepoFilmpje } from "@/components/zappie/bliepo/BliepoFilmpje";
import { Prototype3D } from "@/components/zappie/bouwtekening/Prototype3D";
/* Dezelfde stijl als op de startpagina (.bt-prototype, .bt-ballon), zodat ze er precies zo uitzien. */
import "@/components/zappie/startpagina.css";

type Id = "links" | "midden" | "rechts";
const VERSIES: { id: Id; titel: string; uitleg: string }[] = [
  { id: "links", titel: "Nu op de site", uitleg: "Het 3D-model zoals het nu op de startpagina staat (zappie.glb)." },
  { id: "midden", titel: "3D, kleiner model", uitleg: "Zelfde 3D-robot, kleiner model, laadt 1 keer, tekent alleen in beeld." },
  { id: "rechts", titel: "Filmpje", uitleg: "Herhalend filmpje uit hetzelfde model: zweeft en zwaait." },
];

const BESTAND: Record<Id, string[]> = {
  links: ["/assets/zappie/3d/zappie.glb"],
  midden: ["/assets/zappie/3d/zappie-klein.glb"],
  rechts: ["/assets/zappie/bliepo/bliepo-zweef.webm", "/assets/zappie/bliepo/bliepo-zweef.webp"],
};

type Hapering = { t: number; duur: number };

function mb(bytes: number) {
  return (bytes / 1048576).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function sec(ms: number) {
  return (ms / 1000).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function VoorbeeldBliepo() {
  const [alleen, zetAlleen] = useState<Id | null | undefined>(undefined);
  const [actief, zetActief] = useState<Id[]>([]);
  const [uitslag, zetUitslag] = useState<Partial<Record<Id, { mb: string; net: string; stil: string }>>>({});
  const [three, zetThree] = useState<string | null>(null);
  const [rustig, zetRustig] = useState(false);
  const haperingen = useRef<Hapering[]>([]);
  const begin = useRef<Partial<Record<Id, number>>>({});

  /* De teller: elk gat tussen twee beeldjes van meer dan 50 ms. */
  useEffect(() => {
    let frame = 0;
    let vorige = performance.now();
    const tel = (nu: number) => {
      if (nu - vorige > 50) haperingen.current.push({ t: vorige, duur: nu - vorige });
      vorige = nu;
      frame = requestAnimationFrame(tel);
    };
    frame = requestAnimationFrame(tel);
    return () => cancelAnimationFrame(frame);
  }, []);

  const stilTussen = (van: number, tot: number) =>
    haperingen.current.filter((h) => h.t >= van - 1 && h.t <= tot).reduce((a, h) => a + h.duur, 0);

  /* Volgorde: eerst Three.js apart (tenzij ?alleen=), dan links, midden, rechts. */
  useEffect(() => {
    const p = new URLSearchParams(location.search).get("alleen");
    const keuze = p === "links" || p === "midden" || p === "rechts" ? p : null;
    const wacht = window.setTimeout(async () => {
      zetAlleen(keuze);
      if (keuze) {
        begin.current[keuze] = performance.now();
        zetActief([keuze]);
        return;
      }
      const t0 = performance.now();
      await Promise.all([
        import("three"),
        import("three/examples/jsm/environments/RoomEnvironment.js"),
        import("@/lib/zappie3d/zappie"),
      ]);
      await new Promise((r) => setTimeout(r, 1500));
      zetThree(sec(stilTussen(t0, performance.now())));
      begin.current.links = performance.now();
      zetActief(["links"]);
    }, 1200);
    return () => window.clearTimeout(wacht);
  }, []);

  const klaar = useCallback(
    (id: Id) => {
      window.setTimeout(() => {
        const van = begin.current[id] ?? 0;
        const stil = stilTussen(van, performance.now());
        const regels = BESTAND[id]
          .map((u) => performance.getEntriesByType("resource").find((e) => e.name.endsWith(u)) as PerformanceResourceTiming | undefined)
          .filter(Boolean) as PerformanceResourceTiming[];
        const groot = regels.reduce((a, r) => a + (r.decodedBodySize || 0), 0);
        const net = regels.reduce((a, r) => a + (r.encodedBodySize || 0), 0);
        zetUitslag((u) => ({ ...u, [id]: { mb: mb(groot), net: mb(net), stil: sec(stil) } }));
        if (alleen) return;
        const volgende: Id | undefined = id === "links" ? "midden" : id === "midden" ? "rechts" : undefined;
        if (volgende) {
          begin.current[volgende] = performance.now();
          zetActief((a) => [...a, volgende]);
        }
      }, 1500);
    },
    [alleen],
  );

  return (
    <main className="min-h-svh bg-[#0d2a6b] px-4 py-8 text-white sm:px-8">
      <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-bold">Voorbeeld: drie versies van Bliepo</h1>
      <p className="mt-2 max-w-3xl text-white/80">
        Testpagina, staat in geen menu. Ze komen één voor één in beeld; onder elke versie staat hoe groot het bestand is
        en hoe lang de pagina stilstond toen hij in beeld kwam, gemeten op dit apparaat.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/80">
        {alleen === null && <span>3D-motor (Three.js, nodig voor links en midden) laden: {three ? `${three} s stilstand` : "bezig…"}</span>}
        <button
          type="button"
          onClick={() => zetRustig((r) => !r)}
          className="rounded-full border border-white/40 px-4 py-1.5 font-semibold text-white hover:bg-white/10"
        >
          {rustig ? "Beweging aan" : "Beweging uit"}
        </button>
      </div>

      <ul className="mt-6 grid gap-5 sm:grid-cols-3">
        {VERSIES.filter((v) => !alleen || v.id === alleen).map((v) => {
          const u = uitslag[v.id];
          const aan = actief.includes(v.id);
          return (
            <li key={v.id} className="rounded-3xl border border-white/20 bg-white/5 p-4">
              <h2 className="text-lg font-bold">
                {v.id === "links" ? "Links" : v.id === "midden" ? "Midden" : "Rechts"}: {v.titel}
              </h2>
              <p className="text-sm text-white/70">{v.uitleg}</p>
              <div className="relative mx-auto mt-3 aspect-[276/348] w-full max-w-[276px]" data-versie={v.id}>
                {aan && v.id === "links" && <KlaarWacht onKlaar={() => klaar("links")}><Prototype3D rustig={rustig} /></KlaarWacht>}
                {aan && v.id === "midden" && <Bliepo3D rustig={rustig} onKlaar={() => klaar("midden")} />}
                {aan && v.id === "rechts" && (
                  /* Zelfde vlak als de 3D-versies (.bt-prototype), zodat hij even groot staat. */
                  <div className="absolute inset-x-[4%] top-0 bottom-[14%]">
                    <BliepoFilmpje rustig={rustig} onKlaar={() => klaar("rechts")} />
                  </div>
                )}
                {!aan && <p className="absolute inset-0 grid place-items-center text-sm text-white/60">Wacht op zijn beurt…</p>}
              </div>
              <p className="mt-3 text-sm font-semibold" data-uitslag={v.id}>
                {u ? `Bestand: ${u.mb} MB (${u.net} MB over het netwerk) · stilstand: ${u.stil} s` : aan ? "Meten…" : " "}
              </p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

/** Prototype3D meldt niet zelf wanneer hij klaar is; we kijken naar data-klaar. */
function KlaarWacht({ children, onKlaar }: { children: React.ReactNode; onKlaar: () => void }) {
  const plek = useRef<HTMLDivElement>(null);
  const gemeld = useRef(false);
  useEffect(() => {
    const el = plek.current;
    if (!el) return;
    const kijk = new MutationObserver(() => {
      if (!gemeld.current && el.querySelector('[data-klaar="ja"]')) {
        gemeld.current = true;
        /* klaar = model geladen; het eerste beeld volgt in het volgende beeldje */
        requestAnimationFrame(() => requestAnimationFrame(onKlaar));
      }
    });
    kijk.observe(el, { subtree: true, attributes: true, attributeFilter: ["data-klaar"] });
    return () => kijk.disconnect();
  }, [onKlaar]);
  return (
    <div ref={plek} className="absolute inset-0">
      {children}
    </div>
  );
}
