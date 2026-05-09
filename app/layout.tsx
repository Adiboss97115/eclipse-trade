import Image from "next/image";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EclipseTrade 🌑",
  description: "Plateforme de trading avancée"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0B1020] text-white">

  {/* HEADER */}
  <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-md bg-[#0B1020]/80 sticky top-0 z-50">
    
    {/* Logo + Nom */}
    <div className="flex items-center gap-3">
  <Image
    src="/logo.png"
    alt="EclipseTrade logo"
    width={40}
    height={40}
  />
  <span className="text-lg font-bold tracking-wide bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
  EclipseTrade
</span>
</div>

    {/* Navigation */}
    <nav className="flex items-center gap-8 text-sm font-medium text-slate-300">
  
  <Link
    href="/"
    className="relative group hover:text-white transition"
  >
    Accueil
    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
  </Link>

  <Link
    href="/markets"
    className="relative group hover:text-white transition"
  >
    Marchés
    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
  </Link>

  <Link
    href="/dashboard"
    className="relative group hover:text-white transition"
  >
    Portfolio
    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
  </Link>

  <Link
    href="/contact"
    className="relative group hover:text-white transition"
  >
    Support
    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
  </Link>

</nav>

    {/* Bouton */}
    <a
  href="/auth"
  className="animated-gradient-button rounded-xl px-4 py-2 font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_35px_rgba(59,130,246,0.55)]"
>
  Commencer
</a>

  </header>

  {/* CONTENU */}
  <main className="flex-1">
    {children}
  </main>
<footer className="mt-20 py-6 text-center text-sm text-slate-500">
  Built with Next.js & Supabase by Adrien Laviso
</footer>

</body>
</html>
  );
}
