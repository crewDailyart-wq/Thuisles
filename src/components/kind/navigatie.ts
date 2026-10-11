/**
 * Het hoofdmenu van de kindomgeving: zijbalk, balk onderaan en het
 * startscherm halen het hier vandaan.
 */

import type { IcoonNaam } from "@/components/kind/Icoon";

type NavItem = {
  href: "/start" | "/oefenen" | "/voortgang" | "/wereld" | "/maatje" | "/profiel";
  label: string;
  icoon: IcoonNaam;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/start", label: "Start", icoon: "start" },
  { href: "/oefenen", label: "Oefenen", icoon: "oefenen" },
  { href: "/voortgang", label: "Voortgang", icoon: "voortgang" },
  { href: "/wereld", label: "Wereld", icoon: "wereld" },
  { href: "/maatje", label: "Maatje", icoon: "maatje" },
  { href: "/profiel", label: "Profiel", icoon: "profiel" },
];
