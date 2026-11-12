# LESRECEPT — zo bouw je een gouden les

> ## ⭐ UITGANGSPUNT (Sara, 9 november 2026, zesde ronde; BOUWREGELS 15.10)
> **Het skelet van elke les komt van Synthesis; het karakter en de foutaanpak zijn van Bliepo.**
> - **Van Synthesis (skelet):** het verloop, het tempo, het hulphandje, het oplichten, de bonusvraag, alles in eigen woorden.
> - **Van Bliepo (karakter en foutaanpak):** het rode en groene scherm, reageren op de denkfout met de fouttabel, nooit stoppen en nooit naar het menu, de naam van het kind (hooguit 2 keer per les), robotzinnen over zijn scherm.
>
> **Elke les heeft twee lagen.**
> - **Laag 1** is voor alle onderwerpen gelijk. Die staat in dit bestand en in BLIEPO-KARAKTER.md.
> - **Laag 2** is per onderwerp anders. Die komt uit het eigen Synthesis-draaiboek van dat onderwerp: het verloop, de hulp in beeld, het tempo en de denkfouten. **Neem het verloop van het ene onderwerp nooit over voor een ander.**
>
> ## ⭐ TWEE POGINGEN (Sara, 9 november 2026; BOUWREGELS 15.11) — vervangt de 3 pogingen van de vierde ronde
> Bij alle vragen en opdrachten zijn er **2 pogingen**. **1e fout:** Bliepo reageert op de denkfout met een hint uit de fouttabel en het kind mag nog 1 keer. **2e fout:** Bliepo legt het uit en doet het samen met het kind voor; daarna gaat de les verder. Overal hieronder waar "3e poging" of "3e fout" staat, is dat **vervangen** door deze regel (de oude tekst blijft ter herinnering staan). In de voortgang staat per vraag: **goed in één keer**, **goed na een fout** of **samen gedaan**; alleen "goed in één keer" telt mee voor beheersing.
>
> ## ⭐ Wat nog meer besloten is (9 november 2026, ronde 14 en 15; BOUWREGELS 15.12 t/m 15.16)
> - Uitlegvragen na Nee, vragen tussendoor en de bonusvraag mogen, mits binnen hetzelfde leerdoel en dezelfde Squla-getallen. Na een fout altijd een nieuwe kans, ook bij kijkvragen.
> - Naam hooguit 2 keer per les. Bij opdrachten komt de aanmoediging samen met het hulphandje; bij keuzevragen zegt Bliepo niets als het kind nadenkt (zoals Synthesis).
> - "Volgende keer gaat het nog beter" alleen als het kind de helft of meer van de vragen niet in één keer goed had.
> - Een spiegelbeeld-fout (bijvoorbeeld 10 kiezen bij 2) is een eigen denkfout in de fouttabel (`spiegelbeeld`).
> - **Per onderwerp één gouden les.** Zoek eerst grondig bij Synthesis; pas als het draaiboek klaar is bouwen we. Is er geen passende Synthesis-les, dan bouwen we niets, maken we geen eigen invulling en melden we het aan Sara. De overige lessen van een onderwerp bouwen we pas om als de gouden les is goedgekeurd.

> ## ⭐ GELEERD BIJ DE GOUDEN LES TELLEN (kind-test en keuring, 9 november 2026; BOUWREGELS 15.25) — geldt voor elke gouden les
> - **Alles wat Bliepo vóór een blauwe pijl zegt, is 1 uiting** (de zinnen samengevoegd). Anders breekt een tik op de pijl alleen de lopende zin af en begint de volgende nog even. *(Sinds 10 november 2026 stopt een tik de hele stem meteen in lessen met `pijlZoalsSynthesis`; samenvoegen hoeft dan niet meer, maar mag.)*
> - **Lof en reactie niet allebei met "Ja"**; een robotreactie hooguit 1 keer per les; hetzelfde foute antwoord 2 keer = niet 2 keer dezelfde zin ("Je koos weer 11."); "weer" alleen als Bliepo de 1e keer echt zei wat er mis was (BLIEPO-KARAKTER.md §2).
> - **Verklapcontrole per script:** noemt Bliepo bij een fout geen richting (omdat er dan maar 1 keuze over zou blijven), dan mag de hint ook geen richting geven ("sla er geen over", "1 keer", "maar 1", "te veel"). Laat het fouttabel-script per vraag en per fout antwoord nagaan hoeveel keuzes er na eerste zin + hint logisch overblijven; 1 = verklapper, het script stopt (voorbeeld: `scripts/fouttabel-tellen-gouden.ts`).
> - **Getalkleur in de echte Chrome meten.** De lesbeschrijving (`synthesis`) moet met "Squla" beginnen, anders zet het lesscherm geen `data-squla` en zijn alle getallen in Bliepo's tekst wit (Lesscherm.tsx). Meet de kleur van `.getal` in Chrome (zonder venster, als Testkind) en zet de uitkomst in KEUZES-VOOR-SARA.md.
> - **Tempo uit het draaiboek met een vaste tijd per stap**, niet "wacht tot de zin klaar is" (natellen: 1,15 s per nummer, niet 2,4 s).
> - **De zin van de vorige vraag weg** zodra het nieuwe beeld komt.
> - **Varieer de hint** (2 à 3 versies per denkfout), anders hoort het kind 10 keer hetzelfde.
> - **Hulphandje niet over een ander voorwerp** leggen: schuin, in de lege ruimte ernaast.
> - **Vloeiend meten:** `ALLEEN=<les-id> npm run vloeiend` (het filter kijkt naar het pad met het les-id, niet naar de bestandsnaam). Telefoon-hapering melden in DESIGN-LATER.md.
> - **Testen en keuren nooit in de echte Chrome met het koekje van een echt kind.** Eerst nakijken welk kind er gekozen is; liefst een script met Chrome zonder venster en `?naam=Testkind` (zonder koekje, of met KIND_ID van Testkind). Anders komen testantwoorden in de voortgang van een echt kind.

> ## ⭐ GELEERD BIJ DE GOUDEN LES SPLITSEN (kind-test, 9 november 2026; KINDTEST-SPLITSEN-GOUDEN.md) — geldt voor elke gouden les
> - **Elke uitlegstap is uit elke tussenstand te herstellen.** Ligt er iets op een verkeerde plek, dan zegt Bliepo wat er mis ligt en wijst het handje van díe plek weg (nooit naar een plek waar het probleem niet zit). **Vangnet:** na 3 keer in een verkeerde stand, of 20 s zonder goede beweging, doet Bliepo de stap voor en gaat de les door. Test elke stap ook met "eerst in het verkeerde vak" en met de stand die op het doel lijkt (bij 5 = 1 en 4: ook 2 en 3, en 0 en 5).
> - **Vanzelf nakijken pas na rust.** Na de laatste sleep ± 0,7 s wachten; als de dingen na een fout blijven liggen (het kind schuift ze zelf goed) ± 1,6 s. Elke nieuwe sleep zet de tijd terug. Test met een langzame, kinderlijke sleep (± 1 s slepen, 1 s stil), niet alleen met het snelle testscript.
> - **Geen eindeloze lus,** ook niet bij "telt niet als fout" (al gevonden, 1 vak leeg): hooguit 2 keer opnieuw, dan hulp, en lukt het dan nog niet, dan maakt Bliepo het af en gaat de les door.
> - **De zin bij de 2e fout is uitleg, geen opdracht** ("Er horen er 3 in." en niet "Leg er eerst 3 in"): meteen daarna doet Bliepo het samen voor. Het werkwoord past bij wat het kind doet ("sleep", niet "leg"; "Je legde er weer 4", niet "Je koos weer 4" bij slepen).
> - **Het uitlegvoorbeeld is niet de eerste vraag** (3.23): gebruik hetzelfde beeld van het beginscherm, maar een andere verdeling of opgave.
> - **Geen getal over een ding dat het kind moet pakken** (het totaal in het dak pas als het hoopje leeg is).
> - **Een knop die voor het eerst verschijnt, 1 keer uitleggen** (3.15), en hem daarna niet vanzelf laten oplichten terwijl het kind nog bezig is. Let op: het lesscherm haalt elke zin met het woord "vinkje" weg (besluit 30 oktober); zeg dus "deze knop" terwijl de knop oplicht.
> - **Dezelfde lange opdrachtzin niet steeds herhalen:** de eerste keer(en) helemaal, daarna korter en afwisselend, met dezelfde getallen en dezelfde handeling.
> - **"Ja" ook midden in de lofzin tellen** ("Even nakijken… ja, goed!" + "Ja, …" mag niet); **"nakijken" hooguit 2 keer per les** in lof, momenten en reacties samen.
> - **Komt de blauwe pijl voor het eerst na een hint,** dan niet "Klaar met kijken?" maar "Tik op de blauwe pijl als je het nog eens wilt proberen."
> - **Het beginscherm heeft altijd een uitlegdeel** (wat je in deze les doet), ook vóór een startvraag (4.3).
> - **Geldt ook voor eerder gebouwde gouden lessen** (niet door mij veranderd, eerst Sara): Tellen en de klokles kijken alleen naar "ja" vooraan in de lofzin en zeggen "Klaar met kijken?" ook als de eerste pijl na een fout komt; de klokles herhaalt het uitlegvoorbeeld (3 uur) als eerste vraag.

> ## ⭐ GELEERD BIJ DE GOUDEN LES MINSOMMEN (10 november 2026) — geldt voor elke gouden les
> - **Woorden lichten op met de stem** (`woordenMeeMetStem: true`, 3.9a, BOUWREGELS 3.7).
> - **Een 2e zin in een stuk mag niet eerst wit en dan weer gedimd worden** (F7). Wachtte een zin langer dan 2,5 s op zijn beurt, dan werd hij wit en daarna weer grijs. Opgelost in het gedeelde BliepoTekst (de 2,5 s tellen nu per zin vanaf zijn beurt); geldt dus meteen voor alle lessen.
> - **De teller (of een ander getal dat meetelt) pas na het antwoord of bij het samen voordoen** (15.20); test het: een meting "teller in beeld tijdens een keuzevraag" moet 0 zijn.
> - **Na goed met een naspeel-animatie** (de machine): de les wacht tot de animatie klaar is, maar een tik op de pijl slaat ook die over.
> - **Kale som = witte getallen, ook als het oude vlak ze kleurt**: teken de som dan zelf in het gouden vlak (2.1, 14.27), het oude vlak blijft ongewijzigd.
> - **Testen:** met een rechtstreekse link wacht de eerste zin op de eerste tik (stemHeelUitpraten): het testscript tikt eerst 1 keer naast het speelvlak. Bewerk geen bronbestand terwijl een test loopt (de les herstart dan en de F8-teller geeft vals alarm). Laat een testscript Chrome ook afsluiten als het wordt gestopt (SIGTERM): 65 achtergebleven Chrome-processen gaven een belasting van 290.
> - **Geldt ook voor eerder gebouwde gouden lessen** (niet door mij veranderd, eerst Sara): klok, Tellen, Splitsen en Plussommen hebben `woordenMeeMetStem` nog niet (1 regel per les). *(10 nov: Tellen en Splitsen zijn omgezet, Ronde 29.)*

