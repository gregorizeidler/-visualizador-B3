"use client";

import { motion } from "framer-motion";
import { Search, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface ResultadoScreener {
  ticker: string;
  nome: string;
  preco: number;
  pl: number;
  rsi: number;
  score: number;
  recomendacao: string;
  volume: number;
}

export default function ScreenerAcoes() {
  const [resultados, setResultados] = useState<ResultadoScreener[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    pl_max: "",
    rsi_max: "",
    rsi_min: "",
    score_min: "",
    volume_min: "",
  });

  const aplicarFiltros = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.pl_max) params.append("pl_max", filtros.pl_max);
      if (filtros.rsi_max) params.append("rsi_max", filtros.rsi_max);
      if (filtros.rsi_min) params.append("rsi_min", filtros.rsi_min);
      if (filtros.score_min) params.append("score_min", filtros.score_min);
      if (filtros.volume_min) params.append("volume_min", filtros.volume_min);

      const res = await fetch(`http://localhost:8000/api/b3/screener?${params}`);
      const data = await res.json();
      setResultados(data.resultados || []);
    } catch (error) {
      console.error("Erro ao filtrar ações:", error);
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      pl_max: "",
      rsi_max: "",
      rsi_min: "",
      score_min: "",
      volume_min: "",
    });
    setResultados([]);
  };

  const getRecomendacaoColor = (rec: string) => {
    if (rec.includes("Compra Forte")) return "bg-green-600";
    if (rec.includes("Compra")) return "bg-green-500";
    if (rec.includes("Neutro")) return "bg-yellow-500";
    if (rec.includes("Venda")) return "bg-red-500";
    return "bg-gray-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">Screener de Ações B3</h3>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-xs text-gray-400 mb-2">P/L Máximo</label>
          <input
            type="number"
            placeholder="Ex: 15"
            value={filtros.pl_max}
            onChange={(e) => setFiltros({ ...filtros, pl_max: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2">RSI Mínimo</label>
          <input
            type="number"
            placeholder="Ex: 30"
            value={filtros.rsi_min}
            onChange={(e) => setFiltros({ ...filtros, rsi_min: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2">RSI Máximo</label>
          <input
            type="number"
            placeholder="Ex: 70"
            value={filtros.rsi_max}
            onChange={(e) => setFiltros({ ...filtros, rsi_max: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2">Score Mínimo</label>
          <input
            type="number"
            placeholder="Ex: 60"
            value={filtros.score_min}
            onChange={(e) => setFiltros({ ...filtros, score_min: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2">Volume Mínimo</label>
          <input
            type="number"
            placeholder="Ex: 1000000"
            value={filtros.volume_min}
            onChange={(e) => setFiltros({ ...filtros, volume_min: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={aplicarFiltros}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Filter className="w-5 h-5 inline-block mr-2" />
          {loading ? "Filtrando..." : "Aplicar Filtros"}
        </button>
        <button
          onClick={limparFiltros}
          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
        >
          Limpar
        </button>
      </div>

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">
              {resultados.length} ações encontradas
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-xs text-gray-400 font-semibold p-3">Ticker</th>
                  <th className="text-left text-xs text-gray-400 font-semibold p-3">Nome</th>
                  <th className="text-right text-xs text-gray-400 font-semibold p-3">Preço</th>
                  <th className="text-right text-xs text-gray-400 font-semibold p-3">P/L</th>
                  <th className="text-right text-xs text-gray-400 font-semibold p-3">RSI</th>
                  <th className="text-right text-xs text-gray-400 font-semibold p-3">Score</th>
                  <th className="text-left text-xs text-gray-400 font-semibold p-3">Recomendação</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((resultado, idx) => (
                  <motion.tr
                    key={resultado.ticker}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-3">
                      <span className="font-bold text-white">{resultado.ticker}</span>
                    </td>
                    <td className="p-3 text-sm text-gray-400">{resultado.nome}</td>
                    <td className="p-3 text-right font-semibold text-white">
                      R$ {resultado.preco.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-gray-300">{resultado.pl.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <span
                        className={`${
                          resultado.rsi > 70
                            ? "text-red-400"
                            : resultado.rsi < 30
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {resultado.rsi?.toFixed(1) || "-"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-bold text-cyan-400">{resultado.score.toFixed(0)}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`${getRecomendacaoColor(
                          resultado.recomendacao
                        )} text-white text-xs font-semibold px-2 py-1 rounded`}
                      >
                        {resultado.recomendacao}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {resultados.length === 0 && !loading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Configure os filtros e clique em "Aplicar Filtros"</p>
        </div>
      )}
    </motion.div>
  );
}

