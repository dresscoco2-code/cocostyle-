import Link from 'next/link';

const CATEGORIES = [
  { slug: 'uppers' as const, label: 'Uppers', emoji: '👕', blurb: 'Tops, shirts, knits' },
  { slug: 'lowers' as const, label: 'Lowers', emoji: '👖', blurb: 'Pants, skirts, shorts' },
  { slug: 'shoes' as const, label: 'Shoes', emoji: '👟', blurb: 'Sneakers, boots, heels' },
  { slug: 'jackets' as const, label: 'Jackets', emoji: '🧥', blurb: 'Layers & outerwear' },
];

export default function WardrobePage() {
  return (
    <div className="min-h-screen bg-[#07070c] pb-20 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">CocoStyle</p>
        <h1 className="mt-2 bg-gradient-to-r from-[#e8a598] via-[#c084fc] to-[#8b5cf6] bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
          Wardrobe
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/50">
          Choose a category to add and manage pieces with AI validation.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map(({ slug, label, emoji, blurb }) => (
            <li key={slug}>
              <Link
                href={`/wardrobe/${slug}`}
                className="flex flex-col gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.03] p-6 transition hover:border-[#c084fc]/40 hover:bg-white/[0.06]"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-lg font-semibold text-white">{label}</span>
                <span className="text-sm text-white/45">{blurb}</span>
                <span className="mt-2 text-sm font-medium text-[#c084fc]">Open →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
