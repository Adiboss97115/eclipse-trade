import CryptoPrices from "@/app/components/CryptoPrices";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import BuyCrypto from "../components/BuyCrypto";
import Portfolio from "../components/Portfolio";
import WalletBalance from "../components/WalletBalance";
import SellCrypto from "../components/SellCrypto";
import PortfolioChart from "../components/PortfolioChart";
import Watchlist from "../components/Watchlist";
import CryptoNews from "../components/CryptoNews";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, bio")
    .eq("id", user.id)
    .single();

  const fullName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "Utilisateur";

  const email =
    profile?.email ||
    user.email ||
    "Email inconnu";

  const bio = profile?.bio || "Aucune bio pour le moment.";

  const initial = fullName.charAt(0).toUpperCase();

  const colors = [
  "from-blue-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-pink-500 to-rose-500",
  "from-orange-500 to-yellow-500",
];

const color =
  colors[
    (fullName.charCodeAt(0) + fullName.length) % colors.length
  ];

  return (

    <main className="min-h-screen bg-gradient-to-br from-[#0B1020] via-[#0f172a] to-[#020617] text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-4">
  <div
  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${color} text-lg font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]`}
>
  {initial}
</div>

  <div>
    <p className="text-sm text-slate-400">Connecté en tant que</p>
    <h1 className="text-xl font-bold">{fullName}</h1>
    <p className="text-sm text-slate-400">{email}</p>
  </div>
</div>

          <div className="flex gap-3">
  <Link
    href="/profile"
    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
  >
    Modifier profil
  </Link>

  <form action="/auth/signout" method="post">
    <button
      type="submit"
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
    >
      Se déconnecter
    </button>
  </form>
</div>  
        </div>

        {/* CRYPTO */}
        <div className="mt-8">
  <CryptoPrices />
  <WalletBalance />
  <PortfolioChart />
  <BuyCrypto />
  <SellCrypto />
  <Portfolio />
  <Watchlist />
  <CryptoNews />
</div>

{/* BIO */}
<div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
  <p className="text-sm text-slate-400">Bio</p>
  <p className="mt-2 text-slate-200">{bio}</p>
</div>
      </div>
    </main>
  );
}