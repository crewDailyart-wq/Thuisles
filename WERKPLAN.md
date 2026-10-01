# Werkplan

Wat er gebouwd wordt en in welke volgorde. Per onderwerp de titels zoals het
kind ze ziet, met de bolletjes en wat het kind er doet.

## Groep 4 – Erafsommen – Aftrekken tot en met 15

Alle getallen 0 tot en met 15; de uitkomst komt nooit onder 0. De eerste
sommen van een oefening zijn visueel — het kind doet het zelf — en daarna
volgt gewoon oefenen. Hoeveel sommen dat zijn is een instelling per titel,
standaard 3.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Wegstrepen tot en met 15 | ● | Ziet bijvoorbeeld 13 appels en op het bordje "5 eraf". Tikt er zelf vijf weg — die krijgen een rood kruis — en typt hoeveel er overblijven. Elke som is visueel. |
| 2 | Een minsom bij een plaatje | ● | Ziet bijvoorbeeld 9 vogels; er schuiven er 3 vanzelf weg. Vult daarna de hele som in: ▢ − ▢ = ▢. Elke som is visueel. |
| 3 | Aftrekken met plaatjes tot en met 15 | ●● | Een som met alleen plaatjes, zonder getallen: groep − groep = ▢. Bij de eerste sommen streept het kind zelf weg, daarna rekent het zelf. |
| 4 | Aftrekken met plaatjes en getallen tot en met 15 | ●● | Hetzelfde, maar met het getal onder elk groepje. Bij de eerste sommen streept het kind zelf weg. |
| 5 | Aftrekken tot en met 15 | ●●● | De kale som: 13 − 5 = ▢. Bij de eerste sommen staat het rekenrek erbij en schuift het kind zelf de kralen weg. |
| 6 | Sommen en uitkomsten koppelen | ●●●● | Sleept elke uitkomst naar de som waar hij bij hoort; tikken werkt ook. |

Staat klaar in de database: het domein Erafsommen, het onderwerp "Aftrekken
tot en met 15", de zes leerdoelen met hun sjablonen en per titel vijftien
gepubliceerde vragen — evenveel als bij Optellen tot en met 20.

## Groep 4 – Erafsommen – Aftrekken met het rekenrek

Hetzelfde rekenrek als op school: twee rijen van tien, vijf rode en vijf witte
per rij. Eerst kijken, dan zelf schuiven, en aan het eind uit het hoofd.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Flitsen met het rekenrek | ● | Ziet het rek een paar tellen (standaard 2), daarna gaat er een kaart overheen. Typt hoeveel kralen het zag. Getallen 6 tot en met 20. |
| 2 | Aftrekken vanaf 10 | ● | Leest de som 10 − 3 = ▢, schuift zelf drie kralen weg en vult het antwoord in. Negen vragen: meer verschillende sommen bestaan er niet. |
| 3 | De kleine som | ●● | Sommen binnen het tiental, zoals 17 − 4. Na een goed antwoord verschijnt eronder: 7 − 4 = 3, dus 17 − 4 = 13. |
| 4 | Aftrekken via de 10 | ●●● | Sommen over de tien, zoals 15 − 7. De rondjes onder het bordje staan in twee groepjes en de bovenste rij licht op zodra er tien over zijn. Na een goed antwoord staan de twee stappen eronder: 15 − 5 = 10 en 10 − 2 = 8. |
| 5 | Denk aan het rekenrek | ●●●● | De kale som over de tien, zonder rek erbij. Gaat het mis, dan speelt het rek de som alsnog voor met de twee stappen. |

### Nog te doen

De andere onderwerpen van Erafsommen:

- Basisvaardigheden
- Eraf tot en met 20
- Eraf tot en met 50
- Eraf tot en met 100
- Meerkeuzevragen
- Vleksommen

Erafsommen staat even stil. Wat al gebouwd is (Aftrekken tot en met 15 en
Aftrekken met het rekenrek) blijft zoals het is.

## Groep 4 – Delen

Nog te bouwen. De basisversie zijn gewone sommen; beeld komt later. De notatie
is overal met een dubbele punt: 8 : 2.

### Onderwerp 1 — Deeltafels oefenen

Elke titel geeft kale deelsommen uit die ene deeltafel, bijvoorbeeld 8 : 2 =
▢. De uitkomsten lopen van 1 tot en met 10.

| # | Titel | Bolletjes |
|---|-------|-----------|
| 1 | Delen door 1 | ● |
| 2 | Delen door 2 | ● |
| 3 | Delen door 10 | ● |
| 4 | Delen door 5 | ●● |
| 5 | Delen door 3 | ●●● |
| 6 | Delen door 4 | ●●● |
| 7 | Delen door 6 | ●●●● |
| 8 | Delen door 8 | ●●●● |
| 9 | Delen door 7 | ●●●●● |
| 10 | Delen door 9 | ●●●●● |

### Onderwerp 2 — Deelsommen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Deelsommen tot en met 5 | ●● | Kale deelsommen door elkaar uit de deeltafels 1 tot en met 5. |
| 2 | Deelsommen tot en met 10 | ●●● | Hetzelfde, nu door elkaar uit de deeltafels 1 tot en met 10. |
| 3 | Deelsommen koppelen: tafels van 1, 2, 5 en 10 | ●●●● | Vijf deelsommen met een leeg vak ernaast; het kind sleept bij elke som het goede antwoord naar dat vak. Hergebruikt het koppel-onderdeel dat er al is. |
| 4 | Deelsommen koppelen: tafels van 1 tot en met 10 | ●●●● | Hetzelfde, met alle deeltafels. |
| 5 | Zelf een deelsom maken | ●●●●● | Het kind ziet zes getallen en een uitkomst, bijvoorbeeld ▢ : ▢ = 5, en kiest twee getallen die samen kloppen. Elke goede combinatie telt goed. |

## Bouwstenen

Onderdelen die één keer gebouwd zijn en die elk volgend domein kan gebruiken:

- **Wegtikken** (`src/components/oefenen/Wegtikken.tsx`) — een groep plaatjes
  in rijtjes van vijf. Het kind tikt plaatjes aan en die krijgen een rood
  kruis; nog een keer tikken haalt het kruis eraf. In de stand "vanzelf"
  schuiven de plaatjes één voor één weg en kijkt het kind alleen.
- **Rekenrek** (`src/components/oefenen/Rekenrek.tsx`) — twee staafjes met
  tien kralen, vijf rode en vijf witte. De bovenste rij wordt eerst gevuld tot
  tien, de rest komt op de onderste rij. Drie standen: *wegschuiven* (het kind
  tikt of sleept; er gaat altijd de laatste kraal weg), *flitsen* (na een paar
  tellen gaat er een kaart overheen) en *kijken* (het rek speelt de som zelf
  af). Met het bordje van Wegstrepen erbij, en het moment bij de tien: blijven
  er precies tien over, dan licht de bovenste rij even op. Uit te proberen in
  het beheer onder "Rekenrek". De kralen komen uit dezelfde tekening als
  Kralen tellen; daar is niets aan veranderd. Er hangt nog geen oefening aan.
