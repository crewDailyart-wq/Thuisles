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
import { Pictogram } from "@/components/kind/Pictogram";
import { Schil } from "@/components/zappie/Schil";
import { huidigKind } from "@/lib/auth/sessie";
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

export default async function ZappieLayout({ children }: LayoutProps<"/zappie">) {
  const kind = await huidigKind();
  return (
    <Schil
      speler={{
        id: kind?.id ?? null,
        naam: kind?.roepnaam ?? null,
        avatar: kind ? <Pictogram naam={kind.avatar} /> : undefined,
      }}
    >
      {children}
    </Schil>
  );
}
