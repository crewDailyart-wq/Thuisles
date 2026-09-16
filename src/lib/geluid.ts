/**
 * Kleine geluidjes voor de uitleg: een teltikje en een belletje.
 *
 * Met code gemaakt in plaats van geluidsbestanden: dat scheelt downloaden en
 * werkt overal. Zacht en kort; het kan altijd uit.
 */

import { zetGeluidsvoorkeur } from "@/app/oefenacties";

let context: AudioContext | null = null;

/*
  De geluidsmotor aanzetten bij de eerste aanraking.

  Browsers spelen geen geluid af voordat de gebruiker iets heeft aangeraakt. Op
  een telefoon is dat strenger dan op een laptop: daar moet de motor ook echt
  BINNEN die aanraking worden gestart. Gebeurt dat een fractie later — bij het
  eerste geluidje — dan blijft hij slapen en hoor je de rest van het bezoek
  helemaal niets. Precies dat ging er mis: op de laptop klonk alles, op de
  telefoon niets.

  Daarom wordt hier bij de eerste tik de motor gemaakt, wakker gemaakt en één
  stil hapje afgespeeld. Dat laatste is wat iPhones en iPads echt overtuigt.
*/
let getikt = false;

function zetMotorAan() {
  getikt = true;
  const ctx = krijgContext();
  if (!ctx) return;
  ctx.resume().catch(() => {});
  try {
    /* Een stil geluidje van één trilling: genoeg om de motor te openen. */
    const bron = ctx.createBufferSource();
    bron.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    bron.connect(ctx.destination);
    bron.start(0);
  } catch {
    // Lukt dit niet, dan werkt het geluid gewoon vanaf de volgende aanraking.
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", zetMotorAan, { once: true, capture: true });
  window.addEventListener("touchstart", zetMotorAan, { once: true, capture: true });
  window.addEventListener("keydown", zetMotorAan, { once: true, capture: true });
}

/**
 * De motor nog even wakker maken, binnen een aanraking.
 *
 * Voor geluid dat pas ná de aanraking klinkt. Het sleutelgeluid is daar het
 * voorbeeld van: dat hoort bij het moment dat de sleutel in beeld komt, en dat
 * kan seconden later zijn dan de tik waarmee het kind antwoordde. Een browser
 * — en een telefoon in het bijzonder — laat een motor die intussen in slaap is
 * gevallen niet zomaar buiten een aanraking om weer aanslaan; dan hoor je niets.
 *
 * Hiermee wordt hij nog binnen de tik aangezet, zodat het geluid even later
 * gewoon klinkt. Hij doet niets als hij al draait, en hij maakt zelf geen
 * hoorbaar geluid.
 */
export function wekGeluid(): void {
  zetMotorAan();
}

function krijgContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Maker = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Maker) return null;
    context = new Maker();
  }
  return context;
}

function toon(frequentie: number, duur: number, volume: number) {
  const ctx = krijgContext();
  if (!ctx) return;
  /*
    Een browser houdt geluid tegen tot de gebruiker iets heeft aangeraakt. Dan
    ketst `resume()` af. Zonder `catch` komt die afwijzing als foutmelding in de
    console terecht, terwijl er niets aan de hand is: het geluid komt vanzelf
    zodra er een keer getikt is.

    Slaapt de motor, dan wordt het toontje pas ingepland zodra hij draait. Dat
    is geen overbodige voorzichtigheid: de klok van de motor staat stil zolang
    hij slaapt, en een toontje dat op die stilstaande klok wordt gezet, is zijn
    moment voorbij tegen de tijd dat hij weer loopt. Je hoort dan niets.
  */
  if (ctx.state !== "running") {
    ctx
      .resume()
      .then(() => speel(ctx, frequentie, duur, volume))
      .catch(() => {});
    return;
  }

  speel(ctx, frequentie, duur, volume);
}

/** Het toontje zelf, op een motor die draait. */
function speel(ctx: AudioContext, frequentie: number, duur: number, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequentie;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duur);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duur + 0.02);
}

/** Zacht tikje bij elk geteld blokje. */
export function tel(): void {
  toon(660, 0.08, 0.06);
}

/**
 * Zachte plop als de vos op een steen landt.
 *
 * Een korte lage toon die meteen wegzakt — het klinkt als neerkomen, niet als
 * een piepje. Zacht gehouden: hij komt bij elke sprong terug en moet ook bij de
 * tiende keer niet gaan irriteren.
 *
 * Speelt niets zolang er nog nergens is getikt. Een browser laat geluid dan
 * toch niet toe, en zo komt er ook geen waarschuwing in de console.
 */
export function plop(): void {
  if (!getikt) return;
  toon(300, 0.1, 0.05);
  setTimeout(() => toon(190, 0.09, 0.035), 22);
}

/** Klein belletje bij het antwoord. */
export function belletje(): void {
  toon(880, 0.18, 0.07);
  setTimeout(() => toon(1320, 0.22, 0.05), 110);
}

/**
 * Kort vrolijk deuntje bij het feestscherm na een goed antwoord.
 *
 * Een stijgend drieklankje (do-mi-sol) met een octaaf eroverheen als afsluiter.
 * Klimmende tonen klinken als "gelukt"; dalende zouden het tegenovergestelde
 * zeggen. Kort gehouden — een halve seconde — want het komt bij elk goed
 * antwoord terug en moet ook bij de twintigste keer niet gaan irriteren.
 */
