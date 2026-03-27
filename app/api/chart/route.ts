import { NextRequest, NextResponse } from "next/server";

const assetMap: Record<string, string> = {
  "BTC/USD": "bitcoin",
  "ETH/USD": "ethereum",
  "SOL/USD": "solana",
  "EUR/USD": "tether",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const asset = searchParams.get("asset") || "BTC/USD";
    const coinId = assetMap[asset] || "bitcoin";

    const marketRes = await fetch(
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&price_change_percentage=24h`,
  {
    headers: { Accept: "application/json" },
    next: { revalidate: 15 },
  }
);

await new Promise((res) => setTimeout(res, 500));

const chartRes = await fetch(
  `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`,
  {
    headers: { Accept: "application/json" },
    next: { revalidate: 15 },
  }
);

    if (!marketRes.ok || !chartRes.ok) {
      return NextResponse.json(
        { error: "Impossible de récupérer les données du graphique." },
        { status: 500 }
      );
    }

    const marketData = await marketRes.json();
    const chartData = await chartRes.json();

    const market = marketData?.[0];

    const prices =
      chartData?.prices?.map((entry: [number, number]) => {
        const date = new Date(entry[0]);
        const time = date.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return {
          time,
          price: Number(entry[1].toFixed(2)),
        };
      }) || [];

    return NextResponse.json({
      asset,
      currentPrice: market?.current_price ?? 0,
      priceChange24h: market?.price_change_percentage_24h ?? 0,
      chartData: prices,
    });
  } catch (error) {
    console.error("API chart error:", error);

    return NextResponse.json(
      { error: "Erreur serveur lors du chargement du graphique." },
      { status: 500 }
    );
  }
}