import type { Bosthema } from "@/lib/generatoren/bosspellen-catalogus";

export function BosVos({ className = "" }: { className?: string }) {
  return <span className={`relative inline-block ${className}`} aria-hidden="true">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/vos-lijf.png" alt="" className="block h-auto w-full"/>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/vos-arm.png" alt="" className="absolute w-[21.2707%] animate-vos-zwaai" style={{left:"73.4807%",top:"26.5884%",height:"auto",transformOrigin:"34.63% 88%"}}/>
  </span>;
}

export function Kikker() {
  return <svg viewBox="0 0 100 85" className="h-full w-full" aria-hidden="true"><ellipse cx="50" cy="73" rx="41" ry="9" fill="#296747" opacity=".2"/><ellipse cx="50" cy="51" rx="35" ry="28" fill="#6bbd45"/><ellipse cx="50" cy="60" rx="23" ry="17" fill="#d7ed98"/><circle cx="29" cy="26" r="18" fill="#6bbd45"/><circle cx="71" cy="26" r="18" fill="#6bbd45"/><circle cx="29" cy="25" r="12" fill="white"/><circle cx="71" cy="25" r="12" fill="white"/><circle cx="32" cy="26" r="6" fill="#294631"/><circle cx="68" cy="26" r="6" fill="#294631"/><path d="M35 53Q50 66 65 53" fill="none" stroke="#294631" strokeWidth="3" strokeLinecap="round"/><ellipse cx="17" cy="70" rx="16" ry="7" fill="#54a43a"/><ellipse cx="83" cy="70" rx="16" ry="7" fill="#54a43a"/></svg>;
}

/** Eigen miniaturen: visuele keuzes in plaats van een lijst met lesnamen. */
export function BosMiniatuur({ thema }: { thema: Bosthema }) {
  return <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
    <path d="M0 143Q80 114 160 139T320 132V180H0Z" fill={thema === "waterlelies" ? "#76cdd4" : "#b9d878"}/><circle cx="270" cy="36" r="20" fill="#ffe6a4"/>
    {thema === "appels" || thema === "blaadjes" ? <><path d="M147 66H173L183 159H137Z" fill="#ad7445"/><path d="M160 100L119 68M160 103L204 65" stroke="#ad7445" strokeWidth="12"/><path d="M87 90C40 70 62 16 114 25C127 -1 182 0 202 29C259 11 285 83 241 100C192 129 125 124 87 90" fill={thema === "appels" ? "#65ac4c" : "#e3ae43"}/>{[[97,60],[151,43],[213,63],[129,93],[190,98]].map(([x,y],i)=><g key={i}><ellipse cx={x} cy={y} rx="11" ry="12" fill="#e8690f"/><path d={`M${x} ${y-11}q3 -9 9 -6`} stroke="#395d31" strokeWidth="3" fill="none"/></g>)}<path d="M220 130H280L271 161H230Z" fill="#bd8046" stroke="#91612e" strokeWidth="3"/><path d="M233 132Q249 103 267 132" fill="none" stroke="#91612e" strokeWidth="4"/></>
      : thema === "trein" ? <><path d="M20 156H300" stroke="#8a725e" strokeWidth="6"/><g fill="#e8690f" stroke="#bd571f" strokeWidth="3"><path d="M31 101H96V138H31Z"/><path d="M63 64H94V121H63Z"/><path d="M42 89H53V102H42Z"/><rect x="112" y="91" width="72" height="47" rx="10"/><rect x="200" y="91" width="72" height="47" rx="10"/></g><g fill="#d5f0f3"><rect x="70" y="74" width="16" height="21" rx="3"/><rect x="124" y="102" width="47" height="23" rx="5"/><rect x="212" y="102" width="47" height="23" rx="5"/></g><g fill="#42585d">{[44,85,126,170,214,258].map(x=><circle key={x} cx={x} cy="140" r="12"/>)}</g><g fill="white" opacity=".8"><circle cx="43" cy="65" r="9"/><circle cx="28" cy="45" r="13"/></g></>
      : thema === "waterlelies" ? <><path d="M0 115Q90 85 180 111T320 100V180H0Z" fill="#82d7db"/>{[60,160,260].map((x,i)=><g key={x}><ellipse cx={x} cy={142-i*9} rx="39" ry="16" fill="#58a45c"/><path d={`M${x} ${142-i*9}l25 -16l-7 27Z`} fill="#82d7db"/></g>)}<g transform="translate(120 45) scale(.8)"><ellipse cx="48" cy="61" rx="35" ry="26" fill="#72bb44"/><circle cx="27" cy="35" r="14" fill="#72bb44"/><circle cx="68" cy="35" r="14" fill="#72bb44"/><g fill="white"><circle cx="27" cy="34" r="9"/><circle cx="68" cy="34" r="9"/></g><g fill="#304a33"><circle cx="30" cy="35" r="4"/><circle cx="65" cy="35" r="4"/></g><path d="M35 61q14 12 26 0" stroke="#304a33" fill="none" strokeWidth="3"/></g></>
      : thema === "huisjes" ? <>{[68,160,252].map((x,i)=><g key={x}><rect x={x-33} y={80+i*5} width="66" height="73" rx="5" fill="#ffe3b8" stroke="#daac70" strokeWidth="2"/><path d={`M${x-43} ${82+i*5}L${x} ${42+i*5}L${x+43} ${82+i*5}Z`} fill="#e8690f"/><path d={`M${x-12} 153v-30a12 12 0 0 1 24 0v30`} fill="#997149"/><rect x={x-12} y={87+i*5} width="24" height="22" rx="5" fill="white"/><text x={x} y={104+i*5} textAnchor="middle" fill="#725237" fontWeight="800" fontSize="19">{i===0?"?":i+7}</text></g>)}</>
      : thema === "blokken" ? <>{[[90,115],[137,115],[184,115],[114,70],[161,70],[138,25]].map(([x,y],i)=><g key={i}><rect x={x} y={y} width="42" height="42" rx="7" fill={i%2?"#efac5e":"#e8690f"} stroke="#b95416" strokeWidth="3"/><path d={`M${x+7} ${y+8}h26`} stroke="#ffd7a2" strokeWidth="4"/></g>)}</>
      : thema === "sterren" ? <>{[[73,70],[158,42],[234,84],[153,126]].map(([x,y],i)=><path key={i} d={`M${x} ${y-24}l7 16 19 2-14 13 4 19-16-10-16 10 4-19-14-13 19-2Z`} fill="#ffd35c" stroke="#d59a28" strokeWidth="2"/>)}</>
      : <><path d="M36 73Q160 165 284 73" stroke="#a87944" strokeWidth="4" fill="none"/>{[54,96,138,180,222,264].map((x,i)=><g key={x}><circle cx={x} cy={90+Math.sin(i/5*Math.PI)*35} r="18" fill={i%2?"#62b5bd":"#e8690f"} stroke="white" strokeWidth="3"/><circle cx={x-5} cy={85+Math.sin(i/5*Math.PI)*35} r="5" fill="white" opacity=".6"/></g>)}</>}
  </svg>;
}
