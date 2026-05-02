import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CocoStyle — AI Wardrobe Styling App | Look Your Best",
  description:
    "CocoStyle uses AI to suggest perfect outfits from your existing wardrobe based on your skin tone and occasion. Free to start. Virtual try-on included.",
  keywords:
    "wardrobe app, outfit suggestions, skin tone, AI styling, virtual try-on, fashion app",
  openGraph: {
    title: "CocoStyle — Look Your Best From What You Own",
    description:
      "AI analyses your skin tone and builds perfect outfits from clothes you already own.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
