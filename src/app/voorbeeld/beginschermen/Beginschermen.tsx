import s from "./overzicht.module.css";
import { bewaarTekst, schakelBeheer } from "./acties";

type Les = { id: string; titel: string; onderwerp: string; zin1: string; zin2: string; wens: string };

export function Beginschermen({ lessen, zoek = "", onderwerp = "", open = "", herhaling = "", stap = "begin", melding = "", veld = "", beheer = false, laptop = false }: { lessen: Les[]; zoek?: string; onderwerp?: string; open?: string; herhaling?: string; stap?: "begin" | "nee"; melding?: string; veld?: string; beheer?: boolean; laptop?: boolean }) {
  const onderwerpen = [...new Set(lessen.map((les) => les.onderwerp))];
  const term = zoek.toLocaleLowerCase("nl").trim();
  const zichtbaar = lessen.filter((les) => (melding && les.id === open) || ((!onderwerp || les.onderwerp === onderwerp) &&
    `${les.titel} ${les.id} ${les.zin1} ${les.zin2}`.toLocaleLowerCase("nl").includes(term)));

  const tekst = lessen.map((les, i) => `${i + 1}. ${les.titel}\nOnderwerp: ${les.onderwerp}\nLes: ${les.id}\n\nZin 1: ${les.zin1}\nZin 2: ${les.zin2}\nBeginscherm: http://localhost:3000/voorbeeld/les/${les.id}\n`).join("\n------------------------------\n\n");
  const download = `data:text/plain;charset=utf-8;base64,${Buffer.from(`BEGINZINNEN — THUISLES\n${lessen.length} Squla-lessen\n\n${tekst}`).toString("base64")}`;
  function adres(id: string, fase = stap, opnieuw = false) {
    const params = new URLSearchParams({ zoek, onderwerp, les: id, stap: fase });
    if (opnieuw) params.set("opnieuw", herhaling === "1" ? "0" : "1");
    return `?${params}#${id || open}`;
  }
  function invoervelden(les: Les, naam: "zin1" | "zin2" | "wens") {
    return <><input type="hidden" name="id" value={les.id} /><input type="hidden" name="veld" value={naam} /><input type="hidden" name="verwacht" value={les[naam]} /><input type="hidden" name="zoek" value={zoek} /><input type="hidden" name="onderwerp" value={onderwerp} /><input type="hidden" name="stap" value={stap} /></>;
  }
  function lesAdres(id: string, uitleg = false) {
    const params = new URLSearchParams();
    if (beheer) params.set("beheer", "1");
    if (uitleg) params.set("uitleg", "nee");
    return `/voorbeeld/les/${id}${params.size ? `?${params}` : ""}`;
  }

  return <main className={s.pagina}>
    <header className={s.kop}>
      <p className={s.bovenregel}>THUISLES · HANDMATIGE CONTROLE</p>
      <h1>Beginschermen en uitleg na ‘Nee’</h1>
      <p>{lessen.length} Squla-lessen. Bij elke les lees je de huidige beginzinnen en kun je het beginscherm óf de uitleg na ‘Nee’ bekijken.</p>
      <ol className={s.stappen}><li><strong>Beginscherm bekijken:</strong> het beeld, de beginzinnen en de knoppen Ja en Nee.</li><li><strong>Uitleg na Nee bekijken:</strong> wat Bliepo daarna zegt en laat zien. Je opent meteen de echte uitleg.</li><li><strong>Zelf controleren:</strong> klik in de uitleg op de antwoorden of afbeeldingen om ook de volgende stappen en feedback te zien.</li></ol>
      <p>Er staat steeds één les open. Synthesis-lessen en de oude conceptlessen staan niet in dit overzicht.</p>
      {beheer ? <><p><strong>Beheerstand op je laptop staat aan.</strong> Open een les als beheerder. In de les kun je bij de tekst op ‘Deze zin bewerken’ klikken of via ‘Les aanpassen’ een wens bewaren. Gewone kinderlessen tonen deze knoppen niet.</p><form action={schakelBeheer}><input type="hidden" name="aan" value="nee" /><button className={s.knop} type="submit">Beheerstand uitzetten</button></form></> : laptop ? <><p><strong>Alleen voor jouw laptop:</strong> zet de lokale beheerstand aan om zinnen in de lessen te bewerken. Deze stand is geen persoonlijke beheerlogin.</p><form action={schakelBeheer}><input type="hidden" name="aan" value="ja" /><button className={s.knop} type="submit">Beheerstand op deze laptop aanzetten</button></form></> : <p>Bewerken is alleen beschikbaar via het lokale beheeroverzicht op de laptop.</p>}
      <a className={s.knop} href={download} download="Thuisles-alle-beginzinnen.txt">Download alle zinnen</a>
      {beheer && <p className={s.bijschrift}>In de beheerweergave blijft elke tekst staan. Klik op ‘Volgende tekst →’ om verder te gaan. Bij een vraag verschijnen daarna de antwoordknoppen.</p>}
    </header>
    <form className={s.filters} method="get">
      <label>Zoek een les of zin<input type="search" name="zoek" defaultValue={zoek} placeholder="Bijvoorbeeld fruit, geld of knikkers" /></label>
      <label>Onderwerp<select name="onderwerp" defaultValue={onderwerp}><option value="">Alle onderwerpen</option>{onderwerpen.map((o) => <option key={o}>{o}</option>)}</select></label>
      <button className={s.knop} type="submit">Toon lessen</button><p role="status">{zichtbaar.length} van {lessen.length} lessen</p>
    </form>
    <div className={s.lijst}>
      {zichtbaar.length === 0 && <p>Geen lessen gevonden. Pas je zoekwoord of onderwerp aan.</p>}
      {zichtbaar.map((les) => <article className={s.les} key={les.id} id={les.id}>
        <div className={s.leskop}><div><p className={s.bovenregel}>{lessen.indexOf(les) + 1} / {lessen.length} · {les.onderwerp}</p><h2>{les.titel}</h2><p className={s.id}>{les.id}</p></div>
          <a className={s.link} href={lesAdres(les.id)} target="_blank" rel="noreferrer">{beheer ? "Open les als beheerder ↗" : "Open les groot ↗"}</a></div>
        {open === les.id && melding && <p className={s.melding} role="status">{melding === "opgeslagen" ? veld === "wens" ? "Je wijzigingswens is bewaard. De opdracht is nog niet aangepast." : "Je zin is opgeslagen. Open het beginscherm opnieuw om de wijziging te bekijken." : melding === "conflict" ? "Deze tekst is intussen gewijzigd in een ander venster. Controleer de nieuwste tekst hieronder en probeer het opnieuw." : "Vul een zin in van maximaal 700 tekens, of een wens van maximaal 5000 tekens."}</p>}
        <div className={s.zinnen}>{(["zin1", "zin2"] as const).map((naam, i) => <div key={naam}><h3>{i === 0 ? "Zin 1 · Over de les" : "Zin 2 · Vraag aan het kind"}</h3>{beheer ? <details className={s.bewerker}><summary><span>{les[naam]}</span><small>Klik op deze zin om te bewerken</small></summary><form action={bewaarTekst}>{invoervelden(les, naam)}<label htmlFor={`${les.id}-${naam}`}>Nieuwe tekst voor zin {i + 1}</label><textarea id={`${les.id}-${naam}`} name="tekst" defaultValue={les[naam]} rows={4} maxLength={700} required /><button className={s.knop} type="submit">Zin {i + 1} opslaan</button><p className={s.bijschrift}>Alleen deze beginzin wordt aangepast.</p></form></details> : <p>{les[naam]}</p>}</div>)}</div>
        {beheer && <details className={s.wens}><summary>Wijzigingswens voor deze les{les.wens ? " · wens bewaard" : ""}</summary><p>Beschrijf wat je wilt veranderen en waar het gebeurt, bijvoorbeeld na Ja, na Nee of na een antwoord. Dit bewaart je wens bij deze les; het verandert de opdracht niet automatisch.</p><form action={bewaarTekst}>{invoervelden(les, "wens")}<label htmlFor={`${les.id}-wens`}>Wat wil je veranderen?</label><textarea id={`${les.id}-wens`} name="tekst" defaultValue={les.wens} rows={4} maxLength={5000} placeholder="Bijvoorbeeld: na Ja moet de portemonnee blijven staan tot de eerste opdracht." /><button className={s.knop} type="submit">Wens bewaren</button></form></details>}
        <div className={s.acties}>
          <a className={s.knop} aria-current={open === les.id && stap === "begin" ? "true" : undefined} href={adres(les.id, "begin", open === les.id)}>Beginscherm bekijken</a>
          <a className={s.knop} aria-current={open === les.id && stap === "nee" ? "true" : undefined} href={adres(les.id, "nee", open === les.id)}>Uitleg na Nee bekijken</a>
          {open === les.id && <a className={s.link} href={adres("")}>Voorbeeld sluiten</a>}
        </div>
        <div id={`beeld-${les.id}`}>
          {open === les.id && <>
            <div className={s.previewkop}><h3>{stap === "nee" ? "Je bekijkt: de uitleg na Nee" : "Je bekijkt: het beginscherm"}</h3><a className={s.link} href={lesAdres(les.id, stap === "nee")} target="_blank" rel="noreferrer">Dit voorbeeld groot openen ↗</a></div>
            <p className={s.bijschrift}>{beheer ? "De tekst blijft staan totdat je op ‘Volgende tekst →’ klikt. Daarna verschijnt de volgende tekst of komen de antwoordknoppen in beeld. Je kunt elke tekst ondertussen bewerken." : stap === "nee" ? "Dit is dezelfde uitleg die een kind krijgt na Nee. Wacht tot Bliepo is uitgesproken en doe daarna mee. Klik opnieuw op ‘Uitleg na Nee bekijken’ om de uitleg opnieuw te starten." : "Wacht tot Bliepo is uitgesproken om de volledige tekst en Ja/Nee te zien. Je kunt hier zelf op Nee klikken of hierboven direct de uitleg openen."}</p>
            <iframe key={`${les.id}-${stap}-${herhaling}-${beheer}`} className={s.scherm} src={lesAdres(les.id, stap === "nee")} title={`${stap === "nee" ? "Uitleg na Nee" : "Beginscherm"} van ${les.titel}`} allow="autoplay" />
          </>}
        </div>
      </article>)}
    </div>
  </main>;
}
