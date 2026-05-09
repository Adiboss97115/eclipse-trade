import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://cryptocurrency.cv/api/news", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Erreur API news");
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Impossible de récupérer les news crypto." },
      { status: 500 }
    );
  }
}