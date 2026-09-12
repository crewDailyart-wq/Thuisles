/**
 * Seed-data voor de bouwfase.
 *
 * Alle inhoud hieronder is eigen, origineel Thuisles-materiaal. Er is niets
 * overgenomen uit bestaande lesmethodes. Methodenamen worden uitsluitend als
 * metadata gebruikt (afstemmingslaag), nooit als bron van de content.
 *
 * Zodra de Supabase-database staat, verhuist deze data naar Postgres en
 * verandert alleen `queries.ts`. De schermen blijven ongewijzigd.
 */

import type { WereldGebied } from "@/lib/types";

/*
  Kinderen, ouders, school en methode staan hier NIET meer.

  Sinds stap 1 is een kind een echt profiel onder een echt ouderaccount, in de
  database. Voorbeeldkinderen zouden nu aan niemand hangen en zouden in het
  ouderdashboard van een echte ouder terecht kunnen komen. School en methode
  volgen in stap 2 en beginnen daar op "nog niet bekend" — de harde regel is
  dat we een methode nooit raden of vast invullen.
*/

/*
  ---------------------------------------------------------------------------
  Hier stonden vakken, domeinen, subdomeinen en leerdoelen
  ---------------------------------------------------------------------------
  Die lijsten zijn verwijderd. Ze werden bij een lege database automatisch in
  de database geschreven, en dat is precies wat er niet meer mag gebeuren:
  content ontstaat uitsluitend doordat de beheerder hem zelf aanmaakt, via het
  formulier in de beheeromgeving of via een upload die zij zelf start.

  Wat hieronder overblijft is `wereldGebieden`: dat is geen lesinhoud maar de
  vormgeving van de wereldkaart op het startscherm (namen van gebieden en hun
  volgorde). Er hangen geen vragen, leerdoelen of onderwerpen aan.
*/

export const wereldGebieden: WereldGebied[] = [
  { id: "geb-1", naam: "Getallendorp", icoon: "dorp", volgorde: 1, ontgrendeld: true, voortgangProcent: 100 },
  { id: "geb-2", naam: "Tafelbos", icoon: "bos", volgorde: 2, ontgrendeld: true, voortgangProcent: 60 },
  { id: "geb-3", naam: "Deelmeer", icoon: "meer", volgorde: 3, ontgrendeld: true, voortgangProcent: 15 },
  { id: "geb-4", naam: "Breukberg", icoon: "berg", volgorde: 4, ontgrendeld: false, voortgangProcent: 0 },
  { id: "geb-5", naam: "Kommakust", icoon: "kust", volgorde: 5, ontgrendeld: false, voortgangProcent: 0 },
];
