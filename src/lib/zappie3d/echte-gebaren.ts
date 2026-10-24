/**
 * Echte, door mensen opgenomen bewegingen voor Bliepo (24 oktober 2026,
 * opdracht eigenaar: "geen stijve robotgebaren, maar zoals een echte tutor").
 *
 * De bewegingen komen van Mixamo (door mensen opgenomen, gratis) en zijn in
 * Blender overgezet op Bliepo's eigen scharnieren: hoofd, schouders,
 * ellebogen, polsen en vingers. Zijn armen zijn kort, dus waar een arm door
 * zijn lijf, hoofd of wielen zou gaan, is hij naar buiten of naar voren
 * geduwd. Zijn lijf en wielen bewegen niet mee. Het model zelf
 * (zappie-klein.glb) is niet veranderd: de clips staan in een eigen, klein
 * bestand (zappie-gebaren.glb, meshopt-gecomprimeerd) en worden pas geladen
 * als de 3D-Bliepo er staat.
 *
 * Afspelen: elke clip komt er zacht in en gaat er zacht uit (crossfade), over
 * de gewone houding uit zappie.js heen. Het hoofd houdt de draai naar het
 * kind (Levendig); van de clip krijgt het alleen het knikken en scheef
 * houden erbij. Zolang hij praat en geen ander gebaar maakt, lopen de
 * praat-clips achter elkaar door, steeds een andere, en de handen gaan wat
 * sneller op luide lettergrepen. Het lijntje op zijn scherm blijft gewoon de
 * stemmeter volgen.
 */

import type { AnimationClip, Object3D, Quaternion as TQuaternion, QuaternionKeyframeTrack } from "three";

export const GEBAREN_MODEL = "/assets/zappie/3d/zappie-gebaren.glb";

/**
 * De clips in het bestand, met wat ze zijn (ook de knoppen op /voorbeeld-bliepo).
 * Tussen haakjes de opname bij Mixamo waar ze vandaan komen.
 */
export const ECHTE_GEBAREN: Record<string, string> = {
  praten1: "Praten 1 (General Conversation)",
  praten2: "Praten 2 (Having A Chat)",
  vraag1: "Vraag met twee handen",
  vraag2: "Vraag met één hand",
  vraag3: "Vraag stellen",
  wijzen1: "Wijzen naar de opdracht",
  wijzen2: "Laten zien",
  tellen: "Tellen op de vingers",
  nadenken: "Nadenken (hint)",
  duim: "Duim omhoog",
  klappen: "Klappen",
  knikken: "Ja knikken",
  knikken2: "Bedachtzaam knikken (aanmoedigen)",
  geruststellen: "Geruststellen (geeft niet)",
  zwaaien: "Zwaaien",
  zwaaien2: "Zwaaien (groot)",
};
/** Welke clips tijdens het praten doorlopen. */
export const PRAAT_CLIPS = ["praten1", "praten2"];
/** Korte opnames die een paar keer achter elkaar spelen (één zwaai of klap is te kort). */
const HERHAAL: Record<string, number> = { zwaaien: 4, zwaaien2: 2, klappen: 2 };

type Spoor = { naam: string; track: QuaternionKeyframeTrack; doel: Object3D };
type Laag = { clip: string; t: number; gewicht: number; erin: number; eruit: boolean; lus: boolean; duur: number; lengte: number; sporen: Spoor[] };
type Clips = Map<string, AnimationClip>;

let bron: Promise<Clips> | null = null;

/** De clips één keer ophalen, hoe vaak Bliepo ook op de pagina staat. */
export function laadEchteGebaren(): Promise<Clips> {
  bron ??= (async () => {
    const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
      import("three/examples/jsm/loaders/GLTFLoader.js"),
      import("three/examples/jsm/libs/meshopt_decoder.module.js"),
    ]);
    const lader = new GLTFLoader();
    lader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await lader.loadAsync(GEBAREN_MODEL);
    return new Map(gltf.animations.map((c) => [c.name, c]));
  })();
  bron.catch(() => {
    bron = null;
  });
  return bron;
}

const ERIN = 0.35;
const ERUIT = 0.45;

export class EchteGebaren {
  private lagen: Laag[] = [];
  private vorigePraat = "";
  private q: TQuaternion;
  private q2: TQuaternion;
  private qRust: TQuaternion;
  private pieken = new Map<string, number>();
  private stemGem = 0;
  private klem = 0;
  private xAs: import("three").Vector3;
  /** Of er nu een gebaar (geen praat-clip) speelt. */
  gebaar = "";

