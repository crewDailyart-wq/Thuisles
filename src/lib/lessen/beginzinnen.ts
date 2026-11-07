import zinnen from "./beginzinnen.json";
import { cijfersInTekst } from "./cijfertaal";

/** Dezelfde twee zinnen voor de les en het beheeroverzicht. */
export function beginzinnen(lesId?: string): { zin1: string; zin2: string } | undefined {
  if (!lesId || !Object.hasOwn(zinnen, lesId)) return undefined;
  const zin = zinnen[lesId as keyof typeof zinnen];
  return { zin1: cijfersInTekst(zin.zin1), zin2: cijfersInTekst(zin.zin2) };
}
