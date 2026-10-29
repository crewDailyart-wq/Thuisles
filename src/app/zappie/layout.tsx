/**
 * Zappie: de nieuwe kinderkant, eerste fase (oktober 2026).
 *
 * Opdracht van de eigenaar: een nieuwe startpagina voor groep 3 met Zappie de
 * robot, drie ontdekkingswerelden en een grote knop "Start oefenen". Het
 * voorbeeld staat in ontwerp/zappie/voorbeeld-startpagina.webp.
 *
 * Deze schermen staan los van de bestaande kinderkant onder /start: daar is
 * niets aan veranderd. De voortgang (punten en missies) staat voorlopig in de
 * browser, zie `lib/zappie/opslag.ts`.
 *
 * Het kind: als er op dit apparaat een kind gekozen is, staat zijn naam en
 * plaatje rechtsboven. Is er geen kind gekozen, dan zegt Zappie gewoon "Hoi!".
 */

import type { Metadata, Viewport } from "next";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { Pictogram } from "@/components/kind/Pictogram";
import { KnopTik } from "@/components/kind/KnopTik";
import { Schil } from "@/components/zappie/Schil";
import { StijlVariabelen } from "@/components/StijlVariabelen";
import { huidigKind } from "@/lib/auth/sessie";
import { haalLesgeluidjes } from "@/lib/lesgeluiden-ouder";
import { MERKNAAM } from "@/lib/merk";
import { NIET_INDEXEREN } from "@/lib/seo";
import "@/components/zappie/zappie.css";

export const metadata: Metadata = {
  title: MERKNAAM,
  robots: NIET_INDEXEREN,
};

export const viewport: Viewport = {
  themeColor: "#071b43",
};

/**
 * Het gekozen kind, of niemand.
 *
 * Zappie heeft de database alleen nodig voor de naam en het plaatje rechtsboven.
 * Is de database er niet (bijvoorbeeld in een preview op Vercel, waar het
 * SQLite-bestand niet kan staan), dan speelt Zappie gewoon zonder naam verder in
 * plaats van het hele scherm met een foutmelding te laten vallen.
 */
async function gekozenKind() {
  /*
    Eerst wachten op een echt bezoek. Anders zou Next deze schermen tijdens het
    bouwen als vaste pagina klaarzetten: daar is geen database, de fout hieronder
    wordt opgevangen, en dan stond er voorgoed geen naam meer.
  */
  await connection();
  try {
    return await huidigKind();
  } catch (fout) {
    /* Fouten waarmee Next zelf werkt (doorsturen, niet gevonden) gaan gewoon door. */
    unstable_rethrow(fout);
    console.warn("[zappie] geen kind op te halen, verder zonder naam:", fout);
    return null;
  }
}

export default async function ZappieLayout({ children }: LayoutProps<"/zappie">) {
  const kind = await gekozenKind();
  return (
    <Schil
      speler={{
        id: kind?.id ?? null,
        naam: kind?.roepnaam ?? null,
        avatar: kind ? <Pictogram naam={kind.avatar} /> : undefined,
      }}
    >
      {/* De gekozen stijl van de kinderkant (stijlkiezer, /admin/stijl). */}
      <StijlVariabelen />
      {/* Zacht tikje bij elke knop (29 okt 2026); uit als de ouder "Geluidjes in de lessen" uitzette. */}
      <KnopTik toegestaan={kind ? haalLesgeluidjes(kind.id) : true} />
      {children}
    </Schil>
  );
}
