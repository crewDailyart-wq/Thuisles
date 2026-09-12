/**
 * De avatars die een ouder voor een kindprofiel kan kiezen.
 *
 * Bewust een korte, vaste lijst uit de bestaande Thuisles-pictogrammen: een
 * dier en vier plekken uit de wereldkaart. Geen foto's, geen gezichten, geen
 * upload — een avatar is een plaatje, geen persoonsgegeven.
 */

import type { PictogramNaam } from "@/lib/types";

export const AVATARS: { naam: PictogramNaam; label: string }[] = [
  { naam: "vos", label: "Vos" },
  { naam: "dorp", label: "Dorp" },
  { naam: "bos", label: "Bos" },
  { naam: "meer", label: "Meer" },
  { naam: "berg", label: "Berg" },
  { naam: "kust", label: "Kust" },
];

export const STANDAARD_AVATAR: PictogramNaam = "vos";

export function isAvatar(waarde: string): waarde is PictogramNaam {
  return AVATARS.some((a) => a.naam === waarde);
}
