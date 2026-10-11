# Klokkijken (groep 3): vragen en keuzes

Lessen: `klok-urenwijzer` (De urenwijzer), `klok-hele-uren-zetten` (Hele uren zetten),
`klok-halve-uren` (Halve uren), `klok-kwart-over` (Kwart over).
Bestanden: `src/components/les/lessen/klokkijken.tsx`, `src/components/les/vlakken/klok-wijzerklok.tsx` (+ `.module.css`).

## Hoe ik "half" heb aangepakt (Nederlands tegenover Engels)

- In het Engels heet 3:30 "half past three": je noemt het uur dat **voorbij** is.
  In het Nederlands heet het "half 4": je noemt het uur dat **eraan komt**.
  Een kind dat Engelse uitleg één-op-één vertaald krijgt, leert dus precies het verkeerde uur.
- Synthesis bouwt "half" op met: "welk uur is de urenwijzer al voorbij?" Die vraag heb ik gehouden
  (hij leert de draairichting), maar er direct achteraan gezet: "nu is hij **op weg naar** de 5".
  Daarna de naam: "Het is een half uur na 5 uur. De urenwijzer is op weg naar de 6. Hij is al
  halverwege. Daarom heet deze tijd *half 6*. Half op weg naar 6 uur." En de regel in één zin:
  "Bij half noemen we altijd het uur dat eraan komt."
- De afleiders zijn omgezet naar de Nederlandse valkuilen: bij 5:30 zijn de foute keuzes "half 5"
  (het Engelse denken: het uur dat voorbij is) en "6 uur". Synthesis' afleider "half past 6" zou in
  het Nederlands juist goed zijn ("half 6"), dus die kon niet blijven.
- De foutzoeker (Synthesis: Sams klok, uurwijzer vergeten te verzetten) heb ik vervangen door de
  typisch Nederlandse fout: Vos wil half 6 laten zien, maar zet de urenwijzer tussen de 6 en de 7
  (hij denkt "6 en een half"). Uitleg: "Half 6 komt vóór 6 uur. Hij hoort tussen de 5 en de 6."
- Bij zelf zetten (half 9) krijgt het kind dat de urenwijzer na de 9 zet een eigen uitleg:
  "Half 9 komt vóór 9 uur. De urenwijzer is nog op weg naar de 9."
- "Kwart over" is in beide talen gelijk; daar alleen de bekende fout "kwart over 3" (de 3 van de
  minutenwijzer als uur lezen) opgevangen.
- Tijden in de zinnen staan als "3 uur", "half 4", "kwart over 3" (cijfer, geen woord), zoals de opdracht vroeg.
  De stem leest "half 4" als "half vier".

## Vragen voor de eigenaar

1. **Kleur van de wijzers.** ONTWERPREGELS zegt "alle klokken zien er hetzelfde uit: donkere wijzers".
   Deze lessen volgen Synthesis: urenwijzer oranje, minutenwijzer paars (de uitleg zegt steeds "de
   korte oranje wijzer", "de lange paarse wijzer"). De vorm volgt wel de Thuisles-regel (grote wijzer tot
   bij de streepjes, kleine korter en dikker, één rondje in het midden). Mag dat zo, of liever donker?
2. **Woorden in kleur.** Bij Synthesis staat "urenwijzer" in de tekst oranje en "minutenwijzer" paars.
   Het lesscherm kan alleen getallen kleuren (met tegelkleuren) en *nadruk*. Ik heb de woorden gewoon wit
   gelaten. Wil je dat het lesscherm ook een woord in een eigen kleur kan zetten?
3. **Getallen niet gekleurd.** In deze lessen staan getallen níet tussen {accolades}: anders wordt de 3
   geel en de 7 blauw, en dat heeft met de klok niets te maken. Akkoord?
4. **Namen van de wijzers.** Ik gebruik "urenwijzer" en "minutenwijzer", met "de korte" en "de lange"
   erbij. De bestaande Thuisles-klok zegt "kleine wijzer" en "grote wijzer". Welke wil je overal?
