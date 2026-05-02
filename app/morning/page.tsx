"use client";
import { useEffect, useState } from "react";
const affirmations = ["You are magnetic. Every room you walk into notices.","Your style is an extension of your power. Own it.","You dress not to impress, but to express who you truly are.","Confidence is the best outfit. Rock it and own it.","Today you are exactly where you need to be, dressed perfectly for it.","Your presence is your greatest accessory.","You carry elegance effortlessly — it is simply who you are.","Beauty begins the moment you decide to be yourself.","You are a limited edition. Dress like it.","Every outfit you wear tells a story. Make it a great one."];
const occasions = [{id:"work",emoji:"💼",label:"Work / Office"},{id:"casual",emoji:"🌿",label:"Casual Day"},{id:"date",emoji:"🌹",label:"Date Night"},{id:"gym",emoji:"💪",label:"Gym / Workout"},{id:"brunch",emoji:"🥂",label:"Brunch"},{id:"party",emoji:"🎉",label:"Party"},{id:"travel",emoji:"✈️",label:"Travel"},{id:"formal",emoji:"🎩",label:"Formal Event"},{id:"shopping",emoji:"🛍️",label:"Shopping"},{id:"beach",emoji:"🏖️",label:"Beach / Outdoor"}];
const weatherOptions = [{id:"sunny",emoji:"☀️",label:"Sunny",temp:"28°C"},{id:"cloudy",emoji:"⛅",label:"Cloudy",temp:"22°C"},{id:"rainy",emoji:"🌧️",label:"Rainy",temp:"18°C"},{id:"cold",emoji:"❄️",label:"Cold",temp:"10°C"},{id:"windy",emoji:"💨",label:"Windy",temp:"20°C"},{id:"hot",emoji:"🔥",label:"Very Hot",temp:"35°C"}];
function getGreeting(){const h=new Date().getHours();if(h<12)return{text:"Good Morning",emoji:"🌅"};if(h<17)return{text:"Good Afternoon",emoji:"☀️"};return{text:"Good Evening",emoji:"🌙"};}
function getTodayAffirmation(){const d=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0).getTime())/86400000);return affirmations[d%affirmations.length];}
function Section({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}){return(<div style={{margin:"28px 0"}}><div style={{marginBottom:"14px"}}><h2 style={{fontSize:"1rem",fontWeight:700,margin:"0 0 2px",color:"white"}}>{title}</h2><p style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.4)",margin:0}}>{subtitle}</p></div>{children}</div>);}
export default function MorningPage(){
const [time,setTime]=useState("");const [date,setDate]=useState("");const [selectedOccasion,setSelectedOccasion]=useState<string|null>(null);const [selectedWeather,setSelectedWeather]=useState<string|null>(null);const [aiOutfit,setAiOutfit]=useState<string|null>(null);const [loading,setLoading]=useState(false);const [affirmationVisible,setAffirmationVisible]=useState(false);const greeting=getGreeting();const affirmation=getTodayAffirmation();
useEffect(()=>{const update=()=>{const now=new Date();setTime(now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true}));setDate(now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}));};update();const interval=setInterval(update,1000);return()=>clearInterval(interval);},[]);
useEffect(()=>{const t=setTimeout(()=>setAffirmationVisible(true),600);return()=>clearTimeout(t);},[]);
const getOutfitSuggestion=async()=>{if(!selectedOccasion||!selectedWeather)return;setLoading(true);setAiOutfit(null);const occasion=occasions.find(o=>o.id===selectedOccasion);const weather=weatherOptions.find(w=>w.id===selectedWeather);try{const response=await fetch("/api/morning-outfit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({occasion:occasion?.label,weather:`${weather?.label} (${weather?.temp})`,greeting:greeting.text})});const data=await response.json();setAiOutfit(data?.result||"Could not generate outfit.");}catch{setAiOutfit("Something went wrong. Try again.");}finally{setLoading(false);}};
return(<div style={{minHeight:"100vh",background:"#07070c",color:"white",fontFamily:"system-ui,sans-serif",paddingBottom:"60px"}}>
<div style={{background:"linear-gradient(135deg,#0d0d18,#12081a,#0a0f1a)",borderBottom:"1px solid rgba(232,165,152,0.15)",padding:"40px 24px 32px",textAlign:"center"}}>
<div style={{fontSize:"3rem",marginBottom:"8px"}}>{greeting.emoji}</div>
<h1 style={{fontSize:"clamp(1.6rem,4vw,2.4rem)",fontWeight:700,background:"linear-gradient(135deg,#e8a598,#c084fc,#8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:"0 0 4px"}}>{greeting.text}</h1>
<div style={{fontSize:"1rem",color:"rgba(255,255,255,0.45)",marginBottom:"16px"}}>{date}</div>
<div style={{fontSize:"clamp(2rem,6vw,3.5rem)",fontWeight:200,letterSpacing:"0.1em"}}>{time}</div>
</div>
<div style={{maxWidth:"760px",margin:"0 auto",padding:"0 20px"}}>
<div style={{margin:"28px 0",padding:"24px 28px",background:"linear-gradient(135deg,rgba(232,165,152,0.08),rgba(139,92,246,0.08))",borderRadius:"20px",border:"1px solid rgba(232,165,152,0.2)",textAlign:"center",opacity:affirmationVisible?1:0,transform:affirmationVisible?"translateY(0)":"translateY(16px)",transition:"all 0.7s ease"}}>
<div style={{fontSize:"1.5rem",marginBottom:"10px"}}>✨</div>
<p style={{fontSize:"clamp(0.95rem,2.5vw,1.15rem)",fontStyle:"italic",color:"rgba(255,255,255,0.85)",lineHeight:1.6,margin:0}}>"{affirmation}"</p>
<div style={{marginTop:"10px",fontSize:"0.7rem",color:"rgba(232,165,152,0.6)",textTransform:"uppercase",letterSpacing:"0.12em"}}>Daily Affirmation</div>
</div>
<Section title="🌤️ Today Weather" subtitle="What is it like outside?">
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px"}}>
{weatherOptions.map(w=>(<button key={w.id} onClick={()=>setSelectedWeather(w.id)} style={{padding:"14px 10px",borderRadius:"14px",border:`1.5px solid ${selectedWeather===w.id?"#e8a598":"rgba(255,255,255,0.1)"}`,background:selectedWeather===w.id?"linear-gradient(135deg,rgba(232,165,152,0.15),rgba(139,92,246,0.15))":"rgba(255,255,255,0.03)",color:"white",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:"1.6rem"}}>{w.emoji}</div><div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.8)"}}>{w.label}</div><div style={{fontSize:"0.7rem",color:"rgba(232,165,152,0.7)"}}>{w.temp}</div></button>))}
</div>
</Section>
<Section title="📅 Today Occasion" subtitle="What are you dressing for?">
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"10px"}}>
{occasions.map(o=>(<button key={o.id} onClick={()=>setSelectedOccasion(o.id)} style={{padding:"14px 16px",borderRadius:"14px",border:`1.5px solid ${selectedOccasion===o.id?"#8b5cf6":"rgba(255,255,255,0.1)"}`,background:selectedOccasion===o.id?"linear-gradient(135deg,rgba(139,92,246,0.2),rgba(232,165,152,0.1))":"rgba(255,255,255,0.03)",color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:"10px"}}><span style={{fontSize:"1.4rem"}}>{o.emoji}</span><span style={{fontSize:"0.85rem"}}>{o.label}</span></button>))}
</div>
</Section>
<div style={{textAlign:"center",margin:"28px 0"}}>
<button onClick={getOutfitSuggestion} disabled={!selectedOccasion||!selectedWeather||loading} style={{padding:"16px 40px",borderRadius:"50px",border:"none",background:!selectedOccasion||!selectedWeather?"rgba(255,255,255,0.1)":"linear-gradient(135deg,#e8a598,#8b5cf6)",color:!selectedOccasion||!selectedWeather?"rgba(255,255,255,0.4)":"white",fontSize:"1rem",fontWeight:600,cursor:!selectedOccasion||!selectedWeather?"not-allowed":"pointer"}}>
{loading?"🪄 Styling you...":"✨ Get My Outfit for Today"}</button>
{(!selectedOccasion||!selectedWeather)&&<p style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.35)",marginTop:"8px"}}>Pick weather and occasion first</p>}
</div>
{loading&&<div style={{padding:"28px",borderRadius:"20px",border:"1px solid rgba(139,92,246,0.3)",background:"rgba(139,92,246,0.05)",textAlign:"center"}}><p style={{color:"rgba(255,255,255,0.6)",margin:0}}>🪄 Crafting your perfect look...</p></div>}
{aiOutfit&&!loading&&(<div style={{padding:"28px",borderRadius:"20px",border:"1px solid rgba(232,165,152,0.3)",background:"linear-gradient(135deg,rgba(232,165,152,0.06),rgba(139,92,246,0.06))"}}>
<div style={{fontWeight:700,fontSize:"0.95rem",marginBottom:"12px"}}>👗 Your Look for Today</div>
<div style={{fontSize:"0.9rem",lineHeight:1.8,color:"rgba(255,255,255,0.85)",whiteSpace:"pre-line"}}>{aiOutfit}</div>
<button onClick={getOutfitSuggestion} style={{marginTop:"20px",padding:"10px 22px",borderRadius:"50px",border:"1px solid rgba(232,165,152,0.3)",background:"transparent",color:"#e8a598",fontSize:"0.8rem",cursor:"pointer"}}>🔄 Try another look</button>
</div>)}
<div style={{marginTop:"36px"}}>
<div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:"12px"}}>Quick Access</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px"}}>
{[{href:"/wardrobe",emoji:"👗",label:"Wardrobe"},{href:"/confidence",emoji:"💪",label:"Confidence"},{href:"/affirmations",emoji:"✨",label:"Affirmations"}].map(link=>(<a key={link.href} href={link.href} style={{padding:"16px 10px",borderRadius:"14px",border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"rgba(255,255,255,0.7)",textDecoration:"none",textAlign:"center",fontSize:"0.8rem"}}><div style={{fontSize:"1.4rem",marginBottom:"6px"}}>{link.emoji}</div>{link.label}</a>))}
</div>
</div>
</div>
</div>);
}


