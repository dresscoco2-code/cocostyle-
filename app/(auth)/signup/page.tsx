"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      if (oauthError) setError(oauthError.message);
    } catch {
      setError("Google sign up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!agreeTerms) {
      setError("Please accept Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const { error: signupError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      setSuccessMessage("Check your email and click the link to sign in!");
    } catch {
      setError("Could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,165,152,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(139,92,246,0.18),transparent_35%)]" />

      <section className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
        <div className="mb-8 text-center">
          <p className="bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-4xl font-bold italic text-transparent">
            CocoStyle
          </p>
          <h1 className="mt-4 text-3xl font-bold text-white">Create Your Account</h1>
          <p className="mt-2 text-sm text-white/60">We&apos;ll send you a magic link to sign in</p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}
        {successMessage && (
          <p className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            ✅ {successMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading || loading}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-4 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {googleLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Connecting...
            </>
          ) : (
            "Continue with Google"
          )}
        </button>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            required
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-rose-300 focus:outline-none"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-rose-300 focus:outline-none"
          />

          <label className="flex items-start gap-3 text-sm text-white/75">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10"
            />
            <span>I agree to Terms of Service and Privacy Policy</span>
          </label>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-4 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Sending...
              </>
            ) : (
              "Send Magic Link"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/70">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#e8a598] hover:underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
