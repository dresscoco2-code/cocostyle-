"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
const tools=[
  {href:"/weather-outfit",label:"Weather outfit",desc:"Today weather"},
  {href:"/planner",label:"Week planner",desc:"7-day looks"},
];
export function ToolsMenu(){
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    function close(e){if(ref.current&&!ref.current.contains(e.target))setOpen(false);}
    document.addEventListener("click",close);
    return()=>document.removeEventListener("click",close);
  },[]);
  return(
    <div className="relative" ref={ref}>
      <button type="button" onClick={()=>setOpen(o=>!o)} className="text-sm text-zinc-200 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5">
        Tools {open?"▲":"▼"}
      </button>
      {open&&<div className="absolute right-0 z-[100] mt-2 w-48 rounded-xl border border-white/10 bg-[#12121a] py-2">
        {tools.map(t=>(<Link key={t.href} href={t.href} onClick={()=>setOpen(false)} className="block px-4 py-2 text-sm text-white hover:bg-white/5">{t.label}</Link>))}
      </div>}
    </div>
  );
}