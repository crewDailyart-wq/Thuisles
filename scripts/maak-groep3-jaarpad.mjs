import fs from 'node:fs';

// Originele voorbeeldplanning. Geen verplichte landelijke dag- of weeknorm.
// Per week: rekenen, lezen/taal en spelling/schrijven. Dagen 4 en 5 herhalen.
const groepen = {
 R: ['Rekenen', 'Getallen herkennen|Getallen schrijven|Tellen|Getalvolgorde|Hoeveelheden|Vergelijken|Splitsen|Aanvullen|Optellen|Aftrekken|Rekenstrategieën|Rekentaal|Sommen in verhalen|Sprongen tellen|Getallen tot 100|Geld|Tijd|Meten|Meten met eenheden|Meetkunde|Ruimtelijke begrippen|Patronen|Tabellen en afbeeldingen'],
 L: ['Lezen', 'Letterkennis|Klanken horen|Klank-letterkoppeling|Woorden ontsleutelen|Lettercombinaties|Zinnen lezen|Korte teksten|Leesbegrip|Verhaal volgen|Leesplezier|Leesvloeiendheid'],
 S: ['Spelling', 'Klanken analyseren|Klanken opschrijven|Klankzuivere woorden|Letters en woorden|Klankgroepen|Woordpatronen|Hoofdletters|Spelling controleren'],
 W: ['Schrijven', 'Handschrift|Woorden schrijven|Zinnen maken|Zinsgrenzen|Eigen tekst|Schrijfdoel'],
 M: ['Mondelinge taal', 'Luisteren|Instructies|Vertellen|Gesprek voeren|Woordenschat|Uitleg geven'],
 T: ['Taalbegrip', 'Woordbetekenis|Zinsbegrip|Rijm en klanken|Taalbegrippen'],
};
const doelen = Object.entries(groepen).flatMap(([prefix,[vak,onderdelen]]) => onderdelen.split('|').map((onderdeel,i)=>({id:`${prefix}${String(i+1).padStart(2,'0')}`,vak,onderdeel,bron:'Gebruikerstabel; eigen uitwerking met SLO als referentiekader'})));

