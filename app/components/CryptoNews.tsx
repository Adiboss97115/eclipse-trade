"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  title?: string;
  url?: string;
  source?: string;
  published_at?: string;
  summary?: string;
};

export default function CryptoNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch("/api/crypto-news", { cache: "no-store" });
        const data = await res.json();

        const items = Array.isArray(data)
          ? data
          : data.articles || data.news || data.items || [];

        setNews(items.slice(0, 5));
      } catch {
        setNews([]);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-xl font-bold">News crypto</h2>
      <p className="mt-1 text-sm text-slate-400">
        Dernières actualités du marché crypto.
      </p>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400">Chargement des news...</p>
        ) : news.length === 0 ? (
          <p className="text-sm text-slate-400">
            Aucune news disponible pour le moment.
          </p>
        ) : (
          news.map((item, index) => (
            <a
              key={`${item.url}-${index}`}
              href={item.url || "#"}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-white/10 bg-[#11182D] p-4 transition hover:bg-white/10"
            >
              <p className="font-semibold">
                {item.title || "Actualité crypto"}
              </p>

              {item.summary && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                  {item.summary}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{item.source || "Crypto News"}</span>
                {item.published_at && (
                  <span>
                    {new Date(item.published_at).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}