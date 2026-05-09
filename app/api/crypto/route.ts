import { NextResponse } from "next/server";

const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];

export async function GET() {
  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error(`Erreur Binance pour ${symbol}`);
        }

        const data = await res.json();

        return {
          symbol: data.symbol,
          price: Number(data.lastPrice),
          changePercent: Number(data.priceChangePercent),
        };
      })
    );

    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: "Impossible de récupérer les prix crypto." },
      { status: 500 }
    );
  }
}