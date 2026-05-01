"use client";

import { useMemo, useState } from "react";

type ApiResponse = {
  quote?: string;
  confidenceMessage?: string;
  error?: string;
  details?: string;
};

export default function AffirmationsPage() {
  const [quote, setQuote] = useState(
    "You are worthy of feeling confident and beautiful in everything you wear today."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

  const generateNewAffirmation = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/affirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          regenerate: true,
        }),
      });

      const data = (await response.json()) as ApiResponse;
      if (!response.ok) {
        setError(data.error || data.details || "Could not generate affirmation.");
        return;
      }

      if (!data.quote || !data.quote.trim()) {
        setError("No affirmation returned from API.");
        return;
      }

      setQuote(data.quote.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-10">
      <section className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-white">Daily Affirmation ✨</h1>
        <p className="mt-2 text-white/60">{today}</p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">
          <p className="text-2xl italic leading-relaxed text-white sm:text-3xl">“{quote}”</p>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={() => void generateNewAffirmation()}
          disabled={loading}
          className="mt-6 rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-5 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate New Affirmation"}
        </button>
      </section>
    </main>
  );
}