> ## ⭐ GELEERD BIJ DE KEURING MINSOMMEN (onafhankelijke keurder, 10 november 2026; KEURING-MINSOMMEN-GOUDEN.md) — geldt voor elke gouden les
> - **Ook de uitleg na de 2e fout gebruikt het woord van de vraag** (3.11, 3.12): vraagt de les "Hoeveel komen eruit?", zeg dan niet "Er blijven … over". En geef die uitleg 2 versies, zodat een kind dat veel fouten maakt niet 15 keer dezelfde zin hoort (5.10).
> - **Een rondje om 1 getal in een som raakt de tekens ernaast niet** (1.15). Maak een schermfoto van elke soort som met rondje.
> - **Meet de eindkaart:** loopt Bliepo's laatste zin over de kaart? In alle 4 gemeten gouden lessen wel (Tellen 4 woorden, Splitsen 3, Plussommen 2, Minsommen 1 tot 4; klok niet gemeten). Kaart en tekstvak komen uit het gedeelde Lesscherm.tsx: niet per les oplossen, eerst Sara (KEUZES-VOOR-SARA.md Ronde 24b punt 1).
> - **Geldt ook voor eerder gebouwde gouden lessen** (niet veranderd, alleen gemeten): de eindkaart in Tellen, Splitsen en Plussommen (zie hierboven). Het rondje om een getal in een som zit alleen in Minsommen.

> ## ⭐ GELEERD BIJ DE GOUDEN LES MEER-MINDER (10 november 2026) — geldt voor elke gouden les
> - **Eindkaart:** in lessen met `stemHeelUitpraten` staat de kaart nu links van het vaste tekstvak (gedeeld Lesscherm.tsx, alleen met die optie). Gemeten: Meer-minder en Minsommen 0 woorden onder de kaart. Tellen, Splitsen en Plussommen hebben de optie nog niet en houden de oude plek (eerst Sara, KEUZES-VOOR-SARA.md Ronde 25 punt 4).
> - **Een vraag van 2 zinnen is 1 uiting** (`zeg(l, zinnen.join(" "))`): tikt het kind al tijdens de 1e zin, dan begint Bliepo niet alsnog aan de 2e.
> - **Een vlak bovenop een oud vlak:** zet de eigen tikknoppen van het oude vlak uit en geef je eigen knoppen een eigen kenmerk (`data-plek`); het oude vlak heeft dezelfde `data-ding`-namen (uitgeschakeld) eerder in de pagina. Test met `querySelectorAll(...).find(!disabled)`.
> - **Samen tellen heeft een vangnet:** na 20 s zonder tik of 3 keer de verkeerde kaart doet Bliepo de stap zelf (anders blijft de speelcontrole met ALLEFOUT hangen).
> - **Woorden als "meeste" laten Bliepo een gebaar maken** (lib/bliepo-gebaren.ts, BOUWREGELS 3.16); het sprongen-script telt dat als "Bliepo verspringt". Kijk bij een Bliepo-sprong eerst of het een gebaar is.
> - **Gedeelde verbetering BliepoTekst:** het woord van nu hoort bij 1 uitspraak; zonder dat stond een nieuwe zin heel even wit en werd hij daarna weer gedimd (F7).

> ## ⭐ GELEERD BIJ DE KEURING MEER-MINDER (onafhankelijke keurder, 10 november 2026; KEURING-MEER-MINDER-GOUDEN.md) — geldt voor elke gouden les
> - **Het speelvlak blijft uit het vaste tekstvak** (15.30, 1.15). Het overlap-script keek alleen naar Bliepo; bij Meer-minder liepen de 3 kaarten van het oude vlak 63 tot 95 px onder het tekstvak, en een hint van 4 of 5 regels viel over de rechterkaart. Meet de rechterrand van het speelvlak tegen de linkerrand van `.bliepo-vloer-ballon` op alle 4 de schermmaten, en maak een schermfoto van de **langste hint** bij elke soort beeld. Oplossing zonder het oude vlak te veranderen: het gouden vlak bij dat beeld iets kleiner (`scale`, vanaf links).
> - **Na het vangnet geen "Ja"**: deed Bliepo de stap zelf (20 s niets of 3 keer mis), dan zegt hij niet "Ja, daar …" alsof het kind het deed, maar "Kijk, hier …".
> - **Ook een korte eerste zin zonder richting afwisselen** ("Dat is dichtbij." stond 5 keer per les; 5.10): 2 à 3 versies.
> - **"Weer" bij dezelfde kaart:** zeg wat het kind deed ("Je koos weer dezelfde kaart."), geen stroeve omschrijving ("een kaart met bijna de meeste").
> - **Geldt ook voor eerder gebouwde gouden lessen** (alleen gemeten, niets veranderd; eerst Sara, KEUZES Ronde 25b): het speelvlak loopt het tekstvak in bij **Minsommen** (± 25 px) en **Plussommen** (± 90 px); "… is dichtbij." steeds hetzelfde in **Tellen** en **Splitsen**. "Ja" na het vangnet: in geen andere les.

> ## ⭐ GELEERD BIJ DE GOUDEN LES HUISNUMMERS (10 november 2026) — geldt voor elke gouden les
> - **Noem bij een fout nooit beide buren** van het gat ("19 past niet tussen 15 en 17" verklapt 16). Zeg alleen iets over het gekozen getal ("19 komt na 18, aan het eind van de straat."). Laat het fouttabel-script controleren dat er geen "tussen … en …" in eerste zin of hint staat.
> - **Een eerste zin die een hele kant uitsluit** ("aan het eind van de straat") kan ook de andere foute keuze uitsluiten: dan blijft er maar 1 over. Het script rekent het na; zeg dan alleen "Huis 37 past niet op deze plek." (zoals "Dat is dichtbij." bij Meer-minder).
> - **"Weer" alleen bij dezelfde kant:** eerst 19 (eind) en dan 13 (begin) is niet "weer een nummer van het begin". Geef een denkfout met een richting een eigen soort per richting.
> - **Typen in een gouden les:** een echt invulvak op de plek van het vraagteken (HARDE REGEL 5), het vinkje van het lesscherm pas als er iets staat (`l.knoppen(["controleer"])` + een melding "vol/leeg" van het vlak), Enter werkt ook; nooit `l.getal()` (die heeft de knop "Weet ik niet").
> - **Een oud vlak dat geen Phaser is** (de straat was een SVG-tekening): maak een nieuw Phaser-vlak met dezelfde plaatjes (`preload()` in de scène), anders kan `npm run vloeiend` het niet meten.

> ## ⭐ GELEERD BIJ DE KEURING HUISNUMMERS (onafhankelijke keurder, 10 november 2026; KEURING-HUISNUMMERS-GOUDEN.md) — geldt voor elke gouden les
> - **Wat Bliepo bij een fout zegt, moet WAAR zijn voor elk antwoord dat het kind kan geven**, niet alleen voor de rijen in de fouttabel. Bij typen kan een kind elk getal typen; dan valt het terug op een algemene regel, en die moet bij elke straat of som kloppen. Fout gevonden: "Het vraagteken staat midden in de straat." terwijl het aan het eind stond, "aan het begin van de straat" voor het gat dat zelf aan het begin stond, en "De nummers hier beginnen met een 2" bij de straat 30, 31.
> - **Laat het fouttabel-script een waarheidscontrole doen**: bij typen voor elk getal van 0 tot 99 de zinnen maken en nagaan dat elke bewering klopt met het beeld (voorbeeld: `scripts/fouttabel-huisnummers-gouden.ts`, deel 3). Een beschrijving van het beeld ("de nummers hier", "midden in", "aan het eind") alleen als hij voor déze vraag waar is.
> - **Zinnen over een buur gaan over het buurhuis van de vraag** ("Na 39 …" bij "Welk nummer komt na 39?"), niet over het kleinste of grootste nummer in de rij.
> - **"Je koos weer …" past bij wat het kind deed:** "typte" bij typen, "sleepte" bij slepen.
> - **Geldt ook voor eerder gebouwde gouden lessen:** alleen Huisnummers heeft typen; in de andere 6 gouden lessen kan het kind alleen kiezen, tikken of slepen uit vaste dingen, en daar gaat het fouttabel-script al alle foute antwoorden langs. Daar is deze fout dus niet mogelijk (geteld: 0 van 6).

> ## ⭐ GELEERD BIJ DE GOUDEN LES GETALLENLIJN (10 november 2026) — geldt voor elke gouden les
> - **Een richting kan ook de andere foute keuze uitsluiten** (bij 17 / 18 / 8: "17 staat vóór het raketje, tel verder" sluit ook de 8 uit). Dan zegt Bliepo alleen "Het raketje staat niet bij de 17." en de hint geeft **ook geen richting** ("Kijk recht onder het raketje. Tel de streepjes vanaf een getal dat je ziet."). Het fouttabel-script controleert beide (voorbeeld: `scripts/fouttabel-getallenlijn-gouden.ts`).
> - **Een rondje dat bijna het antwoord aanwijst, mag niet** (bij "ongeveer" een rondje om de 10 als het raketje bij 11 staat). Dan noemt de hint geen getal en komt er geen rondje (15.17, 7.8: rondje alleen om wat Bliepo noemt).
> - **Bij vaste keuzes heeft elke rij een denkfout**: het script laat "onduidelijk" niet toe, en elke eerste zin moet door de waarheidscontrole na te lopen zijn (een zin die het script niet kent, telt als fout).
> - **Een opdracht in stapjes (springen 0 → 1 → 2 → 3):** na elke stap het testkenmerk (`haak`) bijwerken, anders denkt de test dat er niets gebeurde; een tik op een stap die al gedaan is telt niet als fout; een correctie midden in de opdracht ("Het raketje springt steeds 1 streepje.") is een opdrachtzin **zonder pijl** en een tik tijdens die zin telt.
> - **Kaarten op volgorde:** een kaart die al in een vak ligt heeft geen `data-plek`, anders tikt de speelcontrole steeds dezelfde kaart heen en terug. Nakijken met het vinkje als alle vakken vol zijn (6.5).
> - **Heeft het draaiboek een startvraag** ("laten zien wat je weet?"), dan komt die er ook (zoals Splitsen en de klok): Ja = proef van vraag 1 en 2, 2 fouten = de uitleg en daarna alle vragen.

