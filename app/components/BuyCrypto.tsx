"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function BuyCrypto() {
  const supabase = createClient();

  const [symbol, setSymbol] = useState("BTCUSDT");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleBuy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const dollars = Number(amount);

    if (!dollars || dollars <= 0) {
      setMessage("Entre un montant valide.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    console.log("USER ID:", user?.id);

    if (!user) {
      setMessage("Tu dois être connecté.");
      setLoading(false);
      return;
    }

    let { data: wallet, error: walletError } = await supabase
  .from("wallets")
  .select("id, balance")
  .eq("user_id", user.id)
  .maybeSingle();

if (walletError) {
  setMessage(walletError.message);
  setLoading(false);
  return;
}

if (!wallet) {
  const { data: newWallet, error: createWalletError } = await supabase
    .from("wallets")
    .insert({
      user_id: user.id,
      balance: 10000,
    })
    .select("id, balance")
    .single();

  if (createWalletError || !newWallet) {
    setMessage(createWalletError?.message || "Impossible de créer le wallet.");
    setLoading(false);
    return;
  }

  wallet = newWallet;
}

const balance = Number(wallet.balance);

    if (balance < dollars) {
      setMessage("Solde insuffisant.");
      setLoading(false);
      return;
    }

    const priceRes = await fetch(`/api/crypto`);
    const prices = await priceRes.json();

    const coin = prices.find((c: any) => c.symbol === symbol);

    if (!coin) {
      setMessage("Prix crypto introuvable.");
      setLoading(false);
      return;
    }

    const cryptoAmount = dollars / Number(coin.price);
    const newBalance = balance - dollars;

    const updateWallet = await supabase
      .from("wallets")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateWallet.error) {
      setMessage(updateWallet.error.message);
      setLoading(false);
      return;
    }

    const insertTransaction = await supabase.from("transactions").insert({
      user_id: user.id,
      symbol,
      amount: cryptoAmount,
      price: Number(coin.price),
    });

    if (insertTransaction.error) {
      setMessage(insertTransaction.error.message);
      setLoading(false);
      return;
    }

    setMessage(`Achat réussi : ${cryptoAmount.toFixed(6)} ${symbol}`);
    setAmount("");
    setLoading(false);
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-xl font-bold">Acheter une crypto</h2>
      <p className="mt-1 text-sm text-slate-400">
        Simulation d’achat avec ton solde fictif.
      </p>

      <form onSubmit={handleBuy} className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Crypto</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none"
          >
            <option value="BTCUSDT">BTC</option>
            <option value="ETHUSDT">ETH</option>
            <option value="SOLUSDT">SOL</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Montant en $
          </label>
          <input
            type="number"
            placeholder="Ex : 100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {message && <p className="text-sm text-blue-300">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="animated-gradient-button w-full rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Achat en cours..." : "Acheter"}
        </button>
      </form>
    </div>
  );
}