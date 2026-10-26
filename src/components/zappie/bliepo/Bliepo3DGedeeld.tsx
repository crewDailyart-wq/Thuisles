"use client";

/**
 * Bliepo in 3D met één gedeelde 3D-motor (18 oktober 2026; eerst als vierde
 * versie op de testpagina /voorbeeld-bliepo, daarna met akkoord van de
 * eigenaar overal waar Bliepo in 3D staat).
 *
 * Zoals Bliepo3D (klein model, één keer geladen, tekent alleen in beeld),
 * maar alle Bliepo's op de pagina delen één WebGL-motor
 * (src/lib/zappie3d/gedeelde-motor.ts). Belichting en shaders worden zo maar
 * één keer klaargezet. Hieronder de uitleg van Bliepo3D.
 *
 *
 * Doet en reageert precies als Prototype3D (zwaaien als je in de buurt komt,
 * praten bij de eerste tik, juichen daarna), maar:
 *   - met het kleine model (zappie-klein.glb, 0,52 MB in plaats van 1,81 MB),
 *     dat maar één keer wordt geladen, ook als hij vaker op de pagina staat
 *     (src/lib/zappie3d/bliepo-klein.ts);
 *   - hij tekent en beweegt alleen als hij in beeld is: daarbuiten staat de
 *     tekenlus helemaal stil;
 *   - hij start pas als de browser even niets te doen heeft.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BliepoFilm, filmPieken, type Filmhouding } from "@/components/zappie/bliepo/BliepoFilm";
import { bliepoGeluidKlinkt, bliepoStemNiveau, luisterNiveau } from "@/lib/bliepo-geluid";
import { abonneerPraten, praatVos, zeg } from "@/lib/stem";
import { startstemAan } from "@/components/zappie/startstem";
import { useLichteWeergave } from "@/lib/lichte-weergave";
import { abonneerVoorlees, huidigeVoorlees } from "@/lib/voorlezen";
import { gebarenBijZin, soortVanGebaar } from "@/lib/bliepo-gebaren";
import { bekendGebarenPlan } from "@/lib/gebaren-plan";
import { wachtOpScrollrust } from "@/lib/scrollrust";

const TIKTEKST = "Hoi! Ik ben Bliepo. Tesla heeft mij uitgevonden.";

type Instellingen = {
  rustig: boolean;
  /** de hoek waarin hij staat als niemand iets doet; positief = naar rechts */
  rusthoek?: number;
  /** draait hij mee met de muis? */
  volgMuis?: boolean;
  /** wordt aangeroepen als hij voor het eerst getekend is */
  onKlaar?: () => void;
  className?: string;
  /** Een tekstballon van buitenaf (de begroeting op de startpagina, 23 oktober 2026). */
  ballon?: string | null;
  /** Telt op bij elke keer dat hij moet zwaaien (niet bij "Beweging uit"). */
  zwaai?: number;
  /**
   * Een gebaar van buitenaf (23 oktober 2026): bij elke nieuwe n speelt hij `naam` (zie ACTIONS in zappie.js).
   * Met `opStem` wacht het gebaar tot de volgende zin echt begint te klinken (hoogstens 2,5 tellen).
   */
  gebaar?: { naam: string; n: number | string; opStem?: boolean } | null;
  /** Bij een tik niet zeggen wie hij is (in opdrachten en lessen praat hij daar al). */
  geenTiktekst?: boolean;
};

/*
  Tikken op Bliepo: hij zegt wie hij is, sinds 23 oktober 2026 ook met zijn
  stem (Ruth), behalve als de luidspreker op de startpagina uit staat.
*/
function zegTiktekst() {
  if (startstemAan()) zeg(TIKTEKST);
}

/** Kijkt hij naar rechts (positieve rusthoek), dan ook bij voorkeur zijn hoofd die kant op. */
const RUSTHOEK_VOORKEUR = (rusthoek: number) => Math.max(-0.35, Math.min(0.35, rusthoek * 1.5));

/**
 * Het lijntje op zijn scherm volgt de stem: hoe hard klinkt Bliepo nu (0 tot 1), of null als hij stil is.
 * Sinds 23 oktober 2026 de gedeelde meter (bliepoStemNiveau): per lettergreep, in decibel, direct.
 */
function stemNiveau(): number | null {
  return bliepoStemNiveau();
}