  constructor(
    private T: typeof import("three"),
    private clips: Clips,
    private onderdelen: Record<string, Object3D>,
    private rust: Record<string, { q: TQuaternion }>,
  ) {
    this.q = new T.Quaternion();
    this.q2 = new T.Quaternion();
    this.qRust = new T.Quaternion();
    this.xAs = new T.Vector3(1, 0, 0);
  }

  heeft(clip: string) {
    return this.clips.has(clip);
  }

  duur(clip: string) {
    return (this.clips.get(clip)?.duration ?? 0) * (HERHAAL[clip] ?? 1);
  }

  /**
   * Wanneer het gebaar op zijn hoogste punt is (seconden na het begin): het
   * eerste moment waarop de armen (bijna, 85%) het verst van het begin staan.
   * Dat moment komt net voor het woord waar het gebaar bij hoort.
   */
  piek(clip: string) {
    const bekend = this.pieken.get(clip);
    if (bekend !== undefined) return bekend;
    const c = this.clips.get(clip);
    let piek = 0;
    if (c) {
      const sporen = c.tracks.filter((t) => /^(Arm|Elbow)(Left|Right)\.quaternion$/.test(t.name));
      /* Elk spoor heeft zijn eigen beeldjes (na het verkleinen); daarom op een vaste klok uitrekenen. */
      type Lezer = { evaluate: (t: number) => ArrayLike<number> };
      const lezers = sporen.map((t) => (t as unknown as { createInterpolant: () => Lezer }).createInterpolant());
      const begin = lezers.map((l) => Array.from(l.evaluate(0)));
      const tijden: number[] = [];
      const afstand: number[] = [];
      for (let t = 0; t <= c.duration; t += 1 / 30) {
        let som = 0;
        lezers.forEach((l, j) => {
          const v = l.evaluate(t);
          const b = begin[j];
          /* Hoek tussen nu en het begin: 2·acos(|q0·q|). */
          const d = Math.abs(b[0] * v[0] + b[1] * v[1] + b[2] * v[2] + b[3] * v[3]) / Math.hypot(v[0], v[1], v[2], v[3]);
          som += 2 * Math.acos(Math.min(1, d));
        });
        tijden.push(t);
        afstand.push(som);
      }
      /* Het eerste moment dat de armen er (bijna) zijn: daar zie je het gebaar. */
      const max = Math.max(0, ...afstand);
      const i = afstand.findIndex((a) => a >= max * 0.85);
      piek = i >= 0 ? tijden[i] : 0;
    }
    this.pieken.set(clip, piek);
    return piek;
  }

  private maakLaag(clip: string, lus: boolean): Laag | null {
    const c = this.clips.get(clip);
    if (!c) return null;
    const sporen: Spoor[] = [];
    for (const track of c.tracks) {
      const naam = track.name.split(".")[0];
      const doel = this.onderdelen[naam];
      if (doel && track.name.endsWith(".quaternion")) sporen.push({ naam, track: track as QuaternionKeyframeTrack, doel });
    }
    return { clip, t: 0, gewicht: 0, erin: ERIN, eruit: false, lus, duur: c.duration * (HERHAAL[clip] ?? 1), lengte: c.duration, sporen };
  }

  /** Een gebaar één keer spelen (vanaf `vanaf` seconden); wat er speelde gaat er zacht uit. */
  speel(clip: string, vanaf = 0) {
    const laag = this.maakLaag(clip, false);
    if (!laag) return false;
    laag.t = Math.max(0, Math.min(vanaf, laag.duur - ERUIT - 0.1));
    for (const l of this.lagen) l.eruit = true;
    this.lagen.push(laag);
    this.gebaar = clip;
    return true;
  }

  /** Alles zacht laten uitlopen (bijvoorbeeld bij een ander, eigen gebaar uit zappie.js). */
  stop() {
    for (const l of this.lagen) l.eruit = true;
    this.gebaar = "";
  }

