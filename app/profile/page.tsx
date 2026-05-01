"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read image."));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Invalid image data."));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const selfieInputRef = useRef<HTMLInputElement | null>(null);
  const fullBodyInputRef = useRef<HTMLInputElement | null>(null);

  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [fullBodyPreview, setFullBodyPreview] = useState<string | null>(null);
  const [skinTone, setSkinTone] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [stylePersonality, setStylePersonality] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [loadingSelfie, setLoadingSelfie] = useState(false);
  const [loadingFullBody, setLoadingFullBody] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingDetails, setSavingDetails] = useState(false);
  const [message, setMessage] = useState("");
  const [selfieError, setSelfieError] = useState("");
  const [fullBodyError, setFullBodyError] = useState("");
  const [selfieSavedMessage, setSelfieSavedMessage] = useState("");
  const [fullBodySavedMessage, setFullBodySavedMessage] = useState("");

  useEffect(() => {
    const loadExistingProfile = async () => {
      setLoadingProfile(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setSelfieError("Please log in again.");
          setLoadingProfile(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          // If profile row does not exist yet, keep defaults without showing an error.
          if (error.code === "PGRST116") {
            setLoadingProfile(false);
            return;
          }
          setSelfieError(error.message);
          setLoadingProfile(false);
          return;
        }

        if (data) {
          if (data.selfie_url) {
            const savedSelfie = data.selfie_url as string;
            setSelfiePreview(savedSelfie);
          }
          if (data.full_body_url) {
            const savedFullBody = data.full_body_url as string;
            setFullBodyPreview(savedFullBody);
          }
          if (data.skin_tone) {
            const savedSkinTone = data.skin_tone as string;
            setSkinTone(savedSkinTone);
          }
          if (data.age_group) setAgeGroup(data.age_group as string);
          if (data.gender) setGender(data.gender as string);
          if (data.style_personality) setStylePersonality(data.style_personality as string);
          if (data.body_type) setBodyType(data.body_type as string);
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    void loadExistingProfile();
  }, []);

  const handleSelfieUpload = async (file: File) => {
    setLoadingSelfie(true);
    setSelfieError("");
    setSelfieSavedMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSelfieError("Please log in again.");
        setLoadingSelfie(false);
        return;
      }

      // 1) Convert to base64
      const imageBase64 = await fileToBase64(file);

      // 6) Show preview
      const preview = URL.createObjectURL(file);
      setSelfiePreview(preview);

      // 2) Upload to storage at fixed path
      const selfiePath = `selfies/${user.id}/selfie.jpg`;
      const { error: uploadError } = await supabase.storage.from("profiles").upload(selfiePath, file, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      });
      if (uploadError) {
        setSelfieError(uploadError.message);
        setLoadingSelfie(false);
        return;
      }

      // 3) Get public URL
      const { data: publicUrlData } = supabase.storage.from("profiles").getPublicUrl(selfiePath);
      const publicUrl = publicUrlData.publicUrl;

      // 4) Detect skin tone using Claude API
      const detectResponse = await fetch("/api/profile/detect-skin-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mediaType: file.type || "image/jpeg",
        }),
      });
      const detectData = (await detectResponse.json()) as {
        skinTone?: string;
        error?: string;
        details?: string;
      };
      if (!detectResponse.ok) {
        if (detectData.error) {
          setSelfieError(detectData.error);
        } else if (detectData.details) {
          setSelfieError(detectData.details);
        } else {
          setSelfieError("Could not detect skin tone.");
        }
        setLoadingSelfie(false);
        return;
      }

      let detectedSkinTone = "";
      if (detectData.skinTone) {
        detectedSkinTone = detectData.skinTone;
      } else {
        detectedSkinTone = "Warm Medium";
      }

      // 5) Save to profiles
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            selfie_url: publicUrl,
            skin_tone: detectedSkinTone,
          },
          { onConflict: "id" }
        );

      if (upsertError) {
        setSelfieError(upsertError.message);
        setLoadingSelfie(false);
        return;
      }

      // 7) Show detected tone
      setSkinTone(detectedSkinTone);
      // 8) Saved message
      setSelfieSavedMessage("Saved! ✅");
    } catch (e) {
      setSelfieError(e instanceof Error ? e.message : "Selfie upload failed.");
    } finally {
      setLoadingSelfie(false);
    }
  };

  const handleFullBodyUpload = async (file: File) => {
    setLoadingFullBody(true);
    setFullBodyError("");
    setFullBodySavedMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setFullBodyError("Please log in again.");
        setLoadingFullBody(false);
        return;
      }

      // 4) Show preview
      const preview = URL.createObjectURL(file);
      setFullBodyPreview(preview);

      // 1) Upload to storage at fixed path
      const fullBodyPath = `fullbody/${user.id}/body.jpg`;
      const { error: uploadError } = await supabase.storage.from("profiles").upload(fullBodyPath, file, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      });
      if (uploadError) {
        setFullBodyError(uploadError.message);
        setLoadingFullBody(false);
        return;
      }

      // 2) Get public URL
      const { data: publicUrlData } = supabase.storage.from("profiles").getPublicUrl(fullBodyPath);
      const publicUrl = publicUrlData.publicUrl;

      // 3) Save to profiles
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_body_url: publicUrl,
          },
          { onConflict: "id" }
        );

      if (upsertError) {
        setFullBodyError(upsertError.message);
        setLoadingFullBody(false);
        return;
      }

      // 5) Saved message
      setFullBodySavedMessage("Saved! ✅");
    } catch (e) {
      setFullBodyError(e instanceof Error ? e.message : "Full body upload failed.");
    } finally {
      setLoadingFullBody(false);
    }
  };

  const handleSaveProfileDetails = async () => {
    setSavingDetails(true);
    setSelfieError("");
    setMessage("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSelfieError("Please log in again.");
        setSavingDetails(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            age_group: ageGroup || null,
            gender: gender || null,
            style_personality: stylePersonality || null,
            body_type: bodyType || null,
            skin_tone: skinTone || null,
            selfie_url: selfiePreview || null,
            full_body_url: fullBodyPreview || null,
          },
          { onConflict: "id" }
        );

      if (error) {
        setSelfieError(error.message);
        setMessage("");
      } else {
        setSelfieError("");
        setMessage("Profile saved! ✅");
      }
    } finally {
      setSavingDetails(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
          <h1 className="text-3xl font-bold text-white">📸 Upload Your Photos</h1>
          <p className="mt-2 text-white/60">
            Upload these first so CocoStyle can personalize everything for you.
          </p>

          {loadingProfile && (
            <p className="mt-4 text-sm text-white/60">Loading your existing profile...</p>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => selfieInputRef.current?.click()}
              className="rounded-2xl border border-dashed border-white/25 bg-white/5 p-6 text-left transition hover:bg-white/10"
            >
              <p className="text-2xl">🤳</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Upload Selfie</h2>
              <p className="mt-1 text-sm text-white/60">Front face photo for skin tone detection</p>
              {selfiePreview && (
                <img src={selfiePreview} alt="Selfie preview" className="mt-4 h-56 w-full rounded-xl object-cover" />
              )}
              {loadingSelfie && <p className="mt-3 text-sm text-white/70">Uploading & detecting skin tone...</p>}
              {selfieError && (
                <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {selfieError}
                </p>
              )}
              {selfieSavedMessage && (
                <p className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  {selfieSavedMessage}
                </p>
              )}
            </button>

            <button
              type="button"
              onClick={() => fullBodyInputRef.current?.click()}
              className="rounded-2xl border border-dashed border-white/25 bg-white/5 p-6 text-left transition hover:bg-white/10"
            >
              <p className="text-2xl">🧍</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Upload Full Body Photo</h2>
              <p className="mt-1 text-sm text-white/60">A full-length photo for fit and body context</p>
              {fullBodyPreview && (
                <img
                  src={fullBodyPreview}
                  alt="Full body preview"
                  className="mt-4 h-56 w-full rounded-xl object-cover"
                />
              )}
              {loadingFullBody && <p className="mt-3 text-sm text-white/70">Uploading full body photo...</p>}
              {fullBodyError && (
                <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {fullBodyError}
                </p>
              )}
              {fullBodySavedMessage && (
                <p className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  {fullBodySavedMessage}
                </p>
              )}
            </button>
          </div>

          <input
            ref={selfieInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleSelfieUpload(file);
            }}
          />
          <input
            ref={fullBodyInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFullBodyUpload(file);
            }}
          />

          {skinTone && (
            <p className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-emerald-300">
              Skin tone detected: {skinTone} ✅
            </p>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h3 className="text-xl font-semibold text-white">Profile details</h3>
          <p className="mt-2 text-sm text-white/60">Personalize your style profile for better AI suggestions.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/70">Age group</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none"
              >
                <option value="" className="bg-black">Select age group</option>
                <option value="Teen (13-17)" className="bg-black">🧒 Teen (13-17)</option>
                <option value="Young Adult (18-25)" className="bg-black">🧑 Young Adult (18-25)</option>
                <option value="Adult (26-35)" className="bg-black">👨 Adult (26-35)</option>
                <option value="Mid Adult (36-45)" className="bg-black">👨‍💼 Mid Adult (36-45)</option>
                <option value="Senior (46+)" className="bg-black">👴 Senior (46+)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none"
              >
                <option value="" className="bg-black">Select gender</option>
                <option value="Male" className="bg-black">👨 Male</option>
                <option value="Female" className="bg-black">👩 Female</option>
                <option value="Non-binary" className="bg-black">🧑 Non-binary</option>
                <option value="Prefer not to say" className="bg-black">🤐 Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">Style personality</label>
              <select
                value={stylePersonality}
                onChange={(e) => setStylePersonality(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none"
              >
                <option value="" className="bg-black">Select style personality</option>
                <option value="Casual" className="bg-black">🕶️ Casual</option>
                <option value="Professional" className="bg-black">💼 Professional</option>
                <option value="Creative" className="bg-black">🎨 Creative</option>
                <option value="Minimal" className="bg-black">🌿 Minimal</option>
                <option value="Bold" className="bg-black">🔥 Bold</option>
                <option value="Elegant" className="bg-black">👑 Elegant</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">Body type (optional)</label>
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none"
              >
                <option value="" className="bg-black">Select body type</option>
                <option value="Rectangle" className="bg-black">Rectangle</option>
                <option value="Hourglass" className="bg-black">Hourglass</option>
                <option value="Pear" className="bg-black">Pear</option>
                <option value="Apple" className="bg-black">Apple</option>
                <option value="Inverted Triangle" className="bg-black">Inverted Triangle</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => void handleSaveProfileDetails()}
            disabled={savingDetails}
            className="mt-6 rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-5 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
          >
            {savingDetails ? "Saving..." : "Save Profile"}
          </button>
        </section>
      </div>
    </main>
  );
}
