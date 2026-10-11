# Vragen: Optellen tot 10 (Synthesis "Add within 10")

Bestand: `src/components/les/lessen/optellen-tot-10.tsx`. Vlakken: `vlakken/optellen-tegelvlak.tsx`, `vlakken/optellen-stippen.tsx`.

1. **Volgorde in het overzicht (alle lessen).** In `lessen/index.ts` staat `optellenOnder10` vóór `...LESSEN_OPTELLEN_TOT_10`. Daardoor komt de instaptoets ná "Optellen onder de 10". Bij Synthesis staat de Assessment vooraan. Gekozen: mijn lijst staat in de volgorde van Synthesis; `index.ts` heb ik niet aangeraakt. Moet de instaptoets naar voren?

2. **Instaptoets: stoppen na twee fouten?** Synthesis stopt de toets bij de tweede fout op dezelfde vraag en stuurt het kind naar de les die erbij hoort. Gekozen: zo nagebouwd. De les noemt de naam van die les ("In de les "Dubbelen" leren we dit samen."), er komt geen kaart en daarna staat er "Nog een keer". Bij de vragen over de 10 (6 + 7, en waar of niet waar) stopt de toets nooit: na twee fouten zegt de les kort het antwoord. Klopt dat zo?

3. **Toetsen: "Kun je dit al?"** Synthesis vraagt eerst "Ben je hier al goed in? Ja/Nee" en daarna "Toets of lessen?". Gekozen: alleen de eerste vraag. Bij Nee gaat de toets gewoon door ("We kijken gewoon wat je al weet"). De keuze toets of lessen heb ik weggelaten, omdat bij ons de ouder beslist. Goed zo?

4. **Sommen over de 10 in groep 3** (instaptoets/eindtoets: 6 + 7, 7 + 8, 4 + 9 = 12, 3 + 8 = 11; "Klopt de som?": 5 + 6 = 11; "Het ontbrekende getal": 4 + ? = 11). In de aantekeningen staat "twijfel groep 3/4". Gekozen: overgenomen zoals bij Synthesis. Moeten ze eruit?

5. **Typen in de som.** Synthesis laat het kind in het vakje van de som typen. Op het tegelvlak typt het kind in het invulvak links (`l.getal()`). Het vakje in de som licht op en vult zich daarna met het getal in zijn kleur. Reden: het vlak ligt in Lesscherm over de som heen. Dan kun je op een tablet niet in `l.somVak()` tikken, en komt er geen toetsenbord. Daarom tekent het vlak zijn eigen som. Is dat goed, of moet Lesscherm het vlak onder de som leggen (of `pointer-events` op het vlak uitzetten), zodat `l.somVak()` ook met een vlak werkt?

6. **Splitsen: bediening van de stippen.** Synthesis gebruikt lang indrukken (alles los), dubbeltikken (één stip eraf) en een vak trekken (alles samen). Gekozen, volgens INSPIRATIE ("open breken met één tik"):
   - aan het begin breekt één tik de groep helemaal open;
   - daarna laat één tik er één stip af springen;
   - slepen voegt groepjes samen;
   - de knoppen "Alles los" en "Alles samen" vervangen lang indrukken en het vak trekken.
   Akkoord?

7. **Splitsen: "Kies er drie" / "Kies er twee".** `l.kies` kan maar één keuze tegelijk. Gekozen: het kind kiest de goede sommen één voor één. Elke keuze komt met een vinkje of kruisje in het lijstje linksboven. Is dat goed, of moet de gids meerdere keuzes tegelijk kunnen?

8. **Splitsen: uitleg bij een fout.** Synthesis zegt alleen "dat klopt niet helemaal" en gaat door. Gekozen (zoals INSPIRATIE vraagt): de les rekent de gekozen som voor ("… is samen 8. We hebben 7 stippen."), en laat het kind het met de stippen nagaan.

9. **Drie getallen: een tweede kans.** Synthesis geeft bij de snelle sommen geen tweede kans. Gekozen (INSPIRATIE: bewust niet overnemen): één tweede kans; daarna laat de les een oplossing zien met de tegels in de vorm. Een 0 telt niet als getal ("Elk getal moet minstens 1 zijn"). Akkoord?

10. **Klopt de som: woorden.** Ik gebruik "waar" en "niet waar", zoals in de aantekeningen bij ronde 2 staat. In ronde 1 stond als idee: "klopt" en "klopt niet". Welke wil je?

11. **Een tegel neerleggen.** Synthesis laat het kind de plek in het rooster kiezen. Op het tegelvlak kiest de les waar de tegel komt (bovenop de 10, in de vorm, of rechts naast het totaal). Het kind sleept de tegel naar het vak, of tikt hem aan en tikt dan in het vak. Dat is eenvoudiger en voorkomt dat de les vastloopt.

12. **Kaart aan het eind van Splitsen.** Synthesis liet geen eindkaart zien. Gekozen: wel een kaart (drie groepjes stippen), net als bij de andere lessen.

## Tweede ronde (10 oktober 2026, nalopen)

13. **Toetsen: "Toets of eerste les?" nu wél** (vervangt het antwoord bij vraag 3). Na "Ja" vraagt de toets nu, zoals Synthesis: "Wil je in een korte toets laten zien wat je kunt? Of begin je liever bij de eerste les?" Kiest het kind "Eerste les", dan noemt de les "Optellen onder de 10" en stopt de toets zonder kaart. Let op: het lesscherm telt een les die eindigt als "gespeeld", ook zonder kaart (net als bij het stoppen na twee fouten). Moet dat anders, dan is er iets in `Lesscherm.tsx` nodig (een manier om te stoppen zonder af te ronden).
14. **Het handje bij "Klopt de som?" (2 + 3 + 4 = 8).** Synthesis heeft een handje voor hulp; dan licht op waar de tegel moet en worden de andere tegels dof. Nagebouwd als knop "Hulp" met een handje, links op de plek van de bediening (in het tegelvlak zelf, omdat de gids geen hulpknop heeft). Alleen bij die stap, zoals in de aantekeningen. Goed zo?
15. **Kleur van de tegel noemen** in de toetsen ("Goed gekozen, de gele tegel."). De 4 heet "lichtgroen" (Synthesis: lime), de 9 en de 10 allebei "roze". Akkoord met die woorden?