// titel | doelen | drie kleine, observeerbare stappen | materiaal/voorbeeld
const rekenen = `
Tellen tot 5|R01,R03,R05|Wijs bij elk telwoord één voorwerp aan;Koppel de cijfers 1 tot 5 aan een hoeveelheid;Leg zelf een gevraagde hoeveelheid tot 5|5 blokjes, cijferkaartjes 1–5
Getallen tot 10|R01,R02,R03|Lees en schrijf de cijfers 0 tot 5;Tel voorwerpen van 6 tot 10 één voor één;Leg bij de cijfers 0 tot 10 het juiste aantal en schrijf het cijfer|10 blokjes, papier en cijferkaartjes 0–10
Meer, minder, evenveel|R06,R12|Maak twee groepjes even groot door te koppelen;Wijs het grootste en kleinste groepje aan;Vertel hoeveel er bij moet om evenveel te krijgen|Groepjes van 3, 5 en 7 blokjes
De rij tot 10|R03,R04|Tel vanaf 4 verder tot 10;Noem het getal vóór en na een getal tot 10;Vul één ontbrekend getal in een telrij in|Kaartjes 0–10, leg bijvoorbeeld 3, 4, leeg, 6
Vijf in één blik|R05,R11|Herken 1 tot 3 zonder te tellen;Herken 4 en 5 in een vaste dobbelsteenstructuur;Leg dezelfde hoeveelheid op twee manieren|Dobbelsteenbeelden 1–5, 5 blokjes
Splitsen tot 5|R07,R12|Verdeel 3 blokjes in twee groepjes;Vind verschillende splitsingen van 4;Vul het ontbrekende groepje bij 5 aan|5 blokjes, twee bakjes en één doek
Erbij tot 5|R09,R11,R12|Laat zien wat erbij betekent;Voeg twee groepjes samen en tel het totaal;Lees en maak een plussom tot 5|2 blokjes plus 1, 3 plus 2, 4 plus 1
Eraf tot 5|R10,R11,R12|Laat zien wat eraf betekent;Haal voorwerpen weg en tel wat overblijft;Koppel een minsom tot 5 aan de handeling|5 blokjes waarvan 1, 2 of 3 worden weggehaald
Vormen en plekken|R20,R21|Herken cirkel, driehoek en vierkant;Onderscheid een rechthoek van een vierkant;Leg een voorwerp boven, onder en tussen andere voorwerpen|Papieren vormen en drie speelgoedfiguren
Tien in één blik|R05,R08,R11|Herken 6 en 7 als 5 en nog wat;Herken 8 tot 10 met de vijfstructuur;Vul een tienveld aan en vertel hoeveel ontbreekt|Tienveld met 6, 7, 8 of 9 stippen
Splitsen tot 10|R07,R08|Splits 6 en 7 met blokjes;Splits 8 en 9 op verschillende manieren;Vind de getallenparen die samen 10 zijn|10 blokjes en twee bakjes
Optellen tot 10|R09,R11|Tel door vanaf het grootste groepje;Gebruik de vijfstructuur bij een plussom;Los een som tot 10 op en vertel je aanpak|4+3, 5+4 en 6+2 met blokjes
Aftrekken tot 10|R10,R11|Laat een minsom tot 10 met blokjes zien;Tel terug vanaf een getal tot 10;Gebruik een bekende splitsing bij aftrekken|8−3, 9−4 en 10−6
Verhalen tot 10|R12,R13|Herken in een verhaal of er iets bij komt;Herken in een verhaal of er iets af gaat;Bedenk bij een som een eigen kort verhaal|Er zitten 4 vogels, 3 komen erbij. Er zijn 8 appels, 2 gaan weg.
Lengte en gewicht|R18,R19|Leg twee voorwerpen met hetzelfde beginpunt naast elkaar;Orden drie voorwerpen van kort naar lang;Vergelijk zwaar en licht met een balans|Potloden, stroken papier, blokjes en eenvoudige balans
Getallen tot 20|R01,R02,R03|Lees en schrijf de getallen 11 tot 15;Lees en schrijf de getallen 16 tot 20;Leg getallen 11 tot 20 als tien en losse eenheden|20 blokjes, papier, tienveld en getalkaartjes
Buren tot 20|R03,R04|Tel verder vanaf een willekeurig getal tot 20;Tel terug vanaf 20 tot 10;Noem het getal tussen twee getallen tot 20|Kaartjes 0–20 en een getallenlijn
Erbij en eraf tot 20|R09,R10,R11|Reken 10 plus een getal tot 9 uit;Tel bij een getal boven 10 enkele erbij zonder tientalpassage;Haal van een getal boven 10 enkele af zonder tientalpassage|10+4, 13+3, 18−5 op een getallenlijn
Dubbelen en bijna dubbelen|R07,R09,R11|Maak de dubbelen 1+1 tot 5+5;Gebruik een bekende dubbel bij een bijna-dubbel;Leg uit hoe 6+6 helpt bij 6+7|Twee gelijke groepjes blokjes, 4+4, 4+5, 6+6
Herkennen en kiezen|R06,R09,R10,R13|Kies bij een kort verhaal een plus- of minsom;Vergelijk twee antwoorden en leg het verschil uit;Los een gemengde reeks sommen tot 10 op|5+3, 9−2, 4+4 en 10−5 met eigen verhaaltjes
Over de tien erbij|R07,R08,R09,R11|Vul 7, 8 en 9 aan tot 10;Splits het tweede getal om eerst 10 te maken;Reken een plussom over 10 uit met twee sprongen|8+4 en 9+5 met tienveld en getallenlijn
Over de tien eraf|R07,R10,R11|Haal van 12 en 14 eerst af tot 10;Splits wat eraf gaat in twee delen;Reken een minsom over 10 uit met twee sprongen|12−5 en 14−6 met blokjes
Meten en vullen|R18,R19|Vergelijk welke beker meer inhoud heeft;Meet een strook met gelijke blokjes zonder gaten;Lees een lengte in hele centimeters vanaf nul af|Twee bekers, water, blokjes, liniaal en stroken tot 10 cm
Munten en betalen|R16,R09|Herken munten van 1 en 2 euro;Leg hetzelfde bedrag tot 5 euro op twee manieren;Betaal een bedrag tot 10 euro precies|Speelmunten van 1 en 2 euro, prijskaartjes
Dagen en hele uren|R17|Zet de dagen van de week op volgorde;Koppel ochtend, middag en avond aan activiteiten;Lees hele uren op een analoge klok|Weekkaart en verstelbare klok, 3 uur, 7 uur en 10 uur
Tientallen verkennen|R14,R15|Tel in sprongen van 10 tot 100;Herken de tientallen 10 tot 100;Maak een getal uit tientallen en losse eenheden|Bundels van tien stokjes, 20, 30 en 42
Getallen tot 100|R02,R04,R15|Lees en noteer getallen met tientallen en eenheden;Koppel een tweecijferig getal aan bundels en losse stokjes;Plaats een getal tussen twee tientallen|24, 37, 61 en 85, tientalstroken
Sprongen en patronen|R14,R22|Tel in sprongen van 2 tot 20;Maak een patroon met twee en drie herhalende elementen af;Bedenk een patroon en beschrijf de herhaling|2,4,6; rood-blauw; cirkel-cirkel-vierkant
Sommenfamilies|R07,R09,R10,R11|Maak bij een splitsing twee plussommen;Maak bij dezelfde splitsing twee minsommen;Gebruik een plussom om een minsom te controleren|De getallen 6, 4 en 10; 8, 5 en 13
Bewegen en bouwen|R20,R21|Beschrijf waar iets staat met links, rechts, voor en achter;Bouw een klein bouwwerk na vanaf een afbeelding;Volg een route van drie eenvoudige aanwijzingen|6 blokjes, foto van een bouwsel en een raster
Informatie lezen|R23|Lees aantallen uit een eenvoudige beeldgrafiek;Lees een turflijst met groepjes van vijf;Beantwoord een vraag bij een tabel met twee kolommen|Zelfgemaakte fruitlijst: appels 4, peren 3, bananen 5
Geld in verhalen|R16,R13|Tel een klein bedrag met euro- en centmunten apart;Kies genoeg geld voor een aankoop tot 10 euro;Bereken wat overblijft na een kleine aankoop|Speelgeld: 10,20,50 cent, 1 en 2 euro; betaal 5 euro voor iets van 3 euro
Klok en kalender|R17|Zeg welke dag gisteren en morgen is;Koppel een hele tijd aan een activiteit;Verken een half uur met de grote wijzer op 6|Weekkalender en oefenklok, half 4 als uitbreiding
Handig tot 20|R08,R09,R10,R11|Kies tussen doortellen, splitsen en een bekende som;Los een plussom over 10 met materiaal op;Los een minsom over 10 op en controleer|7+6, 9+8 en 16−7
Meten in je omgeving|R18,R19,R20|Kies een passend hulpmiddel om lengte te meten;Vergelijk drie voorwerpen op gewicht en licht je keuze toe;Zoek en beschrijf vormen in een kamer|Liniaal, blokjes, balans en voorwerpen uit huis
Verhalen in twee stapjes|R12,R13|Vertel welke gegevens nodig zijn voor een som;Los een verhaal met één bewerking zelfstandig op;Verken een verhaal met twee handelingen met materiaal|Er zijn 8 potloden, er komen 4 bij, daarna gaan 2 weg; uitbreiding met begeleiding
Getallenmix|R01,R03,R04,R15|Orden getallen tot 20 zonder getallenlijn;Lees tientallen en eenheden tot 100;Leg uit waarom 47 tussen 40 en 50 ligt|Getalkaartjes 8,12,17,20,30,47,60
Rekenmix|R07,R08,R09,R10|Haal splitsingen tot 10 uit het geheugen op;Los plussommen tot 10 nauwkeurig op;Los minsommen tot 10 nauwkeurig op|Splits 7 en 9; 6+3, 5+4, 9−6, 10−4
Toepassen in de winkel|R13,R16,R23|Lees prijzen uit een eenvoudige prijstabel;Bereken de prijs van twee artikelen tot 20 euro;Leg uit hoe je een betaling controleert|Appel 2 euro, brood 3 euro, sap 4 euro; speelgeld
Terugkijken en verder|R03,R09,R10,R11|Laat zien welke telstrategie je nu beheerst;Kies een lastige som tot 20 en leg je aanpak uit;Maak een nieuwe gemengde opdracht zonder voorbeeld|Nieuwe getallen bij eerder geoefende vormen; noteer waar nog steun nodig is
`.trim();

