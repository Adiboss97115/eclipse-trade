"use client";

import { useEffect, useMemo, useState } from "react";
import CandlestickChart from "./components/CandlestickChart";

import {
  Bell,
  BarChart3,
  Wallet,
  Search,
  Menu,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  RefreshCw,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number | null;
};

type ChartPoint = {
  time: string;
  price: number;
};

const watchlist = [
  { name: "Bitcoin", symbol: "BTC", allocation: "42%", pnl: "+$1,240", positive: true },
  { name: "Ethereum", symbol: "ETH", allocation: "26%", pnl: "+$420", positive: true },
  { name: "Solana", symbol: "SOL", allocation: "18%", pnl: "+$860", positive: true },
  { name: "Ripple", symbol: "XRP", allocation: "14%", pnl: "-$120", positive: false },
];

const transactions = [
  { type: "Buy", asset: "BTC", amount: "$1,250", date: "Aujourd’hui • 14:32", positive: true },
  { type: "Sell", asset: "ETH", amount: "$640", date: "Aujourd’hui • 11:08", positive: false },
  { type: "Buy", asset: "SOL", amount: "$320", date: "Hier • 19:45", positive: true },
  { type: "Buy", asset: "EUR/USD", amount: "$900", date: "Hier • 16:10", positive: true },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}
