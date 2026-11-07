# Controle herstel groep A (klok, tijd, dagen, geld) — 7 november 2026

Onafhankelijke controleur. Alles zelf gespeeld als Testkind op `/voorbeeld/les/<id>?naam=Testkind`
(schrijft niets naar de database). Per les schermfoto's vóór het antwoord, na een goed antwoord en
(om de 3 vragen) na een fout. Laptop 1440x900; telefoon 390x844. Lessen met keuzes 2 keer gespeeld waar nodig
om de plek van het goede antwoord te vergelijken. Niets aan de code veranderd.

Foto's (map F): `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/ctrlA/`
- `r1/<les>/` = laptop, ronde 1; `r2/<les>/` = laptop, ronde 2; `r3/<les>/` = laptop, overige kloklessen; `tel/<les>/` = telefoon.
- Naam: `sNN-a-voor.jpg` (vóór antwoord), `sNN-b-goed-1.jpg` / `sNN-c-goed-2.jpg` (1,4 s en 3,2 s na goed), `-fout-` = na fout.

## Algemene punten (gelden voor meerdere lessen)

**A1 — Klok te klein op telefoon (BOUWREGELS 1.24). AFGEKEURD.**
Op 390x844 is de vraagklok ongeveer 125 px breed, de cijfers ongeveer 9 px hoog. Bij klokkijken3-4 zijn de
3 antwoordklokken maar ongeveer 75 px, cijfers ongeveer 5 px: niet te lezen zonder inzoomen. Tussen de klok en de
zin van Bliepo staat op telefoon een groot leeg stuk (bijna de helft van het scherm). De klok kan daar veel groter.
Foto's: `F/tel/squla-klok-hoelaat-1/s01-a-voor.jpg`, `F/tel/squla-klok-klokkijken3-4/s01-a-voor.jpg`,
`F/tel/squla-klok-digitaal-2/` (zelfde beeld). Het is één vlak (`squla-klok-vlak.tsx`), dus één herstel helpt alle kloklessen.

**A2 — Dagnamen op de weektrein te klein op telefoon (BOUWREGELS 1.24). AFGEKEURD.**
Op laptop zijn ze nu goed te lezen. Op telefoon zijn de letters van de volle trein ongeveer 7 px
(`F/tel/squla-dagen-van-de-week/s02-a-voor.jpg`), en de losse antwoordwagons ongeveer 9 px
(`F/tel/squla-tijd-dagen-1/s01-a-voor.jpg`). Ook hier is de onderste helft van het speelvlak leeg.
Voorstel: op telefoon de antwoordwagons veel groter (er is ruimte), en de volle trein in 2 rijen of groter
in beeld. De helper schreef "breder kan niet"; op een staand scherm kan het wel hoger.

**A3 — Plek van het goede antwoord (BOUWREGELS 1.23). GOEDGEKEURD.**
Ronde 1 van klokkijken-2 had 12 van 14 keer het goede antwoord rechts, en hoelaat-2 3 keer in het midden. Daarom
2e keer gespeeld: klokkijken-2 toen R,R,L,L,R,L,R,R,L,L,R,L en hoelaat-2 rechts, midden, links, midden, links, rechts.
Een simulatie van de schudcode (`draai` in squla-klok.tsx) geeft een eerlijke verdeling. De eerste ronde was toeval.
Bij alle andere lessen wisselde de plek ook.

**A4 — Geen enkel plaatje verklapt het antwoord.** Nergens gezien dat een plaatje of beweging vóór het antwoord
het antwoord laat zien. Bus, oven, raket, lampje, deeg, trein en spaarpot bewegen pas na het antwoord.

## Per les

### KLOK

**squla-klok-hoelaat-1 — AFGEKEURD**
- Fout: bij "De bus komt bij de eerste halte" (naspeel "rijden") rijdt de bus na het goede antwoord tegen de klok aan
  en de neus van de bus verdwijnt onder de rand van de klok. Zo blijft hij staan, ook als de volgende vraag al in beeld is.
  Foto's: `F/r1/squla-klok-hoelaat-1/s06-b-goed-1.jpg`, `s06-c-goed-2.jpg`. De bus moet vóór de klok stoppen.
- A1 (klok op telefoon te klein).
- Klein (geen afkeur): de klok is bij de zon-vragen iets groter dan bij de bus-vragen (`s03-a-voor.jpg` vs `s04-a-voor.jpg`);
  het beeld verspringt dus nog een beetje.
- Goed: bus staat stil tijdens de vraag, rijdt pas na het antwoord weg (`s03-a-voor.jpg` → `s03-b-goed-1.jpg`);
  zon klein en zacht linksboven; plek van de goede knop wisselt; hint na fout klopt (`s01-c-fout-2.jpg`).

