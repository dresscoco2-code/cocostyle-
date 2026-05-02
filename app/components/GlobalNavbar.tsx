import Link from 'next/link';
import { ToolsMenu } from './ToolsMenu';

const linkClass =
  'text-sm text-zinc-300 hover:text-white transition-colors';

const navLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Wardrobe', href: '/wardrobe' },
  { label: 'Closet', href: '/closet' },
  { label: 'Confidence', href: '/confidence' },
  { label: 'Affirmations', href: '/affirmations' },
  { label: 'Profile', href: '/profile' },
  { label: '📊 Insights', href: '/insights' },
];

export function GlobalNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07070c]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-white">
          CocoStyle
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {navLinks.map(({ label, href }) => (
            <Link key={href} className={linkClass} href={href}>
              {label}
            </Link>
          ))}
          <ToolsMenu />
        </nav>
      </div>
    </header>
  );
}
