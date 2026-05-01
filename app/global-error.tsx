"use client";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">App error</h2>
          <p className="mt-3 text-sm text-white/60">
            {error?.message || "A fatal application error occurred."}
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-5 py-3 font-medium text-white transition hover:scale-[1.02]"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
