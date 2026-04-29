"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type BodyType = "Slim" | "Athletic" | "Curvy" | "Plus Size";
type StylePersonality = "Classic" | "Trendy" | "Minimalist" | "Bold";

const bodyTypeOptions: Array<{ label: BodyType; icon: string }> = [
  { label: "Slim", icon: "🕊️" },
  { label: "Athletic", icon: "💪" },
  { label: "Curvy", icon: "🌸" },
  { label: "Plus Size", icon: "👑" },
];

const styleOptions: Array<{ label: StylePersonality; emoji: string; description: string }> = [
  { label: "Classic", emoji: "🤍", description: "Timeless, polished, and effortlessly elegant." },
  { label: "Trendy", emoji: "✨", description: "Fashion-forward looks with modern energy." },
  { label: "Minimalist", emoji: "🖤", description: "Clean lines, neutral tones, calm confidence." },
  { label: "Bold", emoji: "🔥", description: "Statement pieces, fearless colors, unapologetic vibe." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [skinTone, setSkinTone] = useState<string>("not_provided");
  const [bodyType, setBodyType] = useState<BodyType | null>(null);
  const [stylePersonality, setStylePersonality] = useState<StylePersonality | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);
      setLoadingUser(false);
    };

    void loadUser();
  }, [router]);

  const progress = useMemo(() => (step / 4) * 100, [step]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setSkinTone("auto_detected");
  };

  const goNext = () => {
    setError("");
    if (step === 3 && !bodyType) {
      setError("Please select your body type to continue.");
      return;
    }
    if (step === 4 && !stylePersonality) {
      setError("Please choose your style personality to continue.");
      return;
    }
    setStep((prev) => Math.min(4, prev + 1));
  };

  const goBack = () => {
    setError("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const finishOnboarding = async () => {
    if (!userId || !bodyType || !stylePersonality) {
      setError("Please complete all required selections.");
      return;
    }
    setSaving(true);
    setError("");
    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        skin_tone: skinTone,
        body_type: bodyType,
        style_personality: stylePersonality,
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }
    router.push("/dashboard");
  };

  if (loadingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-white/70">Preparing your style journey...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1
            className="text-4xl font-bold italic"
            style={{
              background: "linear-gradient(135deg, #e8a598, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CocoStyle
          </h1>
          <p className="mt-2 text-sm text-white/50">Style that feels like you.</p>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-8">
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between text-xs text-white/60">
              <span>Step {step} of 4</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(135deg, #e8a598, #8b5cf6)",
                }}
              />
            </div>
          </div>

          <div className="min-h-[360px] transition-all duration-300">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 text-center">
                <h2 className="text-3xl font-bold text-white">Let&apos;s Discover Your Style ✨</h2>
                <p className="mx-auto mt-4 max-w-lg text-white/70">
                  Answer a few questions and we&apos;ll personalize CocoStyle just for you
                </p>
                <button
                  onClick={goNext}
                  className="mt-10 rounded-2xl px-8 py-4 text-lg font-semibold text-white transition hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #e8a598, #8b5cf6)" }}
                >
                  Get Started
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                <h2 className="text-3xl font-bold text-white">Upload Your Photo</h2>
                <p className="mt-3 text-white/70">
                  We&apos;ll detect your skin tone to suggest colors that make you glow
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-8 w-full rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center transition hover:bg-white/10"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Uploaded preview"
                      className="mx-auto h-52 w-full max-w-sm rounded-xl object-cover"
                    />
                  ) : (
                    <>
                      <p className="text-5xl">📷</p>
                      <p className="mt-3 text-white font-medium">Tap to upload your photo</p>
                      <p className="mt-1 text-sm text-white/50">JPG or PNG • private and secure</p>
                    </>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={goNext}
                    className="rounded-xl px-5 py-3 font-semibold text-white transition hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg, #e8a598, #8b5cf6)" }}
                  >
                    {photoPreview ? "Continue" : "Skip for now"}
                  </button>
                  {photoPreview && (
                    <button
                      onClick={() => {
                        setPhotoPreview(null);
                        setSkinTone("not_provided");
                      }}
                      className="rounded-xl border border-white/20 px-5 py-3 text-white/80 transition hover:bg-white/10"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                <h2 className="text-3xl font-bold text-white">What&apos;s Your Body Type?</h2>
                <p className="mt-3 text-white/70">Choose the option that feels closest to you.</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {bodyTypeOptions.map((option) => {
                    const selected = bodyType === option.label;
                    return (
                      <button
                        key={option.label}
                        onClick={() => setBodyType(option.label)}
                        className={`rounded-2xl border p-5 text-left transition-all ${
                          selected
                            ? "border-rose-300/80 bg-white/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <p className="text-3xl">{option.icon}</p>
                        <p className="mt-3 text-lg font-semibold text-white">{option.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                <h2 className="text-3xl font-bold text-white">What&apos;s Your Style?</h2>
                <p className="mt-3 text-white/70">Pick the vibe that boosts your confidence most.</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {styleOptions.map((option) => {
                    const selected = stylePersonality === option.label;
                    return (
                      <button
                        key={option.label}
                        onClick={() => setStylePersonality(option.label)}
                        className={`rounded-2xl border p-5 text-left transition-all ${
                          selected
                            ? "border-rose-300/80 bg-white/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <p className="text-3xl">{option.emoji}</p>
                        <p className="mt-3 text-lg font-semibold text-white">{option.label}</p>
                        <p className="mt-1 text-sm text-white/65">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {error && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

          {step !== 1 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={goBack}
                disabled={saving}
                className="rounded-xl border border-white/20 px-5 py-3 text-white/80 transition hover:bg-white/10 disabled:opacity-50"
              >
                Back
              </button>

              {step < 4 ? (
                <button
                  onClick={goNext}
                  className="rounded-xl px-5 py-3 font-semibold text-white transition hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #e8a598, #8b5cf6)" }}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={finishOnboarding}
                  disabled={saving}
                  className="rounded-xl px-5 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #e8a598, #8b5cf6)" }}
                >
                  {saving ? "Saving..." : "Complete Onboarding"}
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
