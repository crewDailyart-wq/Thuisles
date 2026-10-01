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

### Daarna

De andere onderwerpen van Erafsommen volgen nog:

- Basisvaardigheden
- Aftrekken tot en met 20
- Aftrekken tot en met 50
- Aftrekken tot en met 100
- Meerkeuzevragen
- Vleksommen

## Bouwstenen

Onderdelen die één keer gebouwd zijn en die elk volgend domein kan gebruiken:

- **Wegtikken** (`src/components/oefenen/Wegtikken.tsx`) — een groep plaatjes
  in rijtjes van vijf. Het kind tikt plaatjes aan en die krijgen een rood
  kruis; nog een keer tikken haalt het kruis eraf. In de stand "vanzelf"
  schuiven de plaatjes één voor één weg en kijkt het kind alleen.
- **Rekenrek** (`src/components/oefenen/Rekenrek.tsx`) — twee staafjes met
  tien kralen, vijf rode en vijf witte. De kralen die meedoen staan links, de
  rest lichter aan de rechterkant. Het kind schuift zelf kralen weg. De kralen
  zelf komen uit dezelfde tekening als Kralen tellen.
