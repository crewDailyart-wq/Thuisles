import "server-only";

/**
 * Netjes zijn tegen schoolwebsites.
 *
 * Drie regels, en ze zijn niet vrijblijvend:
 *
 *   1. robots.txt wordt gelezen en gevolgd. Zegt een site "niet doen", dan
 *      slaan we die site over. Geen uitzonderingen.
 *   2. Hooguit één verzoek per paar seconden per website. Een schoolsite draait
 *      vaak op een kleine server; die mag geen last van ons hebben.
 *   3. Alles heeft een korte tijdslimiet en een herkenbare naam in de
 *      user-agent, zodat een beheerder kan zien wie er langskwam.
 *
 * LEGAL REVIEW REQUIRED — automatisch lezen van schoolwebsites. Zie de notitie
 * in `src/lib/zoeker/README-notitie.md`.
 */

/** Zo herkent een schoolbeheerder ons in zijn logboek. */
const NAAMKAARTJE =
  "ThuislesMethodeZoeker/1.0 (+https://thuisles.nl/zoeker; leest alleen openbare schoolgidsen)";

/** Minimale tijd tussen twee verzoeken naar dezelfde website. */
const RUST_MS = 3000;

/** Hoe lang we hooguit op een antwoord wachten. */
const GEDULD_MS = 20_000;

/** Groter dan dit halen we niet op; een schoolgids is zelden zo groot. */
const MAX_BYTES = 12 * 1024 * 1024;

type Robotsregels = {
  /** Paden die niet bezocht mogen worden. Leeg = alles mag. */
  verboden: string[];
  /** Zegt de site expliciet dat alles verboden is? */
  allesDicht: boolean;
};

const robotsPerHost = new Map<string, Robotsregels>();
const laatsteBezoek = new Map<string, number>();

function host(adres: string): string {
  try {
    return new URL(adres).host.toLowerCase();
  } catch {
    return "";
  }
}

async function wacht(ms: number) {
  await new Promise((klaar) => setTimeout(klaar, ms));
}

/** Houdt het tempo per website in de gaten. */
async function rustUit(gastheer: string) {
  const vorige = laatsteBezoek.get(gastheer) ?? 0;
  const wachten = RUST_MS - (Date.now() - vorige);
  if (wachten > 0) await wacht(wachten);
  laatsteBezoek.set(gastheer, Date.now());
}

// ---------------------------------------------------------------------------
// robots.txt
// ---------------------------------------------------------------------------

/**
 * Leest robots.txt en houdt de regels voor `User-agent: *` aan.
 *
 * Bewust eenvoudig: alleen Disallow-regels, met een eenvoudige padvergelijking.
 * Bij twijfel gaan we niet: kunnen we robots.txt niet lezen door iets anders
 * dan "bestaat niet", dan slaan we de site over.
 */
async function haalRobots(gastheer: string, protocol: string): Promise<Robotsregels> {
  const bekend = robotsPerHost.get(gastheer);
  if (bekend) return bekend;

  let regels: Robotsregels = { verboden: [], allesDicht: false };

  try {
    await rustUit(gastheer);
    const antwoord = await fetch(`${protocol}//${gastheer}/robots.txt`, {
      headers: { "user-agent": NAAMKAARTJE },
      signal: AbortSignal.timeout(GEDULD_MS),
      redirect: "follow",
    });

    if (antwoord.ok) {
      regels = leesRobots(await antwoord.text());
    } else if (antwoord.status >= 500) {
      // De server heeft het moeilijk; dan laten we hem met rust.
      regels = { verboden: [], allesDicht: true };
    }
    // 404 of 403: geen robots.txt. Dan geldt: alles mag.
  } catch {
    // Niet te bereiken: niet doorgaan. Bij twijfel niet.
    regels = { verboden: [], allesDicht: true };
  }

  robotsPerHost.set(gastheer, regels);
  return regels;
}

/** Ontleedt robots.txt. Alleen het blok voor `User-agent: *` telt voor ons. */
export function leesRobots(tekst: string): Robotsregels {
  const verboden: string[] = [];
  let inOnsBlok = false;
  let iets = false;

  for (const regel of tekst.split(/\r?\n/)) {
    const schoon = regel.split("#")[0].trim();
    if (!schoon) continue;

    const [sleutelRuw, ...rest] = schoon.split(":");
    const sleutel = sleutelRuw.trim().toLowerCase();
    const waarde = rest.join(":").trim();

    if (sleutel === "user-agent") {
      inOnsBlok = waarde === "*";
      continue;
    }
    if (!inOnsBlok) continue;

    if (sleutel === "disallow") {
      iets = true;
      if (waarde) verboden.push(waarde);
    }
    if (sleutel === "allow" && waarde) iets = true;
  }

  return { verboden, allesDicht: iets && verboden.includes("/") };
}

function magPad(regels: Robotsregels, pad: string): boolean {
  if (regels.allesDicht) return false;
  return !regels.verboden.some((verbod) => pad.startsWith(verbod));
}

// ---------------------------------------------------------------------------
// Ophalen
// ---------------------------------------------------------------------------

export type Opgehaald = {
  ok: true;
  url: string;
  soort: "html" | "pdf";
  inhoud: Uint8Array;
};

export type Mislukt = { ok: false; reden: string };

/**
 * Haalt één pagina of PDF op, mits dat mag en het tempo het toelaat.
 *
 * Geeft nooit een foutmelding die de rest blokkeert: wat er misgaat komt terug
 * als `{ ok: false, reden }` en wordt stil gelogd.
 */
export async function haalOp(adres: string): Promise<Opgehaald | Mislukt> {
  let url: URL;
  try {
    url = new URL(adres);
  } catch {
    return { ok: false, reden: "ongeldig adres" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reden: "geen webadres" };
  }

  const gastheer = url.host.toLowerCase();
  const regels = await haalRobots(gastheer, url.protocol);
  if (!magPad(regels, url.pathname)) {
    return { ok: false, reden: "robots.txt staat dit niet toe" };
  }

  try {
    await rustUit(gastheer);
    const antwoord = await fetch(url.toString(), {
      headers: { "user-agent": NAAMKAARTJE, accept: "text/html,application/pdf,*/*" },
      signal: AbortSignal.timeout(GEDULD_MS),
      redirect: "follow",
    });

    if (!antwoord.ok) return { ok: false, reden: `code ${antwoord.status}` };

    const type = (antwoord.headers.get("content-type") ?? "").toLowerCase();
    const lengte = Number(antwoord.headers.get("content-length") ?? 0);
    if (lengte > MAX_BYTES) return { ok: false, reden: "te groot" };

    const buffer = new Uint8Array(await antwoord.arrayBuffer());
    if (buffer.byteLength > MAX_BYTES) return { ok: false, reden: "te groot" };

    const soort: "html" | "pdf" =
      type.includes("pdf") || url.pathname.toLowerCase().endsWith(".pdf")
        ? "pdf"
        : "html";

    return { ok: true, url: antwoord.url || url.toString(), soort, inhoud: buffer };
  } catch (fout) {
    const reden =
      fout instanceof Error && fout.name === "TimeoutError"
        ? "te traag"
        : "niet te bereiken";
    return { ok: false, reden };
  }
}

/** Voor de tests: de onthouden robots-regels en tempo-gegevens wissen. */
export function vergeetWebsites(): void {
  robotsPerHost.clear();
  laatsteBezoek.clear();
}

export { host, NAAMKAARTJE, RUST_MS };
