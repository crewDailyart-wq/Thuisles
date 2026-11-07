"use client";

import { createContext } from "react";

/** Alleen de aparte conceptpagina zet deze presentatiekeuze aan. */
export const GetekendeMuntenContext = createContext(false);
export const MUNTENBLAD = "/geld/munten-concept/munten-transparant.png";
/** Alleen het papier wordt getoond: buitenranden en gloed uit de bron vallen buiten de uitsnede. */
export const BRIEFUITSNEDE = {
  b5: { pad: "/geld/briefjes-concept/briefjes-5-10-20.png", x: 139, y: 103, b: 744, h: 377, bladB: 1024, bladH: 1536 },
  b10: { pad: "/geld/briefjes-concept/briefjes-5-10-20.png", x: 119, y: 570, b: 785, h: 389, bladB: 1024, bladH: 1536 },
  b20: { pad: "/geld/briefjes-concept/briefjes-5-10-20.png", x: 106, y: 1053, b: 813, h: 412, bladB: 1024, bladH: 1536 },
  b50: { pad: "/geld/briefjes-concept/briefjes-50-100.png", x: 68, y: 119, b: 950, h: 526, bladB: 1086, bladH: 1448 },
  b100: { pad: "/geld/briefjes-concept/briefjes-50-100.png", x: 65, y: 794, b: 954, h: 534, bladB: 1086, bladH: 1448 },
  b200: { pad: "/geld/briefjes-concept/briefjes-200-500.png", x: 56, y: 208, b: 912, h: 491, bladB: 1024, bladH: 1536 },
  b500: { pad: "/geld/briefjes-concept/briefjes-200-500.png", x: 57, y: 852, b: 910, h: 485, bladB: 1024, bladH: 1536 },
} as const;
/** Uitsneden uit het transparante blad, zonder de dubbele 50-centmunt. */
export const MUNTUITSNEDE = {
  m2: { x: 359, y: 139, b: 359, h: 365 },
  m1: { x: 726, y: 281, b: 295, h: 296 },
  c50: { x: 87, y: 418, b: 351, h: 357 },
  c20: { x: 435, y: 540, b: 322, h: 324 },
  c10: { x: 802, y: 605, b: 269, h: 268 },
  c5: { x: 1324, y: 319, b: 257, h: 260 },
  c2: { x: 1048, y: 447, b: 279, h: 283 },
  c1: { x: 1326, y: 605, b: 247, h: 250 },
} as const;
