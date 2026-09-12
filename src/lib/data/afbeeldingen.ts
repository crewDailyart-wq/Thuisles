import "server-only";

/**
 * Afbeeldingen bij vragen en antwoordopties.
 *
 * Bestanden staan in `public/vragen` en worden aangehaald op bestandsnaam,
 * net als bij de afbeelding van een vraag zelf. Er is bewust geen uploadknop:
 * dat is een aparte beslissing (opslag, formaten, rechten) die nog niet is
 * genomen.
 *
 * Wat dit bestand bewaakt:
 *   - een naam mag alleen letters, cijfers, punt, streepje en liggend streepje
 *     bevatten. Zo kan een ingetypte naam nooit buiten de map wijzen;
 *   - er wordt gecontroleerd of het bestand er echt is. Bestaat het niet, dan
 *     valt het scherm terug op tekst in plaats van een gebroken plaatje te
 *     tonen aan een kind;
 *   - bij een upload wordt niet alleen op de extensie afgegaan, maar ook in
 *     het bestand zelf gekeken. Een .png die eigenlijk iets anders is, komt er
 *     niet in.
 */

import fs from "node:fs";
import path from "node:path";
import {
  MAX_BYTES,
  MAX_TEKST,
  TOEGESTAAN,
  extensieVan,
  leesbareGrootte,
  veiligeNaam,
} from "@/lib/afbeeldingregels";

const MAP = path.join(process.cwd(), "public", "vragen");
const VEILIGE_NAAM = /^[A-Za-z0-9._-]+$/;

/** Alle beschikbare bestanden, alfabetisch. Voor de keuzelijst in het beheer. */
export function lijstAfbeeldingen(): string[] {
  try {
    return fs
      .readdirSync(MAP)
      .filter((n) => path.extname(n).toLowerCase() in TOEGESTAAN)
      .sort();
  } catch {
    return [];
  }
}

export function bestaatAfbeelding(naam: string | null | undefined): boolean {
  if (!naam || !VEILIGE_NAAM.test(naam)) return false;
  return fs.existsSync(path.join(MAP, naam));
}

/** Het webadres van een afbeelding, of null als hij er niet is. */
export function afbeeldingUrl(naam: string | null | undefined): string | null {
  return bestaatAfbeelding(naam) ? `/vragen/${naam}` : null;
}


// ---------------------------------------------------------------------------
// Uploaden
// ---------------------------------------------------------------------------

/** Herkent het echte type aan de eerste bytes van het bestand. */
function echtType(bytes: Uint8Array, tekst: () => string): string | null {
  const begint = (...b: number[]) => b.every((v, i) => bytes[i] === v);

  if (begint(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (begint(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (
    begint(0x52, 0x49, 0x46, 0x46) &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  if (/<svg[\s>]/i.test(tekst().slice(0, 4000))) return "image/svg+xml";
  return null;
}

/**
 * Een SVG is tekst en kan dus code bevatten. Zo'n bestand wordt geweigerd:
 * niet omdat het waarschijnlijk is, maar omdat het niet nodig is voor een
 * plaatje bij een som.
 */
function svgIsVeilig(tekst: string): boolean {
  return !/<script|<foreignobject|javascript:|\son\w+\s*=/i.test(tekst);
}

/** Zoekt een naam die nog vrij is: naam.png, naam-2.png, naam-3.png ... */
function vrijeNaam(gewenst: string): string {
  if (!fs.existsSync(path.join(MAP, gewenst))) return gewenst;

  const ext = extensieVan(gewenst);
  const kaal = gewenst.slice(0, -ext.length);
  for (let n = 2; n < 500; n++) {
    const kandidaat = `${kaal}-${n}${ext}`;
    if (!fs.existsSync(path.join(MAP, kandidaat))) return kandidaat;
  }
  return `${kaal}-${Date.now()}${ext}`;
}

export type UploadUitslag =
  | { ok: true; naam: string; hernoemd: boolean }
  | { ok: false; fout: string };

export async function bewaarUpload(bestand: File): Promise<UploadUitslag> {
  const origineel = bestand.name || "afbeelding";
  const ext = extensieVan(origineel);

  if (!ext || !(ext in TOEGESTAAN)) {
    return {
      ok: false,
      fout: `"${origineel}" is geen png-, jpg-, svg- of webp-bestand.`,
    };
  }
  if (bestand.size === 0) {
    return { ok: false, fout: `"${origineel}" is leeg.` };
  }
  if (bestand.size > MAX_BYTES) {
    return {
      ok: false,
      fout: `"${origineel}" is ${leesbareGrootte(bestand.size)}. Het maximum is ${MAX_TEKST}.`,
    };
  }

  const bytes = new Uint8Array(await bestand.arrayBuffer());
  const alsTekst = () => new TextDecoder().decode(bytes);
  const gevonden = echtType(bytes, alsTekst);

  if (!gevonden) {
    return {
      ok: false,
      fout: `"${origineel}" lijkt geen afbeelding te zijn. Sla het opnieuw op als png, jpg, svg of webp.`,
    };
  }
  if (gevonden !== TOEGESTAAN[ext]) {
    return {
      ok: false,
      fout: `"${origineel}" heeft de extensie ${ext}, maar is eigenlijk een ander soort bestand.`,
    };
  }
  if (gevonden === "image/svg+xml" && !svgIsVeilig(alsTekst())) {
    return {
      ok: false,
      fout: `"${origineel}" bevat scripts. Sla het op als een gewone tekening, zonder code.`,
    };
  }

  const gewenst = veiligeNaam(origineel);
  const naam = vrijeNaam(gewenst);

  fs.mkdirSync(MAP, { recursive: true });
  fs.writeFileSync(path.join(MAP, naam), bytes);

  return { ok: true, naam, hernoemd: naam !== origineel };
}

// ---------------------------------------------------------------------------
// Overzicht en opruimen
// ---------------------------------------------------------------------------

export type AfbeeldingRegel = {
  naam: string;
  bytes: number;
  grootte: string;
  gewijzigd: string;
};

export function lijstMetDetails(): AfbeeldingRegel[] {
  return lijstAfbeeldingen().map((naam) => {
    const info = fs.statSync(path.join(MAP, naam));
    return {
      naam,
      bytes: info.size,
      grootte: leesbareGrootte(info.size),
      gewijzigd: info.mtime.toISOString(),
    };
  });
}

export function verwijderAfbeelding(naam: string): boolean {
  if (!bestaatAfbeelding(naam)) return false;
  fs.unlinkSync(path.join(MAP, naam));
  return true;
}
