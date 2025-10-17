"use client";

import { motion } from "framer-motion";
import { useState, lazy, Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Lazy loading dos componentes pesados
const ScoreTecnico = lazy(() => import("@/components/ScoreTecnico"));
const PadroesCandles = lazy(() => import("@/components/PadroesCandles"));
const VolumeProfile = lazy(() => import("@/components/VolumeProfile"));
const IndicadoresAvancados = lazy(() => import("@/components/IndicadoresAvancados"));
const Fibonacci = lazy(() => import("@/components/Fibonacci"));
const GraficosAlternativos = lazy(() => import("@/components/GraficosAlternativos"));

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="glass rounded-xl p-6 animate-pulse">
    <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-20 bg-gray-700 rounded"></div>
      <div className="h-20 bg-gray-700 rounded"></div>
    </div>
  </div>
);

export default function AnalisePage() {
  const router = useRouter();
  const [ticker, setTicker] = useState("PETR4");

  const acoesPopulares = [
    "PETR4", "VALE3", "ITUB4", "BBDC4", "ABEV3", "WEGE3", "RENT3", "MGLU3",
    "B3SA3", "RAIL3", "BBAS3", "SUZB3", "JBSS3", "RADL3", "LREN3", "VIVT3"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Análise Técnica Avançada
            </h1>
            <p className="text-gray-400">
              Indicadores, padrões e métricas avançadas para {ticker}
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Digite o ticker"
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-6 flex flex-wrap gap-2">
          {acoesPopulares.map((acao) => (
            <button
              key={acao}
              onClick={() => setTicker(acao)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                ticker === acao
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {acao}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Score Técnico - Carrega primeiro */}
        <Suspense fallback={<LoadingSkeleton />}>
          <ScoreTecnico ticker={ticker} />
        </Suspense>

        {/* Grid de 2 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <PadroesCandles ticker={ticker} />
          </Suspense>
          <Suspense fallback={<LoadingSkeleton />}>
            <VolumeProfile ticker={ticker} />
          </Suspense>
        </div>

        {/* Indicadores Avançados */}
        <Suspense fallback={<LoadingSkeleton />}>
          <IndicadoresAvancados ticker={ticker} />
        </Suspense>

        {/* Fibonacci - Zonas e Extensões */}
        <Suspense fallback={<LoadingSkeleton />}>
          <Fibonacci ticker={ticker} />
        </Suspense>

        {/* Gráficos Alternativos */}
        <Suspense fallback={<LoadingSkeleton />}>
          <GraficosAlternativos ticker={ticker} />
        </Suspense>
      </div>
    </div>
  );
}

