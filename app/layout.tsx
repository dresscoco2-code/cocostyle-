import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { GlobalNavbar } from './components/GlobalNavbar';

export const metadata: Metadata = {
  title: 'CocoStyle',
  description: 'AI-powered personal styling',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#07070c] antialiased">
        <nav className="border-b border-amber-500/15 bg-gradient-to-r from-amber-950/40 via-[#0a0a12] to-violet-950/30">
          <div className="mx-auto flex max-w-6xl items-center justify-end px-4 py-2">
            <Link
              href="/morning"
              className="text-sm font-medium text-amber-100 transition hover:text-amber-50"
            >
              🌅 Morning
            </Link>
          </div>
        </nav>
        <GlobalNavbar />
        {children}
      </body>
    </html>
  );
}
