const categories: Array<{ name: string; slug: string; emoji: string }> = [
  { name: "Uppers", slug: "uppers", emoji: "👕" },
  { name: "Lowers", slug: "lowers", emoji: "👖" },
  { name: "Shoes", slug: "shoes", emoji: "👟" },
  { name: "Jackets", slug: "jackets", emoji: "🧥" },
];

export default function WardrobePage() {
  return (
    <main className="min-h-screen bg-black px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-white">Wardrobe Categories</h1>
        <p className="mt-2 text-white/60">Choose where you want to add or view clothes.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.slug}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
            >
              <p className="text-4xl">{category.emoji}</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{category.name}</h2>
              <p className="mt-1 text-sm text-white/60">Category card</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
