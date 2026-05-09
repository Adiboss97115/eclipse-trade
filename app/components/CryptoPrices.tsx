"use client";

import { useEffect, useState } from "react";

type Coin = {
  symbol: string;
  price: number;
  changePercent: number;
};

export default function CryptoPrices() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPrices() {
    const res = await fetch("/api/crypto");
    const data = await res.json();
    setCoins(data);
    setLoading(false);
  }

  useEffect(() => {
    loadPrices();
    const interval = setInterval(loadPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <p className="text-slate-400">Chargement...</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {coins.map((coin) => (
        <div
          key={coin.symbol}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <p className="text-sm text-slate-400">{coin.symbol}</p>
          <h2 className="mt-2 text-2xl font-bold">
            ${coin.price.toLocaleString()}
          </h2>
          <p
            className={`mt-2 text-sm ${
              coin.changePercent >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {coin.changePercent >= 0 ? "+" : ""}
            {coin.changePercent.toFixed(2)}%
          </p>
        </div>
      ))}
    </div>
  );
}