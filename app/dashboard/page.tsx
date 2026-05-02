import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-zinc-200">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      <p className="mt-3 text-sm text-zinc-400">
        OAuth and magic links should use redirect <code className="text-zinc-300">/auth/callback</code> so
        users land on <strong className="text-white">/morning</strong> after sign-in.
      </p>
      <Link href="/morning" className="mt-6 mr-6 inline-block text-amber-300 hover:text-amber-200">
        → 🌅 Morning
      </Link>
      <Link href="/agents" className="mt-6 inline-block text-violet-300 hover:text-violet-200">
        → 🤖 AI Agents
      </Link>
    </main>
  );
}