/*
  Lichte weergave (19 oktober 2026, opdracht eigenaar): op telefoon, tablet en
  trage apparaten geen 3D en geen 3D-motor, maar het filmpje van Bliepo
  (BliepoFilmpje, opgenomen uit hetzelfde model). Tik je erop, dan zegt hij
  wie hij is, net als de 3D-robot. Op laptop en computer: de 3D-robot.
*/
export function Bliepo3DGedeeld(instellingen: Instellingen) {
  const licht = useLichteWeergave();
  if (licht) return <BliepoAlsFilmpje {...instellingen} />;
  if (licht === null) return <div className={`bt-prototype ${instellingen.className ?? ""}`} aria-hidden="true" />;
  return <Bliepo3DEcht {...instellingen} />;
}

/*
  Sinds 23 oktober 2026 (opdracht eigenaar) de filmpjes met losse bewegingen
  (BliepoFilm) in plaats van het ene zweef-filmpje: rust, en zwaaien bij de
  begroeting of een gebaar, praten zolang zijn stem klinkt. Het lijntje op
  zijn scherm beweegt live mee. BliepoFilmpje (het zweef-filmpje) staat er nog.
*/
const geenPraat = () => false;
/** Welk filmpje hoort bij welke echte beweging (lib/zappie3d/echte-gebaren.ts). */
const FILM_VAN_CLIP: Record<string, Filmhouding> = {
  praten1: "praten",
  praten2: "praten",
  vraag1: "vraag",
  vraag2: "vraag",
  vraag3: "vraag",
  wijzen1: "wijzen",
  wijzen2: "latenzien",
  tellen: "tellen",
  nadenken: "nadenken",
  duim: "duim",
  klappen: "klappen",
  knikken: "knikken",
  knikken2: "aanmoedigen",
  geruststellen: "troost",
  zwaaien: "zwaaien",
  zwaaien2: "zwaaien",
  /* Het gebarenwoordenboek (26 oktober 2026): de belangrijkste nieuwe gebaren als filmpje; tellen op de vingers via het telfilmpje. */
  groot: "groot",
  klein: "klein",
  erbij: "erbij",
  eraf: "eraf",
  stop: "stop",
  samen: "samen",
  meer: "meer",
  minder: "minder",
  links: "links",
  rechts: "rechts",
  boven: "boven",
  onder: "onder",
  denken: "denken",
  vingers1: "tellen",
  vingers2: "tellen",
  vingers3: "tellen",
  vingers4: "tellen",
  helemaal: "groot",
  snel: "praten",
  langzaam: "praten",
  eerst: "latenzien",
  dan: "latenzien",
  openhand: "vraag",
};
function BliepoAlsFilmpje({ rustig, onKlaar, className = "", ballon, gebaar = null, geenTiktekst = false }: Instellingen) {
  const plek = useRef<HTMLDivElement>(null);
  const [praat, zetPraat] = useState(false);
  const stemKlinkt = useSyncExternalStore(abonneerPraten, praatVos, geenPraat);
  /* Het laatste gebaar (of de begroeting) speelt één keer; daarna rust, of praten zolang zijn stem klinkt. */
  /*
    Echte bewegingen (24 oktober 2026, opdracht eigenaar): net als de
    3D-Bliepo kiest hij per zin de gebaren die bij de woorden horen
    (lib/bliepo-gebaren.ts) en start hij het filmpje zo dat het hoogste punt
    op dat woord valt. Een gebaar van buitenaf (opdrachten, lessen) telt als
    soort zin; klinkt er na 2,5 tellen geen stem, dan het passende filmpje
    meteen. De oude koppeling (kaart) blijft voor gebaren zonder stem.
  */
  const kaart: Record<string, Filmhouding> = {
    greet: "zwaaien",
    wave: "zwaaien",
    think: "nadenken",
    correct: "juichen",
    celebrate: "juichen",
    incorrect: "troost",
    idea: "nadenken",
    thumbsUp: "duim",
    clap: "klappen",
    encourage: "aanmoedigen",
    fist: "aanmoedigen",
    ask: "vraag",
    pointTask: "wijzen",
    explain: "latenzien",
  };
  const [filmGebaar, zetFilmGebaar] = useState<{ houding: Filmhouding; n: string } | null>(null);
  const gebaarRef = useRef(gebaar);
  const wachtOpStem = useRef(0);
  const laatsteZwaaiFilm = useRef(-1e9);
  useEffect(() => {
    gebaarRef.current = gebaar;
    if (!gebaar?.n) return;
    const echt = gebaar.naam.startsWith("echt:") ? FILM_VAN_CLIP[gebaar.naam.slice(5)] : undefined;
    /*
      Alleen nog een losse echte beweging (testknoppen) meteen. De oude
      koppeling (kaart) speelde zonder stem na 2,5 tellen een filmpje dat
      niet bij een woord hoorde: weggehaald (26 oktober 2026). De gebaren op
      de woorden komen hieronder (opZin).
    */
    const houding = echt;
    void kaart;
    if (!houding) return;
    /* Zonder stem (of een losse echte beweging) meteen, anders als vangnet na 2,5 tellen. */
    window.clearTimeout(wachtOpStem.current);
    wachtOpStem.current = window.setTimeout(() => zetFilmGebaar({ houding, n: `g:${gebaar.n}` }), !gebaar.opStem || echt ? 0 : 2500);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij een nieuw gebaar
  }, [gebaar?.n]);
  useEffect(() => {
    let laatste = huidigeVoorlees()?.id ?? 0;
    let klokken: number[] = [];
    const opZin = () => {
      const z = huidigeVoorlees();
      if (!z || z.id === laatste) return;
      laatste = z.id;
      window.clearTimeout(wachtOpStem.current);
      klokken.forEach((k) => window.clearTimeout(k));
      klokken = [];
      let plan = gebarenBijZin(z.zin, soortVanGebaar(gebaarRef.current?.naam));
      if (!plan.length) plan = bekendGebarenPlan(z.zin) ?? [];
      /* Eén zwaai per begroeting. */
      const nuMs = performance.now();
      plan = plan.filter((m) => m.soort !== "begroeting" || nuMs - laatsteZwaaiFilm.current > 10000);
      if (plan.some((m) => m.soort === "begroeting")) laatsteZwaaiFilm.current = nuMs;
      /* Een telrij ("een, twee, drie") is op de telefoon één telfilmpje, bij het eerste getal. */
      plan = plan.filter((m, i) => !(FILM_VAN_CLIP[m.clip] === "tellen" && i > 0 && FILM_VAN_CLIP[plan[i - 1].clip] === "tellen"));
      void filmPieken().then((pieken) => {
        if (laatste !== z.id) return;
        /* Een filmpje moet zijn hoogste punt halen: begint het volgende eerder, dan valt dat volgende weg. */
        let vrijVanaf = 0;
        for (const m of plan) {
          const houding = FILM_VAN_CLIP[m.clip];
          if (!houding || houding === "praten") continue;
          /* Het hoogste punt van het filmpje precies op het woord (26 oktober 2026). */
          const woordOp = z.start + (z.tijden[m.woord]?.begin ?? 0) * 1000;
          const op = woordOp - (pieken[houding] ?? 0.4) * 1000;
          if (op < vrijVanaf) continue;
          vrijVanaf = woordOp + 300;
          klokken.push(window.setTimeout(() => zetFilmGebaar({ houding, n: `${z.id}:${m.woord}` }), Math.max(0, op - performance.now())));
        }
      });
    };
    const af = abonneerVoorlees(opZin);
    return () => {
      af();
      klokken.forEach((k) => window.clearTimeout(k));
      window.clearTimeout(wachtOpStem.current);
    };
  }, []);
  const gebaarHouding = filmGebaar?.houding;
  /* Na een gebaar weer rust, of praten zolang zijn stem klinkt; nadenken blijft (BliepoFilm). */
  const daarna: Filmhouding = stemKlinkt ? "praten" : "rust";
  /* Geen zwaaifilmpje meer op verzoek (`zwaai`): alleen op een groetwoord (26 oktober 2026). */
  const houding: Filmhouding = gebaarHouding ?? daarna;
  const beurt = `0:${filmGebaar?.n ?? 0}`;
  const ballonRef = useRef(ballon);
  useEffect(() => {
    ballonRef.current = ballon;
  }, [ballon]);
  useEffect(() => {
    const host = plek.current;
    if (!host) return;
    let stil = 0;
    const tik = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      if ((e.target as Element | null)?.closest("a, button, input, select, textarea")) return;
      if (ballonRef.current || geenTiktekst) return;
      zetPraat(true);
      zegTiktekst();
      window.clearTimeout(stil);
      stil = window.setTimeout(() => zetPraat(false), 4000);
    };
    window.addEventListener("pointerdown", tik, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", tik);
      window.clearTimeout(stil);
    };
  }, [geenTiktekst]);
  return (
    <div ref={plek} className={`bt-prototype ${className}`} aria-hidden="true">
      <BliepoFilm houding={houding} beurt={beurt} daarna={daarna} rustig={rustig} praat={stemKlinkt} className="bt-prototype-doek" onKlaar={onKlaar} />
      {(ballon || praat) && (
        <div className={`bt-ballon${ballon ? " bt-ballon-groet" : ""}`} role="status">
          <span>{ballon || TIKTEKST}</span>
          <span />
        </div>
      )}
    </div>
  );
}

