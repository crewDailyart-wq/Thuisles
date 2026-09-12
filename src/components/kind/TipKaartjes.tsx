/**
 * Losse tip-kaartjes in de rechterkolom.
 *
 * Bewust aanmoedigend en zonder druk: nooit een verwijt, nooit een aftellende
 * klok. De teksten staan hier vast; later kunnen ze meebewegen met wat het
 * kind aan het doen is.
 */

import { Icoon, type IcoonNaam } from "@/components/kind/Icoon";

type Tip = {
  id: string;
  icoon: IcoonNaam;
  kop: string;
  tekst: string;
  stijl: string;
  merkStijl: string;
};

const TIPS: Tip[] = [
  {
    id: "tip-tempo",
    icoon: "gloeilamp",
    kop: "Tip van Vos",
    tekst: "Tien minuten per dag helpt meer dan een uur op zaterdag.",
    stijl: "border-geel/40 bg-geel-zacht",
    merkStijl: "bg-geel/25 text-oranje-diep",
  },
  {
    id: "tip-fout",
    icoon: "maatje",
    kop: "Nog niet goed?",
    tekst: "Niet erg. Je krijgt altijd een hint en mag het nog een keer proberen.",
    stijl: "border-groen/30 bg-groen-zacht",
    merkStijl: "bg-groen/20 text-groen-diep",
  },
  {
    id: "tip-edelsteen",
    icoon: "edelsteen",
    kop: "Bijna een edelsteen",
    tekst: "Nog twee voltooide leerdoelen en je verdient er een.",
    stijl: "border-lucht/30 bg-lucht-zacht",
    merkStijl: "bg-lucht/20 text-lucht",
  },
];

export function TipKaartjes() {
  return (
    <div className="flex flex-col gap-3">
      {TIPS.map((tip) => (
        <article
          key={tip.id}
          className={`flex items-start gap-3 rounded-kaart border p-4 ${tip.stijl}`}
        >
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-full ${tip.merkStijl}`}
          >
            <Icoon naam={tip.icoon} className="size-5" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold leading-tight">{tip.kop}</h3>
            <p className="mt-0.5 text-xs font-semibold leading-snug text-inkt-zacht">
              {tip.tekst}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
