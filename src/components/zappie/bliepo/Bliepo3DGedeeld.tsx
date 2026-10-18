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

import { useEffect, useRef, useState } from "react";
import { BliepoFilmpje } from "@/components/zappie/bliepo/BliepoFilmpje";
import { useLichteWeergave } from "@/lib/lichte-weergave";
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
};

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

function BliepoAlsFilmpje({ rustig, onKlaar, className = "" }: Instellingen) {
  const plek = useRef<HTMLDivElement>(null);
  const [praat, zetPraat] = useState(false);
  useEffect(() => {
    const host = plek.current;
    if (!host) return;
    let stil = 0;
    const tik = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      if ((e.target as Element | null)?.closest("a, button, input, select, textarea")) return;
      zetPraat(true);
      window.clearTimeout(stil);
      stil = window.setTimeout(() => zetPraat(false), 4000);
    };
    window.addEventListener("pointerdown", tik, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", tik);
      window.clearTimeout(stil);
    };
  }, []);
  return (
    <div ref={plek} className={`bt-prototype ${className}`} aria-hidden="true">
      <BliepoFilmpje rustig={rustig} className="bt-prototype-doek" onKlaar={onKlaar} />
      {praat && (
        <div className="bt-ballon" role="status">
          <span>{TIKTEKST}</span>
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
}: {
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

  useEffect(() => {
    rustigRef.current = rustig;
  }, [rustig]);

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
        if (!items.some((i) => i.isIntersecting)) return;
        kijker.disconnect();
        if (typeof window.requestIdleCallback === "function")
          wachtOpRust = window.requestIdleCallback(() => void start(), { timeout: 2500 });
        else wachtOpRust = globalThis.setTimeout(() => void start(), 600) as unknown as number;
      },
      { rootMargin: "400px 0px" },
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

      const besturing = new Z.ZappieController(model, { reducedMotion: rustigRef.current });
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
      const beweeg = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        const midden = r.left + r.width / 2;
        if (instelling.current.volgMuis)
          doelhoek = RUSTHOEK + Math.max(-1, Math.min(1, (e.clientX - midden) / (window.innerWidth / 2))) * 0.55;
        if (binnen(e.clientX, e.clientY, 40) && besturing.action === "idle") speel("wave");
      };
      const tik = (e: PointerEvent) => {
        if (!binnen(e.clientX, e.clientY, 0)) return;
        if ((e.target as Element | null)?.closest("a, button, input, select, textarea")) return;
        wachtTot = 0;
        if (!getikt) {
          getikt = true;
          besturing.showText(TIKTEKST);
          wachtTot = performance.now() + 4000;
        } else speel("celebrate");
      };
      window.addEventListener("pointermove", beweeg, { passive: true });
      window.addEventListener("pointerdown", tik, { passive: true });

      let frame = 0;
      let vorige = performance.now();
      let laatsteTekening = 0;
      let rustTijd = 0;
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
        if (!gegroet) {
          gegroet = true;
          if (!rustigRef.current) besturing.play("greet");
        }
        rustTijd = besturing.action === "idle" ? rustTijd + dt : 0;
        if (rustTijd > 24 && !rustigRef.current) {
          besturing.play("checkTail");
          rustTijd = 0;
        }
        const hoek = besturing.action === "talk" && instelling.current.volgMuis ? -Math.PI / 14 : doelhoek;
        model.root.rotation.y += (hoek - model.root.rotation.y) * Math.min(1, dt * 4);
        besturing.update(dt, {});
        ballon.update(besturing);
        /*
          Zuinig tekenen (18 oktober 2026, de site werd traag): in rust 15 keer
          per seconde (hij ademt alleen rustig), tijdens een gebaar 30 keer;
          niet meer op de volle snelheid van het scherm (tot 120 keer).
        */
        const pauze = besturing.action !== "idle" ? 1000 / 30 : rustigRef.current ? 250 : 1000 / 15;
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
        cancelAnimationFrame(frame);
        document.removeEventListener("visibilitychange", wakker);
        window.removeEventListener("pointermove", beweeg);
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

  return <div ref={plek} className={`bt-prototype ${className}`} aria-hidden="true" />;
}
