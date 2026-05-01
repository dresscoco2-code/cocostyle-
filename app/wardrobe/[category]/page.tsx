"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Analysis = {
  name?: string;
  tip?: string;
  itemName: string;
  color: string;
  style: string;
  occasion: string;
  stylingTip: string;
};

type UploadedItem = {
  id: string;
  fileName: string;
  previewUrl: string;
  status: "analyzing" | "done" | "error";
  error?: string;
  analysis?: Analysis;
  saved?: boolean;
};

const categoryLabelMap: Record<string, string> = {
  uppers: "Uppers",
  lowers: "Lowers",
  shoes: "Shoes",
  jackets: "Jackets",
};

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
        reject(new Error("Invalid image encoding."));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export default function WardrobeCategoryPage() {
  const params = useParams<{ category: string }>();
  const categorySlug = params.category ?? "";
  const categoryName = useMemo(
    () => categoryLabelMap[categorySlug] ?? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
    [categorySlug]
  );

  const [items, setItems] = useState<UploadedItem[]>([]);
  const [globalError, setGlobalError] = useState("");

  const saveAnalyzedItem = async (file: File, analysis: Analysis, localItemId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Please log in again to save wardrobe items.");
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const cleanCategory = categorySlug.toLowerCase();
    const storagePath = `${user.id}/${cleanCategory}/${Date.now()}-${localItemId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from("wardrobe").upload(storagePath, file, {
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const { data: publicData } = supabase.storage.from("wardrobe").getPublicUrl(storagePath);
    const imageUrl = publicData.publicUrl;

    const name = analysis.name ?? analysis.itemName;
    const tip = analysis.tip ?? analysis.stylingTip;

    const { error: insertError } = await supabase.from("wardrobe").insert({
      user_id: user.id,
      category: cleanCategory,
      name,
      color: analysis.color,
      style: analysis.style,
      occasion: analysis.occasion,
      tip,
      image_url: imageUrl,
    });

    if (insertError) {
      throw new Error(`Could not save wardrobe item: ${insertError.message}`);
    }
  };

  const analyzeSingleFile = async (file: File, id: string) => {
    try {
      const imageBase64 = await fileToBase64(file);
      const mediaType = file.type || "image/jpeg";

      const response = await fetch("/api/wardrobe/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mediaType,
          category: categoryName,
        }),
      });

      const data = (await response.json()) as { analysis?: Analysis; error?: string; details?: string };
      if (!response.ok || !data.analysis) {
        throw new Error(data.error || data.details || "Analysis failed.");
      }

      await saveAnalyzedItem(file, data.analysis, id);

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "done", analysis: data.analysis, saved: true } : item
        )
      );
    } catch (error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "error",
                error: error instanceof Error ? error.message : "Could not analyze this photo.",
              }
            : item
        )
      );
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalError("");
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const selected = Array.from(files);
    const newItems: UploadedItem[] = selected.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      fileName: file.name,
      previewUrl: URL.createObjectURL(file),
      status: "analyzing",
    }));

    setItems((prev) => [...newItems, ...prev]);

    for (const [index, file] of selected.entries()) {
      const id = newItems[index].id;
      await analyzeSingleFile(file, id);
    }

    event.target.value = "";
  };

  return (
    <main className="min-h-screen bg-black px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-white">{categoryName}</h1>
        <p className="mt-2 text-white/60">
          Upload your {categoryName.toLowerCase()} photos and let AI analyze each item for smart styling.
        </p>

        <label className="mt-8 flex w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center transition hover:bg-white/10">
          <div>
            <p className="text-5xl">📷</p>
            <p className="mt-3 text-lg font-semibold text-white">Upload Photos</p>
            <p className="mt-1 text-sm text-white/60">Select multiple images</p>
          </div>
          <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
        </label>

        {globalError && (
          <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {globalError}
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img src={item.previewUrl} alt={item.fileName} className="h-52 w-full object-cover" />
              <div className="p-4">
                <p className="truncate text-sm text-white/50">{item.fileName}</p>

                {item.status === "analyzing" && <p className="mt-3 text-sm text-white/70">Analyzing with Claude...</p>}

                {item.status === "error" && (
                  <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {item.error ?? "Could not analyze this photo."}
                  </p>
                )}

                {item.status === "done" && item.analysis && (
                  <div className="mt-3 space-y-2 text-sm text-white/85">
                    <p>
                      <span className="text-white/50">Item:</span> {item.analysis.itemName}
                    </p>
                    <p>
                      <span className="text-white/50">Color:</span> {item.analysis.color}
                    </p>
                    <p>
                      <span className="text-white/50">Style:</span> {item.analysis.style}
                    </p>
                    <p>
                      <span className="text-white/50">Occasion:</span> {item.analysis.occasion}
                    </p>
                    <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/80">
                      <span className="text-white/50">Tip:</span> {item.analysis.stylingTip}
                    </p>
                    {item.saved && <p className="text-xs text-emerald-300">Saved to wardrobe</p>}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