function Bliepo3DEcht({
  rustig,
  rusthoek = -Math.PI / 9,
  volgMuis = true,
  onKlaar,
  className = "",
  ballon,
  zwaai = 0,
  gebaar = null,
  geenTiktekst = false,
}: {
  ballon?: string | null;
  zwaai?: number;
  gebaar?: { naam: string; n: number | string; opStem?: boolean } | null;
  geenTiktekst?: boolean;
  rustig: boolean;
  /** de hoek waarin hij staat als niemand iets doet; positief = naar rechts */
  rusthoek?: number;
  /** draait hij mee met de muis? */
  volgMuis?: boolean;
  /** wordt aangeroepen als hij voor het eerst getekend is */
  onKlaar?: () => void;
  className?: string;
}) {
  const plek = useRef<HTMLDivElement>(null);
  const rustigRef = useRef(rustig);
  const instelling = useRef({ rusthoek, volgMuis, onKlaar });
  const ballonRef = useRef(ballon);
  const geenTikRef = useRef(geenTiktekst);
  const zwaaiRef = useRef<((actie: string, opStem?: boolean) => void) | null>(null);

  useEffect(() => {
    rustigRef.current = rustig;
  }, [rustig]);

  useEffect(() => {
    ballonRef.current = ballon;
  }, [ballon]);

  /*
    Zwaaien op verzoek (`zwaai`) doet hij niet meer (26 oktober 2026, opdracht
    eigenaar): hij zwaait alleen nog precies op een groetwoord ("Hoi",
    "Hallo", "Goedemorgen", "Tot morgen", "Doei") aan het begin van een
    begroeting, via het gebarenwoordenboek (lib/bliepo-gebaren.ts).
  */
  void zwaai;

  /* Een gebaar van buitenaf (testknoppen op /voorbeeld-bliepo), niet bij "Beweging uit". */
  const gebaarNaam = gebaar?.naam;
  const gebaarN = gebaar?.n ?? 0;
  const gebaarOpStem = gebaar?.opStem ?? false;
  useEffect(() => {
    if (gebaarN && gebaarNaam && !rustigRef.current) zwaaiRef.current?.(gebaarNaam, gebaarOpStem);
  }, [gebaarN, gebaarNaam, gebaarOpStem]);

  useEffect(() => {
    const host = plek.current;
    if (!host) return;
    let opgeruimd = false;
    let opruimen: (() => void) | null = null;

    /*
      Pas laden als het prototype bijna in beeld is, en dan nog pas als de
      browser even niets te doen heeft: het opstarten (Three.js, het model,
      de belichting) houdt de pagina anders bijna een seconde vast, en de
      robot naast "Kies jouw vak" staat al bij het openen in beeld.
    */
    let wachtOpRust = 0;
    const kijker = new IntersectionObserver(
      (items) => {
        const item = items.find((i) => i.isIntersecting);
        if (!item) return;
        kijker.disconnect();
        /*
          Volgorde (19 oktober 2026): een Bliepo die nu al in beeld is, start
          eerst; de andere (podium, onderaan) pas een paar tellen later, zodat ze
          niet allemaal tegelijk opstarten.
        */
        const nuInBeeld = item.boundingClientRect.top < window.innerHeight && item.boundingClientRect.bottom > 0;
        const plan = () => {
          if (opgeruimd) return;
          if (typeof window.requestIdleCallback === "function")
            wachtOpRust = window.requestIdleCallback(() => void start(), { timeout: 2500 });
          else wachtOpRust = globalThis.setTimeout(() => void start(), 600) as unknown as number;
        };
        if (nuInBeeld) plan();
        else wachtOpRust = globalThis.setTimeout(plan, 3000) as unknown as number;
      },
      /*
        Vloeiend scrollen (19 oktober 2026): de hele pagina telt als "in de
        buurt", zodat alle Bliepo's al opstarten als de pagina net geladen is
        en de browser rust heeft, en niet pas midden in het scrollen. Tekenen
        doen ze daarna nog steeds alleen als ze echt in beeld zijn.
      */
      { rootMargin: "100000px 0px" },
    );
    kijker.observe(host);

    async function start() {
      /* Vloeiend scrollen (19 oktober 2026): niet opstarten midden in het scrollen. */
      await wachtOpScrollrust();
      if (opgeruimd) return;
      const [Z, { laadBliepoKlein }, G] = await Promise.all([
        import("@/lib/zappie3d/zappie"),
        import("@/lib/zappie3d/bliepo-klein"),
        import("@/lib/zappie3d/gedeelde-motor"),
      ]);
      if (opgeruimd || !host) return;

      let m: Awaited<ReturnType<typeof G.haalMotor>>;
      try {
        await new Promise((r) => setTimeout(r, 0));
        await wachtOpScrollrust();
        m = await G.haalMotor();
      } catch {
        return; /* Geen WebGL: de tekening blijft staan. */
      }
      if (opgeruimd || !host) return;
      const T = m.T;
      const doek = document.createElement("canvas");
      doek.className = "bt-prototype-doek";
      host.append(doek);
      const renderer = { render: (sc: InstanceType<typeof T.Scene>, ca: InstanceType<typeof T.PerspectiveCamera>) => G.teken(m, sc, ca, doek) };

      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(32, 0.8, 0.1, 30);
      camera.position.set(0, 2.3, 8.6);
      camera.lookAt(0, 1.95, 0);
      scene.environment = m.omgeving;
      scene.environmentIntensity = 0.8;

      scene.add(new T.HemisphereLight(0xe5f7ff, 0x315274, 1.7));
      const licht = new T.DirectionalLight(0xffffff, 2.8);
      licht.position.set(3, 5, 5);
      licht.castShadow = true;
      licht.shadow.mapSize.set(512, 512);
      Object.assign(licht.shadow.camera, { left: -3, right: 3, top: 5, bottom: -1 });
      licht.shadow.bias = -0.001;
      licht.shadow.normalBias = 0.025;
      scene.add(licht);
      const rand = new T.DirectionalLight(0xbfe6ff, 1.6);
      rand.position.set(-3, 4, -2);
      scene.add(rand);
      const vloer = new T.Mesh(new T.PlaneGeometry(5, 4), new T.ShadowMaterial({ opacity: 0.28, color: 0x061a3a }));
      vloer.rotation.x = -Math.PI / 2;
      vloer.receiveShadow = true;
      scene.add(vloer);

      let model: Awaited<ReturnType<typeof laadBliepoKlein>>;
      try {
        await new Promise((r) => setTimeout(r, 0));
        await wachtOpScrollrust();
        model = await laadBliepoKlein();
      } catch (fout) {
        console.warn("[zappie] 3D-model niet geladen, de tekening blijft staan:", fout);
        doek.remove();
        return;
      }
      if (opgeruimd) {
        doek.remove();
        return;
      }
      scene.add(model.root);
      const RUSTHOEK = instelling.current.rusthoek;
      model.root.rotation.y = RUSTHOEK;

      await new Promise((r) => setTimeout(r, 0));
      await wachtOpScrollrust();
      if (opgeruimd) {
        doek.remove();
        return;
      }
      const besturing = new Z.ZappieController(model, { reducedMotion: rustigRef.current });
      /* Levendig (23 oktober 2026): hij kijkt bij voorkeur naar de kant waar hij al heen staat (de vakken). */
      if (besturing.levendig) besturing.levendig.voorkeur = RUSTHOEK_VOORKEUR(instelling.current.rusthoek);
      const ballon = Z.createSpeechBubble(host);
      ballon.element.className = "bt-ballon";
      ballon.element.removeAttribute("style");
      ballon.element.hidden = true;
      host.dataset.klaar = "ja";

      const maat = () => {
        const r = host.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio, 1.5);
        doek.width = Math.round(r.width * dpr);
        doek.height = Math.round(r.height * dpr);
        camera.aspect = r.width / Math.max(1, r.height);
        camera.updateProjectionMatrix();
      };
      maat();
      const maatkijker = new ResizeObserver(maat);
      maatkijker.observe(host);

      /*
        Alleen tekenen en bewegen als hij in beeld is: buiten beeld staat de
        tekenlus helemaal stil (geen requestAnimationFrame meer).
      */
      let zichtbaar = true;
      const inBeeld = new IntersectionObserver((items) => {
        const nu = items.some((i) => i.isIntersecting);
        if (nu === zichtbaar) return;
        zichtbaar = nu;
        if (zichtbaar && !frame) {
          vorige = performance.now();
          frame = requestAnimationFrame(tel);
        }
      });
      inBeeld.observe(host);

      let gegroet = false;
      let getikt = false;
      let wachtTot = 0;
      let doelhoek = RUSTHOEK;
      const binnen = (x: number, y: number, marge: number) => {
        const r = host.getBoundingClientRect();
        return x > r.left - marge && x < r.right + marge && y > r.top - marge && y < r.bottom + marge;
      };
      const speel = (actie: string) => {
        const nu = performance.now();
        if (nu < wachtTot) return;
        wachtTot = nu + 2200;
        besturing.play(actie);
      };
      /*
        De muis (23 oktober 2026): het hoofd kijkt naar de muis en het lijf
        draait maar een klein beetje mee (eerst draaide de hele robot als één
        blok). Beweegt de muis een tijdje niet, dan kijkt hij weer zelf rond.
      */
      let muisStil = 0;
      const beweeg = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        const midden = r.left + r.width / 2;
        if (instelling.current.volgMuis) {
          const nx = Math.max(-1, Math.min(1, (e.clientX - midden) / (window.innerWidth / 2)));
          const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.25)) / (window.innerHeight / 2)));
          doelhoek = RUSTHOEK + nx * 0.15;
          if (besturing.levendig) besturing.levendig.kijk = { x: nx, y: ny };
          window.clearTimeout(muisStil);
          muisStil = window.setTimeout(() => {
            if (besturing.levendig) besturing.levendig.kijk = null;
            doelhoek = RUSTHOEK;
          }, 2500);
        }
        /* Zwaaien als de muis in de buurt komt: weggehaald (26 oktober 2026, alleen nog zwaaien op een groetwoord). */
      };
      const tik = (e: PointerEvent) => {
        if (!binnen(e.clientX, e.clientY, 0)) return;
        if ((e.target as Element | null)?.closest("a, button, input, select, textarea")) return;
        /* Begroet hij net (tekstballon van buitenaf), of praat hij al in een opdracht, dan niet ook nog wie hij is. */
        if (ballonRef.current || geenTikRef.current) return;
        wachtTot = 0;
        if (!getikt) {
          getikt = true;
          besturing.showText(TIKTEKST);
          zegTiktekst();
          wachtTot = performance.now() + 4000;
        } else speel("celebrate");
      };
      window.addEventListener("pointermove", beweeg, { passive: true });
      window.addEventListener("pointerdown", tik, { passive: true });
      /* Alleen op de ontwikkelcomputer: de robot bereikbaar voor het afstellen van houdingen. */
      if (process.env.NODE_ENV === "development") {
        const w = window as unknown as { __bliepo?: unknown; __bliepos?: unknown[] };
        w.__bliepo = { besturing, model, T, host };
        (w.__bliepos ??= []).push(w.__bliepo);
      }
      /*
        Gebaar op de stem (23 oktober 2026): het gebaar bij een zin begint
        pas als die zin echt klinkt (de stem meldt elke nieuwe zin in
        lib/voorlezen.ts), niet al terwijl de stem nog geladen wordt. Klinkt
        er na 2,5 tellen nog niets (stem uit), dan toch.
      */
      let wachtend: { actie: string; zin: number; tot: number } | null = null;
      zwaaiRef.current = (actie, opStem) => {
        if (opStem) {
          wachtend = { actie, zin: huidigeVoorlees()?.id ?? 0, tot: performance.now() + 2500 };
          return;
        }
        wachtend = null;
        wachtTot = 0;
        /* "echt:<clip>": een echte beweging (testknoppen op /voorbeeld-bliepo). */
        if (actie.startsWith("echt:")) {
          besturing.speelEcht(actie.slice(5));
          return;
        }
        speel(actie);
      };

      /*
        Echte bewegingen (24 oktober 2026, opdracht eigenaar): door mensen
        opgenomen gebaren (Mixamo), in Blender op Bliepo gezet. Ze worden pas
        geladen als hij er staat (klein bestand, apart van het model). Lukt
        dat niet, dan blijven de eigen gebaren uit zappie.js.

        Per zin kiest lib/bliepo-gebaren.ts welke gebaren bij de woorden
        horen; elk gebaar wordt zo gestart dat zijn hoogste punt op dat woord
        valt (de stem meldt wanneer elk woord klinkt). Een gewone uitleg
        krijgt geen los gebaar: dan lopen de praat-bewegingen door.
      */
      void import("@/lib/zappie3d/echte-gebaren")
        .then(async (E) => {
          const clips = await E.laadEchteGebaren();
          if (opgeruimd) return;
          besturing.echt = new E.EchteGebaren(
            T,
            clips,
            model.parts as unknown as Record<string, import("three").Object3D>,
            model.rest as unknown as Record<string, { q: import("three").Quaternion }>,
          );
        })
        .catch((fout) => console.warn("[zappie] echte bewegingen niet geladen, de eigen gebaren blijven:", fout));
      let laatsteZin = huidigeVoorlees()?.id ?? 0;
      let laatsteZwaai = -1e9;
      let gepland: { clip: string; op: number; vanaf: number; tempo: number; woord: string; woordOp: number; woordTot: number }[] = [];
      /* Het gebaar begint ongeveer 0,3 tel voor het woord en is op zijn hoogste punt precies op het woord (26 oktober 2026). */
      const AANLOOP = 0.3;
      const planZin = (zin: string, soort: ReturnType<typeof soortVanGebaar>, start: number, tijden: { begin: number; eind: number }[]) => {
        const echt = besturing.echt;
        if (!echt) return false;
        /* Het gebarenwoordenboek; vindt dat niets, dan het plan dat de server één keer maakte (lib/gebaren-plan.ts). */
        let plan = gebarenBijZin(zin, soort).filter((m) => echt.heeft(m.clip));
        if (!plan.length) plan = (bekendGebarenPlan(zin) ?? []).filter((m) => echt.heeft(m.clip));
        /* Eén zwaai per begroeting: "Hoi Sam! Goedemorgen!" zwaait alleen op "Hoi". */
        const nuMs = performance.now();
        plan = plan.filter((m) => m.soort !== "begroeting" || nuMs - laatsteZwaai > 10000);
        if (plan.some((m) => m.soort === "begroeting")) laatsteZwaai = nuMs;
        const woorden = zin.trim().split(/\s+/);
        /* Het tempo past ook bij hoe snel hij praat (gewoon: zo'n 2,5 woorden per tel). */
        const duur = tijden.length > 1 ? tijden[tijden.length - 1].eind - tijden[0].begin : 0;
        const spreek = duur > 0.5 ? Math.max(0.85, Math.min(1.15, tijden.length / duur / 2.5)) : 1;
        gepland = plan.map((m, j) => {
          const tempo = Math.max(0.5, Math.min(1.8, (m.tempo ?? 1) * spreek));
          const piek = echt.piek(m.clip);
          const woordOp = start + (tijden[m.woord]?.begin ?? 0) * 1000;
          /*
            Een lange aanloop (Mixamo) begint verder in de clip, zodat het gebaar
            0,3 tel voor het woord in beeld komt. Tellen na tellen ("een, twee,
            drie"): de hand staat al omhoog, dan alleen de volgende vinger, kort
            voor het woord.
          */
          const telVerder = /^vingers\d$/.test(m.clip) && /^vingers\d$/.test(plan[j - 1]?.clip ?? "");
          const vanaf = Math.max(0, piek - (telVerder ? 0.12 : AANLOOP) * tempo);
          return {
            clip: m.clip,
            op: woordOp - ((piek - vanaf) / tempo) * 1000,
            vanaf,
            tempo,
            woord: woorden[m.woord] ?? "",
            woordOp,
            woordTot: start + (tijden[m.woord]?.eind ?? 0) * 1000,
          };
        });
        return true;
      };

      let frame = 0;
      let vorige = performance.now();
      let laatsteTekening = 0;
      let rustTijd = 0;
      let praatTot = 0;
      let eersteKeer = true;
      const tel = (nu: number) => {
        if (!zichtbaar || document.hidden) {
          frame = 0;
          return;
        }
        frame = requestAnimationFrame(tel);
        const dt = Math.min((nu - vorige) / 1000, 0.05);
        vorige = nu;
        besturing.reducedMotion = rustigRef.current;
        /*
          Bij elke start zwaaien (greet) en na 24 tellen rust naar zijn stekker
          kijken: weggehaald (26 oktober 2026, opdracht eigenaar). Geen grote
          gebaren meer die niet bij een woord horen.
        */
        if (!gegroet) gegroet = true;
        rustTijd = besturing.action === "idle" ? rustTijd + dt : 0;
        /*
          Praten (23 oktober 2026, opdracht eigenaar): zolang zijn stem klinkt
          (en een tel daarna, tussen twee zinnen) draait hij zich meer naar het
          kind en kijkt hij recht in de camera; rondkijken en de muis volgen
          alleen als hij stil is.
        */
        const niveau = stemNiveau();
        const zin = huidigeVoorlees();
        if (zin && zin.id !== laatsteZin) {
          laatsteZin = zin.id;
          /* Een nieuwe zin klinkt: de gebaren op de woorden (en het gebaar van buitenaf telt als soort zin). */
          if (!rustigRef.current && planZin(zin.zin, soortVanGebaar(wachtend?.actie), zin.start, zin.tijden)) wachtend = null;
          /* Alleen op de ontwikkelcomputer: wanneer de zin begon te klinken (voor het nameten en de testfilmpjes). */
          if (process.env.NODE_ENV === "development") {
            const w = window as unknown as { __zinnenlog?: unknown[] };
            (w.__zinnenlog ??= []).push({ zin: zin.zin, start: zin.start, epoch: performance.timeOrigin + zin.start });
          }
        }
        if (wachtend && ((huidigeVoorlees()?.id ?? 0) !== wachtend.zin || nu > wachtend.tot)) {
          wachtend = null;
          wachtTot = 0;
          /*
            Geen stem (uit of niet gelukt): geen gebaar (26 oktober 2026). Een
            gebaar hoort bij een woord; zonder woord blijft hij rustig.
          */
        }
        while (gepland.length && gepland[0].op <= nu) {
          const g = gepland.shift()!;
          /*
            Te laat (de zin begon al): verder in het gebaar beginnen, zodat het
            hoogste punt toch op het woord valt, met minstens 0,2 tel aanloop
            (anders springt de arm). Bij het eerste woord van een zin valt het
            hoogste punt dan nog binnen dat woord.
          */
          const piek = besturing.echt?.piek(g.clip) ?? 0;
          const vanaf = Math.max(g.vanaf, Math.min(g.vanaf + ((nu - g.op) / 1000) * g.tempo, piek - 0.15 * g.tempo));
          if (!rustigRef.current) besturing.speelEcht(g.clip, vanaf, g.tempo);
          /* Alleen op de ontwikkelcomputer: bijhouden voor het nameten (welk gebaar, welk woord, wanneer). */
          if (process.env.NODE_ENV === "development") {
            const w = window as unknown as { __gebarenlog?: unknown[] };
            (w.__gebarenlog ??= []).push({ clip: g.clip, woord: g.woord, start: Math.round(nu), op: Math.round(g.op), vanaf: +vanaf.toFixed(3), piek: +(besturing.echt?.piek(g.clip) ?? 0).toFixed(3), tempo: +g.tempo.toFixed(2), piekOp: Math.round(nu + ((besturing.echt?.piek(g.clip) ?? 0) - vanaf) * 1000 / g.tempo), woordOp: Math.round(g.woordOp), woordTot: Math.round(g.woordTot) });
          }
        }
        if (niveau !== null || praatVos()) praatTot = nu + 800;
        const praatNu = nu < praatTot && !rustigRef.current;
        /* Luistert hij naar het kind (praatknop, 24 oktober 2026)? Dan draait hij zich ook naar het kind. */
        const luister = rustigRef.current ? null : luisterNiveau();
        besturing.luisterNiveau = luister;
        if (besturing.levendig) besturing.levendig.luistert = luister !== null;
        const hoek = praatNu || luister !== null ? RUSTHOEK * 0.45 : besturing.action === "talk" && instelling.current.volgMuis ? -Math.PI / 14 : doelhoek;
        model.root.rotation.y += (hoek - model.root.rotation.y) * Math.min(1, dt * 4);
        if (besturing.levendig) {
          besturing.levendig.praat = praatNu;
          /* Het hoofd draait de rest bij (het lijf draait een vijfde mee), zodat hij precies naar voren kijkt. */
          besturing.levendig.naarKind = -model.root.rotation.y / 1.22;
        }
        besturing.setSpeechLevel(niveau);
        besturing.update(dt, {});
        ballon.update(besturing);
        /*
          Zuinig tekenen (18 oktober 2026, de site werd traag): in rust 15 keer
          per seconde (hij ademt alleen rustig), tijdens een gebaar 30 keer;
          niet meer op de volle snelheid van het scherm (tot 120 keer).
        */
        const pauze = besturing.action !== "idle" || bliepoGeluidKlinkt() || luister !== null ? 1000 / 30 : rustigRef.current ? 250 : 1000 / 15;
        if (nu - laatsteTekening >= pauze) {
          renderer.render(scene, camera);
          laatsteTekening = nu;
          if (eersteKeer) {
            eersteKeer = false;
            instelling.current.onKlaar?.();
          }
        }
      };
      frame = requestAnimationFrame(tel);
      const wakker = () => {
        if (!document.hidden && zichtbaar && !frame) {
          vorige = performance.now();
          frame = requestAnimationFrame(tel);
        }
      };
      document.addEventListener("visibilitychange", wakker);

      opruimen = () => {
        zwaaiRef.current = null;
        cancelAnimationFrame(frame);
        document.removeEventListener("visibilitychange", wakker);
        window.removeEventListener("pointermove", beweeg);
        window.clearTimeout(muisStil);
        window.removeEventListener("pointerdown", tik);
        maatkijker.disconnect();
        inBeeld.disconnect();
        ballon.dispose();
        const materialen = new Set<{ dispose: () => void }>();
        model.root.traverse((o: { geometry?: { dispose: () => void }; material?: { dispose: () => void } }) => {
          o.geometry?.dispose();
          if (o.material) materialen.add(o.material);
        });
        materialen.forEach((m) => m.dispose());
        vloer.geometry.dispose();
        (vloer.material as { dispose: () => void }).dispose();
        doek.remove();
      };
    }

    return () => {
      opgeruimd = true;
      kijker.disconnect();
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(wachtOpRust);
      globalThis.clearTimeout(wachtOpRust);
      opruimen?.();
    };
  }, []);

  return (
    <div ref={plek} className={`bt-prototype ${className}`} aria-hidden="true">
      {ballon && (
        <div className="bt-ballon bt-ballon-groet" role="status">
          <span>{ballon}</span>
          <span />
        </div>
      )}
    </div>
  );
}
