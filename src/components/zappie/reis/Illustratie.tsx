import type { CSSProperties } from "react";

/** Alleen de vier door de eigenaar goedgekeurde illustraties; geen interface in de beelden. */
export const ILLUSTRATIES = {
  wereld: { bestand: "eigen-wereld", breedte: 1448, hoogte: 1086 },
  werkplaats: { bestand: "werkplaats", breedte: 1448, hoogte: 1086 },
  atelier: { bestand: "atelier", breedte: 1448, hoogte: 1086 },
  kust: { bestand: "kust", breedte: 1664, hoogte: 928 },
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
    <picture className={`zi-illustratie ${className}`} style={style}>
      <source type="image/avif" srcSet={`${BASIS}/${beeld.bestand}-720.avif 720w, ${BASIS}/${beeld.bestand}-1440.avif 1440w`} sizes={sizes} />
      <img src={`${BASIS}/${beeld.bestand}-1440.webp`} srcSet={`${BASIS}/${beeld.bestand}-720.webp 720w, ${BASIS}/${beeld.bestand}-1440.webp 1440w`} sizes={sizes} width={beeld.breedte} height={beeld.hoogte} alt={alt} loading={prioriteit ? "eager" : "lazy"} fetchPriority={prioriteit ? "high" : undefined} decoding="async" draggable={false} />
    </picture>
  );
}
