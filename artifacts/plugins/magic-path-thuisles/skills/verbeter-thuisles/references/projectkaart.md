# Projectkaart Thuisles

Momentopname van de broncode op 5 oktober 2026; controleer actuele bestanden voor gebruik.

- Next.js 16.3.4, React 19, TypeScript en Tailwind 4 in package.json.
- `src/app/(kind)/start/page.tsx`: startscherm met Vakkenmenu, RekenPaneel, SchoolMethodeKaart, TipKaartjes, Wereldpad en Mascotte.
- `src/app/(kind)/oefenen/`: bestaande routes via vak, domein, subdomein en oefening.
- `src/components/kind/`: onder meer Kindschil, KindHeader, Zijbalk, Onderbalk, Pictogram, Mascotte en Wereldpad. Zoek ook de componenten die de actuele oefenroute importeert.
- `src/app/globals.css`: gedeelde ontwerptokens; Nunito voor de kindomgeving, roomkleurige basis, marineblauwe zijbalk, mandarijnoranje huisstijl. Gebruik de diepere oranje tint voor tekstcontrast. Paars wordt apart gebruikt in ouder- en beheeromgeving.
- `src/lib/data/queries.ts`: centrale ingang voor schermdata; `src/lib/auth/sessie.ts` voor ouder en actief kind. Houd gegevenslogica buiten schermcomponenten.
- `src/lib/aanbeveling.ts`: uitlegbare aanbevelingen; vervang die niet stilzwijgend door AI.
- `thuisles-projectcontext.md`: leerdoelen, originele content, privacy en productkeuzes. De README bevat historische tegenstrijdigheden over inloggen: verifieer actuele code.
- Ouderomgeving en beheeromgeving hebben een eigen functie en visuele rust. Een kinderontwerp-opdracht breidt zich niet automatisch tot die omgevingen uit.
- Bestaande controles in package.json: `lint`, `schermen`, `bewaking`, `oefentypes`, `bosspellen`, `opgaven`; `bewaak` bundelt meerdere controles. Kies controles naar de gewijzigde functionaliteit.

Voorbeelden van geschikte opdrachten:
- Maak het bestaande startscherm overzichtelijker en visueel sterker voor groep 4.
- Verbeter de feedback en visuele uitleg in deze rekenoefening.
- Bekijk de kindomgeving op tablet en herstel te kleine knoppen en onduidelijke navigatie.
