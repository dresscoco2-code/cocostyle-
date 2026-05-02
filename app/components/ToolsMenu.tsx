'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const tools = [
  { href: '/weather-outfit', label: 'Weather outfit', desc: "Today's weather + pick" },
  { href: '/planner', label: 'Week planner', desc: '7-day looks' },
  { href: '/outfit-rater', label: 'Outfit rater', desc: 'Photo score' },
  { href: '/shopping-list', label: 'Shopping list', desc: 'Top 5 gaps' },
  { href: '/rewear', label: 'Rewear', desc: 'Forgotten pieces' },
];

export function ToolsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-zinc-200 hover:border-violet-400/40 hover:bg-white/10"
        aria-expanded={open}
        aria-haspopup="true"
      >
        ✨ Tools
        <span className="text-[10px] text-zinc-500">{open ? '▲' : '▼'}</span>
      </button>
      {open ? (
        <div
          className="absolute right-0 z-[100] mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#12121a] py-2 shadow-2xl shadow-black/60 ring-1 ring-violet-500/20"
          role="menu"
        >
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-left hover:bg-white/5"
              role="menuitem"
            >
              <span className="block text-sm font-medium text-white">{t.label}</span>
              <span className="text-xs text-zinc-500">{t.desc}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}