const taal = `
Luisteren en klanken|M01,M02,L02,T03|Voer een mondelinge opdracht met één stap uit;Herken of twee woorden rijmen;Hoor de eerste klank van een bekend woord|Zeg: pak een blokje. Rijm: maan-baan, vis-roos. Begin: maan.
Letters m, s en aa|L01,L03,T04|Koppel m en s aan hun klank;Herken aa als één klank met twee letters;Voeg m-aa-n mondeling samen tot maan|m, s, aa; begeleider verklankt maan, nog geen zelfstandige leeseis voor n
Letters i, k en v|L01,L03,L04|Koppel i, k en v aan hun klank;Lees ik en mis met bekende letters;Lees vis en wijs het passende voorwerp aan|ik, mis, vis; gebruik alleen bekende letters
Letters n, t en ee|L01,L03,L04|Koppel n, t en ee aan hun klank;Lees maan en teen door klanken samen te voegen;Lees korte woorden met aa en ee door elkaar|maan, teen, mis, vis
Letters r, p en oo|L01,L03,L04|Herken r, p en oo in woorden;Lees raam, roos en poot;Vertel welk woord past bij een afbeelding|raam, roos, poot, peer
Letters e, o en b|L01,L03,L04|Hoor het verschil tussen e en ee;Hoor het verschil tussen o en oo;Lees pen, bos en ben met bekende letters|pen, peer, bos, boos, ben
Letters d, u en f|L01,L03,L04|Herken d, u en f;Lees dun, mus en fan;Lees drie bekende woorden achter elkaar nauwkeurig|dun, mus, fan, fin, dak
Letters a, l, h en w|L01,L03,L04|Herken a, l, h en w;Lees lam, hek en wip;Lees een korte zin met bekende letters|lam, hek, wip. Sam is in het bos.
Letters z en j, klank oe|L01,L03,L05|Herken z, j en oe;Lees zoem, jas en boek;Kies bij een gelezen woord een passende betekenis|zoem, jas, boek, zoek
Klanken ie, eu en uu|L01,L03,L05|Herken ie, eu en uu als klanken;Lees ziek, neus en muur;Lees korte zinnen met bekende klanken|De mier is in het bos. De muur is hoog; begeleider helpt bij g.
Klanken ui en ei|L01,L03,L05|Herken ui en ei in een woord;Lees huis, muis, reis en teil;Hoor en benoem de middelste klank|huis, muis, reis, teil
Klanken ij, ou en au|L01,L03,L05|Herken ij en vergelijk de klank met ei;Lees hout en saus met hulp bij ou en au;Lees bekende woorden met gelijke klanken maar andere letters|ijs, rij, hout, saus; ei/ij en ou/au zijn onthoudkeuzes
Letters g, sch en ng|L01,L04,L05|Lees gas en gum;Voeg s en ch samen bij schoolwoorden met sch;Herken ng als één klank in ring|gas, gum, schip, ring; sch bestaat uit meerdere klanken
Luisteren en navertellen|M01,M03,L09|Noem wie in een voorgelezen verhaal voorkomt;Vertel wat eerst en daarna gebeurt;Vertel een verhaal met begin, midden en einde na|Begeleider vertelt een eigen verhaal van vier zinnen over een zoekgeraakte bal
Eerste zinnen lezen|L06,L08,T02|Volg een zin van links naar rechts;Vertel wie iets doet in een zin;Kies welke zin past bij een eenvoudige situatie|Sam pakt de jas. De jas ligt op de mat.
Woorden met twee medeklinkers|L04,L05,L11|Lees woorden met twee medeklinkers vooraan;Lees woorden met twee medeklinkers achteraan;Lees bekende korte en langere woorden door elkaar|spin, vlag, kast, tent; introduceer a indien nog onbekend
Woorden met nk en sch|L04,L05|Lees bank en plank met nk;Lees schip en schep met sch;Lees een korte zin met deze woorden|De plank ligt op de bank. Ik pak de schep.
Begrijpen wie en wat|L07,L08|Lees twee samenhangende zinnen;Beantwoord een wie-vraag over de tekst;Beantwoord een wat-vraag en wijs de bijpassende zin aan|Sam heeft een boek. Hij leest in de tuin.
Waar en wanneer|L07,L08,M05|Zoek in een tekst waar iets gebeurt;Herken woorden voor tijd zoals eerst en daarna;Vertel wanneer een gebeurtenis plaatsvindt|Eerst eet Noor thuis. Daarna gaat zij naar het park.
Letters terugvinden|L01,L03,L11|Lees bekende losse letters nauwkeurig;Lees bekende lettercombinaties zonder ze te splitsen;Lees een korte bekende tekst opnieuw met minder haperingen|Herhaal alle geïntroduceerde tekens; vergelijk met eigen eerdere lezing, geen snelheidseis
Woorden en betekenis|T01,M05|Leg een bekend woord met een voorbeeld uit;Kies een woord dat bij een omschrijving past;Gebruik een nieuw woord in een eigen zin|oever, brug, stevig; ondersteun met afbeeldingen of voorwerpen
Instructies lezen|L06,L08,M02|Lees en voer één korte aanwijzing uit;Voer twee aanwijzingen in de goede volgorde uit;Vertel waarom de volgorde belangrijk is|Pak een pen. Leg de pen naast het boek.
Verhaalvolgorde|L07,L09,M03|Kies wat het begin van een verhaal is;Zet drie gebeurtenissen op volgorde;Vertel de gebeurtenissen met eerst, dan en tot slot|Een zaad planten, water geven, een plant zien groeien
Vragen stellen|M04,L08,T02|Stel een vraag over een kort verhaal;Luister naar een antwoord en reageer erop;Gebruik wie, wat of waar in een eigen vraag|Eigen verhaal over een bezoek aan de winkel; voer een echt gesprek
Betekenis uit de context|T01,M05,L08|Wijs een onbekend woord aan in een voorgelezen zin;Gebruik de rest van de zin om een betekenis te bedenken;Controleer je idee met een afbeelding of uitleg|De beker is leeg: er zit geen water meer in. Het pad is smal: er past maar één kind naast elkaar.
Meerlettergrepige woorden|L04,L05,L11|Lees twee bekende woorddelen achter elkaar;Lees korte samengestelde woorden;Lees een zin met een samengesteld woord|voet-bal, zak-lamp, vis-kom; geen openlettergreepregel vereist
Vlot en precies lezen|L06,L11|Lees een bekende zin met alle woorden in de juiste volgorde;Stop kort bij een punt;Lees een korte tekst opnieuw met passende pauzes|Sam zit op de bank. Hij pakt een boek. Dan leest hij.
Een informatieve tekst|L07,L08|Vertel waar een korte informatieve tekst over gaat;Haal één genoemd feit uit de tekst;Beantwoord een vraag met informatie uit de tekst|Een bij heeft zes poten. Een bij bezoekt bloemen. Begeleider helpt bij onbekende woorden.
Samen praten|M03,M04,M06|Vertel over iets dat je hebt gemaakt;Wacht op een vraag en geef een passend antwoord;Leg in twee stappen uit hoe je iets deed|Bouw samen een brug met zes blokjes
Boek kiezen en vertellen|L10,L09,M03|Kies een boek op basis van titel en afbeelding;Vertel wat je leuk vindt aan een verhaal;Vertel één gebeurtenis uit het boek na|Een passend eigen boek, samen lezen mag
Zinnen begrijpen|T02,L06,L08|Vertel wie iets doet in een zin;Vergelijk twee zinnen met omgewisselde personen;Leg uit hoe woordvolgorde de betekenis verandert|Sam helpt Noor. Noor helpt Sam. Geen ontledingstermen nodig.
Taal om over taal te praten|T04,L01,L06|Wijs een letter en een woord aan;Tel woorden in een korte zin;Wijs begin en eind van een verhaal aan|De kat zit op de mat. Een zelfgekozen boek.
Luisteren en onthouden|M01,M02|Onthoud twee gegevens uit een korte uitleg;Voer een opdracht met drie bekende stappen uit;Vertel met eigen woorden wat de opdracht was|Pak een boek, leg het op tafel, ga ernaast staan
Verbanden in een verhaal|L07,L08,L09|Noem een gebeurtenis uit een korte tekst;Leg een eenvoudig omdat-verband uit dat in de tekst staat;Voorspel een passend vervolg met een reden|Het regent. Daarom pakt Noor haar jas. Wat kan zij daarna doen?
Woorden vergelijken|T01,T03,M05|Noem twee woorden die op elkaar rijmen;Zoek een woord met dezelfde beginklank;Benoem een tegenstelling in een concrete situatie|huis-muis, maan-mat, vol-leeg, hoog-laag
Een mening vertellen|M04,L10|Vertel welk verhaal je liever leest;Geef één reden voor je keuze;Luister naar een andere keuze en stel een vraag|Twee passende korte verhalen of boeken
Lezen in het dagelijks leven|L06,L07,L08|Lees een kort briefje;Haal de belangrijkste boodschap eruit;Voer een passende actie uit|Ik ben in de tuin. Pak je jas. Kom je ook?
Leesmix|L04,L05,L11|Lees een nieuwe reeks bekende woordtypen;Lees drie zinnen met passende pauzes;Herstel een leesfout door de zin opnieuw te lezen|Nieuwe klankzuivere woorden en samenstellingen met bekende letters
Vertellen met bewijs|L08,M03,M06|Beantwoord een vraag over een tekst;Wijs aan waar het antwoord staat;Vertel hoe je het antwoord vond|Een eigen tekst van vier zinnen over een picknick
Mijn leesjaar|L07,L09,L10,L11|Kies een tekst die je zelfstandig kunt lezen;Lees en vertel de belangrijkste gebeurtenis;Vertel wat je graag verder wilt leren lezen|Een zelfgekozen passende tekst; begeleider noteert nauwkeurigheid en begrip
`.trim();

