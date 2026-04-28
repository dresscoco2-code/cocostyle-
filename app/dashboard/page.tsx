"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setEmail(user.email ?? "");
      setLoading(false);
    };

    void loadUser();
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex items-center gap-3 text-white">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Loading dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,165,152,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(139,92,246,0.18),transparent_35%)]" />

      <section className="relative z-10 mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
        <p className="bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-4xl font-bold italic text-transparent">
          CocoStyle
        </p>
        <h1 className="mt-4 text-3xl font-bold text-white">Welcome to CocoStyle!</h1>
        <p className="mt-3 text-white/70">Signed in as: {email}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button className="rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-5 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.01]">
            Complete your profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {logoutLoading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </section>
    </main>
  );
}
