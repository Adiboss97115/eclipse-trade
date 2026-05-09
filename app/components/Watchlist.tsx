"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const availableCoins = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];

type WatchItem = {
  id: string;
  symbol: string;
};

export default function Watchlist() {
  const supabase = createClient();
  const [items, setItems] = useState<WatchItem[]>([]);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [message, setMessage] = useState("");

  async function loadWatchlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("watchlist")
      .select("id, symbol")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setItems(data || []);
  }

  async function addCoin() {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Tu dois être connecté.");
      return;
    }

    const { error } = await supabase.from("watchlist").insert({
      user_id: user.id,
      symbol,
    });

    if (error) {
      setMessage("Cette crypto est déjà dans ta watchlist.");
      return;
    }

    await loadWatchlist();
  }

  async function removeCoin(id: string) {
    await supabase.from("watchlist").delete().eq("id", id);
    await loadWatchlist();
  }

  useEffect(() => {
    loadWatchlist();
  }, []);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-xl font-bold">Watchlist</h2>
      <p className="mt-1 text-sm text-slate-400">
        Sauvegarde tes cryptos favorites.
      </p>

      <div className="mt-5 flex gap-3">
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none"
        >
          {availableCoins.map((coin) => (
            <option key={coin} value={coin}>
              {coin}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={addCoin}
          className="rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-600"
        >
          Ajouter
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-blue-300">{message}</p>}

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune crypto suivie.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-[#11182D] p-4"
            >
              <span className="font-semibold">{item.symbol}</span>

              <button
                type="button"
                onClick={() => removeCoin(item.id)}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Retirer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}