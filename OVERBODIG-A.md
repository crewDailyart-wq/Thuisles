# Overbodige plaatjes, groep A (klok, tijd, dagen, geld, meten)

Gekeken naar BOUWREGELS 1.22: een plaatje moet iets DOEN in de opdracht.
Alleen gelezen, niets aangepast. Regelnummers zijn van de lesbestanden in
`src/components/les/lessen/`.

Keuzes: (1) verhaal naspelen in Phaser met tweens, (2) kleine zachte
sfeer-achtergrond, (3) weghalen.

Bekeken: 40 lessen (klok 18, tijd 7, dagen 1, geld 6, meten 8). Overbodig: 12.
Het plaatje op het beginscherm telt niet apart mee: bij elke les met een
voorbeeld wordt dat vervangen door de eerste opgave voordat Bliepo praat.

---

## KLOK (squla-klok.tsx)

De hulpfunctie `leesKlok` (regel 372) zet een voorwerp (`ding`) naast de klok.
De klok is de opgave; het voorwerp wordt niet gebruikt voor het antwoord.

### squla-klok-hoelaat-1 (regels 1066-1077, 12 vragen)
- Plaatje: bezorgbus, zon, maan, bakkerij naast de klok.
- Waarom overbodig: het verhaaltje ("de bus vertrekt") staat in de zin, het
  plaatje doet niets. De tijd lees je alleen van de klok.
- Verklapt het antwoord nu al: nee. (Zon/maan geven wel een dagdeel, maar dat
  bepaalt het uur niet.)
- Advies: (1). Beginsituatie tijdens de vraag (bus staat bij de bakkerij, zon
  laag, maan nog niet zichtbaar). Pas na het antwoord: bus rijdt met een
  kleine stuiter naar rechts weg met een stofwolkje, zon schuift omhoog, maan
  komt zacht in beeld. Bij een tweede fout hetzelfde, als uitleg.

### squla-klok-hoelaat-2 (regels 1094-1104, 7 vragen)
- Plaatje: oven, bezorgbus, zon naast de klok.
- Waarom overbodig: zelfde als hoelaat-1.
- Verklapt: nee.
- Advies: (1). Oven: dichte deur tijdens de vraag, na het antwoord gaat de
  deur open met een warm lichtje. Bus en zon als bij hoelaat-1.

### squla-klok-hoelaat-3 (regels 1122-1125, 1143, 1145, 1163-1165, 9 vragen)
- Plaatje: bezorgbus, zon, bakkerij, maan, oven naast de klok.
- Waarom overbodig: zelfde. (De 2 vragen waar je op zon/maan of bus/bakkerij
  tikt, regels 1130 en 1150, blijven: daar is het plaatje het antwoord.)
- Verklapt: nee.
- Advies: (1), zoals hoelaat-1 en -2. Is dat te veel werk: (3).

### squla-klok-digitaal-2 (regels 981, 982, 987, 1002, 1003, 1009, 1020; 7 vragen)
- Plaatje: bakkerij (981), maan (982), deegkom (987), bezorgbus (1002, 1020),
  oven (1003), taart (1009) naast een klok of klokkeuze.
- Waarom overbodig: verhaalsfeer; het antwoord komt van de klok. De maan bij
  4 uur ("nog nacht") is alleen extra uitleg.
- Verklapt: nee. (De maan zegt "het is donker", niet welke klok.)
- Advies: (1) voor bezorgbus (1002, 1020: bus staat er al / rijdt na het
  antwoord weg met de broodjes), oven (1003: deur gaat na het antwoord open) en
  taart (1009: kaarsje komt er na het antwoord op). Voor bakkerij (981), maan
  (982) en deegkom (987): (2) zachte kleine achtergrond, of (3) weghalen.

### squla-klok-klokkijken3-4 (halfuur4, regels 1570-1580, 11 vragen)
- Plaatje: schoolbord, bed, oven, bus, raketje, taart, kampvuur, voetbal,
  lampje, treintje, gieter naast de klok (via `tijdRekenen`, regel 468).
