"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Transaction = {
  id: string;
  symbol: string;
  amount: number;
  price: number;
  created_at: string;
};

export default function Portfolio() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadPortfolio() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("transactions")
        .select("id, symbol, amount, price, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setTransactions(data || []);

  const priceRes = await fetch("/api/crypto");
  const priceData = await priceRes.json();

  const priceMap: Record<string, number> = {};
priceData.forEach((coin: { symbol: string; price: number }) => {
  priceMap[coin.symbol] = coin.price;
});

setPrices(priceMap);
      setLoading(false);
    }

    loadPortfolio();
  }, [supabase]);

  const holdings = transactions.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.symbol] = (acc[tx.symbol] || 0) + Number(tx.amount);
    return acc;
  }, {});

  if (loading) {
    return <p className="mt-6 text-slate-400">Chargement du portefeuille...</p>;
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="text-xl font-bold">Mon portefeuille</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {Object.keys(holdings).length === 0 ? (
            <p className="text-slate-400">Aucune crypto achetée.</p>
          ) : (
            Object.entries(holdings).map(([symbol, amount]) => (
             <div
  key={symbol}
  className="rounded-xl border border-white/10 bg-[#11182D] p-4"
>
  <p className="text-sm text-slate-400">{symbol}</p>

  <p className="mt-2 text-xl font-bold">
    {amount.toFixed(6)}
  </p>

  <p className="mt-2 text-sm text-slate-400">
    Valeur actuelle
  </p>

  <p className="text-lg font-semibold text-emerald-400">
    ${((prices[symbol] || 0) * amount).toLocaleString()}
  </p>
</div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="text-xl font-bold">Historique des achats</h2>

        <div className="mt-4 space-y-3">
          {transactions.length === 0 ? (
            <p className="text-slate-400">Aucune transaction.</p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-[#11182D] p-4"
              >
                <div>
                  <p className="font-semibold">{tx.symbol}</p>
                  <p className="text-sm text-slate-400">
                    {new Date(tx.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold">{Number(tx.amount).toFixed(6)}</p>
                  <p className="text-sm text-slate-400">
                    Prix : ${Number(tx.price).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}