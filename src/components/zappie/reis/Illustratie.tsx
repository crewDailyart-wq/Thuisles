import type { CSSProperties } from "react";

/** Vier door de eigenaar goedgekeurde beelden. Alle bediening blijft echte HTML. */
export const ILLUSTRATIES = {
  wereld: { bestand: "eigen-wereld", breedte: 1448, hoogte: 1086 },
  werkplaats: { bestand: "werkplaats", breedte: 1448, hoogte: 1086 },
  atelier: { bestand: "atelier", breedte: 1448, hoogte: 1086 },
  kust: { bestand: "kust", breedte: 1672, hoogte: 941 },
} as const;
export type IllustratieNaam = keyof typeof ILLUSTRATIES;
const BASIS = "/assets/zappie/illustraties";

export function Illustratie({ naam, alt = "", className = "", sizes = "100vw", prioriteit = false, style }: {
  naam: IllustratieNaam;
  alt?: string;
  className?: string;
  sizes?: string;
  prioriteit?: boolean;
  style?: CSSProperties;
}) {
  const beeld = ILLUSTRATIES[naam];
  return (
    <picture className={`zi-illustratie ${className}`} style={style} data-illustratie={naam}>
      <source type="image/avif" srcSet={`${BASIS}/${beeld.bestand}-720.avif 720w, ${BASIS}/${beeld.bestand}-1440.avif 1440w`} sizes={sizes} />
      <img src={`${BASIS}/${beeld.bestand}-1440.webp`} srcSet={`${BASIS}/${beeld.bestand}-720.webp 720w, ${BASIS}/${beeld.bestand}-1440.webp 1440w`} sizes={sizes} width={beeld.breedte} height={beeld.hoogte} alt={alt} loading={prioriteit ? "eager" : "lazy"} fetchPriority={prioriteit ? "high" : undefined} decoding="async" draggable={false} />
    </picture>
  );
}
