"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Transaction = {
  symbol: string;
  amount: number;
  type: string;
};

export default function SellCrypto() {
  const supabase = createClient();

  const [holdings, setHoldings] = useState<Record<string, number>>({});
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHoldings();
  }, []);

  async function loadHoldings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("transactions")
      .select("symbol, amount, type")
      .eq("user_id", user.id);

    const portfolio: Record<string, number> = {};

    (data || []).forEach((tx: Transaction) => {
      if (!portfolio[tx.symbol]) {
        portfolio[tx.symbol] = 0;
      }

      if (tx.type === "BUY") {
        portfolio[tx.symbol] += Number(tx.amount);
      } else {
        portfolio[tx.symbol] -= Number(tx.amount);
      }
    });

    setHoldings(portfolio);
  }

  async function handleSell(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const cryptoAmount = Number(amount);

    if (!cryptoAmount || cryptoAmount <= 0) {
      setMessage("Montant invalide.");
      setLoading(false);
      return;
    }

    const owned = holdings[symbol] || 0;

    if (cryptoAmount > owned) {
      setMessage("Pas assez de crypto.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Utilisateur introuvable.");
      setLoading(false);
      return;
    }

    const priceRes = await fetch("/api/crypto");
    const prices = await priceRes.json();

    const coin = prices.find((c: any) => c.symbol === symbol);

    if (!coin) {
      setMessage("Prix introuvable.");
      setLoading(false);
      return;
    }

    const dollars = cryptoAmount * Number(coin.price);

    const walletRes = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (walletRes.error || !walletRes.data) {
      setMessage("Wallet introuvable.");
      setLoading(false);
      return;
    }

    const currentBalance = Number(walletRes.data.balance);

    const updateWallet = await supabase
      .from("wallets")
      .update({
        balance: currentBalance + dollars,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateWallet.error) {
      setMessage(updateWallet.error.message);
      setLoading(false);
      return;
    }

    const insertSell = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        symbol,
        amount: cryptoAmount,
        price: Number(coin.price),
        type: "SELL",
      });

    if (insertSell.error) {
      setMessage(insertSell.error.message);
      setLoading(false);
      return;
    }

    setMessage("Vente réussie.");
    setAmount("");

    await loadHoldings();

    setLoading(false);
  }

  return (
    <div className="mt-6 rounded-2xl border border-red-500/20 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-xl font-bold">Vendre une crypto</h2>

      <form onSubmit={handleSell} className="mt-5 space-y-4">
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#11182D] px-4 py-3"
        >
          {Object.keys(holdings).map((coin) => (
            <option key={coin} value={coin}>
              {coin}
            </option>
          ))}
        </select>

        <input
          type="number"
          step="0.000001"
          placeholder="Quantité crypto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#11182D] px-4 py-3"
        />

        <p className="text-sm text-slate-400">
          Disponible : {(holdings[symbol] || 0).toFixed(6)}
        </p>

        {message && (
          <p className="text-sm text-red-300">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? "Vente..." : "Vendre"}
        </button>
      </form>
    </div>
  );
}