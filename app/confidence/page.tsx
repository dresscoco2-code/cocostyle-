"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type WardrobeItem = {
  id: string;
  category: string;
  name: string;
  color: string;
  style: string;
  occasion?: string;
  tip?: string;
  image_url?: string;
};

type OutfitSuggestion = {
  occasion: string;
  title: string;
  items: string[];
  whyConfidence: string;
};

const occasions = [
  { label: "☀️ Daily Casual", value: "Daily Casual" },
  { label: "💼 Work / Office", value: "Work / Office" },
  { label: "🎉 Party Night", value: "Party Night" },
  { label: "🏋️ Gym / Sports", value: "Gym / Sports" },
  { label: "💑 Date Night", value: "Date Night" },
  { label: "✈️ Travel", value: "Travel" },
  { label: "🎓 College / Campus", value: "College / Campus" },
  { label: "🛍️ Shopping Day", value: "Shopping Day" },
  { label: "☕ Coffee Meetup", value: "Coffee Meetup" },
  { label: "🎨 Creative Day", value: "Creative Day" },
  { label: "🏖️ Beach Day", value: "Beach Day" },
  { label: "🌧️ Rainy Day", value: "Rainy Day" },
  { label: "❄️ Winter Outing", value: "Winter Outing" },
  { label: "🌸 Spring Walk", value: "Spring Walk" },
  { label: "🍂 Autumn Stroll", value: "Autumn Stroll" },
  { label: "🎤 Concert / Show", value: "Concert / Show" },
  { label: "🎭 Theatre / Opera", value: "Theatre / Opera" },
  { label: "🍽️ Fine Dining", value: "Fine Dining" },
  { label: "🍕 Casual Dinner", value: "Casual Dinner" },
  { label: "🏠 House Party", value: "House Party" },
  { label: "💍 Wedding Guest", value: "Wedding Guest" },
  { label: "🤵 Formal Event", value: "Formal Event" },
  { label: "🙏 Religious / Temple", value: "Religious / Temple" },
  { label: "🎂 Birthday Party", value: "Birthday Party" },
  { label: "👨‍👩‍👧 Family Gathering", value: "Family Gathering" },
  { label: "🏕️ Camping / Hiking", value: "Camping / Hiking" },
  { label: "🐴 Brunch with Friends", value: "Brunch with Friends" },
  { label: "🎮 Gaming Night", value: "Gaming Night" },
  { label: "📸 Photoshoot", value: "Photoshoot" },
  { label: "🌙 Night Out", value: "Night Out" },
];

export default function ConfidencePage() {
  const [outfits, setOutfits] = useState<OutfitSuggestion[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("Daily Casual");

  const generateOutfitsForOccasion = async (items: WardrobeItem[], occasion: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/confidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, occasion }),
      });

      const data = (await response.json()) as {
        outfits?: OutfitSuggestion[];
        error?: string;
        details?: string;
      };

      if (!response.ok) {
        setError(data.error || data.details || "Failed to generate outfit suggestions.");
        return;
      }

      if (!data.outfits || data.outfits.length < 1) {
        setError("Claude did not return outfit combinations.");
        return;
      }

      setOutfits(data.outfits.slice(0, 3));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          setError(userError.message);
          return;
        }
        if (!user) {
          setError("Please log in to generate confident outfit suggestions.");
          return;
        }

        const { data: wardrobeData, error: wardrobeError } = await supabase
          .from("wardrobe")
          .select("id, category, name, color, style, occasion, tip, image_url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (wardrobeError) {
          setError(`Wardrobe fetch failed: ${wardrobeError.message}`);
          return;
        }

        const items = (wardrobeData ?? []) as WardrobeItem[];
        if (items.length === 0) {
          setError("Add clothes to your wardrobe first.");
          return;
        }
        setWardrobeItems(items);

        await generateOutfitsForOccasion(items, selectedOccasion);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error occurred.");
      } finally {
        // loading handled by generateOutfitsForOccasion
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const findWardrobeMatch = (suggestedItemName: string) => {
    const query = suggestedItemName.trim().toLowerCase();
    if (!query) return null;

    const exact = wardrobeItems.find((item) => item.name.trim().toLowerCase() === query);
    if (exact) return exact;

    const partial = wardrobeItems.find((item) => {
      const candidate = item.name.trim().toLowerCase();
      return candidate.includes(query) || query.includes(candidate);
    });
    return partial ?? null;
  };

  return (
    <main className="min-h-screen bg-black px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-4xl font-bold italic text-transparent">
          Confidence Fits
        </h1>
        <p className="mt-2 text-white/60">
          Personalized outfit combinations for daily casual, work/formal, and party occasions.
        </p>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-white/70">Choose your occasion</p>
          <div className="max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {occasions.map((occasion) => {
              const active = selectedOccasion === occasion.value;
              return (
                <button
                  key={occasion.value}
                  type="button"
                  onClick={() => {
                    setSelectedOccasion(occasion.value);
                    if (wardrobeItems.length > 0) {
                      void generateOutfitsForOccasion(wardrobeItems, occasion.value);
                    }
                  }}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                    active
                      ? "border-rose-300/60 bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] text-white"
                      : "border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {occasion.label}
                </button>
              );
            })}
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Generating confidence outfits for {selectedOccasion}...
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {outfits.map((outfit, idx) => (
              <article
                key={`${outfit.occasion}-${idx}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
              >
                <p className="text-xs uppercase tracking-widest text-white/50">{outfit.occasion}</p>
                <h2 className="mt-2 text-xl font-bold text-white">{outfit.title}</h2>
                <ul className="mt-4 space-y-2 text-sm text-white/75">
                  {outfit.items.map((itemName) => {
                    const matched = findWardrobeMatch(itemName);
                    return (
                      <li
                        key={`${outfit.occasion}-${itemName}`}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                      >
                        {matched?.image_url ? (
                          <img
                            src={matched.image_url}
                            alt={matched.name}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-lg border border-white/10 bg-white/5" />
                        )}
                        <span>{itemName}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80">
                  {outfit.whyConfidence}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
