"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<"combos" | "rewear" | "insights">("combos");
  const [result, setResult] = useState<string | null>(null);
  const [skinTone, setSkinTone] = useState<string>("");
  const [bestColors, setBestColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsight = async (type: "combos" | "rewear" | "insights") => {
    setActiveTab(type);
    setResult(null);
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setResult("App configuration is missing. Check Supabase environment variables.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setResult("Sign in to load your wardrobe insights.");
        return;
      }

      const endpoint = type === "combos" ? "/api/insights/combos" : "/api/insights";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      });
      const data = await response.json();
      setResult(data.result);
      if (data.skinTone) setSkinTone(data.skinTone);
      if (data.bestColors) setBestColors(data.bestColors);
    } catch {
      setResult("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "combos", emoji: "✨", label: "Perfect Combos", desc: "AI outfits for your skin tone" },
    { id: "rewear", emoji: "🔄", label: "Rewear", desc: "Style forgotten pieces" },
    { id: "insights", emoji: "📊", label: "Insights", desc: "Your wardrobe stats" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#07070c", color: "white", paddingBottom: "60px" }}>
      
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0d0d18, #12081a)", borderBottom: "1px solid rgba(232,165,152,0.15)", padding: "36px 24px 28px", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🧠</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 700, background: "linear-gradient(135deg,#e8a598,#c084fc,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 8px" }}>
          Wardrobe Intelligence
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", margin: 0 }}>
          7 AIs working together to perfect your style
        </p>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 20px" }}>

        {/* Skin tone badge */}
        {skinTone && (
          <div style={{ margin: "20px 0 0", padding: "12px 16px", borderRadius: "12px", background: "rgba(232,165,152,0.08)", border: "1px solid rgba(232,165,152,0.2)", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>Your skin tone:</span>
            <span style={{ fontSize: "0.85rem", color: "#e8a598", fontWeight: 600 }}>{skinTone}</span>
            {bestColors.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {bestColors.slice(0, 5).map((color) => (
                  <span key={color} style={{ padding: "2px 10px", borderRadius: "20px", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", fontSize: "0.72rem", color: "rgba(255,255,255,0.7)" }}>
                    {color}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", margin: "24px 0" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => fetchInsight(tab.id as "combos" | "rewear" | "insights")}
              style={{ padding: "16px 10px", borderRadius: "16px", border: `1.5px solid ${activeTab === tab.id ? "#e8a598" : "rgba(255,255,255,0.08)"}`, background: activeTab === tab.id ? "linear-gradient(135deg,rgba(232,165,152,0.12),rgba(139,92,246,0.12))" : "rgba(255,255,255,0.02)", color: "white", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
            >
              <div style={{ fontSize: "1.6rem", marginBottom: "6px" }}>{tab.emoji}</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: activeTab === tab.id ? "#e8a598" : "white" }}>{tab.label}</div>
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: "40px", borderRadius: "20px", border: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.04)", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🧠</div>
            <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: "0.9rem" }}>
              {activeTab === "combos" ? "7 AIs analyzing your wardrobe + skin tone..." : "AI analyzing your wardrobe..."}
            </p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div style={{ padding: "28px", borderRadius: "20px", border: "1px solid rgba(232,165,152,0.2)", background: "linear-gradient(135deg,rgba(232,165,152,0.05),rgba(139,92,246,0.05))" }}>
            <div style={{ fontSize: "0.9rem", lineHeight: 1.9, color: "rgba(255,255,255,0.85)" }}>
              {result.split("\n").map((line, i) => (
                <p key={i} style={{ margin: "4px 0" }}
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(line)
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => fetchInsight(activeTab)}
              style={{ marginTop: "20px", padding: "10px 22px", borderRadius: "50px", border: "1px solid rgba(232,165,152,0.3)", background: "transparent", color: "#e8a598", fontSize: "0.8rem", cursor: "pointer" }}
            >
              🔄 Refresh
            </button>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>✨</div>
            <p style={{ fontSize: "0.9rem" }}>Select a tab above to get AI-powered wardrobe insights</p>
          </div>
        )}

      </div>
    </div>
  );
}
