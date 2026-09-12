/**
 * Confetti op een canvas.
 *
 * Waarom canvas en niet een paar honderd losse elementen: bij dit aantal
 * stukjes moet de browser anders net zoveel DOM-knopen bijhouden en elk frame
 * opnieuw plaatsen. Op een tablet of telefoon gaat dat schokken. Eén canvas is
 * één element; het tekenen zelf gebeurt in een enkele lus.
 *
 * ---------------------------------------------------------------------------
 * Wat de beweging moet doen
 * ---------------------------------------------------------------------------
 * De stukjes komen van bovenaf en VALLEN. Ze gaan nooit omhoog: de verticale
 * snelheid begint positief (naar beneden) en de zwaartekracht telt daar alleen
 * maar bij op, dus hij kan per definitie niet negatief worden. Dat is met opzet
 * zo opgeschreven en niet als toeval van de gekozen getallen.
 *
 * Daarbovenop krijgt elk stukje eigen toevalligheden, zodat het geen regen van
 * identieke blokjes wordt:
 *   - een zijwaartse drift die langzaam heen en weer zwenkt (dwarrelen);
 *   - een eigen draaisnelheid;
 *   - een "tuimeling": de breedte wordt met een cosinus samengeknepen, alsof
 *     het stukje om zijn eigen as klapt en je het even van de zijkant ziet;
 *   - een eigen vorm en kleur.
 *
 * Aan het eind vervagen ze; ze verdwijnen niet ineens.
 *
 * De plaats van elk stukje wordt uit de verstreken tijd berekend en niet per
 * frame opgeteld. Daardoor loopt de animatie even snel op 60 Hz als op 120 Hz,
 * en — belangrijker — blijft hij op snelheid als de browser frames overslaat.
 */

/** Vrolijke kleuren: roze, paars, groen, geel, oranje, blauw. */
const KLEUREN = [
  "#e4607f", // roze
  "#5b3fd6", // paars
  "#1f9d63", // groen
  "#f2bb2e", // geel
  "#e4832a", // oranje
  "#3577cc", // blauw
  "#7c5cff", // lichtpaars
  "#38b87c", // lichtgroen
];

type Vorm = "strook" | "rond" | "vierkant";

type Stukje = {
  x: number;
  y: number;
  /** Horizontale snelheid in px per seconde. */
  vx: number;
  /** Verticale snelheid in px per seconde. Altijd positief: naar beneden. */
  vy: number;
  breedte: number;
  hoogte: number;
  kleur: string;
  vorm: Vorm;
  /** Huidige draaiing en hoe snel die verandert. */
  hoek: number;
  draai: number;
  /** Fase en snelheid van het tuimelen om de eigen as. */
  tuimel: number;
  tuimelSnelheid: number;
  /** Fase en kracht van het zijwaartse dwarrelen. */
  zwenk: number;
  zwenkSnelheid: number;
  zwenkKracht: number;
  /**
   * Hoeveel seconden dit stukje later begint dan het begin van het feest.
   *
   * Zonder dit valt alles als één pakket naar beneden: na anderhalve seconde
   * is de onderkant van het scherm leeg en regent het nergens meer. Door de
   * stukjes over de eerste seconden te verdelen, blijft het scherm de hele
   * animatie gevuld.
   */
  vertraging: number;
};

/** Zwaartekracht in px per seconde per seconde. */
const ZWAARTEKRACHT = 260;

/** Hoe lang een stukje nog te zien is nadat de tijd om is. */
const VERVAAG_DEEL = 0.28;

