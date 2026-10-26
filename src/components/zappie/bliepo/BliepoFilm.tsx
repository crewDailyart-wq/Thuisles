"use client";

/**
 * Bliepo als filmpjes die wisselen met wat hij doet (23 oktober 2026,
 * opdracht eigenaar). Voor de telefoon en de lessen, waar geen 3D draait.
 *
 * Opgenomen uit het 3D-model met de nieuwe, losse bewegingen (zappie.js,
 * Levendig) in de opnamestudio (/voorbeeld-bliepo?opname=1): rust, praten,
 * juichen, nadenken, zwaaien en troosten (bemoedigend knikken). Doorzichtige
 * achtergrond: WebM voor Chrome, Edge, Firefox en Android, geanimeerde WebP
 * voor Safari, iPhone en iPad.
 *
 * Het lijntje op zijn scherm zit niet in het filmpje: dat tekent BliepoLijn er
 * live overheen, zodat het meebeweegt met zijn stem. Per beeldje staat in
 * film/schermen.json waar het scherm op dat moment staat; zo loopt het lijntje
 * mee als zijn hoofd beweegt.
 *
 * Rust en praten herhalen zich; de andere spelen één keer, daarna gaat hij
 * vanzelf terug naar rust (nadenken blijft staan zolang hij nadenkt). Bij
 * "Beweging uit" staat hij stil (het lijntje blijft rustig), en buiten beeld
 * staat het filmpje op pauze. Alleen het filmpje dat nodig is, wordt geladen.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BliepoLijn, type Schermhoeken } from "@/components/avontuur/BliepoLijn";

export type Filmhouding =
  | "rust"
  | "praten"
  | "juichen"
  | "nadenken"
  | "zwaaien"
  | "troost"
  | "vraag"
  | "wijzen"
  | "latenzien"
  | "tellen"
  | "duim"
  | "klappen"
  | "knikken"
  | "aanmoedigen"
  /* Het gebarenwoordenboek (26 oktober 2026): keyframes uit Blender, recht naar de camera opgenomen. */
  | "groot"
  | "klein"
  | "erbij"
  | "eraf"
  | "stop"
  | "samen"
  | "meer"
  | "minder"
  | "links"
  | "rechts"
  | "boven"
  | "onder"
  | "denken";

/*
  Echte bewegingen (24 oktober 2026, opdracht eigenaar): de filmpjes zijn
  opnieuw opgenomen met de door mensen opgenomen gebaren
  (lib/zappie3d/echte-gebaren.ts), recht naar de camera kijkend, in de map
  film2. De oude filmpjes staan nog in de map film (niet weggehaald).
  In schermen.json staat nu ook per gebaar wanneer het op zijn hoogste punt
  is (piek), zodat dat moment op het woord kan vallen.
*/
const MAP = "/assets/zappie/bliepo/film2";
const HERHAAL: Filmhouding[] = ["rust", "praten"];
const geenAbonnement = () => () => {};

type Sporen = { fps: number; b: number; h: number; clips: Record<Filmhouding, number[][]>; piek?: Partial<Record<Filmhouding, number>> };
let sporen: Promise<Sporen | null> | null = null;
function haalSporen() {
  sporen ??= fetch(`${MAP}/schermen.json`)
    .then((a) => (a.ok ? (a.json() as Promise<Sporen>) : null))
    .catch(() => null);
  return sporen;
}

/** Wanneer elk gebaar-filmpje op zijn hoogste punt is (seconden na het begin). */
/**
 * Een filmpje alvast in de browser zetten (26 oktober 2026), zodat het meteen
 * kan beginnen als het gebaar op het eerste woord van een zin valt.
 */
const vooraf = new Set<string>();
export function laadFilmVooraf(houding: Filmhouding): void {
  if (typeof window === "undefined") return;
  const soort = isWebKit() ? "webp" : "webm";
  const url = `${MAP}/${houding}.${soort}`;
  if (vooraf.has(url)) return;
  vooraf.add(url);
  if (soort === "webp") {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  } else void fetch(url).catch(() => vooraf.delete(url));
}

export async function filmPieken(): Promise<Partial<Record<Filmhouding, number>>> {
  return (await haalSporen())?.piek ?? {};
}