export function feestje(): void {
  const noten = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  noten.forEach((hz, i) => {
    setTimeout(() => toon(hz, i === noten.length - 1 ? 0.3 : 0.16, 0.07), i * 85);
  });
}

/** Vos leest de zin voor, in het Nederlands. */
export function lees(zin: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const stem = new SpeechSynthesisUtterance(zin);
  stem.lang = "nl-NL";
  stem.rate = 0.95;
  stem.pitch = 1.1;
  window.speechSynthesis.speak(stem);
}

export function stopLezen(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// ---------------------------------------------------------------------------
// Voorkeur voor geluid
// ---------------------------------------------------------------------------

/**
 * De aan/uit-stand van het geluid, bewaard op dit apparaat.
 *
 * Bewust een kleine losse opslag buiten React: zo kan een scherm de stand
 * gewoon uitlezen zonder tijdens het opbouwen iets bij te werken.
 */
const SLEUTEL = "thuisles-uitleg-geluid";
const luisteraars = new Set<() => void>();
let stand: boolean | null = null;

export function geluidStaatAan(): boolean {
  if (stand === null) {
    try {
      stand = window.localStorage.getItem(SLEUTEL) !== "uit";
    } catch {
      // Privéstand of geblokkeerde opslag: dan gewoon geluid aan.
      stand = true;
    }
  }
  return stand;
}

/** Op de server is er geen opslag; daar staat het geluid gewoon aan. */
export function geluidOpServer(): boolean {
  return true;
}

export function abonneerGeluid(herteken: () => void): () => void {
  luisteraars.add(herteken);
  return () => {
    luisteraars.delete(herteken);
  };
}

export function zetGeluid(aan: boolean): void {
  stand = aan;
  if (!aan) stopLezen();
  try {
    window.localStorage.setItem(SLEUTEL, aan ? "aan" : "uit");
  } catch {
    // De voorkeur geldt dan alleen deze keer.
  }
  /*
    En naar de database, bij het kind. Zet een kind het geluid uit op de tablet,
    dan staat het ook uit op de laptop. Lukt het versturen niet, dan geldt de
    keuze gewoon op dit apparaat — de opslag hierboven is het vangnet.
  */
  void zetGeluidsvoorkeur("uitleggeluid", aan).catch(() => {});
  for (const f of luisteraars) f();
}

// ---------------------------------------------------------------------------
// Het geluid in de opgave zelf
// ---------------------------------------------------------------------------

/**
 * Los van het geluid in het uitlegfilmpje.
 *
 * De knop in het filmpje regelt de stem die uitlegt; de knop in de opgave
 * regelt de geluidjes tijdens het maken. Een kind dat de ploppen te druk vindt
 * maar de uitleg wél wil horen, kan die twee zo apart zetten.
 */
const SLEUTEL_OPGAVE = "thuisles-opgave-geluid";
const opgaveLuisteraars = new Set<() => void>();
let opgaveStand: boolean | null = null;

export function opgavegeluidStaatAan(): boolean {
  if (opgaveStand === null) {
    try {
      opgaveStand = window.localStorage.getItem(SLEUTEL_OPGAVE) !== "uit";
    } catch {
      // Privéstand of geblokkeerde opslag: dan gewoon geluid aan.
      opgaveStand = true;
    }
  }
  return opgaveStand;
}

/** Op de server is er geen opslag; daar staat het geluid gewoon aan. */
export function opgavegeluidOpServer(): boolean {
  return true;
}

export function abonneerOpgavegeluid(herteken: () => void): () => void {
  opgaveLuisteraars.add(herteken);
  return () => {
    opgaveLuisteraars.delete(herteken);
  };
}

export function zetOpgavegeluid(aan: boolean): void {
  opgaveStand = aan;
  try {
    window.localStorage.setItem(SLEUTEL_OPGAVE, aan ? "aan" : "uit");
  } catch {
    // De voorkeur geldt dan alleen deze keer.
  }
  /* Zie `zetGeluid` hierboven: de voorkeur hoort bij het kind, niet bij dit apparaat. */
  void zetGeluidsvoorkeur("opgavegeluid", aan).catch(() => {});
  for (const f of opgaveLuisteraars) f();
}

// ---------------------------------------------------------------------------
// De stand van de server overnemen
// ---------------------------------------------------------------------------

/**
 * De voorkeuren zoals ze bij het kind in de database staan.
 *
 * De database is de baas. Wat hier binnenkomt overschrijft dus wat dit apparaat
 * zelf had onthouden — anders zou een tablet waar het geluid ooit uit is gezet
 * dat blijven volhouden nadat het kind het op de laptop weer aan zette.
 *
 * Wordt één keer aangeroepen door `Geluidsvoorkeur` in de schil van de
 * kindomgeving, met de waarden die de server heeft opgehaald.
 */
export function neemGeluidsvoorkeurOver(uitleg: boolean, opgave: boolean): void {
  if (stand !== uitleg) {
    stand = uitleg;
    if (!uitleg) stopLezen();
    try {
      window.localStorage.setItem(SLEUTEL, uitleg ? "aan" : "uit");
    } catch {
      /* Niet kunnen onthouden mag het geluid niet breken. */
    }
    for (const f of luisteraars) f();
  }

  if (opgaveStand !== opgave) {
    opgaveStand = opgave;
    try {
      window.localStorage.setItem(SLEUTEL_OPGAVE, opgave ? "aan" : "uit");
    } catch {
      /* Zie boven. */
    }
    for (const f of opgaveLuisteraars) f();
  }
}
