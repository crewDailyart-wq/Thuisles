/**
 * Het wachtwoord voor de site online (Railway, oktober 2026).
 *
 * Er staan gegevens van een kind in de database, en echte inlog bestaat nog
 * niet (zie src/lib/auth/sessie.ts). Daarom staat er een slot voor de hele
 * site: de browser vraagt één keer om een gebruikersnaam en wachtwoord en
 * onthoudt die daarna.
 *
 * Het slot staat alleen aan als de omgevingsvariabele THUISLES_WACHTWOORD is
 * gezet, en dat gebeurt alleen op Railway. Op de laptop verandert er niets.
 * De gebruikersnaam is THUISLES_GEBRUIKER, of "thuisles" als die niet staat.
 *
 * De openbare site (homepagina, scholenkaart, werkbladen, niveautest) kan
 * buiten het slot worden gezet met THUISLES_OPENBAAR=ja. Zonder die variabele
 * blijft alles dicht, precies zoals het was: er gaat niets open voordat de
 * eigenaar dat beslist (13 oktober 2026: "niks gaat live totdat alles af is").
 * De kinder- en ouderpagina's blijven altijd achter het slot.
 *
 * Losse bestanden met een extensie (plaatjes, lettertypen, de Godot-lessen,
 * alles uit public/ en _next/static) gaan er wél langs. Next haalt een plaatje
 * dat het verkleint bij zichzelf op, zonder wachtwoord; met het slot erop kwam
 * het sleutelplaatje daardoor niet door. In die bestanden staan geen gegevens
 * van een kind: die zitten in de pagina's en de serveracties, en die blijven
 * achter het slot.
 */

import { NextResponse, type NextRequest } from "next/server";
import { MERKNAAM } from "@/lib/merk";

/** Vergelijkt zonder vroeg te stoppen, zodat de tijd niets verraadt. */
function gelijk(a: string, b: string): boolean {
  let verschil = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    verschil |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return verschil === 0;
}

/**
 * Wat open mag als THUISLES_OPENBAAR=ja staat. `/_next/image` hoort erbij:
 * daarmee verkleint Next de plaatjes op de homepagina, en dat adres heeft zelf
 * geen extensie.
 */
const OPENBARE_SITE = [
  /^\/$/,
  /^\/scholen(\/methode)?$/,
  /^\/werkbladen(\/.*)?$/,
  /^\/niveautest(\/.*)?$/,
  /^\/_next\/image$/,
];

export function proxy(request: NextRequest) {
  const wachtwoord = process.env.THUISLES_WACHTWOORD;
  if (!wachtwoord) return NextResponse.next();
  if (process.env.THUISLES_OPENBAAR === "ja" && OPENBARE_SITE.some((r) => r.test(request.nextUrl.pathname))) {
    return NextResponse.next();
  }
  const gebruiker = process.env.THUISLES_GEBRUIKER || "thuisles";

  const kop = request.headers.get("authorization") ?? "";
  if (kop.startsWith("Basic ")) {
    let tekst = "";
    try {
      tekst = atob(kop.slice(6));
    } catch {
      tekst = "";
    }
    const scheiding = tekst.indexOf(":");
    if (
      scheiding >= 0 &&
      gelijk(tekst.slice(0, scheiding), gebruiker) &&
      gelijk(tekst.slice(scheiding + 1), wachtwoord)
    ) {
      return NextResponse.next();
    }
  }

  return new NextResponse(`${MERKNAAM} is afgeschermd.`, {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${MERKNAAM}", charset="UTF-8"` },
  });
}

export const config = {
  matcher: [
    // Alles behalve paden die eindigen op een extensie, zoals /sleutel.png.
    "/((?!.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