> ## ⭐ GELEERD BIJ DE KEURING GETALLENLIJN (onafhankelijke keurder, 10 november 2026; KEURING-GETALLENLIJN-GOUDEN.md) — geldt voor elke gouden les
> - **Ook de "weer"-zin bij de 2e fout is uitleg, geen opdracht.** Meteen daarna doet Bliepo het samen voor, dus het kind kan "Tel elk streepje mee", "Begin met het kleinste getal" of "Wijs elke boog aan" niet meer doen. Zeg het als uitleg: "Elk streepje telt mee.", "Het kleinste getal komt vooraan.", "Bij elke sprong hoort 1 boog." (de regel van Splitsen, nu ook voor de "weer"-zinnen en de uitleg-zin).
> - **Een hint zegt hoe je zoekt, niet waar het antwoord staat.** "Kijk naar de 13. Het raketje staat 1 streepje verder." zegt waar het raketje staat (zoals de klokzin "Over 1 uur schuift de kleine wijzer 1 getal verder", 15.17). Beter: "Kijk naar de 13. Tel vanaf daar de streepjes tot het raketje."
> - **1 woord voor 1 ding (3.12):** zegt de hint "stapjes" en het samen voordoen "sprongen", dan hoort het kind 2 woorden voor hetzelfde. Kies het woord van de les (hier "sprongen").
> - **ERNSTIG gevonden: de kaarten bij "op volgorde" waren onzichtbaar.** `tover()` (holo/basis.ts) zet een ding eerst op doorzichtig en plat en laat het dan verschijnen. De les zette de kaarten meteen daarna "terug" (`legKaart` → `killTweensOf`), waardoor het verschijnen stopte en de kaarten doorzichtig bleven. De testscripts tikken op onzichtbare knoppen over het vlak en merkten niets. **Regel:** wie `killTweensOf` doet op iets dat met `tover()` kwam, zet daarna `setAlpha(1)` en de eigen schaal terug; en **kijk naar een schermfoto van elke soort beeld** (`FOTO=…`), niet alleen naar de uitslag van het script.
> - **Een gebaar bij "meer" of "groot" is geen fout** (3.16): het sprongen-script telt het als "Bliepo verspringt". Kijk of de overlap 0 blijft; dan is het goed.
> - **Geldt ook voor eerder gebouwde gouden lessen** (alleen geteld, niets veranderd; eerst Sara, KEUZES Ronde 27b): een opdracht in de "weer"-zin bij de 2e fout staat in **Huisnummers** ("Tel elk huis mee …", "Tel maar 1 stap verder."), de **klok** ("Zoek de kleine, dikke wijzer …", "Tel maar mee: precies 1 stap.") en **Tellen** ("Tel ook de … in de laatste rij."): 3 van de 7. Een hint die zegt waar het antwoord staat: **1 van de 7**, de **klok** (squla-klok-gouden-zinnen.ts: "Na de 6 ga je maar 1 getal verder. Volg de blauwe pijl." en "Over 1 uur schuift de kleine wijzer 1 getal verder. Volg de blauwe pijl.", precies de zinnen die 15.17 al noemt; ze staan er nog). Twee woorden voor dezelfde stap: niet gevonden (alleen in Getallenlijn gezocht op stapjes/sprongen). Onzichtbaar na `killTweensOf` op iets van `tover()`: **0 van de 7** gezien; alleen in **Huisnummers** kan het in theorie (`losTerug` op de losse huizen), maar daar komt `losTerug` pas na een fout, lang na het verschijnen.

> ## ⭐ GELEERD BIJ DE GOUDEN LES METEN (10 november 2026) — geldt voor elke gouden les
> - **Een lang stuk tekst maakt Bliepo kleiner** (het lesscherm schaalt hem als de tekst te lang is): het sprongen-script ziet dat als "Bliepo verspringt" (15.30). Zet een beschrijving van het beeld als eigen stuk vóór de vraag (`intro`), zodat elk stuk kort blijft. Een gebaar bij "groot" of "klein" (3.16) blijft wel een sprong in het script; kijk of de overlap 0 is.
> - **Voorlezen bij aanwijzen op eigen knoppen** (3.5, `zegKeuze`) niet terwijl Bliepo die kaartjes zelf voorleest: anders klinkt dezelfde zin 2 keer (F8).
> - **Het les-id letterlijk in het draaiboek** (`id: "…"`, geen variabele): `npm run opgaven` zoekt het zo op.
> - **Geen "kaart" in de naam (aria-label) van een eigen knop**: de testscripts zoeken de eindkaart op dat woord.
> - **Bewerk geen bestand terwijl een test loopt** (geleerd bij Minsommen, opnieuw gezien): de les begint dan opnieuw en de test geeft valse fouten.
> - **Het oude vlak hergebruiken kan** (zoals Meer-minder): gloed en eigen knoppen van het oude vlak uit (`kaartenActief: false`, geen `goed`/`fout`/`gekozen`), eigen HTML-knoppen met vinkje erover, en het hele vlak iets kleiner vanaf links.

> ## ⭐ GELEERD BIJ DE KEURING METEN (onafhankelijke keurder, 10 november 2026; KEURING-METEN-GOUDEN.md) — geldt voor elke gouden les
> - **Een eerste zin zonder het gekozen getal komt bij 2 verschillende foute antwoorden 2 keer** ("Dat is dichtbij." bij 9 en daarna bij 11, voor dezelfde vraag). Kies de variant niet alleen per vraag (`v.nr % 3`): kijk bij de 2e fout of de eerste zin dezelfde is als bij de 1e fout, en zeg dan iets anders ("Je zit er weer vlak naast."). Test het met 2 verschillende foute antwoorden van dezelfde soort (route `dichtbij` in scripts/test-meten-gouden.mjs).
> - **Enkelvoud of meervoud volgt het beeld van déze vraag:** "de rijen eronder" klopt niet bij een tafel met 2 rijen (er ligt maar 1 rij onder). Laat de zin afhangen van het aantal (`r === 2 ? "De rij eronder …" : "De rijen eronder …"`).
> - **Geldt ook voor eerder gebouwde gouden lessen** (alleen geteld, niets veranderd): dezelfde eerste zin bij 2 verschillende foute antwoorden: **0 van de 8** (Tellen, Splitsen, Meer-minder en Getallenlijn noemen het gekozen getal in de zin; de klok gebruikt dan een "weer"-zin). "Rijen eronder" bij 1 rij: **0 van de 8** (alleen Meten praat over rijen eronder).

> ## ⭐ GELEERD BIJ DE OMZETTING TELLEN EN SPLITSEN (10 november 2026; KEUZES-VOOR-SARA.md Ronde 29) — geldt voor elke gouden les
> - **Omzetten = dezelfde zegDoor/zegOpdracht als de nieuwste lessen, in de les zelf** (geen apart gedeeld pijlbestand): `pijlZoalsSynthesis`, `stemHeelUitpraten` en `woordenMeeMetStem` aan; elk stuk ± 0,7 s na de zin vanzelf door; bij een opdracht `l.verderWeg()`; op de eindkaart geen pijl; de eindzin als 1 uiting.
> - **Na een nieuw beeld ± 150 ms tot de vraag of opdracht,** niet 700 ms: anders is het "einde zin → volgend stuk" 1,4 s in plaats van ± 0,7 s.
> - **Een opdracht van 3 of 4 zinnen eerst splitsen:** de beschrijving als eigen stuk, dan de opdracht (anders past het niet in het vaste tekstvak).
> - **Een lange reactie bij een fout in 2 stukken** (eerst wat het kind deed, dan de hint of uitleg): in 1 stuk werd Bliepo bij Splitsen 22 keer per les kleiner (het sprongen-script ziet dat als "Bliepo verspringt"; geen gebaar). Ook de startvraag kort houden (op 1536 × 864 te lang).
> - **Een Phaser-hulphandje is geen `[data-hulphand]`:** laat de test naar de logregel "aanwijzing" kijken.
> - **Bliepo zelf laten tellen (natellen) heeft een vast tempo** (draaiboek), maar de pijl staat erbij als snelkoppeling: een tik zet alles meteen klaar.
> - **Ook "Kom, we … samen." en de uitleg bij de 2e fout in 2 à 3 versies** (anders zegt Bliepo bij 2 vragen achter elkaar precies hetzelfde; de F8-teller ziet dat als dubbel als slepen niet als actie telt).
> - **Een testspeler die sleept, telt slepen als actie** (`gesleept`), en moet uit een stand kunnen komen waar de foute verdeling al ligt (proef na een fout).
> - **Een vlak dat kleiner moet (vaste zone), altijd even klein** als er in Phaser gesleept wordt: Phaser meet de plek van het vlak bij het begin.

