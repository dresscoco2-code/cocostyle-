"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const wardrobeLinks = [
  { label: "Uppers", href: "/wardrobe/uppers" },
  { label: "Lowers", href: "/wardrobe/lowers" },
  { label: "Shoes", href: "/wardrobe/shoes" },
  { label: "Jackets", href: "/wardrobe/jackets" },
];

const navLinks = [
  { label: "🏠 Dashboard", href: "/dashboard" },
  { label: "👤 Profile", href: "/profile" },
  { label: "🗂️ Closet", href: "/closet" },
  { label: "💪 Confidence", href: "/confidence" },
  { label: "✨ Affirmations", href: "/affirmations" },
];

export default function GlobalNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isWardrobeActive = pathname === "/wardrobe" || pathname.startsWith("/wardrobe/");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          className="bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] bg-clip-text text-2xl font-bold italic text-transparent"
        >
          CocoStyle
        </Link>

        <button
          type="button"
          className="rounded-md border border-white/15 px-3 py-1 text-sm text-white md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/dashboard"
            className={`rounded-lg px-3 py-2 text-sm transition ${
              isActive("/dashboard") ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            🏠 Dashboard
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setWardrobeOpen((prev) => !prev)}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                isWardrobeActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              👗 Wardrobe
            </button>
            {wardrobeOpen && (
              <div className="absolute left-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#111111] p-2 shadow-xl">
                <Link
                  href="/wardrobe"
                  className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                  onClick={() => setWardrobeOpen(false)}
                >
                  All Categories
                </Link>
                {wardrobeLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-lg px-3 py-2 text-sm transition ${
                      isActive(link.href)
                        ? "bg-white/15 text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setWardrobeOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                isActive(link.href) ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-black px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className={`rounded-lg px-3 py-2 text-sm ${
                isActive("/dashboard") ? "bg-white/15 text-white" : "text-white/75"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              🏠 Dashboard
            </Link>

            <Link
              href="/wardrobe"
              className={`rounded-lg px-3 py-2 text-sm ${
                isWardrobeActive ? "bg-white/15 text-white" : "text-white/75"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              👗 Wardrobe
            </Link>
            <div className="ml-3 flex flex-col gap-1">
              {wardrobeLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    isActive(link.href) ? "bg-white/15 text-white" : "text-white/70"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm ${
                  isActive(link.href) ? "bg-white/15 text-white" : "text-white/75"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
