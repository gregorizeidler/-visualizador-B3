"use client";

import { motion } from "framer-motion";
import { Network, GitBranch } from "lucide-react";
import { useState } from "react";

interface CorrelacaoData {
  correlacoes: { [key: string]: { [key: string]: number } };
  pares: Array<{
    source: string;
    target: string;
    correlacao: number;
    forca: number;
  }>;
  tickers: string[];
}

export default function CorrelacaoVisual() {
  const [tickers, setTickers] = useState("PETR4,VALE3,ITUB4,BBDC4,ABEV3,WEGE3");
  const [data, setData] = useState<CorrelacaoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"heatmap" | "network">("heatmap");

  const buscarCorrelacoes = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/b3/correlacoes?tickers=${encodeURIComponent(tickers)}&periodo=6mo`
      );
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Erro ao buscar correlações:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCorCorrelacao = (valor: number) => {
    if (valor > 0.7) return "bg-green-600";
    if (valor > 0.4) return "bg-green-500";
    if (valor > 0.1) return "bg-yellow-500";
    if (valor > -0.1) return "bg-gray-500";
    if (valor > -0.4) return "bg-red-500";
    return "bg-red-600";
  };

  const getTextCorrelacao = (valor: number) => {
    if (valor > 0.7) return "Forte Positiva";
    if (valor > 0.4) return "Moderada Positiva";
    if (valor > 0.1) return "Fraca Positiva";
    if (valor > -0.1) return "Neutra";
    if (valor > -0.4) return "Fraca Negativa";
    if (valor > -0.7) return "Moderada Negativa";
    return "Forte Negativa";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Network className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Correlação Visual Interativa</h3>
      </div>

      {/* Input */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Ex: PETR4,VALE3,ITUB4,BBDC4"
          value={tickers}
          onChange={(e) => setTickers(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={buscarCorrelacoes}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? "Calculando..." : "Calcular"}
        </button>
      </div>

      {/* Toggle View Mode */}
      {data && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode("heatmap")}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              viewMode === "heatmap"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            🔥 Mapa de Calor
          </button>
          <button
            onClick={() => setViewMode("network")}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              viewMode === "network"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            🕸️ Rede de Conexões
          </button>
        </div>
      )}

      {/* Heatmap */}
      {data && viewMode === "heatmap" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2"></th>
                {data.tickers.map((ticker) => (
                  <th key={ticker} className="p-2 text-white font-bold text-sm">
                    {ticker}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.tickers.map((ticker1, i) => {
                const ticker1Sa = `${ticker1}.SA`;
                return (
                  <tr key={ticker1}>
                    <td className="p-2 text-white font-bold text-sm">{ticker1}</td>
                    {data.tickers.map((ticker2, j) => {
                      const ticker2Sa = `${ticker2}.SA`;
                      const corr = data.correlacoes[ticker1Sa]?.[ticker2Sa] ?? 0;
                      return (
                        <motion.td
                          key={`${ticker1}-${ticker2}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (i + j) * 0.02 }}
                          className="p-2"
                        >
                          <div
                            className={`${getCorCorrelacao(
                              corr
                            )} rounded text-white text-center p-3 font-bold text-sm cursor-pointer hover:scale-110 transition-transform`}
                            title={getTextCorrelacao(corr)}
                          >
                            {corr.toFixed(2)}
                          </div>
                        </motion.td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Legenda */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm font-semibold text-gray-400 mb-3">Legenda:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="text-gray-300">Forte Positiva (&gt;0.7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-300">Moderada (0.1-0.7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-gray-300">Neutra (-0.1 a 0.1)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-gray-300">Negativa (&lt;-0.1)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Network Graph (Simplificado) */}
      {data && viewMode === "network" && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {data.tickers.map((ticker, idx) => (
              <motion.div
                key={ticker}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500 rounded-lg text-center"
              >
                <p className="text-2xl font-bold text-white">{ticker}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold text-white mb-4">🔗 Conexões Fortes</h4>
            {data.pares
              .filter((p) => Math.abs(p.correlacao) > 0.5)
              .sort((a, b) => Math.abs(b.correlacao) - Math.abs(a.correlacao))
              .map((par, idx) => (
                <motion.div
                  key={`${par.source}-${par.target}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    par.correlacao > 0 ? "bg-green-900/20" : "bg-red-900/20"
                  }`}
                >
                  <GitBranch
                    className={`w-6 h-6 ${
                      par.correlacao > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold">
                      {par.source} ↔️ {par.target}
                    </p>
                    <p className="text-xs text-gray-400">{getTextCorrelacao(par.correlacao)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        par.correlacao > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {par.correlacao.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Se {par.source} sobe, {par.target} {par.correlacao > 0 ? "sobe" : "cai"}{" "}
                      {(Math.abs(par.correlacao) * 100).toFixed(0)}% das vezes
                    </p>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="text-center py-12">
          <Network className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Digite os tickers e clique em "Calcular"</p>
        </div>
      )}
    </motion.div>
  );
}