const schrijven = `
Tekenen en schrijfbewegingen|W01,W06,S01|Teken lijnen van boven naar beneden en van links naar rechts;Vertel wat jouw tekening betekent;Leg voor elke losse klank van een kort gesproken woord een fiche|Papier, dik potlood; gesproken woord ik met twee klanken
Letters m en s schrijven|W01,S02,S04|Vorm de m met een passend schrijfvoorbeeld;Vorm de s met een passend schrijfvoorbeeld;Schrijf m of s bij de gehoorde klank|Gebruik het lettermodel van school; nog geen eisen aan verbonden schrift
Klanken op volgorde|S01,S02,S03|Leg voor elke klank van ik een fiche;Schrijf ik met bekende letters;Schrijf mis en vis na rustig verklanken|ik, mis, vis; dicteer zonder het geschreven woord te tonen
Woorden met aa en ee|S01,S02,S03|Hoor drie klanken in maan;Schrijf maan en teen na verklanken;Controleer of beide letters van aa en ee aanwezig zijn|maan, teen, maat; letter a in maat is aa
Woorden met oo|S02,S03,S04|Leg de klanken van roos op volgorde;Schrijf roos en poot uit een dictee;Schrijf een bekend woord leesbaar over|roos, poot, peer, raam
Kort of lang horen|S01,S02,S03|Hoor het verschil tussen o en oo in bos en boos;Schrijf pen en ben met de e;Schrijf bos en boos met de juiste klinker|pen, ben, bos, boos
Woorden met u|S01,S02,S03|Hoor u in mus en dun;Schrijf mus en dun uit een dictee;Controleer de eerste en laatste letter van een woord|mus, dun, fan; geen f/v-eindregel
Letters en ruimte|W01,W02,S04|Schrijf lam en wip leesbaar;Schrijf twee bekende woorden met ruimte ertussen;Vergelijk jouw letters met het schoolvoorbeeld|lam, hek, wip; papier met passende hulplijnen
Woorden met oe|S02,S03,S06|Hoor oe als één klank;Schrijf boek en zoek met oe;Controleer of alle klanken in de goede volgorde staan|boek, zoek, zoem
Woorden met ie en eu|S02,S03,S06|Schrijf mier en ziek met ie;Schrijf neus en reus met eu;Kies na teruglezen welke lettercombinatie nodig is|mier, ziek, neus, reus
Woorden met ui|S01,S02,S03|Hoor ui in een gesproken woord;Schrijf huis en muis;Vergelijk een eigen woord met een correct voorbeeld|huis, muis, buis
Onthoudwoorden verkennen|S06,S08|Bekijk ei en ij in twee bekende woorden;Schrijf een geoefend ei- of ij-woord uit het geheugen;Controleer ou en au met een voorbeeldwoord|ei, ijs, hout, saus; schrijfwijze niet uit klank laten raden
Klanken en lettergroepen|S01,S02,S06|Schrijf gas en gum;Leg de letters van ring in volgorde;Schrijf schip met hulp bij sch|gas, gum, ring, schip
Schrijven voor iemand|W02,W05,W06|Kies een persoon voor een kort bericht;Schrijf een bekend woord bij een tekening;Lees of vertel jouw boodschap aan de ontvanger|Maak een kaart voor een bekende, eigen naam mag met voorbeeld
Een eerste zin|W03,W04,S07|Zeg een zin en tel de woorden;Schrijf een korte zin met woordspaties;Zet een hoofdletter en punt bij de zin|Ik pak de pen. Schoolmodel voor hoofdletters gebruiken.
Extra medeklinkers|S01,S02,S03|Hoor beide beginklanken in spin;Schrijf spin en vlag met alle klanken;Schrijf kast en tent zonder de laatste klank over te slaan|spin, vlag, kast, tent; a expliciet herhalen
Patronen nk en sch|S06,S08|Leg bank met nk;Schrijf schep met sch;Lees terug en herstel een ontbrekende letter|bank, plank, schip, schep
Een zin bij een plaatje|W02,W03,W04|Noem wie of wat op een tekening staat;Schrijf daar een korte zin bij;Controleer hoofdletter, spaties en punt|Eigen tekening van een kat op een mat; laat onbekende spelling helpen
De eigen naam|S07,W01,W04|Herken de hoofdletter in je eigen naam;Schrijf je naam leesbaar met een voorbeeld;Begin een korte zin met een hoofdletter|Eigen naam blijft op papier en wordt niet digitaal verzameld
Teruglezen en herstellen|S08,S01,W02|Lees een eigen woord klank voor klank terug;Zoek een ontbrekende klank met hulp;Verbeter het woord en lees het opnieuw|vis geschreven als vi, tent als tet; bespreek zonder harde foutmelding
Woorden in stukjes|S05,T04|Klap een gesproken woord in klankgroepen;Vergelijk een kort en een langer woord;Wijs klanken en klankgroepen afzonderlijk aan|vis, ta-fel, ba-naan; klankgroepen horen, spellingregels nog niet eisen
Een boodschap opschrijven|W03,W05,W06|Vertel wat iemand moet weten;Schrijf een kort briefje met hulp waar nodig;Controleer of de lezer weet wat hij moet doen|Pak je jas. Ik ben in de tuin.
Een verhaaltje maken|W03,W05,W06|Teken drie gebeurtenissen op volgorde;Schrijf bij twee tekeningen een zin;Lees het geheel aan iemand voor|Zaad planten, water geven, plant groeit; spellinghulp toegestaan
Zinnen netjes maken|W01,W04,S07|Maak woordspaties zichtbaar;Zet een hoofdletter aan het begin;Zet een punt op het einde en lees terug|ik zie een vis. de vis zit in de kom.
Woorden controleren|S03,S06,S08|Schrijf drie geoefende klankzuivere woorden;Controleer de volgorde van de medeklinkers;Controleer een bekende dubbele lettergroep|kast, neus, boek; terugkijken pas na eigen poging
Woorden samenvoegen|S05,S06,W02|Zoek twee bekende woorden in een samenstelling;Schrijf viskom vanuit vis en kom;Controleer beide delen van een samenstelling|viskom, zaklamp, voetbal; alleen bekende deelwoorden
Een beschrijving schrijven|W03,W05,W06|Noem twee kenmerken van een voorwerp;Schrijf één zin met een kenmerk;Laat iemand het voorwerp herkennen uit jouw beschrijving|Een rode bal, klein boek of lange stok
Feitjes opschrijven|W03,W05,W06|Vertel een feit uit een voorgelezen tekst;Schrijf dat feit in een korte zin;Controleer of de zin bij de tekst past|Een bij heeft zes poten. Leerkracht helpt met nog onbekende schrijfwijzen.
Een uitleg maken|M06,W03,W05|Vertel hoe je een klein bouwwerk maakt;Teken of schrijf de eerste stap;Voeg een tweede stap toe en laat iemand het proberen|Twee blokken onder, één blok erboven
Een leesreactie schrijven|W03,W05,L10|Kies een gebeurtenis uit een gelezen verhaal;Schrijf wat je daarvan vindt;Voeg met hulp een reden toe|Ik vind ... leuk, want ...; inhoud en spelling apart bespreken
Dictee met klankzuivere woorden|S01,S02,S03,S08|Verklank een kort woord vóór het schrijven;Schrijf een nieuw woord met bekende klanken;Controleer het woord zonder onmiddellijk een voorbeeld|tak, sok, kip, hut; gebruik alleen eerder geïntroduceerde letters
Letters, woorden en zinnen|S04,W01,T04|Schrijf drie letters met herkenbare vorm;Schrijf drie woorden op één regel met spaties;Schrijf een zin en wijs begin en eind aan|m, b, s; pen, boek, jas; De jas is nat.
Een uitnodiging maken|W03,W05,W06|Vertel voor wie de uitnodiging is;Schrijf waarvoor je iemand uitnodigt;Voeg met hulp plek en tijd toe|Een denkbeeldig leesfeest; geen echte adresgegevens verzamelen
Mijn woordcontrole|S06,S08|Schrijf woorden met oe, ie, ui en eu;Controleer een bekend ei/ij- of ou/au-woord met een voorbeeld;Verbeter één woord en leg uit wat je veranderde|boek, mier, huis, neus, ijs, hout
Rijm opschrijven|T03,W02,W05|Bedenk twee rijmwoorden met bekende letters;Schrijf beide woorden;Maak met hulp een kort rijmzinnetje|huis-muis, tak-zak; geen kunstmatige spellingregel
Een eigen verhaaltje|W03,W05,W06|Kies een persoon en een plek;Schrijf twee samenhangende zinnen;Vertel of schrijf een passend einde|Eigen verhaal met tekening; onbekende spelling krijgt hulp
Een lijst maken|W02,W05,W06|Kies waarvoor een lijst nodig is;Schrijf drie passende woorden onder elkaar;Controleer of de lijst bruikbaar is|Denkbeeldige boodschappen: pen, boek, jas; geen prijssommen hier
Spellingmix|S01,S03,S06,S08|Schrijf korte klankzuivere woorden zonder voorbeeld;Schrijf woorden met een extra medeklinker;Controleer bekende lettergroepen in een klein dictee|vis, pen, kast, tent, boek, neus
Tekst verbeteren|W03,W04,S07,S08|Lees jouw tekst terug op betekenis;Herstel een vergeten spatie, hoofdletter of punt;Verbeter één geoefend spellingwoord met uitleg|Gebruik een eigen tekst van twee zinnen
Mijn schrijfjaar|W01,W03,W05,W06|Kies een eerder werkje en vertel wat beter gaat;Schrijf een nieuw kort berichtje voor iemand;Lees terug en bepaal samen een volgend oefenpunt|Bewaar alleen voortgang, papier blijft bij kind; begeleider observeert zonder automatische beheersingsclaim
`.trim();