function buildCandlesFromLineData(
  points: { time: string; price: number }[]
) {
  return points.map((point, index, array) => {
    const previous = array[index - 1]?.price ?? point.price;
    const current = point.price;

    const open = previous;
    const close = current;
    const high = Math.max(open, close);
    const low = Math.min(open, close);

    return {
      time: Math.floor(Date.now() / 1000) - (array.length - index) * 300,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    };
  });
}
export default function Page() {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(24850);
  const [selectedAsset, setSelectedAsset] = useState("BTC/USD");

  const [marketCoins, setMarketCoins] = useState<MarketCoin[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  const [marketError, setMarketError] = useState("");

  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [chartError, setChartError] = useState("");
const candleData = buildCandlesFromLineData(chartData);

  const numericAmount = useMemo(() => Number(amount) || 0, [amount]);

  const handleBuy = () => {
    if (!numericAmount) return;
    setBalance((prev) => prev - numericAmount);
    setAmount("");
  };

  const handleSell = () => {
    if (!numericAmount) return;
    setBalance((prev) => prev + numericAmount);
    setAmount("");
  };

  const fetchMarkets = async () => {
    try {
      setMarketError("");
      setLoadingMarkets(true);

      const response = await fetch("/api/markets", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Impossible de récupérer les marchés.");
      }

      const data: MarketCoin[] = await response.json();
      setMarketCoins(data);
    } catch (error) {
      console.error(error);
      setMarketError("Erreur lors du chargement des marchés.");
    } finally {
      setLoadingMarkets(false);
    }
  };

  const fetchChart = async (asset: string, signal?: AbortSignal) => {
  try {
    setChartError("");

    const response = await fetch(`/api/chart?asset=${encodeURIComponent(asset)}`, {
      signal,
    });

    if (!response.ok) {
      throw new Error("Erreur API");
    }

    const data = await response.json();

    // 🔥 PROTECTION IMPORTANTE
    if (!data.chartData || data.chartData.length === 0) {
      throw new Error("Pas de données");
    }

    setChartData(data.chartData);
    setCurrentPrice(data.currentPrice || 0);
    setPriceChange24h(data.priceChange24h || 0);

  } catch (error) {
    if ((error as Error).name === "AbortError") return;

    console.error("CHART ERROR:", error);

  }
};

  useEffect(() => {
    fetchMarkets();

    const interval = setInterval(() => {
      fetchMarkets();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  const symbol = selectedAsset.replace("/", "").toLowerCase();

  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    setCurrentPrice(parseFloat(data.c));
    setPriceChange24h(parseFloat(data.P));
  };

  ws.onerror = () => {
    console.log("Erreur WebSocket prix");
  };

  return () => {
    ws.close();
  };
}, [selectedAsset]);

  const positiveChange = priceChange24h >= 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.22),_transparent_25%),linear-gradient(180deg,#050816_0%,#090d1f_45%,#04060f_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 lg:px-8">
        <nav className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/30 backdrop-blur ring-1 ring-violet-500/20">
  <img
    src="/logo.png"
    alt="EclipseTrade"
    className="h-7 w-7 drop-shadow-[0_0_6px_#7c3aed]"
  />
</div>

            <div>
              <p className="text-lg font-semibold tracking-wide">
                <span className="text-white">Eclipse </span>
                <span className="text-violet-400 drop-shadow-[0_0_8px_#7c3aed] tracking-wider">Trade
                </span>
                </p>
              <p className="text-xs text-slate-400">Advanced Trading Platform</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 lg:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              placeholder="Rechercher un actif"
              className="w-56 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button className="rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10">
              Markets
            </button>
            <button className="rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10">
              Trade
            </button>
            <button className="rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10">
              Portfolio
            </button>
            <button className="rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10">
              Support
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden rounded-xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/10 md:inline-flex">
              <Bell className="h-5 w-5 text-slate-200" />
            </button>
            <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium transition hover:bg-violet-500">
              Login
            </button>
            <button className="rounded-xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/10 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>

        <section className="mb-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Marché haussier détecté
                </div>
                <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                  Trade smarter, <br className="hidden md:block" />
                  not harder
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
                  Une interface de trading moderne, intuitive et immersive pour
                  suivre les marchés, gérer votre portefeuille et exécuter vos
                  ordres en quelques secondes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:w-[320px]">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-slate-400">Volume 24h</p>
                  <p className="mt-2 text-xl font-semibold">$184.2M</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-slate-400">Traders actifs</p>
                  <p className="mt-2 text-xl font-semibold">24,892</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <button className="rounded-2xl bg-violet-600 px-5 py-4 text-sm font-semibold transition hover:bg-violet-500">
                Commencer maintenant
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold transition hover:bg-white/10">
                Créer un compte
              </button>
              <button className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20">
                Mode démo gratuit
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Balance totale</p>
                <h2 className="mt-1 text-3xl font-bold">${balance.toLocaleString()}</h2>
              </div>
              <div className="rounded-2xl bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
                +12.4%
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-400">Profit / Perte</span>
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xl font-semibold text-emerald-400">+$2,640</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-400">Actifs détenus</span>
                  <Wallet className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xl font-semibold">12 positions</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-400">Niveau de risque</span>
                  <span className="text-xs text-amber-300">Modéré</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-6 xl:grid-cols-[1.8fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-400">Marché sélectionné</p>
                <h3 className="mt-1 text-2xl font-bold">{selectedAsset}</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {["BTC/USD", "ETH/USD", "SOL/USD", "EUR/USD"].map((asset) => (
                  <button
                    key={asset}
                    onClick={() => setSelectedAsset(asset)}
                    className={`rounded-xl px-4 py-2 text-sm transition ${
                      selectedAsset === asset
                        ? "bg-violet-600 text-white"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
  <p className="text-sm text-slate-400">Prix actuel</p>
  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">
    <span className="h-2 w-2 rounded-full bg-emerald-400" />
    Live
  </span>
</div>

<h4 className="mt-1 text-4xl font-bold">
  {formatCurrency(currentPrice)}
</h4>
              </div>
              <div
                className={`rounded-2xl px-4 py-2 ${
                  positiveChange
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-red-400/10 text-red-300"
                }`}
              >
                {priceChange24h.toFixed(2)}%
              </div>
            </div>

            <CandlestickChart symbol={selectedAsset} />
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Trade Panel</h3>
                <div className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                  Demo mode
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm text-slate-400">Actif</label>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                >
                  <option>BTC/USD</option>
                  <option>ETH/USD</option>
                  <option>SOL/USD</option>
                  <option>EUR/USD</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm text-slate-400">Montant</label>
                <input
                  type="number"
                  placeholder="Ex : 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <button
                  onClick={handleBuy}
                  className="rounded-2xl bg-emerald-600 px-4 py-3 font-semibold transition hover:bg-emerald-500"
                >
                  Buy
                </button>
                <button
                  onClick={handleSell}
                  className="rounded-2xl bg-red-600 px-4 py-3 font-semibold transition hover:bg-red-500"
                >
                  Sell
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-400">Solde disponible</span>
                  <span className="text-sm font-medium">${balance.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Frais estimés</span>
                  <span className="text-sm font-medium">$2.90</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600/20">
                  <Bot className="h-5 w-5 text-violet-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Assistant IA</h3>
                  <p className="text-sm text-slate-400">Analyse rapide du marché</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-300">
                {selectedAsset} affiche actuellement une variation de{" "}
                {priceChange24h.toFixed(2)}% sur 24h. Surveille les niveaux de
                cassure pour confirmer la tendance.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Marchés crypto en direct</h3>
              <p className="text-sm text-slate-400">
                Prix, market cap, volume et variation 24h
              </p>
            </div>

            <button
              onClick={fetchMarkets}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
          </div>

          {loadingMarkets ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-slate-300">
              Chargement des marchés...
            </div>
          ) : marketError ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-red-300">
              {marketError}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-slate-400">
                    <th className="px-4 py-2 font-medium">Actif</th>
                    <th className="px-4 py-2 font-medium">Prix</th>
                    <th className="px-4 py-2 font-medium">24h</th>
                    <th className="px-4 py-2 font-medium">Market Cap</th>
                    <th className="px-4 py-2 font-medium">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {marketCoins.map((coin) => {
                    const positive = (coin.price_change_percentage_24h ?? 0) >= 0;
                    const pair =
                      coin.symbol.toUpperCase() === "USDT"
                        ? "EUR/USD"
                        : `${coin.symbol.toUpperCase()}/USD`;

                    return (
                      <tr
                        key={coin.id}
                        className="rounded-2xl border border-white/10 bg-black/20 transition hover:bg-white/5 cursor-pointer"
                        onClick={() => setSelectedAsset(pair)}
                      >
                        <td className="rounded-l-2xl px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={coin.image}
                              alt={coin.name}
                              className="h-9 w-9 rounded-full"
                            />
                            <div>
                              <p className="font-medium">{coin.name}</p>
                              <p className="text-sm uppercase text-slate-400">
                                {coin.symbol}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 font-medium">
                          {formatCurrency(coin.current_price)}
                        </td>

                        <td
                          className={`px-4 py-4 font-medium ${
                            positive ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {coin.price_change_percentage_24h?.toFixed(2) ?? "0.00"}%
                        </td>

                        <td className="px-4 py-4">
                          ${formatCompactNumber(coin.market_cap)}
                        </td>

                        <td className="rounded-r-2xl px-4 py-4">
                          ${formatCompactNumber(coin.total_volume)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="mb-5 text-xl font-semibold">Watchlist</h3>
            <div className="space-y-3">
              {watchlist.map((item) => (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-slate-400">
                      {item.symbol} • Allocation {item.allocation}
                    </p>
                  </div>
                  <span className={item.positive ? "text-emerald-400" : "text-red-400"}>
                    {item.pnl}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Historique des transactions</h3>
              <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10">
                Voir tout
              </button>
            </div>

            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div
                  key={`${tx.asset}-${index}`}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        tx.positive ? "bg-emerald-500/15" : "bg-red-500/15"
                      }`}
                    >
                      {tx.positive ? (
                        <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {tx.type} {tx.asset}
                      </p>
                      <p className="text-sm text-slate-400">{tx.date}</p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="font-semibold">{tx.amount}</p>
                    <p className={tx.positive ? "text-sm text-emerald-400" : "text-sm text-red-400"}>
                      {tx.positive ? "Ordre exécuté" : "Ordre clôturé"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}