> ## ⭐ GELEERD BIJ DE OMZETTING PLUSSOMMEN EN KLOK (11 november 2026; KEUZES-VOOR-SARA.md Ronde 30) — geldt voor elke gouden les
> - **Een zin die al wit is, blijft wit** (F7, Ronde 28b punt 9). Deed de site er langer dan 2,5 s over (de vraag of Ruth de zin heeft), dan werd de zin wit en daarna weer grijs als Bliepo hem toch zei. Opgelost in het gedeelde BliepoTekst, alleen voor lessen met `stemHeelUitpraten` (lib/stem.ts `praatHeelUit`). Test: `scripts/test-wit-blijft-wit.mjs` (maakt de site expres 3,5 s traag), of `TRAGESERVER=3500` bij de testscripts van Plussommen en de klok.
> - **Na een fout niet 2 keer de vraag vóór dezelfde poging:** eerst wat het kind koos (vanzelf door), dan komen de keuzes terug **mét de hint** (zoals Tellen). Bij een opdracht (verbinden) is de hint de nieuwe opdrachtzin, niet nog een opdracht erachter.
> - **Bij verbinden in een testspeler: een fout antwoord is een verwisseling** (som 0 ↔ som 1). Een antwoord dat al aan een andere som hangt, haalt die lijn weg; dan raken de lijnen nooit vol en blijft de test hangen.
> - **Bij zetten mag de zin bij de 2e fout wél een opdracht zijn** als het kind daarna zelf de laatste stap doet (de klok: "Zet de kleine wijzer in het oranje rondje."); bij een keuzevraag nooit.
> - **Een eerste zin zonder richting in 3 versies over de hele les tellen**, niet per `nr % 3` blind kiezen: bij Plussommen vielen de 3 vragen met zo'n zin allemaal op 2 versies. Laat het fouttabel-script het aantal versies tellen.
> - **Een speelvlak in Phaser met alleen HTML-tikplekken** kan altijd even klein (88 %, vanaf links): de tikplekken schalen mee (Plussommen, Minsommen 90 %).
> - **Geldt ook voor eerder gebouwde gouden lessen:** de wit-blijft-wit-oplossing geldt meteen voor alle 9 gouden lessen (allemaal `stemHeelUitpraten`); oude lessen zonder de optie veranderen niet.

> ## ⭐ GELEERD BIJ DE KEURING TELLEN EN SPLITSEN (onafhankelijke keurder, 11 november 2026; KEURING-TELLEN-SPLITSEN-GOUDEN.md) — geldt voor elke gouden les
> - **Niet 2 keer hetzelfde woord bij 1 vraag in de eerste zin,** ook niet in een andere zin: na "12 is dichtbij, …" bij de 1e fout niet "14 is dichtbij, …" bij de 2e. Kies bij de 2e fout een versie zonder dat woord, met dezelfde betekenis. Controleer alle paren foute antwoorden per vraag in het fouttabel-script, niet alleen elke fout apart.
> - **Enkelvoud en meervoud ook bij "1":** "Je legde er 1. Dat is te weinig." (niet "Dat zijn er"); "de andere ballen" klopt niet als er maar 1 over is. Bij een hint dan "de rest" (zegt niet hoeveel), bij het samen voordoen mag "de laatste bal".
> - **Ook de 1 krijgt de kleur van zijn voorwerp** ("Je telde 1 pruim te veel." → 1 paars; "Sleep 1 pion naar het paarse vak." → 1 paars). Zet elk getal in een zin via de kleurhulp (`gk`, `g`), ook een losse 1.
> - **Pas geen bestand aan terwijl een test loopt** (opnieuw gezien): de ontwikkelversie bouwt dan opnieuw en de test meldt valse fouten (hier: "pijl bij de opdracht samen tellen"). Daarna opnieuw meten.
> - **Een test die het hulphandje "na 7 s" zoekt, moet tellen vanaf het einde van de opdrachtzin,** niet vanaf het begin: het handje komt ± 6 s nadat Bliepo uitgesproken is.

> ## ⭐ GELEERD BIJ DE GOUDEN LES GELD (11 november 2026; KEUZES-VOOR-SARA.md Ronde 34) — geldt voor elke gouden les
> - **Een onderwerp zonder Synthesis-les** (15.25): exact het skelet van de andere gouden lessen (laag 1); alles van laag 2 (denkfouten, eerste zinnen, hints, uitleg, samen voordoen) staat als "eigen invulling, niet van Synthesis" in een kort draaiboekbestand (DRAAIBOEKEN-NIEUW/geld.md, "helemaal gespeeld: nee, er is geen les") en per rij in de fouttabel.
> - **Het getal dat het kind moet zoeken is wit in de vraag en de hint**, ook als het naar een voorwerp verwijst: in de kleur van het goede voorwerp ("een briefje van 20 euro" in blauw naast 1 blauw briefje) verklapt de kleur het antwoord (14.22). Ook de keuzes die Bliepo opnoemt ("Is het 10 euro, 20 euro of 50 euro?") zijn wit. Na het antwoord krijgt het getal de kleur van het voorwerp.
> - **Laat het fouttabel-script elk kaal cijfer zoeken in álle zinnen van de les** (vraag, hint, uitleg, "weer", lof-reactie, samen voordoen, terugkomende vragen): bij Geld gevonden in "alle 3", "nog 1", "ook de 0" en "nog 3 vragen" (14.20).
> - **Zegt de hint zelf niet waar het over gaat, zet dan de vraag kort erachter** ("… Waar zie je een munt van 1 euro?"; F1). Dat is 1 keer de vraag vóór de nieuwe poging, geen herhaling (3.23). Meet daarna de lengte: hint + vraag was op 1024 × 768 en 1536 × 864 bij 1 hint te lang (Bliepo werd kleiner); die hint is korter gemaakt.
> - **Een hulphandje bij een opdracht waarvan de plek het antwoord is** (tik alle munten van 1 euro aan): in de lege ruimte ernaast, nooit op een goed ding (15.17).
> - **Een fout bij een tik-opdracht met meer goede dingen** (de zwevende munten): wat al gevonden is, blijft staan (met vinkje); alleen de foute tik telt als poging.
> - **Een oud vlak met een eigen indeling hergebruiken** (`paneel`): de overlay rekent met dezelfde `indeling()` en hetzelfde midden als het oude vlak, en het rondje komt van het oude vlak zelf (`licht` + `rondje`); geef geen `goed`, `fout`, `gekozen` of `uit` door (gloed en vaag om de keuze).
> - **Niet nagelopen in de andere gouden lessen** (alleen gemeld, eerst Sara): kale cijfers in eigen zinnen en een gekleurd zoekgetal in de vraag.

> ## ⭐ GELEERD BIJ DE GOUDEN LES VORMEN: PATRONEN (11 november 2026; KEUZES-VOOR-SARA.md Ronde 36) — geldt voor elke gouden les
> - **De les luistert naar 1 melding van het vlak tegelijk** (`wachtOpVlak`): een vlak dat 2 meldingen direct na elkaar stuurt, verliest de 2e. Stuur per handeling 1 melding (bij de ketting: "kraal verschoven", of "vol", of "weer open").
> - **Een oud vlak dat op slot gaat** (de ketting na 3 kralen): geef het een optie die alleen de gouden les meegeeft (`gouden`), zodat het kind kan schuiven en met het vinkje nakijkt (6.5). Zonder de optie verandert er niets; speel de oude lessen daarna opnieuw.
> - **Een opdracht die het kind niet kan afmaken** (de puzzel in de speelcontrole ALLEFOUT): een vangnet dat Bliepo het laat afmaken (`bliepoLegt`), anders loopt de les vast (geleerd bij Splitsen).
> - **Een hint "zoek eerder in de rij …" alleen als het er eerder echt ligt**, en alleen als daarna in het patroon steeds hetzelfde komt (bij een paar, zoals rood rood blauw blauw, is "kijk wat na rood komt" misleidend). Laat het fouttabel-script dat nalopen.
> - **Zegt de hint al waar het over gaat** ("… Kijk wat daarna komt." bij "Welke kraal komt na …?"), zet de vraag er dan niet nog eens achter: dubbel en te lang (Bliepo werd kleiner).
> - **De F7-test telt een nieuwe opdracht met dezelfde zin** (dezelfde opdracht bij de volgende ketting) **niet als F7**: Bliepo zegt hem echt opnieuw. Laat het slepen van het kind als actie loggen.
> - **Geldt ook voor eerder gebouwde gouden lessen** (niet nagelopen, alleen gemeld): de eerste 2 punten gaan alleen over lessen met slepen in een oud vlak.

> ## ⭐ GELEERD BIJ DE KEURING VORMEN (onafhankelijke keurder, 11 november 2026; KEURING-VORMEN-GOUDEN.md) — geldt voor elke gouden les
> - **Na een vangnet-zin weer een opdrachtzin** als het kind daarna nog iets moet doen (`zegOpdracht`): `zegDoor` laat de pijl staan tot het volgende stuk. Zonder opdrachtzin stond bij de puzzel de pijl erbij terwijl het kind moest slepen (15.27 punt 3), en de opdrachtregel was weg (14.32). Te zien in de test als een lange "einde zin → volgend stuk" (4,4 s).
> - **Geldt ook voor eerder gebouwde gouden lessen:** gezocht in de 10 andere: 0 gevonden.

> ## ⭐ GELEERD BIJ DE GOUDEN LES DAGEN (11 november 2026; KEUZES-VOOR-SARA.md Ronde 38) — geldt voor elke gouden les
> - **"Je zit er vlak naast." alleen als het gekozen ding 2 buren heeft.** Een wagon aan het eind (zondag) heeft er maar 1: dan blijft er na die zin maar 1 keuze over (verklapper, 15.17). Het fouttabel-script rekent per fout antwoord uit welke keuzes na de eerste zin nog kunnen (`overNa`); bij een eind-wagon zegt Bliepo alleen wat het kind koos.
> - **Een zin over "de dag die verder weg ligt" niet als "X is verder weg"**, maar "Die dag ligt verder van vandaag af.": niet 2 keer de dagnaam achter elkaar ("Je koos maandag. Maandag is …").
> - **Elke hint eindigt met de vraag of de opdracht** ("… Welke dag komt na dinsdag?", "… Sleep de dag die mist."): dan hoeft de vraag er niet nog eens achter (F1, geleerd bij Vormen). Het script controleert dat.
> - **Een vraag met 2 goede antwoorden** (het weekend: zaterdag én zondag, 14.30): de les en de testspeler werken met een lijst goede antwoorden (`goed: number[]`), ook bij het samen voordoen (beide tellen). Een testspeler die `t.goed` als 1 antwoord neemt, tikt dan niets aan.
> - **Een oud HTML-vlak** (de weektrein): een nieuw Phaser-vlak met dezelfde plaatjes, iets kleiner zodat alles links van het tekstvak past (x < 860); de oude trein blijft voor de oude les (zoals Huisnummers).
> - **Geldt ook voor eerder gebouwde gouden lessen** (niet nagelopen, alleen gemeld): "vlak naast"/"dichtbij" bij een keuze aan de rand van een rij.