**squla-klok-hoelaat-2 — AFGEKEURD (klein)**
- Fout: "De taarten komen uit de oven": de taart springt uit de oven en blijft half óver de oven liggen, tegen de linkerrand
  van het scherm. Foto: `F/r2/squla-klok-hoelaat-2/s07-b-goed-1.jpg`. Laat de taart naast of vóór de oven landen, vrij van de rand.
- A1.
- Goed: "Kies de goede klok": klokken in vakken in het midden, groot getal erboven, plek wisselt (2 rondes,
  `F/r1/.../s06-a-voor.jpg`, `s09-a-voor.jpg`, `s12-a-voor.jpg` en `F/r2/...`). Bus en oven doen pas iets na het antwoord.

**squla-klok-hoelaat-3 — AFGEKEURD (alleen A1)**
- Verder goed: bus vertrekt pas na het antwoord, zon als zachte achtergrond (`F/r1/squla-klok-hoelaat-3/s01-a-voor.jpg`,
  `s06-b-goed-1.jpg`), dag/nacht-vraag werkt. Vraag 9 (bus of bakkerij) staat er nog: wacht op Sara.

**squla-klok-digitaal-1 — AFGEKEURD (alleen A1)**
- Goed: telefoon-keuze en laptop met grote klok ernaast (foto helper `public/overbodige-plaatjes-na/squla-klok-digitaal-1-na.jpg`;
  eigen foto's `F/r1/squla-klok-digitaal-1/s01-a-voor.jpg`, `s02-c-goed-2.jpg`). Telefoon met klokje als keuze is goed te herkennen.

**squla-klok-digitaal-2 — AFGEKEURD (alleen A1)**
- Goed: bakkerij en maan klein en zacht (`F/r1/squla-klok-digitaal-2/s01-a-voor.jpg`, `s03-a-voor.jpg`), klokken in vakken,
  plek wisselt (links, links, midden), bus groot boven de klokken, deeg rijst na het antwoord (klein effect, `s05-c-goed-2.jpg`).
- Opmerking (geen afkeur): "Het deeg is klaar" en daarna rijst het deeg pas; dat is net andersom. Sara kan kiezen.

**squla-klok-klokkijken3-4 — AFGEKEURD**
- Fout: bij de overgang naar de volgende vraag springt het vak "nu" meteen naar zijn nieuwe plek, terwijl de oude klok
  nog wegschuift. Even staan 2 klokken over elkaar en half buiten het vak. Foto: `F/r1/squla-klok-klokkijken3-4/s08-b-goed-1.jpg`.
- Het vak "nu" staat niet op een vaste plek: met een plaatje ernaast (raket, lamp) staat het rechts, zonder plaatje in het
  midden (`s08-a-voor.jpg` vs `s09-a-voor.jpg`). Dat is hetzelfde "verspringen" als eerder bij hoelaat-1. Liefst één vaste plek.
- A1: op telefoon zijn de antwoordklokken ongeveer 75 px (`F/tel/squla-klok-klokkijken3-4/s01-a-voor.jpg`).
- Goed: vraagklok groot in een eigen vak met "nu", antwoorden in vakken eronder, plek wisselt, lampje gaat pas na het
  antwoord uit (`s14-a-voor.jpg` → `s14-b-goed-1.jpg`), hint na fout klopt (`s16-c-fout-2.jpg`).
- Opmerking: "De taart is net klaar" en "De gieter staat klaar" noemen iets wat niet meer in beeld is (taart en gieter
  zijn weggehaald). Geen fout, wel even laten zien aan Sara.

**squla-klok-klokkijken1-1 — AFGEKEURD (alleen A1)**
- Goed: koppelen, rechts door elkaar en geen paar recht tegenover (foto helper `public/overbodige-plaatjes-na/squla-klok-klokkijken1-1-na.jpg`);
  "Op welke klok": klokken in vakken (`F/r1/squla-klok-klokkijken1-1/s01-a-voor.jpg`).

**squla-klok-klokkijken-2 — AFGEKEURD (alleen A1)**
- Goed: plek wisselt (zie A3), klokken in vakken (`F/r1/squla-klok-klokkijken-2/s01-a-voor.jpg`, `F/r2/squla-klok-klokkijken-2/`).

**squla-klok-klokkijken-3, klokkijken1-3, klokkijken2-3, klokkijken3-1, klokkijken2-2 — AFGEKEURD (alleen A1)**
- Alleen de plek was aangepast. Zelf gespeeld (`F/r3/<les>/`): klokken in vakken, plek wisselt
  (bijv. klokkijken3-1: rechts, rechts, rechts, links, links, links; klokkijken-3 bij de knoppen: 3e, 1e, 3e, 2e, 1e, 1e).
  Geen losse plaatjes, niets kapot (`F/r3/squla-klok-klokkijken2-3/s05-a-voor.jpg`, `F/r3/squla-klok-klokkijken3-1/s01-a-voor.jpg`).

### TIJD

**squla-tijd-dagen-1 — AFGEKEURD (alleen A2)**
- Goed: geen vraagteken meer; tijdens "Hoeveel dagen heeft het weekend?" staat alleen de locomotief
  (`F/tel/squla-tijd-dagen-1/s02-c-goed-2.jpg`), dagnamen op laptop groot genoeg (`F/r1/squla-tijd-dagen-1/s01-a-voor.jpg`),
  hint na fout klopt (`s01-c-fout-2.jpg`). Eindkaart met trein: foto helper.
- Klein (geen afkeur, oud gedrag): op telefoon valt de knop "2" bij de weekendvraag links net buiten beeld
  (`F/tel/squla-tijd-dagen-1/s02-c-goed-2.jpg`, de linkerrand van de knop ontbreekt).

**squla-tijd-dagen-2 — AFGEKEURD (alleen A2)**
- Goed: 4 wagons in een rij, plek van het goede antwoord wisselt (1e, 1e, 4e, 3e, 4e, 3e, 1e, 3e, 1e), hint na fout
  toont de trein met de lege plek (`F/r1/squla-tijd-dagen-2/s04-c-fout-2.jpg`).

**squla-tijd-dagen-3 — AFGEKEURD (alleen A2)**
- Goed: volgorde-sleepvraag werkt, kaarten door elkaar (`F/r1/squla-tijd-dagen-3/s01-a-voor.jpg`). Tent-vraag niet zelf bereikt
  binnen de tijd; foto helper (`public/overbodige-plaatjes-na/squla-tijd-dagen-3-na.jpg`) ziet er goed uit: tent dichtbij, niets over elkaar.

**squla-tijd-kalender-1 — AFGEKEURD**
- Fout: vraag "Vandaag is er gym ... Op welke kalender zie je dat?": de weekkalender (het goede antwoord) staat als een
  groot breed vak bovenaan, de 2 andere keuzes klein eronder. Het goede antwoord valt zo op, én het lijkt op een
  vraag-plaatje in plaats van een keuze. Dit is hetzelfde probleem dat bij vraag 1 is opgelost; hier niet.
  Foto: `F/r1/squla-tijd-kalender-1/s06-a-voor.jpg`. Graag: 3 even grote vakken naast elkaar, plek willekeurig.
- Goed: vraag 1 (3 even hoge vakken, `public/overbodige-plaatjes-na/squla-tijd-kalender-1-na.jpg`), gym = hoepel met bal,
  koppel-kalenders groter (`s14-a-voor.jpg`), rode vak en feesthoedje (`s10-a-voor.jpg`), Waar/Niet waar op telefoon
  (`F/tel/squla-tijd-kalender-1/s05-a-voor.jpg`).
- Opmerking: de mei-lijst bij koppelen heeft nog steeds kleine getallen (`s14-a-voor.jpg`). Voor het koppelen hoeft
  het kind ze niet te lezen; ik keur het niet af.

**squla-tijd-kalender-2 — GOEDGEKEURD**
- Lange antwoorden onder elkaar en even breed (`F/r1/squla-tijd-kalender-2/s03-a-voor.jpg`), "feest" duidelijk rood
  (`s11-a-voor.jpg`), sleepvraag dagkalender werkt (`s06-a-voor.jpg`), plek wisselt. Niets kapot.

**squla-tijd-tijden-1 — GOEDGEKEURD**
- Kampvuur klein en zacht (`F/r1/squla-tijd-tijden-1/s01-a-voor.jpg`); maan weg bij "laat in de avond" (`s09-a-voor.jpg`);
  avond-icoon even groot als ochtend (`s12-a-voor.jpg`); boeken zijn hier de keuzes zelf (`s03-a-voor.jpg`), dat is goed.

**squla-tijd-tijden-2 — GOEDGEKEURD**
- Bakkerij als zachte achtergrond (`F/r1/squla-tijd-tijden-2/s12-a-voor.jpg`), lange keuzes onder elkaar, plaatjes-keuzes in
  vakken (`s03-a-voor.jpg`), plek wisselt.

### DAGEN

**squla-dagen-van-de-week — AFGEKEURD (A2)**
- Op telefoon zijn de dagnamen op de volle trein ongeveer 7 px (`F/tel/squla-dagen-van-de-week/s02-a-voor.jpg`). Dat is precies
  wat Sara in 1.24 noemt. Op laptop is het nu net leesbaar (`F/r1/squla-dagen-van-de-week/s13-a-voor.jpg`).
- Goed: dagkaarten willekeurig, hint na fout klopt (`s04-c-fout-2.jpg`), sleepvraag werkt.

### GELD

**squla-geld-geld-1 — GOEDGEKEURD**
- Munten groter, 1 en 2 euro uit elkaar te houden, ook op telefoon (`F/tel/squla-geld-geld-1/s02-a-voor.jpg`).
  Paren: soms gekruist, soms recht tegenover (`F/r1/squla-geld-geld-1/s01-a-voor.jpg` gekruist, `s05-a-voor.jpg` recht);
  dat is de afgesproken 50/50 bij 2 paren. Meer paren per ronde: wacht op Sara.

**squla-geld-geld-2 — GOEDGEKEURD**
- Groepjes in vakken, 2 × 2 in het midden (`F/r1/squla-geld-geld-2/s01-a-voor.jpg`), hint na fout klopt (`s01-b-fout-1.jpg`).
  Koppelen: ronde 1 recht tegenover (`s05-a-voor.jpg`), ronde 2 gekruist (`s13-a-voor.jpg`); 2 paren, zelfde 50/50 als geld-1.

**squla-geld-geldmachine-1 — GOEDGEKEURD**
- 6 vierkante vakken in 2 rijen, munten groot, 1 en 2 euro duidelijk verschillend (`F/r1/squla-geld-geldmachine-1/s03-a-voor.jpg`,
  telefoon `F/tel/squla-geld-geldmachine-1/s09-a-voor.jpg`). "Waar zie je": plek wisselt (links, midden, links, links, midden).
- Opmerking: op telefoon is onder de vakken veel ruimte; de munten mogen daar nog groter.

**squla-geld-geldmachine-2 — GOEDGEKEURD**
- Groepjes in vakken, voorwerp met prijskaartje erboven (`F/r1/squla-geld-geldmachine-2/s04-a-voor.jpg`), hint na fout klopt
  (`s01-c-fout-2.jpg`).

**squla-geld-zakgeld-1 — GOEDGEKEURD**
- Bezem en gieter laten de 2 klussen zien (doen dus iets), geld in vakken (`F/r1/squla-geld-zakgeld-1/s01-a-voor.jpg`).
  Schelpen, doos, bordje en jas niet meer gezien. Ik kwam in de tijd maar tot vraag 2; latere vragen zijn niet zelf bekeken.

**squla-geld-zakgeld-2 — GOEDGEKEURD**
- Spaarpot: na het goede antwoord verdwijnt het goede groepje (het geld gaat de pot in) (`F/r1/squla-geld-zakgeld-2/s02-b-goed-1.jpg`);
  vóór het antwoord gebeurt er niets (`s01-a-voor.jpg`). Knopen weg. Bal en boek met prijskaartje (`s04-a-voor.jpg`, `s07-a-voor.jpg`).
- Opmerking (geen afkeur): in hetzelfde scherm zijn de munten niet even groot (bij 5 losse munten kleiner dan bij 2 munten,
  `s07-a-voor.jpg`). Liever overal dezelfde muntgrootte.

## Samenvatting

- **Goedgekeurd (9):** tijd-kalender-2, tijd-tijden-1, tijd-tijden-2, geld-geld-1, geld-geld-2, geld-geldmachine-1,
  geld-geldmachine-2, geld-zakgeld-1, geld-zakgeld-2.
- **Afgekeurd met een eigen fout (4):**
  - klok-hoelaat-1: bus rijdt tegen/onder de klok (`F/r1/squla-klok-hoelaat-1/s06-b-goed-1.jpg`).
  - klok-hoelaat-2: taart landt half over de oven, tegen de schermrand (`F/r2/squla-klok-hoelaat-2/s07-b-goed-1.jpg`).
  - klok-klokkijken3-4: bij de overgang 2 klokken over elkaar en half buiten het vak "nu"; vak "nu" verspringt (`F/r1/squla-klok-klokkijken3-4/s08-b-goed-1.jpg`).
  - tijd-kalender-1: weekkalender (goede antwoord) groot bovenaan, andere keuzes klein eronder (`F/r1/squla-tijd-kalender-1/s06-a-voor.jpg`).
- **Afgekeurd alleen op telefoon-grootte:**
  - A1 klok te klein op telefoon: alle kloklessen (één herstel in `squla-klok-vlak.tsx`).
  - A2 dagnamen weektrein te klein op telefoon: tijd-dagen-1, -2, -3 en dagen-van-de-week.
- **Plek van het goede antwoord (1.23):** in orde bij alle lessen (na 2e ronde gecontroleerd).
- **Verklappen (1.22):** nergens gezien.
- Wacht op Sara (geen afkeur): hoelaat-3 vraag 9 (bus/bakkerij), geld-1 meer paren, "taart"/"gieter" in zinnen zonder plaatje
  (klokkijken3-4), deeg "klaar" en daarna rijzen (digitaal-2).
