"use client";

/**
 * Opnamestudio voor de filmpjes van Bliepo (23 oktober 2026, opdracht
 * eigenaar): /voorbeeld-bliepo?opname=1.
 *
 * Tekent Bliepo precies zoals op de site (zelfde model, 3D-motor, licht en
 * bewegingen uit zappie.js), maar beeldje voor beeldje op een vaste klok, met
 * een doorzichtige achtergrond en zonder het lijntje op zijn scherm: dat
 * lijntje tekent de site er live overheen. Per beeldje geeft hij ook de vier
 * hoeken van het scherm terug, zodat het live lijntje precies meebeweegt.
 * Een opnamescript (buiten de site) bedient hem via window.__opname.
 *
 * Instellingen in het adres: b en h (maat in pixels), hoek (draaiing van de
 * robot), afstand, hoogte (waar de camera naar kijkt) en lens.
 *
 * Echte bewegingen (24 oktober 2026): ook de door mensen opgenomen gebaren
 * (lib/zappie3d/echte-gebaren.ts) kunnen worden opgenomen: speelEcht(clip),
 * en praat(aan, lus) zet hem recht naar de camera kijkend aan het praten
 * (lus: de praat-bewegingen lopen door).
 */

import { useEffect, useRef } from "react";

export function Opname() {
  const plek = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const getal = (n: string, s: number) => (q.has(n) ? Number(q.get(n)) : s);
    const B = getal("b", 348);
    const H = getal("h", 536);
    let weg = false;
    void (async () => {
      const [Z, { laadBliepoKlein }, G] = await Promise.all([
        import("@/lib/zappie3d/zappie"),
        import("@/lib/zappie3d/bliepo-klein"),
        import("@/lib/zappie3d/gedeelde-motor"),
      ]);
      const m = await G.haalMotor();
      if (weg || !plek.current) return;
      const T = m.T;
      const doek = document.createElement("canvas");
      doek.width = B;
      doek.height = H;
      doek.style.width = `${B}px`;
      doek.style.height = `${H}px`;
      plek.current.append(doek);
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(getal("lens", 32), B / H, 0.1, 30);
      const doelY = getal("hoogte", 1.95);
      camera.position.set(0, doelY + 0.35, getal("afstand", 8.6));
      camera.lookAt(0, doelY, 0);
      scene.environment = m.omgeving;
      scene.environmentIntensity = 0.8;
      scene.add(new T.HemisphereLight(0xe5f7ff, 0x315274, 1.7));
      const licht = new T.DirectionalLight(0xffffff, 2.8);
      licht.position.set(3, 5, 5);
      licht.castShadow = true;
      licht.shadow.mapSize.set(1024, 1024);
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
      if (q.get("schaduw") !== "nee") scene.add(vloer);
      const model = await laadBliepoKlein();
      /* zappie.js is gewoon JavaScript; het scherm en de golf zijn gewone 3D-onderdelen. */
      const scherm = model.screen as unknown as import("three").Mesh;
      const golf = model.wave as unknown as import("three").Object3D;
      model.root.rotation.y = getal("hoek", -Math.PI / 9);
      scene.add(model.root);
      const besturing = new Z.ZappieController(model, { reducedMotion: false });
      const E = await import("@/lib/zappie3d/echte-gebaren");
      besturing.echt = new E.EchteGebaren(
        T,
        await E.laadEchteGebaren(),
        model.parts as unknown as Record<string, import("three").Object3D>,
        model.rest as unknown as Record<string, { q: import("three").Quaternion }>,
      );
      /* Het scherm: de voorkant van zijn kastje, in de eigen maat van het scherm. */
      scherm.geometry.computeBoundingBox();
      const kast = scherm.geometry.boundingBox!;
      const hoekpunt = (x: number, y: number) => {
        const v = new T.Vector3(x, y, kast.max.z).applyMatrix4(scherm.matrixWorld).project(camera);
        return [+(((v.x + 1) / 2) * 100).toFixed(3), +(((1 - v.y) / 2) * 100).toFixed(3)];
      };
      const tekenNu = () => {
        model.root.updateMatrixWorld(true);
        G.teken(m, scene, camera, doek);
      };
      (window as unknown as { __opname: unknown }).__opname = {
        T,
        besturing,
        model,
        speel(actie: string) {
          besturing.play(actie);
        },
        /* `vanaf`: verder in de clip beginnen (kortere aanloop, 26 oktober 2026). */
        speelEcht(clip: string, vanaf = 0) {
          return besturing.speelEcht(clip, vanaf);
        },
        piek(clip: string) {
          return besturing.echt?.piek(clip) ?? 0;
        },
        duur(clip: string) {
          return besturing.echt?.duur(clip) ?? 0;
        },
        stopEcht() {
          besturing.echt?.stop();
        },
        praat(aan: boolean, lus = true) {
          if (!besturing.levendig) return;
          besturing.levendig.praat = aan;
          /* Recht naar de camera: het hoofd draait de rest bij (zoals in Bliepo3DGedeeld). */
          besturing.levendig.naarKind = -model.root.rotation.y / 1.22;
          besturing.praatLus = lus;
        },
        stap(dt: number, opties: { spraak?: number | null; kijk?: { x: number; y: number } | null; lijn?: boolean } = {}) {
          if (opties.spraak !== undefined) besturing.setSpeechLevel(opties.spraak);
          if (opties.kijk !== undefined && besturing.levendig) besturing.levendig.kijk = opties.kijk;
          besturing.update(dt, {});
          /* Het lijntje tekent de site er live overheen (behalve als erom gevraagd wordt, voor een voor/na-filmpje). */
          golf.visible = !!opties.lijn;
          tekenNu();
          return {
            beeld: doek.toDataURL("image/png"),
            scherm: [hoekpunt(kast.min.x, kast.max.y), hoekpunt(kast.max.x, kast.max.y), hoekpunt(kast.min.x, kast.min.y), hoekpunt(kast.max.x, kast.min.y)],
          };
        },
      };
      document.body.dataset.opname = "klaar";
    })();
    return () => {
      weg = true;
    };
  }, []);
  return <div ref={plek} style={{ background: "transparent" }} />;
}