> ## ⭐ GELEERD BIJ DE KEURING DAGEN (onafhankelijke keurder, 11 november 2026; KEURING-DAGEN-GOUDEN.md) — geldt voor elke gouden les
> - **Een regel uit "Geleerd bij …" moet ook in het script staan, niet alleen als opmerking.** De paren-controle (niet 2 keer dezelfde zin bij 1 vraag) stond in het Dagen-script alleen als commentaar; daardoor kwam "Die dag ligt verder van vandaag af." 2 keer bij 1 vraag. En "niet 2 keer de dagnaam achter elkaar" was maar in 1 zin hersteld (nog 18 over). Laat het script beide nalopen (zoals nu `fouttabel-dagen-gouden.ts`).
> - **Een vangnet-zin en de samen-zin beginnen niet met hetzelfde woord** ("Kom, ik help je …" + "Kom, we kijken samen." → "Ik help je met deze.").
> - **Test ook het vangnet bij slepen** (niets doen tot het vangnet): de route `mistvangnet` in `test-dagen-gouden.mjs`.

> ## ⭐ GELEERD BIJ DE GOUDEN LES TIJD (11 november 2026; KEUZES-VOOR-SARA.md Ronde 40) — geldt voor elke gouden les
> - **Niet 2 keer de naam van wat het kind koos:** "Je koos zaterdag. Die hoort bij het weekend …", "Je koos woensdag. Dat is niet de eerste dag." (niet "Je koos woensdag. Woensdag is …").
> - **Geen woord 2 keer in 1 reactie bij een fout,** ook niet verdeeld over eerste zin en hint of uitleg ("Op maandag ga je naar school. In het weekend ga je niet naar school."): kies een ander woord ("vrij", "vrije dagen"). Ook een getal niet 2 keer ("Je koos 1. Het weekend is langer dan dat.").
> - **Een kaart met 2 dingen** (zaterdag en zondag): de verklapcontrole mag het ding noemen dat ook op de gekozen kaart staat ("Je koos zondag en maandag."), maar nooit het ding dat alleen op de goede kaart staat.
> - **Een vraag die aan het eind terugkomt, krijgt de andere hint-versie** (zelfde vraag, niet 2 keer dezelfde hint; het script controleert het).
> - **Geen rondje om een hele lange rij** (alle 7 wagons): het rondje is breder dan de rij en loopt tot onder het tekstvak (15.30). Bekijk de schermfoto van elk rondje.
> - **Helpers delen de scratchpad-map:** zet schermfoto's in een eigen submap (`FOTO=…/tijdfoto`), anders lopen ze door die van andere lessen.
> - **Geldt ook voor eerder gebouwde gouden lessen** (niet veranderd, alleen gemeld): de gouden les Dagen zegt "Je koos dinsdag. Dinsdag komt vóór woensdag." (2 keer de dagnaam; KEUZES Ronde 40).

> ## ⭐ GELEERD BIJ DE GOUDEN LES REKENTAAL (11 november 2026; KEUZES-VOOR-SARA.md Ronde 42) — geldt voor elke gouden les
> - **De herhaalcontrole in het script** (geen woord of getal 2 keer in 1 reactie bij een fout): tel per reactie alle woorden van de eerste zin + de hint (1e fout) en van de eerste zin, "Nu koos je …" of "Je koos weer …" + de uitleg (2e fout). Kleine woordjes (de, het, is, die, …) en de woorden van de vraag zelf mogen terugkomen (de hint eindigt met de vraag); al het andere niet (voorbeeld: `scripts/fouttabel-rekentaal-gouden.ts`, `dubbel`). Gevonden bij het bouwen: "breed" in eerste zin en hint, "zit" in "Het zit vol." + "Kijk waar geen sap in zit.", "rand" 2 keer in "van rand tot rand".
> - **Wijs met "deze" als het rondje erom staat:** "Je koos deze mand. Die is niet de grootste." Dan hoeft de naam van het voorwerp niet 2 keer (en het goede voorwerp wordt nooit genoemd).
> - **Bij 3 voorwerpen geen richting bij het middelste:** "Er is nog een grotere" sluit ook het kleinste uit (dan blijft er 1 over); zeg alleen "Die is niet de grootste." Bij 2 voorwerpen blijft er na de 1e fout altijd 1 over (inhoud van Squla); het script eist dan minstens 1, bij 3 minstens 2.
> - **Een oud SVG-vlak in Phaser:** teken dezelfde SVG-paden met `new Path2D(d)` in `canvasPlaatje` (1 keer per soort en maat, met een rand van 10 punten voor dikke lijnen). Zo blijven de tekeningen gelijk aan de oude les.
> - **Grote plaatjes alvast tekenen:** een groot plaatje (het picknickkleed) dat pas bij een vraag getekend wordt, gaf op de trage telefoon een hapering van 76 ms. Laat het vlak alle plaatjes van de les verspreid over de eerste seconden tekenen (`bakVooruit`, 1 per 2 beeldjes); daarna 31–43 ms.
> - **Op volgorde met tikken** (geen slepen): elke tik zet een voorwerp op de volgende lege plek, nog een tik zet het terug, het vinkje als alles vol is; het handje bij de eerste lege plek; vangnet 45 s (zoals slepen bij Dagen). Een voorwerp op de plank heeft geen `data-plek`.
> - **Een test die het handje bij een opdracht zoekt, wacht tot 16 s** (de opdrachtzin "Zet de bekers op volgorde. Van klein naar groot. Tik eerst op de kleinste." duurt al ± 4 s).
> - **Geldt ook voor eerder gebouwde gouden lessen** (niet nagelopen, alleen gemeld): de andere fouttabel-scripts hebben deze telling van herhaalde woorden in 1 reactie nog niet; eerst Sara.

> ## ⭐ GELEERD BIJ DE KEURING TIJD (onafhankelijke keurder, 11 november 2026; KEURING-TIJD-GOUDEN.md) — geldt voor elke gouden les
> - **Kijk ook naar de reactie met "Je koos weer …":** dan staat de uitleg direct achter "weer". Een uitleg met "weer" erin ("tot het weer maandag is", "begint de week weer …") geeft 2 keer "weer". Kies "opnieuw" of laat het weg.
> - **Ook in de eerste zin zelf niet 2 keer hetzelfde getal** ("Je koos 5. Op 5 dagen …" → "Op zoveel dagen …"). Laat het herhalingsscript elk paar (eerste zin + hint, en "Nu koos je …"/"Je koos weer …" + uitleg) nalopen.
> - **De dag van de vraag mag terugkomen** ("Die komt niet meteen na maandag. Meteen na maandag komt …"): zonder de dagnaam is de uitleg na "Je koos weer …" niet meer duidelijk. Sara beslist (KEUZES Ronde 41 punt B).

> ## ⭐ GELEERD BIJ DE KEURING REKENTAAL (onafhankelijke keurder, 11 november 2026; KEURING-REKENTAAL-GOUDEN.md) — geldt voor elke gouden les
> - **Toets elke hint aan WOORDEN-GROEP3.md**, ook de reserve-versie: "Vergelijk …" stond in 4 hints ("vergelijken" als werkwoord mag niet). Het fouttabel-script meldt het nu.
> - **Een hint bij op volgorde hoort bij de denkfout:** wie al met de kleinste begon, heeft niets aan "Begin met de kleinste". Kies de hint per denkfout, niet per vraag.
> - **Het werkwoord past bij het ding:** bekers staan, appels liggen ("Er staat nog een kleinere.").
> - **Tel ook hoe vaak een hint en het samen voordoen hetzelfde zeggen** over de hele les ("Ze beginnen bij dezelfde streep." 6 keer bij een kind dat veel fouten maakt).
> - **Geldt ook voor eerder gebouwde gouden lessen:** "vergelijk" in een zin van Bliepo: 0 van 13; "ligt" bij iets wat staat: 0 van 13.

> ## ⭐ GELEERD BIJ DE GOUDEN LES REKENMIX (11 november 2026; KEUZES-VOOR-SARA.md Ronde 44) — geldt voor elke gouden les
> - **Elk Rekenmix-level heeft maar 1 soort vraag** (mix1-1 alleen tellen, mix1-2 alleen vormen, …). "Elke vraag volgt de gouden les van zijn eigen onderwerp" (15.25) betekent dan: de hele les volgt die ene gouden les (verloop, tempo, zinnen, fouttabel-logica). **Importeer de zinnen van die gouden les** (ZIN, TELREACTIE, rijtjes) in plaats van ze te kopiëren; alleen wat niet klopt met het beeld van de nieuwe les wordt eigen (hier: de hints).
> - **Een hint over de plek klopt alleen bij dat beeld:** "rij voor rij" en "linksboven" alleen als de dingen in rijen liggen; bij 2 aan 2 "van links naar rechts", door elkaar "van boven naar beneden". Laat het script het per vraag nalopen.
> - **"Dichtbij" alleen bij hooguit 2 verschil.** Squla heeft soms een keuze 3 verder; dan zegt Bliepo "Je koos 7. Je hebt ze nog niet allemaal geteld." (waarheidscontrole in het script).
> - **Het-woorden:** "elke bal", maar "elk potlood" (ook "Elk potlood krijgt …"). Een zin van een andere gouden les met "elke" werkt alleen bij de-woorden; geef het ding een veld `elk` en laat het script "elke potlood" zoeken.
> - **Ook "1 keer", "1 nummer" en "2 keer" krijgen een kleur** ({1:wit}: een getal zonder ding, 14.20).
> - **Een rijtje dat per aantal opnieuw wordt gemaakt** (`TELREACTIE(n, fruit)` geeft elke keer een nieuw rijtje): dan werkt "niet 2 keer dezelfde zin" van `kies()` niet, want die onthoudt de vorige zin per rijtje. Bewaar het rijtje (1 per aantal en kleur).
> - **Geldt ook voor eerder gebouwde gouden lessen** (niet veranderd, alleen gemeld; eerst Sara, KEUZES Ronde 44): de gouden les Tellen heeft kale cijfers in "Elke appel krijgt 1 nummer.", "Wijs elke … 1 keer aan." en "tel je maar 1 keer", en maakt TELREACTIE bij elke vraag opnieuw. "Elke" bij een het-woord: 0 (Tellen heeft alleen appel, peer, pruim).

