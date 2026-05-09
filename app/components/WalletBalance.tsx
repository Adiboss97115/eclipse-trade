"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function WalletBalance() {
  const supabase = createClient();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    async function loadBalance() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      setBalance(Number(data?.balance || 0));
    }

    loadBalance();
  }, [supabase]);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <p className="text-sm text-slate-400">Solde disponible</p>
      <h2 className="mt-2 text-3xl font-bold">
        {balance === null ? "Chargement..." : `$${balance.toLocaleString()}`}
      </h2>
    </div>
  );
}