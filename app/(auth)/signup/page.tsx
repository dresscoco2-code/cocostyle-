"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(30);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!showOtpStep || resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [showOtpStep, resendSeconds]);

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
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

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setError("Please accept Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const { error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      setShowOtpStep(true);
      setResendSeconds(30);
    } catch {
      setError("Could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    const token = otp.join("");
    if (token.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setOtpLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "signup",
      });
      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendSeconds > 0) return;
    setError("");
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });
      if (resendError) {
        setError(resendError.message);
        return;
      }
      setResendSeconds(30);
    } catch {
      setError("Could not resend code. Please try again.");
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
          <h1 className="mt-4 text-3xl font-bold text-white">
            {showOtpStep ? "Verify Your Email" : "Create Your Account"}
          </h1>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {!showOtpStep ? (
          <>
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 8 characters)"
                minLength={8}
                required
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-rose-300 focus:outline-none"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                minLength={8}
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
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </>
        ) : (
          <div>
            <p className="mb-5 text-center text-sm text-white/70">
              Check your email for a 6-digit code
            </p>
            <div className="mb-6 flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  inputMode="numeric"
                  maxLength={1}
                  className="h-12 w-11 rounded-xl border border-white/20 bg-white/10 text-center text-lg font-semibold text-white focus:border-rose-300 focus:outline-none"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-4 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {otpLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendSeconds > 0}
              className="mt-4 w-full text-center text-sm text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:text-white/40"
            >
              {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}
            </button>
          </div>
        )}

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
