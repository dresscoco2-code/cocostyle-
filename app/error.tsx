"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="mt-3 text-sm text-white/60">
          {error?.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-5 py-3 font-medium text-white transition hover:scale-[1.02]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