  /**
   * Eén stap. `praat`: zijn stem klinkt (dan lopen de praat-clips door);
   * `niveau`: hoe hard hij nu klinkt (0..1) of null; `vrij`: er speelt geen
   * eigen gebaar uit zappie.js.
   */
  stap(dt: number, praat: boolean, niveau: number | null, vrij: boolean) {
    const actief = this.lagen.filter((l) => !l.eruit);
    const bovenste = actief[actief.length - 1];
    if (!vrij) {
      if (actief.length) this.stop();
    } else if (praat && (!bovenste || bovenste.t > bovenste.duur - ERUIT)) {
      /* Praten: de volgende praat-clip, steeds een andere. */
      const keus = PRAAT_CLIPS.filter((c) => c !== this.vorigePraat && this.clips.has(c));
      const clip = keus[Math.floor(Math.random() * keus.length)];
      if (clip) {
        this.vorigePraat = clip;
        for (const l of this.lagen) l.eruit = true;
        const laag = this.maakLaag(clip, true);
        if (laag) {
          /* Niet steeds vanaf het begin: dat ziet er minder herhaald uit. */
          laag.t = Math.random() * Math.max(0, laag.duur * 0.4);
          this.lagen.push(laag);
        }
        this.gebaar = "";
      }
    } else if (!praat && bovenste?.lus) {
      bovenste.eruit = true;
    }
    /* Op luide lettergrepen gaan de handen wat sneller. */
    const tempo = niveau === null ? 1 : 0.85 + 0.4 * niveau;
    /*
      Klemtoon: een lettergreep die luider is dan het gemiddelde geeft een
      klein tikje met de onderarmen, zoals mensen met hun handen de klemtoon
      meegeven. Snel erin, zacht weer terug.
    */
    const n = niveau ?? 0;
    this.stemGem += (n - this.stemGem) * Math.min(1, dt * 3);
    const doel = praat ? Math.max(0, n - this.stemGem - 0.08) : 0;
    this.klem += (doel - this.klem) * Math.min(1, dt * (doel > this.klem ? 22 : 6));
    for (const l of this.lagen) {
      l.t += dt * (l.lus ? tempo : 1);
      if (!l.lus && l.t >= l.duur - ERUIT) l.eruit = true;
      if (l.eruit) l.gewicht = Math.max(0, l.gewicht - dt / ERUIT);
      else l.gewicht = Math.min(1, l.gewicht + dt / l.erin);
    }
    this.lagen = this.lagen.filter((l) => l.gewicht > 0 || !l.eruit);
    if (this.gebaar && !this.lagen.some((l) => !l.eruit && l.clip === this.gebaar)) this.gebaar = "";
  }

  /** Zet de clips over de houding die er al staat (na applyPose). */
  toepas() {
    const T = this.T;
    for (const l of this.lagen) {
      if (l.gewicht <= 0) continue;
      const w = l.gewicht * l.gewicht * (3 - 2 * l.gewicht);
      const tijd = l.lus || l.duur > l.lengte ? l.t % l.lengte : Math.min(l.t, l.lengte);
      for (const s of l.sporen) {
        const waarden = s.track.values;
        const tijden = s.track.times;
        /* Zelf opzoeken en tussen twee beeldjes in mengen (klein, en geen mixer per Bliepo nodig). */
        let i = 0;
        while (i < tijden.length - 2 && tijden[i + 1] < tijd) i++;
        const a = tijden[i];
        const b = tijden[Math.min(i + 1, tijden.length - 1)];
        const f = b > a ? T.MathUtils.clamp((tijd - a) / (b - a), 0, 1) : 0;
        this.q.fromArray(waarden, i * 4);
        this.q2.fromArray(waarden, Math.min(i + 1, tijden.length - 1) * 4);
        this.q.slerp(this.q2, f);
        const rust = this.rust[s.naam]?.q;
        if (s.naam === "Head") {
          /* Het hoofd: de draai naar het kind blijft; de clip voegt knikken en scheef houden toe. */
          if (rust) this.q.premultiply(this.qRust.copy(rust).invert());
          this.q2.identity().slerp(this.q, w);
          s.doel.quaternion.multiply(this.q2);
        } else {
          s.doel.quaternion.slerp(this.q, w);
        }
      }
    }
    /* Het tikje op de klemtoon, alleen bij de praat-bewegingen. */
    const praatGewicht = this.lagen.reduce((m, l) => (l.lus ? Math.max(m, l.gewicht) : m), 0);
    if (this.klem > 0.001 && praatGewicht > 0) {
      for (const naam of ["ElbowLeft", "ElbowRight"]) {
        const o = this.onderdelen[naam];
        if (!o) continue;
        this.q.setFromAxisAngle(this.xAs, this.klem * 0.55 * praatGewicht);
        o.quaternion.multiply(this.q);
      }
    }
  }
}