> ## ⭐ GELEERD BIJ DE KEURING REKENMIX (onafhankelijke keurder, 12 november 2026; KEURING-REKENMIX-GOUDEN.md) — geldt voor elke gouden les
> - **"Niet 2 keer achter elkaar dezelfde zin" geldt over de hele les, ook als het rijtje per aantal anders is.** Een rijtje per aantal (of per uur) bewaren helpt niet: opeenvolgende vragen hebben een ander aantal, dus kies() kent de vorige zin niet. Onthoud de vorige zin over de hele les (`telVorige` in squla-rekenmix-gouden.tsx) en laat de test het tellen met het getal als # ("Het zijn er #." 2 keer = fout).
> - **Laat een controlescript de tekst zonder kleurcode lezen** (`kaal`): met {1:wit} erin vindt een zoekterm als "1 keer" niets.
> - **Ook het gedeelde vaste rijtje nalopen op kale cijfers** ("Al 3 goed achter elkaar!"): het script van een les keek alleen naar de eigen zinnen.
> - **Geldt ook voor eerder gebouwde gouden lessen** (alleen geteld, niets veranderd; eerst Sara, KEUZES Ronde 45): de zin met het aantal kan 2 keer achter elkaar dezelfde zijn in **Tellen**, **Meer-minder** en de **klok** (3 van de 13); kale cijfers in het gedeelde rijtje: in alle gouden lessen (5 zinnen).

> ## ⭐ BELANGRIJKSTE REGEL VAN BLIEPO
> **Bliepo probeert altijd de denkfout van het kind te begrijpen en reageert daarop.**
>
> (Sara, 8 november 2026, vijfde ronde; BOUWREGELS 15.9.) Maak vóór het bouwen per vraag een **fouttabel** (stap 2.7): fout antwoord, waarschijnlijke denkfout, Bliepo's eerste zin, hint voor precies die denkfout, wat er op het scherm gebeurt. Denkfout niet duidelijk = algemene hint, geen verzonnen reden. De denkfout wordt bewaard in de voortgang. **Een les is pas klaar als elke vraag een fouttabel heeft.**
> **Geldt voor lessen die we vanaf nu bouwen** (eerst squla-klok-gouden). Bestaande lessen later, na akkoord van Sara.

> **EERST DIT (Sara, 8 november 2026, vierde ronde; BOUWREGELS 15.8).**
> **We maken geen compleet nieuwe lessen.** Elke gouden les en elke latere les is onze bestaande Squla-les, opnieuw gebouwd in de stijl van LESRECEPT.md en het draaiboek van zijn onderwerp. Inhoud, getallen, vragen en antwoordkeuzes blijven hetzelfde als in de Squla-les; niets toevoegen of weglaten zonder akkoord van Sara. Bouw steeds een nieuwe versie naast de bestaande les; de oude les blijft ongewijzigd staan (harde regel 8 en 9). Pas na akkoord van Sara vervangt de nieuwe versie de oude voor kinderen.

Gemaakt op 8 november 2026 (derde ronde); bijgewerkt in de vierde ronde (alle open punten uit OVERIGE-BOTSINGEN.md zijn besloten). Gebaseerd op BOUWREGELS.md hoofdstuk 15 en op SYNTHESIS-ANALYSE/DRAAIBOEKEN.md. Voorlopig: dit recept wordt eerst getoetst met de eerste gouden klokles (15.6). Botst iets met BOUWREGELS.md, dan gaat BOUWREGELS.md voor.

**Wat is een gouden les?** Eén les per onderwerp die de inhoud van onze Squla-les (leerdoel, getallen, vragen) combineert met het echt waargenomen verloop van de passende Synthesis-les. Die les is daarna het voorbeeld voor alle andere lessen van dat onderwerp (15.1).

**Eerst toestemming.** Bouw pas als Sara zegt dat het mag (15.6). Volgorde: eerst klokkijken, dan de andere onderwerpen, dan pas de gewone lessen.

---

## 1. Bronnen: wat je leest vóór je begint

Lees in deze volgorde:

1. **CLAUDE.md** — de harde regels (vooral 1, 2, 3, 7, 8, 9 en 10).
2. **BOUWREGELS.md** — helemaal, met bovenaan de 3 rondes van 8 november en hoofdstuk 15.
3. **BLIEPO-KARAKTER.md** — wie Bliepo is, hoe hij praat, het vaste rijtje lof en eindzinnen.
4. **SYNTHESIS-ANALYSE/KOPPELING.md** — welke Synthesis-les bij jouw onderwerp hoort, en of die "echt hetzelfde" of "vervangend" is.
5. **SYNTHESIS-ANALYSE/DRAAIBOEKEN.md** — het draaiboek van jouw onderwerp: de stappen, de reacties per soort vraag, de tijden en de lijst NIET GEZIEN.
6. **De Squla-les zelf** (`src/components/les/lessen/squla-*.tsx`) en de notities in **SQULA-VOORTGANG.md** — de vragen, getallen en antwoorden die je gebruikt.
7. **FOUTEN-VOORBEELDEN.md** (F1 t/m F6) en **WOORDEN-GROEP3.md** — fouten die je niet maakt en woorden die je wel en niet gebruikt.
8. **ONTWERPREGELS.md** — uiterlijk en bediening (BOUWREGELS gaat voor).
9. **OVERIGE-BOTSINGEN.md** — wat in de vierde ronde is besloten (punt 1 t/m 14). Punt 15 t/m 30 zijn oudere twijfels; kies daar de veiligste weg en schrijf het op (zie stap 9).

---

## 2. Voorbereiden

1. **Kies het draaiboek.** Zoek je onderwerp op in KOPPELING.md. Is de les "vervangend" of staat het onderwerp op "laten liggen" (Vormen, Rekenmix, Geld, Tijd/Dagen, Meten), dan bouw je niet en meld je dat.
2. **Check of het draaiboek bouwklaar is** (15.4). Staan er punten onder NIET GEZIEN die jouw les raken, schrijf ze op. Vul ze nooit op met een gok.
3. **Maak een koppellijst.** Zet in een tabel naast elkaar: elke stap van het draaiboek, en welke Squla-vraag of -uitleg daar komt. Elke draaiboekstap krijgt een stap in onze les, in dezelfde volgorde.
4. **Tel de vragen.** Alle vragen van de Squla-les komen erin, geen enkele valt weg en er komt er geen bij (zie 4). Minimaal 15 (11.1).
5. **Noteer wat anders moet voor Nederland** (draaiboek, deel "Nederland, Bliepo en Squla"): "half 5" = 4:30, euro's, geen a.m./p.m., geen mensen.
6. **Raak de oude les niet aan.** De gouden les is een nieuw bestand. De bestaande Squla-les blijft precies zoals hij is.
7. **Maak de fouttabel (vijfde ronde, BOUWREGELS 15.9, 14.36).** Maak een bestand `FOUTTABEL-<les>.md` (voorbeeld: FOUTTABEL-squla-klok-gouden.md). Per vraag een tabel, met per fout antwoord (bij sleep- en invulvragen de meest voorkomende foute antwoorden) een rij:

   | Fout antwoord | Waarschijnlijke denkfout | Eerste zin van Bliepo | Hint | Op het scherm |
   |---|---|---|---|---|

   - **Denkfout:** kies een naam uit de vaste lijst (verkeerde wijzer, getal ernaast, 1 te veel, 1 te weinig, plus en min verwisseld, groter en kleiner verwisseld, andere kant van de klok, …) of **"niet duidelijk"**. Verzin geen reden.
   - **Eerste zin:** laat merken dat Bliepo snapt wat het kind dacht, met inhoud ("Je keek naar de lange wijzer."), zonder "fout", zonder naam, zonder vaste opening. Bij "niet duidelijk": een zin uit het rijtje in BLIEPO-KARAKTER.md §10.
   - **Hint:** pakt precies die denkfout aan, wijst naar 1 keuze (14.31), verklapt het antwoord niet.
   - **Op het scherm:** oranje ring (klok, alleen bij hint/doel/2× fout), hulphandje, blokken op een rij, samen tellen, een wijzer die oplicht.
   - Per vraag ook: de **uitleg na de 2e fout** per denkfout, een **andere uitleg** voor als dezelfde denkfout 2 keer komt, en het **samen voordoen** (sinds 9 november 2026 allebei bij de 2e fout; vroeger: uitleg zonder antwoord na de 2e fout en samen voordoen na de 3e, nu **vervangen**, 15.11).
   - Zet bij elke rij welke denkfout in de voortgang wordt bewaard (15.9, punt 4).
   Bouw de reacties in de code pas als de tabel af is. Geen vraag zonder tabel.

---

## 3. Het verloop, stap voor stap

Volg per stap het draaiboek. Hieronder staat wat bij elke stap altijd geldt.

### 3.1 Beginscherm
- Standaard **geen startvraag** (hoofdstuk 4, besluit 12). Bliepo vertelt in een eigen zin wat het kind in deze les gaat doen (4.3, 4.4), en dan komt de eerste stap.
- Heeft het draaiboek wél een startvraag (nu alleen de klok), dan: **Ja = een proef van 2 opgaven; maakt het kind in de proef 2 fouten, dan krijgt het alsnog de uitleg (de Nee-route van BOUWREGELS 4.5). Nee = de uitleg.** Heeft het draaiboek geen startvraag, dan komt er ook geen (4e ronde).
- Nooit een "Weet ik niet"-knop (1.27).

### 3.2 Uitleg
- Volg de uitlegstappen van het draaiboek in dezelfde volgorde en met dezelfde betekenis, in eigen woorden.
- Eén ding tegelijk, en woorden en beeld horen bij hetzelfde moment (3.19).
- Wat Bliepo noemt, wijst hij aan met het rode rondje (7.8). Bij de klok: gloed om de wijzer waar Bliepo over praat. De **oranje** ring om het getal komt **alleen bij een hint, een doel (klok zetten) of na 2 keer fout**, en er staat 1 ring tegelijk (7.8e, 7.9).
- Knoppen leg je per kind en per soort knop 1 keer uit. Er is nog geen opslag voor "dit kind kent de knop"; tot die er is, leg je een knop de eerste keer **per les** uit (3.15).

