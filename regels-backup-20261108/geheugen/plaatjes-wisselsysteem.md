---
name: plaatjes-wisselsysteem
description: "31 okt: alle Squla-plaatjes als tijdelijke placeholder in public/voorwerpen/<naam>.png; Sara maakt ze zelf in Magnific; 'verwerk de inbox' = Claude bekijkt, controle-overzicht, akkoord, dan vervangen"
metadata:
  type: project
---

Besluit Sara 31 okt 2026 (Squla-nabouw):
- Alleen **echte dingen** worden een plaatje (fruit, bal, raket …). Rekendingen (stippen, blokjes, getallenlijn, klok, geld) blijven in code getekend.
- Elk plaatje: vaste naam `public/voorwerpen/<naam>.png`; lessen laden via die naam, vervangen = alleen bestand wisselen. Voorlopig simpele placeholder (vlak, geen gezicht, gloed, schaduw).
- `MAGNIFIC-PROMPTS.md`: genummerd, logische volgorde, per plaatje naam + lessen + prompt; elke prompt begint met dezelfde vaste stijlzin en vraagt **effen witte achtergrond** (Claude knipt wit weg met eigen lokaal hulpje, geen rembg).
- "verwerk de inbox" (Sara typt dit aan Claude): plaatjes in `plaatjes-inbox/` zelf bekijken, bij twijfel vragen; eerst controle-overzicht en wachten op akkoord; dan knippen/verkleinen/comprimeren, oude als backup, screenshots 1280 + tablet, naar `plaatjes-verwerkt/`, lijst vervangen/open. Uitleg in `WISSELEN.md`.
- Gloed: plaatjes zelf geen gloed; code laat ze oplichten bij tellen en goed antwoord ("moment", nacht).
- Stem: geen ElevenLabs nu; zinnen opschrijven, later met schatting + akkoord van Sara.
- WIJZIGING 31 okt (later die dag): Sara: "jij moet ze zelf maken maar wel efficient". Claude maakt de plaatjes zelf via de Magnific-koppeling (credits; Unlimited werkt niet via MCP, en NOOIT de website automatiseren). Efficiënt = vellen van 9 (3×3, Nano Banana 2, 2K = 75 credits per vel, ±8 per plaatje): scripts/voorwerpen/vellen.mjs (prompts) + scripts/inbox/knip-vel.mjs (knippen naar inbox), dan de gewone inbox-route met akkoord van Sara. Genoemde schatting aan Sara: ±9.000 credits als bovengrens; met vellen verwacht ±1.500. Saldo bij start 43.700. Dieren beperken (stipogen). Geen mensen.

Zie [[beeldstijl-zoals-synthesis]], [[geen-poppetjes-geen-ogen]], [[plaatjes-via-magnific]].

**Nacht 31 okt, definitief (Sara):** Claude genereert zelf via de Magnific-koppeling, zonder op akkoord te wachten; "je mag alle credits gebruiken" en "zo efficiënt mogelijk te werk, onthoud dat". Vaste instellingen per generatie: Nano Banana 2 (`imagen-nano-banana-2-flash`), 1K, 16:9, prompt = onderwerp + stijlzin uit scripts/voorwerpen/stijl.mjs (één plaatje per voorwerp, geen vellen). Efficiënt = alleen wat een les echt gebruikt, count 1, opnieuw alleen bij een echt fout plaatje, hergebruik bestaande voorwerpen. Website in Chrome NIET bedienen (regels Magnific).
