"use client";

import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Lazy loading dos componentes pesados
const ScreenerAcoes = lazy(() => import("@/components/ScreenerAcoes"));
const HeatmapTreemap = lazy(() => import("@/components/HeatmapTreemap"));
const ComparadorVisual = lazy(() => import("@/components/ComparadorVisual"));
const CorrelacaoVisual = lazy(() => import("@/components/CorrelacaoVisual"));
const PaperTrading = lazy(() => import("@/components/PaperTrading"));

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="glass rounded-xl p-6 animate-pulse">
    <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-32 bg-gray-700 rounded"></div>
      <div className="h-32 bg-gray-700 rounded"></div>
    </div>
  </div>
);

export default function FerramentasPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Dashboard
        </button>

        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            🛠️ Ferramentas Avançadas
          </h1>
          <p className="text-gray-400">
            Screener, Comparador e Visualizações de Mercado
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Paper Trading - Destaque no topo */}
        <Suspense fallback={<LoadingSkeleton />}>
          <PaperTrading />
        </Suspense>

        {/* Screener - Carrega primeiro (mais leve) */}
        <Suspense fallback={<LoadingSkeleton />}>
          <ScreenerAcoes />
        </Suspense>

        {/* Comparador - Carrega depois */}
        <Suspense fallback={<LoadingSkeleton />}>
          <ComparadorVisual />
        </Suspense>

        {/* Correlação Visual */}
        <Suspense fallback={<LoadingSkeleton />}>
          <CorrelacaoVisual />
        </Suspense>

        {/* Treemap - Carrega por último (mais pesado) */}
        <Suspense fallback={<LoadingSkeleton />}>
          <HeatmapTreemap />
        </Suspense>
      </div>
    </div>
  );
}

