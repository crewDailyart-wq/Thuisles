import Image from "next/image";
import { beginzinnen } from "@/lib/lessen/beginzinnen";
import s from "./GeldStartbeeld.module.css";

/** Alleen de introductieafbeelding; het draaiboek blijft de les aansturen. */
export function geldStartbeeld(lesId: string) {
  if (lesId !== "squla-geld-geldmachine-1") return undefined;
  const opening = beginzinnen(lesId);
  if (!opening) return undefined;
  return {
    tekst: `${opening.zin1} ${opening.zin2}`,
    inhoud: <div className={s.vlak}>
      <Image
        className={s.afbeelding}
        src="/geld/start-concept/portemonnee-transparant.png"
        alt="Een open portemonnee met een briefje van tien euro en daarnaast een munt van twee euro en een munt van één euro."
        width={1680}
        height={960}
        priority
        unoptimized
      />
    </div>,
  };
}
