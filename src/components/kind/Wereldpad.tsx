/**
 * Het wereldpad onderaan het startscherm.
 *
 * Cirkels met een pictogram, verbonden door stippellijnen. Precies één gebied
 * is het actieve gebied en krijgt een gele gloed: het eerste ontgrendelde
 * gebied dat nog niet af is. Gebieden die af zijn krijgen een groen vinkje,
 * de rest een hangslotje.
 *
 * Dit is nadrukkelijk alleen een visuele laag. De gamification-mechaniek
 * (wat ontgrendelt wat, wat munten en edelstenen doen) is nog niet
 * vastgesteld, dus hier wordt geen enkele regel beloofd.
 */

import { Icoon } from "@/components/kind/Icoon";
import { Pictogram } from "@/components/kind/Pictogram";
import type { WereldGebied } from "@/lib/types";

type Toestand = "voltooid" | "actief" | "open" | "op_slot";

function bepaalToestanden(gebieden: WereldGebied[]): Map<string, Toestand> {
  const toestanden = new Map<string, Toestand>();
  let actiefToegekend = false;

  for (const gebied of gebieden) {
    if (!gebied.ontgrendeld) {
      toestanden.set(gebied.id, "op_slot");
      continue;
    }
    if (gebied.voortgangProcent >= 100) {
      toestanden.set(gebied.id, "voltooid");
      continue;
    }
    // Het eerste ontgrendelde gebied dat nog niet af is, is het actieve.
    toestanden.set(gebied.id, actiefToegekend ? "open" : "actief");
    actiefToegekend = true;
  }

  return toestanden;
}

const CIRKEL: Record<Toestand, string> = {
  voltooid: "border-groen bg-groen-zacht",
  actief: "border-geel bg-kaart shadow-gloed",
  open: "border-white bg-kaart",
  op_slot: "border-white/70 bg-rand/60",
};

const BIJSCHRIFT: Record<Toestand, string> = {
  voltooid: "text-groen-diep",
  actief: "text-oranje-diep",
  open: "text-inkt-zacht",
  op_slot: "text-inkt-zacht",
};

export function Wereldpad({ gebieden }: { gebieden: WereldGebied[] }) {
  const toestanden = bepaalToestanden(gebieden);

  return (
    <section aria-labelledby="kop-wereld">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div className="w-fit max-w-full rounded-kaart border border-white/70 bg-kaart px-4 py-2.5 shadow-zacht">
          <h2 id="kop-wereld" className="text-lg font-extrabold">
            Jouw wereld
          </h2>
          <p className="text-sm font-semibold text-inkt-zacht">
            Elk gebied dat je opent, blijft van jou.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-groot border border-rand bg-gradient-to-b from-lucht-zacht via-kaart to-kaart p-6 shadow-zacht">
        <ol className="relative flex w-max items-start gap-6 sm:gap-10">
          {/* De stippellijn die de gebieden met elkaar verbindt. */}
          <span
            aria-hidden="true"
            className="absolute left-10 right-10 top-10 border-t-[3px] border-dashed border-huisstijl/25"
          />

          {gebieden.map((gebied) => {
            const toestand = toestanden.get(gebied.id) ?? "op_slot";

            return (
              <li
                key={gebied.id}
                className="relative flex w-24 flex-col items-center gap-2 text-center sm:w-28"
              >
                <span
                  className={`relative grid size-20 place-items-center rounded-full border-4 ${CIRKEL[toestand]}`}
                >
                  {toestand === "op_slot" ? (
                    <Icoon naam="slot" className="size-7 text-inkt-zacht" />
                  ) : (
                    <Pictogram naam={gebied.icoon} className="size-11" />
                  )}

                  {toestand === "voltooid" && (
                    <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border-[3px] border-kaart bg-groen text-white">
                      <Icoon naam="vinkje" className="size-3.5" />
                    </span>
                  )}
                  {toestand === "actief" && (
                    <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border-[3px] border-kaart bg-geel text-nacht">
                      <Icoon naam="ster" className="size-3.5" />
                    </span>
                  )}
                </span>

                <span className="text-xs font-extrabold leading-tight">
                  {gebied.naam}
                </span>

                <span className={`text-[0.7rem] font-bold ${BIJSCHRIFT[toestand]}`}>
                  {toestand === "op_slot"
                    ? "Nog gesloten"
                    : toestand === "voltooid"
                      ? "Helemaal af"
                      : `${gebied.voortgangProcent}% ontdekt`}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
