# Beelden van Zappie

Alle bestanden hier worden gemaakt met `node scripts/maak-zappie.mjs`, uit de
ontwerpen van de eigenaar in `ontwerp/zappie/`. Pas die ontwerpen aan of zet er
een nieuw ontwerp neer, en draai het script opnieuw.

| Bestand | Bron | Stand |
| --- | --- | --- |
| `space-earth-background-{1672,1280,828}.{avif,webp}` | `ontwerp/zappie/ruimte-aarde.webp` | Klaar. Het origineel is 1672 × 941; de opdracht vraagt minstens 2560 × 1440. Een groter origineel maakt het op grote schermen scherper. |
| `ocean-world.{avif,webp}` | `ontwerp/zappie/wereld-oceaan.webp` | Ronde uitsnede, als bol bewerkt, doorzichtig eromheen. De ingebakken naam, voortgangsbalk en gele stippen vallen erbuiten. |
| `earth-world.{avif,webp}` | `ontwerp/zappie/wereld-aarde.webp` | Idem. |
| `universe-world.{avif,webp}` | `ontwerp/zappie/wereld-heelal.webp` | Idem. |
| `my-world-island.{avif,webp}` | `ontwerp/zappie/voorbeeld-startpagina.webp` (paneel rechtsonder) | **Tijdelijk.** Uit het voorbeeldplaatje gesneden, de titel weggepoetst en 2× vergroot. Wat zacht op een scherp beeldscherm. Moet nog los gemaakt worden. |

## Nog te maken (extern)

1. **Jouw wereld** (`my-world-island`): een los eiland met futuristische
   huisjes, bomen, een pad, water eromheen en lege bouwplekken. Liefst 1600 px
   breed, verhouding ongeveer 2:1, zonder tekst.
2. **Werelden als losse bollen, groter**: de huidige werelden zijn uitsneden
   van ongeveer 680 px. Losse beelden van minstens 1200 × 1200 px met een
   doorzichtige achtergrond en zonder tekst maken ze scherper, en dan blijft de
   hele wereld zichtbaar in plaats van een uitsnede.
3. **Ruimteachtergrond op 2560 × 1440** of groter.
4. *Optioneel:* een zeeschildpad en een paar koraaltjes voor onderaan de pagina.

**Zappie zelf** is geen beeld maar een SVG in code
(`src/components/zappie/Zappie.tsx`), met losse onderdelen die apart bewegen:
wielen, armen, ogen, antennes en de geluidsgolf. Dat was de wens ("bij
voorkeur animatievriendelijk met afzonderlijk bestuurbare onderdelen"). Komt er
later een 3D-render, dan moet die ook in losse lagen geleverd worden, anders
kan hij niet meer zwaaien of praten.
