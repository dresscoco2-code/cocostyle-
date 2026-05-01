"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ClosetItem = {
  id: string;
  category: "Uppers" | "Lowers" | "Shoes" | "Jackets";
  image_url: string;
  name: string;
  color: string;
  style: string;
  occasion?: string;
  tip?: string;
};

const categoryOrder: Array<{ key: ClosetItem["category"]; emoji: string }> = [
  { key: "Uppers", emoji: "👕" },
  { key: "Lowers", emoji: "👖" },
  { key: "Shoes", emoji: "👟" },
  { key: "Jackets", emoji: "🧥" },
];

const normalizeCategory = (value: string): ClosetItem["category"] => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "uppers") return "Uppers";
  if (normalized === "lowers") return "Lowers";
  if (normalized === "shoes") return "Shoes";
  return "Jackets";
};

export default function ClosetPage() {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("wardrobe")
        .select("id, user_id, category, name, color, style, occasion, tip, image_url, created_at")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const normalizedItems: ClosetItem[] = (data ?? []).map((item) => ({
        id: item.id,
        category: normalizeCategory(item.category),
        image_url: item.image_url,
        name: item.name,
        color: item.color,
        style: item.style,
        occasion: item.occasion,
        tip: item.tip,
      }));

      setItems(normalizedItems);
      setLoading(false);
    };

    void loadItems();
  }, []);

  const grouped = useMemo(() => {
    return categoryOrder.map((cat) => ({
      ...cat,
      items: items.filter((item) => item.category === cat.key),
    }));
  }, [items]);

  return (
    <main className="min-h-screen bg-black px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-white">My Closet</h1>
        <p className="mt-2 text-white/60">All your uploaded clothes, grouped by category.</p>

        {loading && <p className="mt-8 text-white/60">Loading your closet...</p>}

        {error && (
          <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Could not load closet: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-8 space-y-10">
            {grouped.map((group) => (
              <section key={group.key}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-white">
                    {group.emoji} {group.key}
                  </h2>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                    {group.items.length} items
                  </span>
                </div>

                {group.items.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/50">
                    No items yet in {group.key}.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((item) => (
                      <article
                        key={item.id}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                      >
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-52 w-full object-cover"
                        />
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                              {item.color}
                            </span>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                              {item.style}
                            </span>
                            {item.occasion && (
                              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                                {item.occasion}
                              </span>
                            )}
                          </div>
                          {item.tip && (
                            <p className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75">
                              Tip: {item.tip}
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