### 3.3 Kleine stap
- Waar het draaiboek het kind iets laat doen (tikken, slepen, zetten), doet het kind dat bij ons ook.
- Het is een echte handeling, geen beschrijving.

### 3.4 Vraag
- De vraag komt met de keuzes tegelijk in beeld (zoals Synthesis).
- Zelfde soort vraag = zelfde schooltermen (3.11). Gebruik woorden uit WOORDEN-GROEP3.md.
- Het goede antwoord staat niet steeds op dezelfde plek (1.23).
- Kleur van een getal = kleur van het voorwerp waar het naar verwijst; **wit alleen voor een getal zonder voorwerp** (2.1, 2.2, 14.27).
- Een vakje om een getal alleen als de plek anders niet als invulplek of keuze te herkennen is (1.4, 2.4).

### 3.5 Nakijken
- **Keuzevraag:** de tik is het antwoord, de knoppen verdwijnen meteen; geen gloed en geen rood om de keuze (6.5, 7.6, 7.8a).
- **Tikken op een groep in beeld:** de gekozen groep krijgt **alleen een vinkje**, geen gele rand en geen gloed. Nog een tik haalt het vinkje weg (6.5, 7.8a).
- **Invullen, slepen, zetten:** de knop Controleer (vinkje).
- **Splitsen:** vanzelf nagekeken zodra het totaal klopt. Elk juist antwoord telt als goed (14.30).
- De reactie van Bliepo begint 0,2 tot 0,4 seconde na de klik (6.10).

### 3.6 Goed
- Bliepo's scherm kleurt 1 seconde groen (5.3).
- Een korte lofzin uit het rijtje in BLIEPO-KARAKTER.md, eventueel met een korte reactie op wat het kind koos.
- **Goed na een fout** (na 1 fout, 2 fouten of in de 3e poging): alleen een korte bevestiging, geen grote lof.
- Een lichtflits of golf bij goed mag (7.6), zonder gloed om de keuze.
- Daarna verder zoals het draaiboek zegt: vanzelf (na de gemeten tijd) of op de blauwe pijl (6.9).

### 3.7 Fout (1e, 2e) — 9 november 2026: 2 pogingen, de 3e is vervangen (15.11)
**Nieuw (15.11):** 1e fout = hint uit de fouttabel en nog 1 keer proberen. 2e fout = Bliepo legt het uit **en doet het samen voor** (het goede antwoord nu in beeld, het kind doet 1 kleine stap); daarna gaat de les verder. Goed na een fout = alleen een korte bevestiging. Wat hieronder over de 3e poging staat, is vervangen.

Bij elke fout: Bliepo's scherm kleurt 1,5 seconde rood, geen fout-geluidje, nooit het woord "fout", geen rood op de keuze (5.3).
**Vijfde ronde (BOUWREGELS 15.9):** alles hieronder komt uit de **fouttabel** van de vraag (stap 2.7). 1e fout: vraag en knoppen even weg, eerste zin plus hint voor de denkfout, het beeld uit de tabel, dan komt de vraag terug. 2e fout: uitleg die past bij de denkfout van de nieuwe keuze, zonder het antwoord. 3e fout: samen voordoen en door. **Twee keer dezelfde denkfout:** Bliepo zegt dat vriendelijk en legt het op een andere manier uit. Nooit dezelfde zin 2 keer achter elkaar. De denkfout gaat naar de voortgang.
- **1e fout:** een korte reactie op wat het kind koos. Een hint in beeld alleen als die bij de vraag past. Het kind probeert meteen opnieuw (5.1). Bij een keuzevraag verdwijnt de vraag tijdens de hint, maar de hint zegt waar het over gaat; bij een opdracht blijft de opdrachtregel staan (14.32). De hint wijst naar precies 1 keuze (14.31).
- **[VERVANGEN 9 nov, 15.11]** **2e fout:** Bliepo legt uit waarom en waar het kind op moet letten, **zonder het goede antwoord te laten zien**. Daarna een **3e poging** (5.1). *Nu: bij de 2e fout uitleg en meteen samen voordoen.*
- **[VERVANGEN 9 nov, 15.11: nu bij de 2e fout]** **3e fout:** Bliepo doet het **samen met het kind voor**, laat nu pas het goede antwoord zien, het kind doet **1 kleine stap**, en de les gaat **gewoon verder** (5.1, 5.4). Nooit stoppen, nooit het hoofdmenu, geen pauze.
- Elke fout-reactie is voor deze vraag en dit antwoord geschreven; geen vaste openingen (5.10, 5.11).

### 3.8 Hulp die vanzelf komt
- **Ronde 15:** bij een opdracht komt de **aanmoediging samen met het hulphandje**; bij een keuzevraag zegt Bliepo niets als het kind nadenkt (zoals Synthesis).
- Het **hulphandje komt vanzelf**, met 1 korte zin van Bliepo; er is geen knop (5.10). Het wijst aan wat het kind moet doen; het kind doet de laatste tik zelf.
- Bij een **opdracht** (tikken, slepen, zetten) komt na 5 à 6 seconden zonder handeling vanzelf het hulphandje, met 1 korte zin van Bliepo. Bij een **keuzevraag** komt niets (6.10). Een rondje alleen als Bliepo iets noemt.

### 3.9 Verder-pijl (DEFINITIEF, 10 november 2026, nieuwe regel van Sara, BOUWREGELS 15.27)
- Bliepo praat door: na elk stuk tekst ±0,7 s na het einde van de zin vanzelf verder, ook na lof, uitleg en hint.
- De pijl staat rechts onder de tekst als snelkoppeling (tik = stem stopt, meteen door). Geen pijl bij vragen, opdrachten (ook niet tijdens de opdrachtzin), hulphandje en eindkaart.
- Zet in elke nieuwe of omgezette gouden les `pijlZoalsSynthesis: true`, `stemHeelUitpraten: true` en `woordenMeeMetStem: true` aan (skelet).
- *[Vervangen: de eerdere 3.9 met "wacht op een tik bij de hint na de 1e fout en uitleg die iets nieuws afsluit".]*

### 3.9a Woorden lichten op met de stem (Sara, 10 november 2026, BOUWREGELS 3.7)
- Elk woord licht op op het moment dat Bliepo het zegt (± 150 ms), zoals Synthesis (per woord, gedimd → wit; bij ons het woord van nu oranje). Niets verspringt.
- Zet in elke nieuwe of omgezette gouden les `woordenMeeMetStem: true` aan (skelet, naast `pijlZoalsSynthesis` en `stemHeelUitpraten`). Voorbeeld: squla-minsommen-gouden.tsx.
- Meet met het woorden-meetscript in een zichtbare Chrome met de echte stem: `LESSEN=<les-id> IJK=1 node scripts/test-woord-oplichten.mjs` (via het lesoverzicht, als Testkind). Eis: elk woord licht apart op (geen sprong), de zin wordt nooit in 1 keer wit vóór Bliepo begint (F10), afwijking per woord zo klein als de stem toelaat (doel ± 150 ms). De oude route `woorden` in scripts/test-minsommen-gouden.mjs mag ook nog.
- Een zin blijft gedimd zolang de stem onderweg is (lib/stem.ts `stemOnderweg`); de woordtijden van de Google-stem komen uit het spreekmodel `GOOGLE_NL` (lib/voorlezen.ts). Niets per les instellen: de optie `woordenMeeMetStem` regelt het (BOUWREGELS 3.7, aanvulling 11 november).

### 3.9b Vaste zones (Sara, 10 november 2026, BOUWREGELS 15.30)
- Bliepo, het tekstvak (pijl rechtsonder, vaste plek), het speelvlak en de knoppen hebben elk een vaste zone; niets verspringt, Bliepo valt nooit over de tekst. Een nieuw stuk tekst staat er in 1 keer op dezelfde plek (gedimd tot Bliepo het zegt).
- Meet met het overlap-script op 1440×900, 1280×720, 1536×864 en 1024×768; maak een schermfoto van het langste stuk.

### 3.10 Tempo
- Reactie 0,2 tot 0,4 seconde na de klik.
- Vanzelf door: gebruik de gemeten tijd uit het draaiboek (bijvoorbeeld 0,5 tot 0,7 seconde bij de klok).
- **Heel snel geantwoord (volg het draaiboek):** alleen als het draaiboek van jouw onderwerp bij een snel antwoord een opmerking heeft, zegt Bliepo ook kort iets uit BLIEPO-KARAKTER.md. De grens is die uit het draaiboek; heeft het draaiboek wel een opmerking maar geen grens, dan binnen 2 seconden na het einde van de vraag. **Bij Tellen, Min en Getallenlijn zegt Bliepo niets.** Heeft het draaiboek geen opmerking, dan ook niets (6.10).

### 3.11 Rondje, oplichten, klok
- Rondje: rood dubbel rondje, alleen als Bliepo iets noemt, 1 tegelijk, blijft zolang hij erover praat, weg als het iets zou verklappen (7.8).
- Geen zachte rondjes: wat al genoemd is blijft zichtbaar als gekleurd getal, boog of nummer (7.8d).
- Klok: gloed langs de rand van de wijzer waar Bliepo over praat en de andere wijzer vervaagt. De **oranje** ring om het getal komt alleen bij een hint, een doel (klok zetten) of na 2 keer fout, 1 ring tegelijk (7.8e, 7.9).

### 3.12 Einde
- Een eindzin uit het rijtje in BLIEPO-KARAKTER.md (3.13).
- Verder zoals het draaiboek (bijvoorbeeld een eindkaart), in onze eigen stijl.

---

## 4. Wat NOOIT mag

