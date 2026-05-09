"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { createClient } from "@/utils/supabase/client";

type Transaction = {
  symbol: string;
  amount: number;
  price: number;
  type: "BUY" | "SELL";
  created_at: string;
};

type ChartPoint = {
  date: string;
  value: number;
};

export default function PortfolioChart() {
  const supabase = createClient();
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChart() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: transactions } = await supabase
        .from("transactions")
        .select("symbol, amount, price, type, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      let totalValue = 0;

      const points =
        transactions?.map((tx: Transaction) => {
          const value = Number(tx.amount) * Number(tx.price);

          if (tx.type === "SELL") {
            totalValue -= value;
          } else {
            totalValue += value;
          }

          return {
            date: new Date(tx.created_at).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
            }),
            value: Number(totalValue.toFixed(2)),
          };
        }) || [];

      setData(points);
      setLoading(false);
    }

    loadChart();
  }, [supabase]);

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-400">
        Chargement du graphique...
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Évolution du portefeuille</h2>
        <p className="mt-1 text-sm text-slate-400">
          Valeur cumulée de tes achats et ventes simulés.
        </p>
      </div>

      {data.length === 0 ? (
        <p className="text-slate-400">
          Fais un achat pour afficher ton graphique.
        </p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8" }} />
              <YAxis tick={{ fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#11182D",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}