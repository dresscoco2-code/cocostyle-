'use client'
export default function DashboardPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,165,152,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(139,92,246,0.18),transparent_35%)]" />
      <section className="relative z-10 mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
        <p className="bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-4xl font-bold italic text-transparent">
          CocoStyle
        </p>
        <h1 className="mt-4 text-3xl font-bold text-white">Welcome to CocoStyle! 🎉</h1>
        <p className="mt-3 text-white/70">Your confidence journey starts here.</p>
        <div className="mt-8">
          <button 
  onClick={() => window.location.href = '/onboarding'}
  className="rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-5 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.01]">
  Complete your profile
</button>
        </div>
      </section>
    </main>
  )
}