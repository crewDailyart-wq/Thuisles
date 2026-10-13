"use client";

import { useId } from "react";
import { Zappie } from "@/components/zappie/Zappie";

export type VoertuigId = "onderzeeer" | "vliegtuig" | "raket";

/** Beweegbare bouwtekening. Een toekomstige losse 3D-render kan deze laag vervangen. */
export function VoertuigBeeld({ soort, klein = false }: { soort: VoertuigId; klein?: boolean }) {
  const id = useId().replace(/:/g, "");
  const goud = `url(#${id}-goud)`;
  const raam = `url(#${id}-raam)`;
  const wit = `url(#${id}-wit)`;
  return <svg viewBox="0 0 420 240" className={klein ? "zr-voertuig-klein" : "zr-voertuig-groot"} aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-goud`} x1=".2" y1="0" x2=".4" y2="1"><stop stopColor="#fff1b1"/><stop offset=".24" stopColor="#ffcd46"/><stop offset=".67" stopColor="#da8e0f"/><stop offset="1" stopColor="#86500b"/></linearGradient>
      <radialGradient id={`${id}-raam`} cx=".34" cy=".28"><stop stopColor="#befdff"/><stop offset=".25" stopColor="#35bbff"/><stop offset=".65" stopColor="#075caf"/><stop offset="1" stopColor="#061e52"/></radialGradient>
      <linearGradient id={`${id}-wit`} x2=".4" y2="1"><stop stopColor="#fff"/><stop offset=".5" stopColor="#d4eafa"/><stop offset="1" stopColor="#6188b6"/></linearGradient>
    </defs>
    <ellipse cx="220" cy="215" rx="150" ry="13" fill="#00112d" opacity=".3"/>
    {soort === "onderzeeer" && <g transform="rotate(-4 220 130)">
      <path d="M166 82V50q0-9 9-9h48v15h-38v30" fill={goud} stroke="#4d5273" strokeWidth="3"/>
      <rect x="207" y="37" width="34" height="23" rx="7" fill={wit}/><rect x="227" y="39" width="11" height="19" rx="4" fill={raam}/>
      <path d="m77 114-28-23-7 80 37-19" fill={goud} stroke="#a27929" strokeWidth="3"/>
      <path d="M76 110q19-30 72-32h105q73 3 103 52 12 24-5 41-18 26-76 25H136q-46-2-65-28z" fill={goud} stroke="#ffdf72" strokeWidth="3"/>
      <path d="M109 93q65-19 151-2" fill="none" stroke="#fff6c1" strokeWidth="6" strokeLinecap="round" opacity=".7"/>
      <path d="M152 83v106m108-109v115" stroke="#604824" strokeOpacity=".5" strokeWidth="5"/>
      <path d="M137 174h133" stroke="#79491e" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="294" cy="137" r="55" fill={wit} stroke="#c28722" strokeWidth="8"/>
      <circle cx="294" cy="137" r="43" fill={raam} stroke="#43deff" strokeWidth="5"/>
      <path d="M264 131q3-24 26-27" fill="none" stroke="#ebfeff" strokeWidth="6" strokeLinecap="round" opacity=".8"/>
      <path d="m275 160 43-47" stroke="#c7f6ff" strokeWidth="12" opacity=".13"/>
      {[113,202].map(x=><g key={x}><circle cx={x} cy="134" r="23" fill={wit} stroke="#825f21" strokeWidth="4"/><circle cx={x} cy="134" r="16" fill={raam}/><path d={`M${x-9} 131q0-8 9-9`} stroke="#c4fcff" strokeWidth="3" fill="none"/></g>)}
      <path d="m182 186-16 24h45l14-22" fill={goud} stroke="#8b5920" strokeWidth="2"/>
      <path d="M68 118H53v40h15" fill="#193f70"/><g className="zr-schroef"><path d="M43 139q-26-29-27-8t27 8q-26 29-27 8t27-8" fill={wit}/></g>
      {[89,143,236,337].map(x=><circle key={x} cx={x} cy="167" r="3" fill="#fff0ac"/>)}
    </g>}
    {soort === "vliegtuig" && <g transform="rotate(-7 210 126)"><path d="m149 128 46-94 49-4-15 100 95 49-14 19-95-40-98 41-12-19z" fill={wit} stroke="#5981b0" strokeWidth="3"/><path d="M59 125q15-22 132-28h120q62 4 58 23-9 23-70 26H103l-43 33-12-8 18-40z" fill={wit} stroke="#577eaa" strokeWidth="3"/><path d="m313 101 30 8-6 13h-37z" fill={raam}/><path d="M117 139h177" stroke="#21baff" strokeWidth="6"/>{[174,200,226,252].map(x=><rect key={x} x={x} y="113" width="15" height="10" rx="4" fill={raam}/>)}<path d="m92 105-9-45h26l27 42" fill={goud}/><ellipse cx="205" cy="163" rx="17" ry="25" fill={wit}/><ellipse cx="205" cy="178" rx="12" ry="10" fill={raam}/></g>}
    {soort === "raket" && <g><path d="m175 125-36 64 11 19 38-23m58-60 37 64-11 19-38-23" fill={goud} stroke="#8e7033" strokeWidth="3"/><path d="M211 15c-44 45-51 112-35 164l11 17h48l11-17c15-52 8-119-35-164z" fill={wit} stroke="#82b1d9" strokeWidth="3"/><path d="M211 15q-23 27-31 47h63q-10-29-32-47" fill={raam}/><circle cx="211" cy="105" r="25" fill={raam} stroke={goud} strokeWidth="7"/><path d="M197 100q2-12 13-14" stroke="#fff" strokeOpacity=".75" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M192 153h38v35h-38z" fill="#1879c5"/><path d="M188 194h46l-6 15h-35z" fill="#253655"/><path d="m204 203 7 23 7-23" fill="#62edff" opacity=".8"/></g>}
  </svg>;
}

export function WerkplaatsBeeld({ voertuig }: { voertuig: VoertuigId }) {
  return <div className="zr-hangar" aria-label="Een verlichte werkplaats met een voertuig en twee kleine bouwrobots">
    <div className="zr-hangar-raster" aria-hidden="true" />
    <div className="zr-werklicht zr-werklicht-a" aria-hidden="true"/><div className="zr-werklicht zr-werklicht-b" aria-hidden="true"/>
    <svg viewBox="0 0 600 340" className="zr-kraanwerk" aria-hidden="true"><path d="M30 297V36h540v261M28 78h542" fill="none" stroke="#164d82" strokeWidth="22"/><path d="M30 35h540" stroke="#f9d25a" strokeWidth="7"/><path d="M32 88v192m537-192v192" stroke="#68d9ff" strokeWidth="3"/><g className="zr-takel"><path d="M439 42v73" stroke="#a8b7c9" strokeWidth="3"/><path d="M429 108h20v23h-20z" fill="#e7b742"/><path d="M439 130v8q19 19 0 28-12 3-12-10" fill="none" stroke="#f8d783" strokeWidth="7" strokeLinecap="round"/></g></svg>
    <div className="zr-voertuig-opstelling"><VoertuigBeeld soort={voertuig}/></div>
    <div className="zr-hulpbot zr-hulpbot-links" aria-hidden="true"><Zappie stemming="kijk" houding="wijs"/></div>
    <div className="zr-hulpbot zr-hulpbot-rechts" aria-hidden="true"><Zappie stemming="blij" houding="zwaai"/></div>
    <div className="zr-laslicht" aria-hidden="true"><i/><i/><i/><i/></div>
    <div className="zr-vloer" aria-hidden="true"/>
  </div>;
}