function tussen(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function maakStukje(
  breedteScherm: number,
  hoogteScherm: number,
  vertraging: number,
): Stukje {
  const vorm: Vorm =
    Math.random() < 0.55 ? "strook" : Math.random() < 0.5 ? "rond" : "vierkant";

  /*
    Startpositie: verspreid over de volle breedte, en verticaal van een eind
    boven het scherm tot net onder de bovenrand. Doordat ze niet allemaal op
    dezelfde hoogte beginnen, regent het meteen over de hele hoogte in plaats
    van dat er één strakke band naar beneden zakt.
  */
  const y = tussen(-hoogteScherm * 0.35, hoogteScherm * 0.05);

  const grootte = tussen(7, 13);

  return {
    x: tussen(-0.04 * breedteScherm, 1.04 * breedteScherm),
    y,
    vx: tussen(-70, 70),
    // Altijd naar beneden. Dit is de enige plek waar vy wordt gezet.
    vy: tussen(140, 380),
    breedte: vorm === "strook" ? grootte * 0.55 : grootte,
    hoogte: vorm === "strook" ? grootte * 1.7 : grootte,
    kleur: KLEUREN[Math.floor(Math.random() * KLEUREN.length)],
    vorm,
    hoek: tussen(0, Math.PI * 2),
    draai: tussen(-5, 5),
    tuimel: tussen(0, Math.PI * 2),
    tuimelSnelheid: tussen(3, 8),
    zwenk: tussen(0, Math.PI * 2),
    zwenkSnelheid: tussen(0.8, 2.2),
    zwenkKracht: tussen(20, 90),
    vertraging,
  };
}

/**
 * Start de confetti op dit canvas.
 *
 * `duurMs` is hoe lang er gevallen wordt; daarna vervagen de stukjes nog even.
 * Geeft een functie terug die de animatie stopt en opruimt — die hoort in de
 * opruimstap van het effect dat hem startte.
 */
export function startConfetti(
  canvas: HTMLCanvasElement,
  duurMs: number,
  aantal = 420,
): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let breedte = 0;
  let hoogte = 0;

  /*
    Het canvas krijgt het aantal echte beeldpunten van het scherm, niet het
    aantal CSS-pixels. Zonder dit is de confetti op een scherm met hoge
    pixeldichtheid (telefoon, retina) zichtbaar korrelig.
  */
  function meetOp() {
    const verhouding = Math.min(window.devicePixelRatio || 1, 2);
    breedte = window.innerWidth;
    hoogte = window.innerHeight;
    canvas.width = Math.floor(breedte * verhouding);
    canvas.height = Math.floor(hoogte * verhouding);
    canvas.style.width = `${breedte}px`;
    canvas.style.height = `${hoogte}px`;
    ctx!.setTransform(verhouding, 0, 0, verhouding, 0, 0);
  }

  meetOp();
  window.addEventListener("resize", meetOp);

  /*
    De eerste golf begint meteen, zodat het scherm direct vol staat; de rest
    volgt verspreid over de eerste tweederde van de tijd. Dat leest als een
    aanhoudende regen in plaats van één worp die voorbij is.
  */
  const duurSec = duurMs / 1000;
  const stukjes = Array.from({ length: aantal }, (_, i) =>
    maakStukje(
      breedte,
      hoogte,
      i < aantal * 0.35 ? 0 : Math.random() * duurSec * 0.62,
    ),
  );

  let bezig = true;
  const begin = performance.now();
  let handvat = 0;

  function stap(nu: number) {
    if (!bezig) return;

    const verstreken = nu - begin;
    const totaleDuur = duurMs * (1 + VERVAAG_DEEL);
    if (verstreken >= totaleDuur) {
      bezig = false;
      ctx!.clearRect(0, 0, breedte, hoogte);
      return;
    }

    // Vervagen pas aan het eind, en dan geleidelijk.
    const vervaagVanaf = duurMs;
    const doorzicht =
      verstreken <= vervaagVanaf
        ? 1
        : Math.max(0, 1 - (verstreken - vervaagVanaf) / (duurMs * VERVAAG_DEEL));

    ctx!.clearRect(0, 0, breedte, hoogte);
    ctx!.globalAlpha = doorzicht;

    const verstrekenSec = verstreken / 1000;

    for (const s of stukjes) {
      // Hoe lang dit stukje zelf al onderweg is.
      const tau = verstrekenSec - s.vertraging;
      // Nog niet aan de beurt: dit stukje valt straks pas.
      if (tau <= 0) continue;

      /*
        De plaats wordt uit de verstreken tijd BEREKEND, niet per frame
        opgeteld.

        Dat is met opzet. Bij optellen bepaalt het aantal frames hoe ver de
        confetti komt, en dan valt hij in slow motion zodra de browser frames
        overslaat — op een tablet die het even druk heeft, of in een tabblad
        dat naar de achtergrond gaat. Met een formule hoort bij elk moment
        precies één plaats, ongeacht hoeveel frames er getekend zijn.

        De val is de gewone valbeweging: beginsnelheid maal tijd, plus een
        halve g maal tijd in het kwadraat. Omdat beide termen positief zijn,
        gaat een stukje nooit omhoog.
      */
      const y = s.y + s.vy * tau + 0.5 * ZWAARTEKRACHT * tau * tau;

      // Onderuit gevallen stukjes hoeven niet meer getekend te worden.
      if (y > hoogte + 40) continue;

      // Zijwaarts: een rechte drift met het dwarrelen eroverheen.
      const xRuw =
        s.x + s.vx * tau + Math.sin(s.zwenk + s.zwenkSnelheid * tau) * s.zwenkKracht;
      // Wie er aan de zijkant uit valt, komt er aan de andere kant weer in.
      const speling = breedte + 80;
      const x = (((xRuw + 40) % speling) + speling) % speling - 40;

      ctx!.save();
      ctx!.translate(x, y);
      ctx!.rotate(s.hoek + s.draai * tau);
      // Het tuimelen: de breedte knijpt samen alsof het stukje omklapt.
      ctx!.scale(Math.cos(s.tuimel + s.tuimelSnelheid * tau), 1);
      ctx!.fillStyle = s.kleur;

      if (s.vorm === "rond") {
        ctx!.beginPath();
        ctx!.arc(0, 0, s.breedte / 2, 0, Math.PI * 2);
        ctx!.fill();
      } else {
        ctx!.fillRect(-s.breedte / 2, -s.hoogte / 2, s.breedte, s.hoogte);
      }

      ctx!.restore();
    }

    ctx!.globalAlpha = 1;
    handvat = requestAnimationFrame(stap);
  }

  handvat = requestAnimationFrame(stap);

  return () => {
    bezig = false;
    cancelAnimationFrame(handvat);
    window.removeEventListener("resize", meetOp);
    ctx.clearRect(0, 0, breedte, hoogte);
  };
}
