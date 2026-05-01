"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const categories = [
  { label: "Uppers", slug: "uppers", emoji: "👕" },
  { label: "Lowers", slug: "lowers", emoji: "👖" },
  { label: "Shoes", slug: "shoes", emoji: "👟" },
  { label: "Jackets", slug: "jackets", emoji: "🧥" },
];

const affirmations = [
  "You already have everything it takes to shine today.",
  "Confidence is your best outfit. Wear it proudly.",
  "Your style is your story. Own it with pride.",
  "Small choices today build your glow tomorrow.",
];

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState("there");
  const [profileComplete, setProfileComplete] = useState(false);
  const [skinTone, setSkinTone] = useState<string | null>(null);
  const [stylePersonality, setStylePersonality] = useState<string | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  const dailyAffirmation = useMemo(() => {
    const dayIndex = new Date().getDate() % affirmations.length;
    return affirmations[dayIndex];
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const fullName = (user.user_metadata?.full_name as string | undefined)?.trim();
      if (fullName) {
        setDisplayName(fullName);
        return;
      }

      const emailPrefix = user.email?.split("@")[0];
      if (emailPrefix) setDisplayName(emailPrefix);

      const { data: profileData } = await supabase
        .from("profiles")
        .select(
          "full_name, skin_tone, age_group, gender, style_personality, selfie_url, full_body_url"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        setSkinTone((profileData.skin_tone as string | null) ?? null);
        setStylePersonality((profileData.style_personality as string | null) ?? null);
        setAgeGroup((profileData.age_group as string | null) ?? null);
        setGender((profileData.gender as string | null) ?? null);

        const requiredComplete =
          Boolean(profileData.full_name) &&
          Boolean(profileData.skin_tone) &&
          Boolean(profileData.age_group) &&
          Boolean(profileData.gender) &&
          Boolean(profileData.style_personality) &&
          Boolean(profileData.selfie_url) &&
          Boolean(profileData.full_body_url);

        setProfileComplete(requiredComplete);
      }
    };

    void loadUser();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,165,152,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(139,92,246,0.18),transparent_35%)]" />

      <section className="relative z-10 mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
        <p className="bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-4xl font-bold italic text-transparent">
          CocoStyle
        </p>
        <h1 className="mt-4 text-3xl font-bold text-white">Welcome back, {displayName} ✨</h1>
        <p className="mt-2 text-white/70">Choose a category to start styling your wardrobe.</p>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
          {!profileComplete ? (
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-white/90">
                ⚠️ Complete your profile for personalized AI recommendations
              </p>
              <Link
                href="/profile"
                className="rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]"
              >
                Complete Profile →
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-white/90">✅ Profile complete — AI is personalizing your experience!</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {skinTone && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    Skin tone: {skinTone}
                  </span>
                )}
                {stylePersonality && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    Style: {stylePersonality}
                  </span>
                )}
                {ageGroup && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    Age group: {ageGroup}
                  </span>
                )}
                {gender && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    Gender: {gender}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/wardrobe/${category.slug}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
            >
              <p className="text-4xl">{category.emoji}</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{category.label}</h2>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-widest text-white/50">Daily affirmation</p>
          <p className="mt-2 text-white/85">“{dailyAffirmation}”</p>
        </div>
      </section>
    </main>
  );
}