5. **Vos in plaats van Sam.** De foutzoeker gebruikt "de klok van Vos" (rode stippelrand, rood bijschrift),
   zonder figuurtje. Een tekening van Vos erbij?
6. **Controleren onder de klok.** Bij Synthesis staan het handje (hulp) en het blauwe vinkje links onder
   de opdracht. Het lesscherm heeft daar geen los vinkje, dus staan ze in het vlak, onder de klok.
7. **"13" als afleider.** Bij "welk getal komt na de 12?" heb ik de 13 gehouden (zoals Synthesis: op een
   getallenlijn klopt dat, op de klok niet). Bij de slotvraag "hoe laat is het over een uur?" heb ik
   "13 uur" vervangen door "2 uur", zoals je in ronde 1 noteerde.
8. **"Weet je dit al?"** Synthesis vraagt dat aan het begin en doet de uitleg daarna toch. Ik doe hetzelfde
   (bij "Ja": "We lopen het toch even samen door."). Liever de uitleg overslaan bij "Ja"?
9. **Kwart over in groep 3.** In de aantekeningen staat Quarter Past als "groep 3 en 4" (kwartier en
   zetten groep 4). Ik heb de hele les gebouwd. Moet hij bij groep 4?
10. **Eindoordeel.** Net als Synthesis telt alleen het toetsdeel aan het eind mee voor "Alles goed" op de
    kaart; fouten in het uitlegdeel niet. Bij Hele uren zetten telt hulp (het handje) ook als niet foutloos.

## Kleine keuzes die ik zelf heb gemaakt

- Synthesis' "wil je nog doorgaan?" halverwege Set the Hour is weggelaten (ronde 1: bewust niet overnemen).
- Bij "ga naar de 2" (De urenwijzer) werkt alleen het getal met het oranje ringetje, zoals bij Synthesis;
  bij Hele uren zetten mag elk getal, en kijkt het vinkje na.
- Na drie keer verkeerd zetten of inkleuren zet de klok zichzelf goed en legt uit, zodat de les nooit vastloopt.
- Slepen met de minutenwijzer valt bij loslaten op het dichtstbijzijnde getal (hele 5 minuten).
  Bij "draai één keer rond" kan de wijzer niet verder dan één rondje (en niet terug voorbij het begin).
- Bij zelf zetten met beide wijzers blijft het uur staan als je de minutenwijzer verzet (de urenwijzer schuift
  binnen zijn uur mee). Bij de proefjes ("draai één keer rond") draait de klok echt door, met het uur mee.

## Tweede bouwronde (10 oktober 2026)

Nieuwe lessen (in `LESSEN_KLOKKIJKEN`, volgorde van Synthesis): `klok-instaptoets`, `klok-digitale-klok`,
de vier bestaande, `klok-tellen-in-vijven`, `klok-eindtoets`, `klok-versla-de-wekker`, `klok-minuten-later`,
`klok-samen-hoe-lang`. Nieuwe vlakken: `klok-wekker.tsx` (digitale wekker), `klok-wekkerrace.tsx` (het spel).
De wijzerklok kreeg er opties bij (minuutgetallen, paarse streepjes, tijdboog met vlaggetje, digitale tijd,
getallenlijn vanaf de 12); alles wat er was werkt nog hetzelfde.

### Nalopen: wat er is bijgekomen
- De urenwijzer: "de secondewijzer" als keuze bij het benoemen van de wijzers, "3 nul" als keuze bij
  "hoe noemen we deze tijd", de laatste toetsklok draait zichtbaar naar 2 uur.
- Hele uren zetten: elke extra fout in het toetsdeel geeft nog een klok (9 uur, 6 uur), zoals Synthesis.
- Halve uren: alle keuzes van Synthesis (ook "de 6" en "tussen de 6 en de 7"); in het toetsdeel bij een
  fout eerst begrip + een tweede kans zonder de foute keuze (ronde 1), en na een fout nog een klok (half 10).
