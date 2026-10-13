"use client";

import { useId } from "react";

export type AccessoireId = "standaard" | "pet" | "oceaan" | "goud" | "kroon" | "bril" | "antenne";
export type VakId = "rekenen" | "taal" | "lezen" | "spelling" | "aardrijkskunde" | "geschiedenis" | "natuur" | "woordenschat" | "engels";

/** Eigen SVG-illustraties: scherp op elk scherm, geen platform-afhankelijke emoji. */
export function AccessoireBeeld({ soort, className = "" }: { soort: AccessoireId; className?: string }) {
  const id = useId().replace(/:/g, "");
  const goud = `url(#${id}-goud)`;
  const blauw = `url(#${id}-blauw)`;
  return <svg viewBox="0 0 160 130" className={className} aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-goud`} x1="0" y1="0" x2=".65" y2="1"><stop stopColor="#fff9c1"/><stop offset=".42" stopColor="#ffd447"/><stop offset="1" stopColor="#cb7404"/></linearGradient>
      <linearGradient id={`${id}-blauw`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c5f8ff"/><stop offset=".28" stopColor="#46caff"/><stop offset="1" stopColor="#064eb1"/></linearGradient>
    </defs>
    {soort === "pet" && <g transform="rotate(-10 80 72)"><path d="M30 83c0-36 19-56 51-56 30 0 48 24 49 56z" fill={blauw} stroke="#0058a5" strokeWidth="3"/><path d="M77 29v53M37 80h92" fill="none" stroke="#a4ebff" strokeWidth="2"/><path d="M29 81c33-10 58-10 99 1 18 5 23 15 8 23-17 10-65 11-94 2-25-7-33-16-13-26z" fill={blauw} stroke="#004897" strokeWidth="3"/><path d="M43 90c29-6 58-3 77 5" fill="none" stroke="#b5f5ff" strokeWidth="3" strokeLinecap="round"/><path d="m92 41 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill={goud}/><ellipse cx="81" cy="28" rx="7" ry="4" fill={goud}/></g>}
    {soort === "kroon" && <g><path d="m24 44 28 24 27-39 27 39 29-25-10 65H35z" fill={goud} stroke="#bc7717" strokeWidth="3"/><path d="m28 47 12 55h79l11-52-24 20-27-35-26 35z" fill="none" stroke="#fff3b2" strokeWidth="2"/><rect x="34" y="99" width="92" height="17" rx="8" fill={goud}/>{[24,79,135].map((x,i)=><circle key={x} cx={x} cy={i===1?25:40} r="7" fill={goud} stroke="#fff1aa" strokeWidth="2"/>)}<path d="m80 69 10 14-10 14-10-14z" fill={blauw}/><circle cx="48" cy="87" r="4" fill="#66edff"/><circle cx="112" cy="87" r="4" fill="#66edff"/></g>}
    {soort === "bril" && <g transform="rotate(-5 80 66)"><path d="m18 53-9-17m132 17 9-17M67 60q13-11 26 0" stroke="#173869" strokeWidth="8" fill="none" strokeLinecap="round"/><path d="M15 47q25-9 51 0l-3 31q-24 26-43-3zm78 0q26-9 51 0l-5 28q-21 28-43 3z" fill="#09284e" stroke={blauw} strokeWidth="7"/><path d="m26 55 22-3m54 4 22-3" stroke="#9fe8ff" strokeWidth="4" strokeLinecap="round"/><path d="m26 70 13-14m66 14 14-14" stroke="#d6f4ff" strokeOpacity=".26" strokeWidth="9"/></g>}
    {soort === "antenne" && <g><path d="M80 62v48" stroke="#a9c5e8" strokeWidth="9"/><path d="M78 66v39" stroke="#e3f9ff" strokeWidth="3"/><ellipse cx="80" cy="111" rx="23" ry="9" fill={blauw}/><path d="m80 14 11 23 25 3-18 18 4 25-22-12-22 12 4-25-18-18 25-3z" fill={goud} stroke="#fff2b4" strokeWidth="3"/><path d="m24 31 5 9m101-9-5 9m-12-29-3 11" stroke="#ffe589" strokeWidth="4" strokeLinecap="round"/></g>}
    {soort === "goud" && <g><path d="M80 13C69 37 41 61 41 85a39 39 0 0 0 78 0c0-24-28-48-39-72z" fill={goud} stroke="#fff0b0" strokeWidth="3"/><path d="M57 83q-3 17 14 23" fill="none" stroke="#fff6cf" strokeWidth="6" strokeLinecap="round"/><circle cx="91" cy="54" r="5" fill="#fff" fillOpacity=".75"/></g>}
    {soort === "oceaan" && <g><path d="M80 13C69 37 41 61 41 85a39 39 0 0 0 78 0c0-24-28-48-39-72z" fill={blauw} stroke="#a2eeff" strokeWidth="3"/><path d="M57 83q-3 17 14 23" fill="none" stroke="#c0f9ff" strokeWidth="6" strokeLinecap="round"/><circle cx="91" cy="54" r="5" fill="#fff" fillOpacity=".7"/></g>}
    {soort === "standaard" && <g fill="none" stroke={blauw} strokeWidth="9" strokeLinecap="round"><path d="M119 44a45 45 0 1 0 4 45"/><path d="M119 19v28H92"/></g>}
  </svg>;
}

export function VakBeeld({ soort }: { soort: VakId }) {
  const id = useId().replace(/:/g, "");
  const papier = `url(#${id}-papier)`;
  const licht = `url(#${id}-licht)`;
  return <svg viewBox="0 0 120 110" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-papier`} x2=".2" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor="#c2e4fc"/></linearGradient>
      <linearGradient id={`${id}-licht`} x2=".8" y2="1"><stop stopColor="#fff0a4"/><stop offset=".45" stopColor="#ffd55d"/><stop offset="1" stopColor="#e19516"/></linearGradient>
    </defs>
    <ellipse cx="60" cy="98" rx="33" ry="6" fill="#001d4f" opacity=".2"/>
    {soort === "rekenen" && <g transform="rotate(-7 60 54)"><rect x="30" y="7" width="62" height="87" rx="12" fill="#0667b8" stroke="#b5efff" strokeWidth="3"/><rect x="39" y="17" width="44" height="20" rx="4" fill="#bceef7"/><path d="M60 23h16m-5 5h5" stroke="#0a5689" strokeWidth="3"/>{[0,1,2].flatMap(y=>[0,1,2].map(x=><rect key={`${x}-${y}`} x={39+x*16} y={46+y*14} width="11" height="10" rx="3" fill={y===2&&x===2?licht:papier}/>))}</g>}
    {(soort === "taal" || soort === "lezen") && <g><path d="M12 20q25-7 48 9 23-16 48-9v67q-23-7-48 8-25-15-48-8z" fill="#cb6542"/><path d="M17 14q25-4 43 12 18-16 43-12v65q-26-5-43 10-19-14-43-10z" fill={papier} stroke="#fff" strokeWidth="2"/><path d="M60 26v63M27 32l23 6M27 44l23 6M27 56l23 6M70 38l23-6M70 50l23-6M70 62l23-6" stroke="#7faccc" strokeWidth="3" strokeLinecap="round"/>{soort==="lezen"&&<g><circle cx="84" cy="75" r="16" fill="#84e0ff" fillOpacity=".6" stroke={licht} strokeWidth="6"/><path d="m96 88 13 14" stroke="#ffce59" strokeWidth="8" strokeLinecap="round"/></g>}</g>}
    {soort === "spelling" && <g>{[[12,45,"A"],[40,10,"B"],[69,45,"C"]].map(([x,y,t])=><g key={t}><rect x={Number(x)} y={Number(y)+6} width="39" height="40" rx="8" fill="#424cb1"/><rect x={Number(x)} y={Number(y)} width="39" height="40" rx="8" fill={papier}/><text x={Number(x)+19.5} y={Number(y)+29} fill="#2560a2" fontSize="30" fontWeight="900" textAnchor="middle">{t}</text></g>)}</g>}
    {soort === "aardrijkskunde" && <g><path d="M87 16a45 45 0 0 1-35 76" fill="none" stroke={licht} strokeWidth="6"/><path d="M59 88v13m-22 1h45" stroke={licht} strokeWidth="8" strokeLinecap="round"/><circle cx="59" cy="50" r="36" fill="#33bdf1" stroke="#b1f1ff" strokeWidth="2"/><path d="m38 21 17-4 11 14-8 13-17-4-11 6-4-11zm28 40 13-10 12 9-5 17-20 9-6-13zM32 59l15-6 10 11-5 19-11-8z" fill="#a1de73"/><path d="M27 37q14-20 34-17" stroke="#efffff" strokeOpacity=".6" strokeWidth="4" fill="none" strokeLinecap="round"/></g>}
    {soort === "geschiedenis" && <g><path d="M30 14h59v74H41l-11-12z" fill={licht}/><path d="M23 14q-10 0-10 10t12 10h61V14zm19 66q-15 0-15 12t14 12h51q12-3 6-16H45" fill={papier} stroke="#ba8f53" strokeWidth="2"/><path d="M41 42h31M41 52h24M41 62h31" stroke="#946c2f" strokeWidth="3" strokeLinecap="round"/></g>}
    {soort === "natuur" && <g><path d="M97 10C37 11 10 43 29 76c17 32 63 15 68-66z" fill="#91e6a9" stroke="#d7ffdc" strokeWidth="3"/><path d="M25 98 77 34m-30 37-3-25m15 13 19-2" stroke="#238b65" strokeWidth="5" strokeLinecap="round"/></g>}
    {soort === "woordenschat" && <g><path d="M83 37c24 0 32 12 28 29-2 10-12 18-24 19l-2 15-16-16c-30-6-25-45 14-47z" fill={licht}/><path d="M57 15C25 15 9 29 11 49c1 14 12 24 27 27l1 16 20-15c34-1 48-19 42-36-4-17-20-26-44-26z" fill={papier}/>{[35,57,79].map(x=><circle key={x} cx={x} cy="47" r="5" fill="#bd5385"/>)}</g>}
    {soort === "engels" && <g><path d="M22 102V14" stroke={papier} strokeWidth="6" strokeLinecap="round"/><path d="M25 16q32-16 75 0v63q-40-17-75-3z" fill="#146bc9" stroke="#b8ebff" strokeWidth="2"/><text x="62" y="57" textAnchor="middle" fill="white" fontWeight="900" fontSize="31">EN</text><circle cx="22" cy="12" r="5" fill={licht}/></g>}
  </svg>;
}