> **⭐ DEFINITIEF (Sara, 10 november 2026, nieuwe regel; BOUWREGELS 15.27): Bliepo praat door.** Na elk stuk tekst gaat de les vanzelf verder, ±0,7 s nadat de zin klaar is, ook na lof, uitleg en de hint na een fout. Het kind hoeft nooit op de pijl te wachten. De pijl staat rechts onder de tekst als snelkoppeling (Sara's keuze; Synthesis: links): een tik stopt de stem en gaat meteen door. Alleen bij vragen en opdrachten wacht de les op het antwoord; daar staat geen pijl (ook niet tijdens de opdrachtzin). Geen pijl bij het hulphandje en de eindkaart. **Skelet van elke nieuwe of omgezette gouden les:** `pijlZoalsSynthesis: true` en `stemHeelUitpraten: true` in het draaiboek (zie zegDoor en zegOpdracht in squla-klok-gouden.tsx; lib/stem.ts heelUitpraten). Nu alleen in de gouden klokles.
> *[VERVANGEN op 10 november 2026, was een foutje; ter herinnering.] Eerdere regel: "de hint na de 1e fout en uitleg die iets nieuws afsluit wachten op een tik; bij een opdracht een pijl tijdens de opdrachtzin". Daarvóór: "elk blok eindigt met de pijl, nooit vanzelf door".*

- **Letterlijk overnemen** van Synthesis: geen tekst, audio, beelden of code, ook niet vertaald (15.2). Wel dezelfde betekenis op hetzelfde moment.
- **Letterlijk overnemen van Squla:** geen teksten, plaatjes of geluiden (11.5).
- **Eigen vragen toevoegen** die niet in de Squla-les staan, of nieuwe leerdoelen bedenken (11.11).
- **Vragen of keuzes weglaten**, ook foute keuzes niet (1.25, harde regel 3). Wat toch weg moet, eerst vragen.
- **Een hint die het antwoord verklapt** (15.17): geen pijl of ring die op het antwoord eindigt, geen zin die het antwoord is. Wijs naar de plek, niet naar het antwoord.
- **Een les stoppen of het kind naar het menu sturen** (15.18), ook niet na veel fouten en ook als Synthesis dat wel doet.
- **Het hulphandje als knop** of bij keuzevragen (15.19). Het komt vanzelf, na ongeveer 6 seconden, alleen bij opdrachten.
- **Inhoud van Squla veranderen** (15.22): vragen, getallen en antwoordkeuzes blijven die van Squla. Alleen duidelijke fouten mogen klein hersteld worden (fout antwoord dat als goed telt; 2 goede antwoorden; onbeantwoordbare vraag; plaatje of zin die niet klopt; woord dat een kind van 6 niet snapt), elk met een regel in KEUZES-VOOR-SARA.md. Een vraag vervangen of weglaten: eerst Sara vragen.
- **Opdrachtjes toevoegen die Synthesis in dat onderwerp niet heeft** (15.22). Toegestane extra's komen per les in een lijstje in KEUZES-VOOR-SARA.md. Een soort vraag waarvoor Synthesis niets heeft: zelfde skelet, hints en fouttabel gemarkeerd "eigen invulling, niet van Synthesis".
- **Een draaiboek bouwklaar noemen terwijl de Synthesis-les niet helemaal gespeeld is** (15.24). Les altijd van begin tot einde spelen; bij pauze het tabblad voorop; lukt het niet, "niet compleet" melden. Elk draaiboek zegt "helemaal gespeeld: ja/nee".
- **Minsommen: de teller laat het antwoord zien** terwijl de vraag nog open is (15.20).
- **De oude les wijzigen.** De bestaande Squla-les blijft zoals hij is.
- **Een gat in het draaiboek opvullen met een gok** (15.4). Zet het in KEUZES-VOOR-SARA.md.
- **Content in de database zetten** (harde regel 2), oude lessen van vóór 27 oktober aanraken (harde regel 8), of tegoed boven 5.000 gebruiken zonder toestemming (harde regel 9).
- Mensen, poppetjes of dingen met een gezichtje (1.1, 1.2), een "Weet ik niet"-knop (1.27), een getekend cijfertoetsenbord (harde regel 5).

---

## 5. Testen en meten

Test als **Testkind** (groep 3), nooit als een echt kind (12.1). Speel elke situatie en meet de tijden. Vergelijk ze met het draaiboek.

| Situatie | Wat je controleert |
|---|---|
| Goed in 1 keer | Korte lof uit het rijtje, groen scherm 1 s, verder zoals het draaiboek (vanzelf of pijl) |
| Goed na een fout (ook in de 3e poging) | Alleen een korte bevestiging, geen grote lof |
| 1e fout | Rood scherm 1,5 s, reactie op de keuze, hint alleen als die past, meteen opnieuw |
| 2e fout | **(9 nov: 2 pogingen)** Uitleg en samen voordoen, nu pas het antwoord in beeld, 1 kleine stap, les gaat door *(oude regel: uitleg en een 3e poging; vervangen)* |
| 3e fout | *Bestaat niet meer (15.11).* |
| Voortgang | Per vraag: goed in één keer, goed na een fout of samen gedaan; alleen "goed in één keer" telt mee voor beheersing |
| Spiegelbeeld | Bijvoorbeeld 10 kiezen bij 2: eigen denkfout `spiegelbeeld`, eerste zin zegt links/rechts |
| Lang wachten (30 s of meer) | Opdracht: hulphandje vanzelf met 1 korte zin na 5 à 6 s. Keuzevraag: geen aanwijzing. Les loopt nooit vast (5.7) |
| Startvraag (alleen klok) | Ja = proef van 2 opgaven; 2 fouten in de proef = alsnog de uitleg |
| Groep tikken | Alleen een vinkje, geen rand of gloed; nog een tik haalt het vinkje weg |
| Heel snel (0,3 s) | Alleen een korte opmerking als het draaiboek er een heeft; bij Tellen, Min en Getallenlijn niets |
| **Elk fout antwoord apart** (vijfde ronde) | Kies per vraag elk fout antwoord uit de fouttabel minstens 1 keer. Klopt de eerste zin met de denkfout? Past de hint bij wat je ziet? Verklapt niets het antwoord? Is de denkfout bewaard? |
| **2 keer dezelfde denkfout** | Bliepo zegt vriendelijk dat het weer hetzelfde was en legt het op een andere manier uit; geen zin 2 keer achter elkaar |
| **2e fout met een andere denkfout** | De uitleg past bij de nieuwe denkfout, zonder het antwoord |
| **Denkfout niet duidelijk** | Een zin uit het rijtje (BLIEPO-KARAKTER.md §10) en een algemene hint; geen verzonnen reden |

**Test per foute keuze (14.37):** leg per vraag in een tabel vast: gekozen antwoord, denkfout volgens de fouttabel, wat Bliepo zei, wat er op het scherm gebeurde, klopt het (ja/nee + reden).

Leg per situatie in een tabel vast: reactietijd na de klik, spreektijd, tijd tot de volgende stap. Wijkt een tijd duidelijk af van het draaiboek, pas het aan of schrijf de reden op.

Maak schermfoto's op laptop én telefoon (12.2). Controleer het rondje echt op het scherm (12.13).

---

## 6. Logica-controle

Loop elke vraag na (SQULA-VOORTGANG.md, plan logica-controle):
- **Kwaliteitsregel 9:** één juist antwoord, óf alle juiste antwoorden worden goed gerekend (14.30).
- Elke hint wijst naar precies 1 keuze (14.31).
- Keuzevraag: tijdens de hint weet het kind waar het over gaat; opdracht: de opdrachtregel blijft staan (14.32).
- Eenvoudige woorden (14.33, WOORDEN-GROEP3.md); het werkwoord past bij wat het kind doet (14.35).
- Alle sommen, tijden en bedragen kloppen (11.9).
- Geen van de fouten F1 t/m F6 uit FOUTEN-VOORBEELDEN.md.
- **Fouttabel (vijfde ronde, 14.36):** elke vraag heeft er een; elke fout heeft een passende reactie; de hint past bij wat het kind ziet; geen hint verklapt het antwoord; "niet duidelijk" heeft geen verzonnen reden; er is een andere uitleg voor dezelfde denkfout 2 keer.
- Draai `npm run inhoudsvergelijk`: geen vraag of keuze verdwenen (1.26).

---

## 7. Kind-test door een aparte helper

- Een **aparte helper** (Sonnet, bouwt niet mee) speelt de les alsof hij een kind van 6 is. Hij ziet alleen het scherm en hoort alleen wat Bliepo zegt.
- Hij keurt af als hij twijfelt, als hij 2 goede antwoorden ziet, of als een zin niet klopt met het beeld.
- **Hij kiest bewust verschillende foute antwoorden** (vijfde ronde, 14.37): elk fout antwoord uit de fouttabel minstens 1 keer, en 1 keer dezelfde denkfout 2 keer achter elkaar. Per fout schrijft hij op of Bliepo's reactie klopt met de denkfout.
- Daarna keurt de onafhankelijke controleur de les op alle regels van BOUWREGELS.md (12.3). Verslag in CONTROLE-SQULA.md.
- Afgekeurd = verbeteren en opnieuw laten keuren.
- Geef elke helper de harde regels mee, zeker 8 en 9 (harde regel 10). Hooguit 3 helpers tegelijk.

---

## 8. Vloeiend-controle

- Zet het nieuwe Phaser-scherm in de lijst `SCHERMEN` van `scripts/vloeiendcontrole.mjs` en laat het `window.__phaser` zetten.
- Draai `npm run vloeiend` als de computer rustig is (geen helpers of tests ernaast).
- Eis: 55 tot 60 beeldjes per seconde, geen hapering boven 50 ms, openen binnen 1 seconde, op laptop én trage telefoon (10.1).
- Haalt hij dat niet: eerst oplossen (gloed bakken, minder deeltjes, kleinere plaatjes).

---

## 9. Wat in KEUZES-VOOR-SARA.md komt

Vraag niet tussendoor (12.10). Zet in KEUZES-VOOR-SARA.md, onder een nieuw kopje met de naam van de les:
- elke afwijking van het draaiboek, met de reden (15.5);
- elk punt uit NIET GEZIEN dat je les raakt, en wat je toen veilig koos;
- elk nog open punt uit OVERIGE-BOTSINGEN.md (punt 15 t/m 30) dat je moest kiezen;
- nieuwe zinnen zonder opgenomen stem (die komen ook in STEMZINNEN.md);
- de tijden die afwijken van het draaiboek;
- de kosten van Magnific, als je plaatjes maakte.

---

## 10. Opslaan

- Commit alleen naar de back-upbranch **`backup-squla`**, met "controle overgeslagen" in de commitregel als je de controle overslaat (12.7).
- Nooit naar `main` en nooit online zonder alle controles groen én Sara's "zet online" (12.9).
- Wil Sara de les zien, dan op de laptop of op de back-upbranch.
