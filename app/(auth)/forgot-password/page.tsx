"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess("Reset link sent. Please check your inbox.");
    } catch {
      setError("Could not send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,165,152,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(139,92,246,0.18),transparent_35%)]" />
      <section className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
        <p className="text-center bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-4xl font-bold italic text-transparent">
          CocoStyle
        </p>
        <h1 className="mt-4 text-center text-3xl font-bold text-white">Forgot Password</h1>
        <p className="mt-2 text-center text-sm text-white/60">Send a reset link to your email.</p>

        {error && (
          <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-4 rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {success}
          </p>
        )}

        <form onSubmit={handleSendReset} className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-rose-300 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-4 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/70">
          Back to{" "}
          <Link href="/login" className="font-semibold text-[#e8a598] hover:underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