- Kwart over: tweede kans in het toetsdeel ("de 3 hoort bij de minutenwijzer"; "veel kinderen kiezen de 6").
- Kaart aan het eind: bij één fout ook "Dat was vast pech." en "Volgende keer lukt het helemaal." (Synthesis).

### Vragen
11. **Twee lessen of één?** Five Minutes Later en Ten Minutes Later hebben samen maar een paar groep 3-opdrachten
    (wijzer 5 of 10 minuten verder, doortellen met vijven binnen het uur). Bij Ten Minutes Later is dat alleen de
    snack (1:15 → 1:25). Ik heb er één les van gemaakt: `klok-minuten-later` "5 en 10 minuten later". Liever twee?
12. **Tijden als 2:35 in groep 3.** Synthesis zegt "2:35"; in ronde 1 noteerde je dat 5-minuten-tijden eigenlijk
    groep 4/5 zijn. De groep 3-labels in ronde 2 gaan over het *doortellen*, dus de tijden staan digitaal ("2:40"),
    niet als "10 over half 3". Akkoord?
13. **Start to Finish: één opdracht.** Het groep 3-deel is alleen "twee duren optellen" (25 + 20). Ik heb die drie keer
    gedaan (25 + 20, 15 + 10, 30 + 20), met een tijdboog op de klok die per activiteit een kleur heeft en het aantal
    minuten erbij. Bij een fout tellen we langs de boog in vijven. Synthesis liet bij deze vraag (voor zover genoteerd)
    geen boog zien. Goed zo?
14. **Tellen in vijven: de streepjes.** "Elk streepje is één minuut" en "de 1 betekent 5" staan als groep 4, maar
    zonder die uitleg kan het tellen in vijven rond de klok niet. Ik heb ze als opstap gehouden; het lezen, schrijven
    en zetten van tijden per 5 minuten en de fout van Sam (groep 4) zijn weggelaten.
15. **De digitale klok (groep 3-deel).** Alleen "wat duurt een minuut" en "hele uren digitaal". De minutenknop, de
    balk 0–60 en "wat komt er na 7:59" zijn groep 4 en staan er niet in. Ik begin daarom op 7:00 en leg kort uit dat
    links het uur (oranje) en rechts de minuten (paars) staan; die zin had Synthesis in het groep 4-stuk.
    Als afleiders bij "hoe laat is het?" gebruik ik "800", "8 nul nul" en "80 uur" (Synthesis: "nine hundred",
    "ninety o'clock"). De vier wekkers zijn eigen tekeningen.
16. **Versla de wekker: record.** Het eigen record ("Jouw beste", top 3) staat in de browser van het apparaat
    (localStorage, per naam van het kind), niet in de database. Geen ranglijst met andere kinderen. De knoppen in het
    spel kijken meteen na (geen vinkje), zoals Synthesis; dat wijkt af van "goed of fout pas na Controleer".
17. **Instaptoets/eindtoets zonder "Lessen"-knop.** Synthesis vraagt "korte check of meteen naar de lessen?". Het
    lesscherm kan niet naar een andere les springen, dus de toets begint altijd. De eindtoets stopt bij de tweede fout
    (zoals Synthesis) en noemt welke les(sen) je eerst nog oefent; de kaart verschijnt dan toch (om te stoppen).
    De instaptoets stopt niet en geeft na een fout één extra vraag van dezelfde soort.
18. **Antwoord-afleiders "1 zes" en "6 uur" bij half.** Synthesis: "1 six" en "6 thirty" (de wijzers één voor één
    lezen, de minutenwijzer als uur). Mijn Nederlandse versie: "1 zes" en "6 uur". Goed zo?
19. **Vos in plaats van Sam** in de verhaaltjes (koekjes, snack, lezen/tekenen), net als bij de klok van Vos.