function parse(raw,lane){return raw.split('\n').map((line,i)=>{const [titel,ids,klein,materiaal]=line.split('|');return {week:i+1,lane,titel,doelen:ids.split(','),klein:klein.split(';'),materiaal};});}
const tracks=[parse(rekenen,0),parse(taal,1),parse(schrijven,2)];
for(const t of tracks)if(t.length!==40)throw new Error(`Verwacht 40 weken, kreeg ${t.length}`);
const stappen=[];
for(let week=1;week<=40;week++)for(let dag=1;dag<=5;dag++)for(let lane=0;lane<3;lane++){
 const huidig=tracks[lane][week-1];
 const herhaal=dag===4 && week>2;
 const unit=herhaal?tracks[lane][week-3]:huidig;
 const nummer=stappen.length+1;
 const micro=dag<=3?dag-1:dag===4?0:2;
 const doel=unit.klein[micro];
 const vak=lane===0?'Rekenen':lane===1?(unit.doelen[0].startsWith('M')?'Mondelinge taal':unit.doelen[0].startsWith('T')?'Taalbegrip':'Lezen'):(unit.doelen[0].startsWith('W')?'Schrijven':'Spelling');
 const activiteit=dag<=3?doel:dag===4?`Haal op zonder voorbeeld: ${doel.charAt(0).toLowerCase()+doel.slice(1)}`:`Pas toe met een ander voorbeeld: ${doel.charAt(0).toLowerCase()+doel.slice(1)}`;
 stappen.push({id:`g3-${String(nummer).padStart(3,'0')}`,nummer,week,dag,lane,vak,titel:unit.titel,doel:activiteit,hoofddoelen:unit.doelen,materiaal:unit.materiaal,fase:dag===4?'Herhalen':dag===5?'Toepassen':dag===1?'Ontdekken':'Oefenen',herhalingVan:herhaal?`g3-${String(((week-3)*15)+lane+1).padStart(3,'0')}`:null,voorwaarde:nummer>3?`g3-${String(nummer-3).padStart(3,'0')}`:null,minuten:5,controle:`Observeer of het kind deze handeling uitvoert: ${doel.charAt(0).toLowerCase()+doel.slice(1)}. Noteer zelfstandig of met hulp; nog niet gelukt leidt tot opnieuw oefenen.`,bron:lane===0?'SLO-R':'SLO-N',prioriteit:/verken|half uur|twee handelingen/i.test(activiteit)?'Opbouw':'Kern / doorlopend',uitvoering:'Begeleid, met materiaal of mondeling'});
}
const bronnen=[
 {id:'SLO-K',titel:'SLO: kerndoelen primair onderwijs',url:'https://www.slo.nl/sectoren/po/kerndoelen/',gebruik:'Landelijk kader, geen verplichte doelen per leerjaar. Nieuwe doelen Nederlands en rekenen sinds augustus 2026 met overgangsrecht. De jaarvolgorde is een eigen ontwerp.'},
 {id:'SLO-R',titel:'SLO: TULE rekenen-wiskunde',url:'https://www.slo.nl/thema/meer/tule/rekenen-wiskunde/',gebruik:'Historische voorbeeldmatige leerlijnen bij kerndoelen 2006, onder meer groep 3/4. Geen één-op-één certificering of mapping naar alle kerndoelen 2025.'},
 {id:'SLO-N',titel:'SLO: TULE Nederlands',url:'https://www.slo.nl/thema/meer/tule/nederlands/',gebruik:'Historische voorbeeldmatige leerlijnen, ontwikkeld met Expertisecentrum Nederlands. Gecombineerd met de door gebruiker aangeleverde doelen.'},
];
const data={versie:'groep3-v1',titel:'Groep 3 — jaarpad',weken:40,dagenPerWeek:5,stappenPerDag:3,doelen,bronnen,stappen};
fs.writeFileSync('src/lib/leerpad/groep3.json',JSON.stringify(data,null,2)+'\n');
const gebruikt=new Set(stappen.flatMap(s=>s.hoofddoelen));
const ontbreekt=doelen.filter(d=>!gebruikt.has(d.id));
if(ontbreekt.length)throw new Error(`Niet afgedekt: ${ontbreekt.map(d=>d.id)}`);
console.log(`${stappen.length} stappen, ${doelen.length} onderdelen, alle onderdelen afgedekt.`);
