"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import { motion } from "framer-motion";

interface DadosAcao {
  data: string;
  abertura: number;
  maxima: number;
  minima: number;
  fechamento: number;
  volume: number;
}

interface Props {
  ticker: string;
  dados: DadosAcao[];
  mostrarVolume?: boolean;
  altura?: number;
}

export default function GraficoCandlestick({ 
  ticker, 
  dados, 
  mostrarVolume = true,
  altura = 500 
}: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [indicadorSelecionado, setIndicadorSelecionado] = useState<string>("none");

  useEffect(() => {
    if (!chartContainerRef.current || dados.length === 0) return;

    // Criar gráfico
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9CA3AF",
      },
      grid: {
        vertLines: { color: "rgba(42, 46, 57, 0.5)" },
        horzLines: { color: "rgba(42, 46, 57, 0.5)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: altura,
      timeScale: {
        borderColor: "#2B2B43",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "#2B2B43",
      },
    });

    chartRef.current = chart;

    // Série de candlestick
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#10B981",
      downColor: "#EF4444",
      borderUpColor: "#10B981",
      borderDownColor: "#EF4444",
      wickUpColor: "#10B981",
      wickDownColor: "#EF4444",
    });

    // Converter dados para formato do gráfico
    const dadosCandlestick = dados.map((d) => ({
      time: new Date(d.data).getTime() / 1000,
      open: d.abertura,
      high: d.maxima,
      low: d.minima,
      close: d.fechamento,
    }));

    candlestickSeries.setData(dadosCandlestick);

    // Volume
    if (mostrarVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: "#3B82F6",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "",
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const dadosVolume = dados.map((d) => ({
        time: new Date(d.data).getTime() / 1000,
        value: d.volume,
        color: d.fechamento >= d.abertura ? "#10B98180" : "#EF444480",
      }));

      volumeSeries.setData(dadosVolume);
    }

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [dados, mostrarVolume, altura]);

  // Adicionar indicadores quando selecionados
  useEffect(() => {
    if (!chartRef.current || dados.length === 0) return;

    // Aqui você pode adicionar lógica para indicadores técnicos
    // Por exemplo: SMA, EMA, Bollinger Bands, etc.
  }, [indicadorSelecionado, dados]);

  const calcularEstatisticas = () => {
    if (dados.length === 0) return null;

    const precoAtual = dados[dados.length - 1]?.fechamento || 0;
    const precoAnterior = dados[dados.length - 2]?.fechamento || precoAtual;
    const variacao = precoAtual - precoAnterior;
    const variacaoPct = (variacao / precoAnterior) * 100;

    const maxima52s = Math.max(...dados.map(d => d.maxima));
    const minima52s = Math.min(...dados.map(d => d.minima));
    const volumeMedio = dados.reduce((acc, d) => acc + d.volume, 0) / dados.length;

    return {
      precoAtual,
      variacao,
      variacaoPct,
      maxima52s,
      minima52s,
      volumeMedio,
    };
  };

  const stats = calcularEstatisticas();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{ticker}</h3>
          {stats && (
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-2xl font-bold text-white">
                R$ {stats.precoAtual.toFixed(2)}
              </span>
              <span
                className={`font-medium ${
                  stats.variacao >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {stats.variacao >= 0 ? "+" : ""}
                {stats.variacao.toFixed(2)} ({stats.variacaoPct.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIndicadorSelecionado("sma")}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              indicadorSelecionado === "sma"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            MMA
          </button>
          <button
            onClick={() => setIndicadorSelecionado("bollinger")}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              indicadorSelecionado === "bollinger"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Bollinger
          </button>
          <button
            onClick={() => setIndicadorSelecionado("none")}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              indicadorSelecionado === "none"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Limpar
          </button>
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full" />

      {stats && (
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
          <div>
            <p className="text-xs text-gray-400">Máxima (período)</p>
            <p className="text-sm font-semibold text-white">
              R$ {stats.maxima52s.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Mínima (período)</p>
            <p className="text-sm font-semibold text-white">
              R$ {stats.minima52s.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Volume Médio</p>
            <p className="text-sm font-semibold text-white">
              {(stats.volumeMedio / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

