"use client";

/**
 * Prototype nr. 1: de echte Zappie in 3D, op Tesla's bouwtekening.
 *
 * Gebruikt het model en de gebaren uit het pakket "Zappie 3D — Blender-editie
 * 02" van de eigenaar (src/lib/zappie3d/zappie.js). Anders dan de overlay uit
 * dat pakket rijdt hij hier niet over de pagina: hij staat op een vaste plek
 * op de tekening, kijkt een beetje mee met de muis en reageert:
 *
 *   - muis of vinger in de buurt: hij zwaait;
 *   - eerste tik: hij zegt wie hem heeft uitgevonden;
 *   - volgende tikken: hij juicht;
 *   - komt hij voor het eerst in beeld: hij begroet je;
 *   - wacht hij lang: hij kijkt even naar zijn stekker (zit in het model).
 *
 * Three.js wordt pas geladen als dit onderdeel echt op het scherm komt, zodat
 * de gewone startpagina er niets van merkt. Geen WebGL: dan blijft alleen de
 * tekening staan. Bij "Beweging uit" of "minder beweging" staat hij rustig en
 * wordt er weinig getekend.
 *
 * De muis en tikken worden op het venster gevolgd (zoals in Bouwtekening.tsx),
 * omdat de inhoud van de pagina boven deze laag ligt.
 */

import { useEffect, useRef } from "react";

const TIKTEKST = "Hoi! Ik ben Bliepo. Tesla heeft mij uitgevonden.";

export function Prototype3D({ rustig }: { rustig: boolean }) {
  const plek = useRef<HTMLDivElement>(null);
  const rustigRef = useRef(rustig);

  useEffect(() => {
    rustigRef.current = rustig;
  }, [rustig]);

  useEffect(() => {
    const host = plek.current;
    if (!host) return;
    let opgeruimd = false;
    let opruimen: (() => void) | null = null;

    /* Pas laden als het prototype bijna in beeld is. */
    const kijker = new IntersectionObserver(
      (items) => {
        if (!items.some((i) => i.isIntersecting)) return;
        kijker.disconnect();
        void start();
      },
      { rootMargin: "400px 0px" },
    );
    kijker.observe(host);

    async function start() {
      const [T, { RoomEnvironment }, Z] = await Promise.all([
        import("three"),
        import("three/examples/jsm/environments/RoomEnvironment.js"),
        import("@/lib/zappie3d/zappie"),
      ]);
      if (opgeruimd || !host) return;

      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try {
        renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      } catch {
        return; /* Geen WebGL: de tekening blijft staan. */
      }
      renderer.setClearColor(0, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFShadowMap;
      renderer.domElement.className = "bt-prototype-doek";
      host.append(renderer.domElement);

      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(32, 0.8, 0.1, 30);
      camera.position.set(0, 2.3, 8.6);
      camera.lookAt(0, 1.95, 0);

      const pmrem = new T.PMREMGenerator(renderer);
      const kamer = new RoomEnvironment();
      const omgeving = pmrem.fromScene(kamer, 0.04);
      scene.environment = omgeving.texture;
      scene.environmentIntensity = 0.8;
      pmrem.dispose();
      kamer.dispose();

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

      let model: Awaited<ReturnType<typeof Z.loadZappie>>;
      try {
        model = await Z.loadZappie();
      } catch (fout) {
        console.warn("[zappie] 3D-model niet geladen, de tekening blijft staan:", fout);
        renderer.dispose();
        omgeving.dispose();
        renderer.domElement.remove();
        return;
      }
      if (opgeruimd) {
        renderer.dispose();
        omgeving.dispose();
        return;
      }
      scene.add(model.root);
      const RUSTHOEK = -Math.PI / 9;
      model.root.rotation.y = RUSTHOEK;

      const besturing = new Z.ZappieController(model, { reducedMotion: rustigRef.current });
      const ballon = Z.createSpeechBubble(host);
      ballon.element.className = "bt-ballon";
      ballon.element.removeAttribute("style");
      ballon.element.hidden = true;
      host.dataset.klaar = "ja";

      const maat = () => {
        const r = host.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / Math.max(1, r.height);
        camera.updateProjectionMatrix();
      };
      maat();
      const maatkijker = new ResizeObserver(maat);
      maatkijker.observe(host);

      /* Alleen tekenen als hij in beeld is. */
      let zichtbaar = true;
      const inBeeld = new IntersectionObserver((items) => {
        zichtbaar = items.some((i) => i.isIntersecting);
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
      const tel = (nu: number) => {
        frame = requestAnimationFrame(tel);
        const dt = Math.min((nu - vorige) / 1000, 0.05);
        vorige = nu;
        if (!zichtbaar || document.hidden) return;
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
        const hoek = besturing.action === "talk" ? -Math.PI / 14 : doelhoek;
        model.root.rotation.y += (hoek - model.root.rotation.y) * Math.min(1, dt * 4);
        besturing.update(dt, {});
        ballon.update(besturing);
        const pauze = besturing.action !== "idle" ? 0 : rustigRef.current ? 250 : 1000 / 30;
        if (nu - laatsteTekening >= pauze) {
          renderer.render(scene, camera);
          laatsteTekening = nu;
        }
      };
      frame = requestAnimationFrame(tel);

      opruimen = () => {
        cancelAnimationFrame(frame);
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
        omgeving.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    return () => {
      opgeruimd = true;
      kijker.disconnect();
      opruimen?.();
    };
  }, []);

  return <div ref={plek} className="bt-prototype" aria-hidden="true" />;
}
