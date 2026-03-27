"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
} from "lightweight-charts";
function toBinanceSymbol(symbol: string) {
  if (symbol === "BTC/USD") return "btcusdt";
  if (symbol === "ETH/USD") return "ethusdt";
  if (symbol === "SOL/USD") return "solusdt";
  if (symbol === "EUR/USD") return "eurusdt";
  return "btcusdt";
}

type Props = {
  symbol: string;
};

export default function CandlestickChart({ symbol }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

useEffect(() => {
  if (!containerRef.current) return;

  const chart = createChart(containerRef.current, {
    width: containerRef.current.clientWidth,
    height: 360,
    layout: {
      background: { type: ColorType.Solid, color: "#0f172a" },
      textColor: "#94a3b8",
    },
    grid: {
      vertLines: { color: "rgba(255,255,255,0.06)" },
      horzLines: { color: "rgba(255,255,255,0.06)" },
    },
    rightPriceScale: {
      borderColor: "rgba(255,255,255,0.08)",
    },
    timeScale: {
      borderColor: "rgba(255,255,255,0.08)",
      timeVisible: true,
    },
    crosshair: {
      vertLine: {
        color: "rgba(139, 92, 246, 0.4)",
      },
      horzLine: {
        color: "rgba(139, 92, 246, 0.4)",
      },
    },
  });

  const candleSeries = chart.addSeries(CandlestickSeries, {
    upColor: "#10b981",
    downColor: "#ef4444",
    wickUpColor: "#10b981",
    wickDownColor: "#ef4444",
    borderVisible: false,
  });


const binanceSymbol = toBinanceSymbol(symbol);

const loadHistoricalKlines = async () => {
  const res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol.toUpperCase()}&interval=1m&limit=100`
  );

  const data = await res.json();

  const formatted = data.map((k: any) => ({
    time: Math.floor(k[0] / 1000),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
  }));

  candleSeries.setData(formatted as any);
  chart.timeScale().fitContent();
};

loadHistoricalKlines();

const ws = new WebSocket(
  `wss://stream.binance.com:9443/ws/${binanceSymbol}@kline_1m`
);

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      const k = message.k;

      if (!k) return;

      const liveCandle = {
        time: Math.floor(k.t / 1000),
        open: Number(k.o),
        high: Number(k.h),
        low: Number(k.l),
        close: Number(k.c),
      };

      candleSeries.update(liveCandle as any);
    } catch (error) {
      console.error("Binance WS parse error:", error);
    }
  };

  ws.onerror = () => {
  console.log("Binance WebSocket: connexion interrompue");
};
ws.onopen = () => {
  console.log("Binance WebSocket connecté");
};

ws.onclose = (event) => {
  console.log("Binance WebSocket fermé:", event.code, event.reason);
};

  chart.timeScale().fitContent();

  const handleResize = () => {
    if (!containerRef.current) return;
    chart.applyOptions({
      width: containerRef.current.clientWidth,
    });
  };

  window.addEventListener("resize", handleResize);
  chartRef.current = chart;

  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
  ws.close();
}
    window.removeEventListener("resize", handleResize);
    chart.remove();
    chartRef.current = null;
  };
}, [symbol]);

  return <div ref={containerRef} className="w-full" />;
}