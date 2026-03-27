import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=8&page=1&sparkline=false&price_change_percentage=24h",
  {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 30 },
  }
);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Impossible de récupérer les marchés." },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API markets error:", error);

    return NextResponse.json(
      { error: "Erreur serveur lors du chargement des marchés." },
      { status: 500 }
    );
  }
}