/** Safari en alles op iPhone/iPad (ook Chrome daar is WebKit) toont de doorzichtigheid van WebM niet. */
function isWebKit() {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios || (/Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|Firefox\//.test(ua));
}

export function BliepoFilm({
  houding = "rust",
  beurt = 0,
  daarna = "rust",
  rustig = false,
  praat = false,
  className = "",
  onKlaar,
}: {
  houding?: Filmhouding;
  /** Verander dit om dezelfde beweging nog eens te spelen. */
  beurt?: number | string;
  /** Wat hij doet als een beweging die één keer speelt, klaar is (rust, of praten als zijn stem nog klinkt). */
  daarna?: Filmhouding;
  rustig?: boolean;
  /** praat hij nu (voor het lijntje, ook als het filmpje nog rust is)? */
  praat?: boolean;
  className?: string;
  onKlaar?: () => void;
}) {
  const soort = useSyncExternalStore(geenAbonnement, () => (isWebKit() ? "webp" : "webm"), () => "stil");
  /* Een filmpje dat één keer speelt, loopt af; daarna terug naar rust (behalve nadenken). */
  const [afgelopen, zetAfgelopen] = useState<string | null>(null);
  const keer = `${houding}:${beurt}`;
  const klaarMet = afgelopen === keer;
  /* Nadenken blijft staan als hij stil nadenkt; praat hij verder (een hint), dan weer praten (24 oktober 2026). */
  const nu: Filmhouding = rustig ? "rust" : klaarMet && (houding !== "nadenken" || praat) ? daarna : houding;

  const vak = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const begin = useRef(0);
  const [spoor, zetSpoor] = useState<Sporen | null>(null);
  useEffect(() => {
    let weg = false;
    void haalSporen().then((s) => !weg && zetSpoor(s));
    return () => {
      weg = true;
    };
  }, []);

  /* Afspelen alleen in beeld, en niet bij Beweging uit. */
  useEffect(() => {
    const v = film.current;
    if (!v) return;
    if (rustig) {
      v.pause();
      v.currentTime = 0;
      return;
    }
    const kijker = new IntersectionObserver((items) => {
      if (items.some((i) => i.isIntersecting)) void v.play().catch(() => {});
      else v.pause();
    });
    kijker.observe(v);
    return () => kijker.disconnect();
  }, [rustig, soort, nu, keer]);

  /* Waar staat het scherm nu? Bij WebM uit de tijd van het filmpje, bij WebP uit de tijd sinds het begon. */
  const hoeken = useCallback((): Schermhoeken | null => {
    const s = spoor?.clips[nu];
    if (!s?.length || !spoor) return null;
    let t: number;
    if (film.current) t = film.current.currentTime;
    else {
      const duur = s.length / spoor.fps;
      const verstreken = (performance.now() - begin.current) / 1000;
      t = HERHAAL.includes(nu) ? verstreken % duur : Math.min(verstreken, duur - 1 / spoor.fps);
    }
    if (rustig) t = 0;
    const f = s[Math.max(0, Math.min(s.length - 1, Math.floor(t * spoor.fps)))];
    /* Van procenten van het filmbeeld naar procenten van het vak (het filmpje staat er passend in). */
    const el = vak.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const filmVerh = spoor.b / spoor.h;
    const vakVerh = r.width / Math.max(1, r.height);
    const sx = filmVerh > vakVerh ? 1 : filmVerh / vakVerh;
    const sy = filmVerh > vakVerh ? vakVerh / filmVerh : 1;
    const ox = (1 - sx) * 50;
    const oy = (1 - sy) * 50;
    const p = (x: number, y: number) => [ox + x * sx, oy + y * sy] as const;
    return { lb: p(f[0], f[1]), rb: p(f[2], f[3]), lo: p(f[4], f[5]), ro: p(f[6], f[7]) };
  }, [spoor, nu, rustig]);

  const afgelopenNu = () => {
    if (!HERHAAL.includes(nu)) zetAfgelopen(keer);
  };

  const klasse = "absolute inset-0 block h-full w-full object-contain";
  let beeld: React.ReactNode;
  if (soort === "stil" || rustig) {
    // eslint-disable-next-line @next/next/no-img-element -- een doorzichtig stilstaand beeldje
    beeld = <img src={`${MAP}/stil.webp`} alt="" draggable={false} className={klasse} onLoad={onKlaar} />;
  } else if (soort === "webp") {
    beeld = (
      // eslint-disable-next-line @next/next/no-img-element -- geanimeerde WebP; next/image zou hem stilzetten
      <img
        key={`${nu}-${keer}`}
        src={`${MAP}/${nu}.webp`}
        alt=""
        draggable={false}
        className={klasse}
        onLoad={(e) => {
          begin.current = performance.now();
          onKlaar?.();
          if (!HERHAAL.includes(nu)) {
            const duur = ((spoor?.clips[nu]?.length ?? 48) / (spoor?.fps ?? 24)) * 1000;
            const img = e.currentTarget;
            window.setTimeout(() => img.isConnected && afgelopenNu(), duur);
          }
        }}
      />
    );
  } else {
    beeld = (
      <video
        key={`${nu}-${keer}`}
        ref={film}
        className={klasse}
        src={`${MAP}/${nu}.webm`}
        poster={`${MAP}/stil.webp`}
        muted
        loop={HERHAAL.includes(nu)}
        playsInline
        autoPlay
        preload="auto"
        aria-hidden="true"
        onLoadedData={onKlaar}
        onEnded={afgelopenNu}
      />
    );
  }

  return (
    <div ref={vak} className={`relative ${className}`} aria-hidden="true">
      {beeld}
      <BliepoLijn rustig={rustig} praat={praat || nu === "praten"} hoeken={hoeken} />
    </div>
  );
}
