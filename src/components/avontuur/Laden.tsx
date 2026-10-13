/**
 * Wat een kind ziet terwijl een scherm in de avontuurstijl laadt: meteen de
 * sterrenhemel en het maatje, in plaats van een scherm dat blijft staan.
 *
 * Gebruikt door de `loading.tsx`-bestanden van de avontuurschermen. Daardoor
 * reageert een tik op een tegel direct, ook op een trage verbinding.
 */

import { HoofdMascotte } from "@/components/avontuur/HoofdMascotte";
import { Sterrenscherm } from "@/components/avontuur/Sterrenscherm";

export function Laden() {
  return (
    <Sterrenscherm>
      <div className="flex flex-1 flex-col items-center justify-center gap-4" role="status">
        <HoofdMascotte className="w-28 motion-safe:animate-bounce drop-shadow-[0_10px_16px_rgba(8,14,70,0.45)]" />
        <p className="av-hand text-3xl text-white/90">Even laden…</p>
      </div>
    </Sterrenscherm>
  );
}