- Waarom overbodig: elk voorwerp wijst alleen de context aan ("de oven is
  aan"). De klok en de 3 antwoordklokken doen het rekenen.
- Verklapt: nee.
- Advies: (3) weghalen voor de meeste; 11 verschillende voorwerpen is veel
  werk voor een tween. Wel (1) mogelijk bij `bus` (4 uur +1 uur: bus staat bij
  de halte, rijdt na het antwoord weg) en `raketje` (staat klaar, vertrekt na
  het antwoord). De rest (2) als kleine sfeer, of (3).

Niet overbodig in klok: digitaal-1 (telefoon, laptop, zandloper, lampje zijn
keuzes of dragen de klok), alle klokkijken- en halfuur-lessen 1-3 (alleen
klokken), vragen waarin je op het voorwerp tikt.

---

## TIJD (squla-tijd.tsx)

### squla-tijd-dagen-3 (regels 642, 657, 672, 690, 704, 719; 6 verhaalvragen)
- Plaatje: zwemmen, schaar, tent, huis, taart, bed, links naast de
  "vandaag"-wagon met gele pijl.
- Waarom overbodig: de dag vind je op de weektrein. Het plaatje laat alleen
  zien waar het verhaal over gaat.
- Verklapt: nee.
- Advies: (1). Tijdens de vraag: zwembad dicht (bordje), kapperszaak dicht,
  tent nog ingepakt, huis nog kaal, taart nog als deeg, bed opgemaakt. Na het
  antwoord: zwembad gaat open, deur van kapper wipt open, tent klapt uit, huis
  krijgt verf, taart krijgt een kaarsje, kussen wipt. Alleen na goed antwoord of
  tweede fout, nooit ervoor.
  (Twijfel: bij "taart" en "huis" zijn kleine animaties gemakkelijk.)

### squla-tijd-tijden-1 (regels 1602, 1640, 1656, 1672, 1751, 1788, 1806)
- Plaatje: kampvuur (1602, 1806), rood/blauw/groen boek (1640, 1656, 1672),
  nacht-plaatje (1751), zwemmen (1788).
- Waarom overbodig: de vragen gaan over dagen, tegenstellingen of woorden;
  het plaatje is alleen het verhaal. Bij de boeken is het plaatje het
  onderwerp van de zin ("het rode boek was lang"), maar het kiezen van het
  antwoord (lang / kort / straks) gebeurt niet met het plaatje: twijfelgeval.
- Verklapt: nacht-plaatje (1751) ja gedeeltelijk: antwoord "laat" en het
  plaatje toont de nacht. Overig nee.
- Advies: kampvuur (1602, 1806) en zwemmen (1788): (1) kampvuur dooft stil
  tijdens "gisteren was het vuur", zwembad gaat open na het antwoord; of (3).
  Boeken (1640, 1656, 1672): (2) of (3). Nacht (1751): (3) weghalen, want het
  verklapt het antwoord.
- Ook de startscène "kampvuur" (regel 1832) is hetzelfde plaatje.

### squla-tijd-tijden-2 (regels 2005, 2068)
- Plaatje: bakkerij (2005, rondleiding), brood (2068, week kamperen).
- Waarom overbodig: de antwoorden zijn woorden; het plaatje doet niets.
- Verklapt: nee.
- Advies: 2005: (1) rondleiding: de bakkerij-deur gaat pas open na het
  antwoord, of (2). 2068: (3) weghalen.

Niet overbodig in tijd: dagen-1, dagen-2 (alleen weektrein), kalender-1 en -2
(kalender, week, dagritme zijn het werkmateriaal), de kaartjes met antwoorden in
tijden-1 en -2.
Niet meegeteld, wel controleren: in dagen-1 staat bij "Hoeveel dagen heeft een
week?" een tekening "vraag" (regel 407) die na het goede antwoord verdwijnt
voor de trein. Ik denk dat het een vraagteken is; niet bekeken wat het toont.

---

## DAGEN (squla-dagen.tsx)

Geen overbodige plaatjes. Alles staat op de weektrein en wordt gebruikt
(wagons tikken, tellen, slepen, de gele pijl).

---

## GELD (squla-geld.tsx)

### squla-geld-zakgeld-1 (regels 943, 969, 983, 1004)
- Plaatje: doos (943, schuur opruimen), bord (969, afwas), schoen (983),
  jas (1004) naast of boven de som met geld.
- Waarom overbodig: het is het klusje uit het verhaaltje, de som gaat over het
  geld. (Bij de bord-vraag staat het bord links naast het plusgeld.)
- Verklapt: nee.
- Advies: (1) voor doos, schoen, jas: tijdens de vraag staat het klusje
  (doos op de vloer, schoenen verspreid, jas op de grond), na het antwoord
  wordt het klaar: doos staat op de plank, schoenen stappen op een rij, jas
  hangt aan haakje. Bord (969): (3) weghalen, of ook (1).
  Niet overbodig: bezem+gieter, emmer+bed (regels 887-905): elke klus telt als 1
  keer evenveel geld, ze worden gebruikt in de som. Skateboard met prijs: de
  prijs is de opgave.

### squla-geld-zakgeld-2 (regels 1052, 1119)
- Plaatje: spaarpot (1052, "20 euro gespaard"), marktkraam (1119, "nog 11
  euro").
- Waarom overbodig: spaarpot/kraam staan er alleen naast; de keuzekaartjes met
  geld zijn het antwoord.
- Verklapt: nee.
- Advies: (2) kleine zachte spaarpot of kraam in de hoek, of (3).
  (Marktkraam op regel 1059 blijft: daar gaat de vraag "waar of niet waar" juist
  over de kraam.)

Niet overbodig in geld: geldmachine-1 (munt/briefje is de opgave),
geldmachine-2 (speelgoed met prijskaartje: het kaartje is het te betalen
bedrag), geld-1, geld-2 (alleen geld).

---

## METEN (squla-meten.tsx)

Alle pizza's, ijsjes, schalen, flesjes, weegschalen, tegels en schilderijen
worden vergeleken of geteld en blijven. Overbodig zijn alleen de plaatjes bij
woordvragen:

### squla-meten-hoeveelheden-1 (regel 1165)
- Plaatje: volle mand (`MAND(2)`) bij "Welk woord zegt het omgekeerde van
  leeg?".
- Waarom overbodig: het antwoord is een woord (vol); de mand doet niets.
- Verklapt: JA. De mand is vol afgebeeld en het antwoord is "vol".
- Advies: (1). Tijdens de vraag: de lege mand. Pas na het antwoord vullen de
  etenswaren de mand met korte springende tweens, en dan staat "vol" erbij.
  Alternatief (3).

### squla-meten-hoeveelheden-2 (regels 1239, 1249, 1259, 1347, 1370)
- Plaatje: volle mand (1239, "zwaar"), rugtas (1249 en 1370), rugtas met
  speelgoed ernaast (1259), rugtas met appels ernaast (1347).
- Waarom overbodig: de vragen zijn woordvragen (zwaar, licht, lichter,
  zwaarder). De tas of mand maakt het antwoord niet duidelijker.
- Verklapt: 1259 ja gedeeltelijk (speelgoed ligt al buiten de tas, antwoord
  "lichter"); 1347 ja gedeeltelijk (appels zitten al bij de tas, antwoord
  "zwaarder"); 1239 gedeeltelijk (mand zit vol); 1249 en 1370 nee.
- Advies: (1) voor 1259 en 1347: dit is echt een verhaal. Tijdens de vraag
  alleen de tas en de mand (en het speelgoed/de appels nog op de plank). Pas na
  het antwoord: speelgoed hupt uit de tas, tas wipt licht omhoog; appels rollen
  de tas in, tas zakt zwaar naar beneden met een stofwolkje.
  1239 (mand): (1) de mand is eerst leeg, na het antwoord hupt er eten in.
  1249 en 1370: (3) weghalen of (2) kleine tas als sfeer.

---

## Samenvatting

| Les | Wat | Advies | Verklapt nu |
|---|---|---|---|
| klok-hoelaat-1 | bus/zon/maan/bakkerij naast klok | (1) | nee |
| klok-hoelaat-2 | oven/bus/zon naast klok | (1) | nee |
| klok-hoelaat-3 | bus/zon/maan/bakkerij/oven naast klok | (1) of (3) | nee |
| klok-digitaal-2 | bakkerij, maan, deegkom, bus, oven, taart | (1) voor bus/oven/taart, (2)/(3) rest | nee |
| klok-klokkijken3-4 | 11 voorwerpen naast klok | (3), bus en raketje (1) | nee |
| tijd-dagen-3 | zwemmen, schaar, tent, huis, taart, bed | (1) | nee |
| tijd-tijden-1 | kampvuur, boeken, nacht, zwemmen | (1) kampvuur/zwemmen, (2)/(3) boeken, (3) nacht | nacht ja |
| tijd-tijden-2 | bakkerij, brood | (1) of (2) / (3) | nee |
| geld-zakgeld-1 | doos, bord, schoen, jas | (1), bord (3) | nee |
| geld-zakgeld-2 | spaarpot, marktkraam | (2) of (3) | nee |
| meten-hoeveelheden-1 | volle mand | (1) | ja |
| meten-hoeveelheden-2 | mand, rugtas, speelgoed, appels | (1) bij 1239, 1259, 1347; (3) bij 1249, 1370 | deels |
