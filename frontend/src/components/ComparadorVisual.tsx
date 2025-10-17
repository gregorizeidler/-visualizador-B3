"use client";

import { motion } from "framer-motion";
import { GitCompare, TrendingUp } from "lucide-react";
import { useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from "recharts";

interface ComparacaoItem {
  ticker: string;
  retorno_total: number;
  volatilidade: number;
  sharpe: number;
  beta: number;
  max_drawdown: number;
  rsi: number;
  score: number;
}

export default function ComparadorVisual() {
  const [tickers, setTickers] = useState("");
  const [comparacao, setComparacao] = useState<ComparacaoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const compararAcoes = async () => {
    if (!tickers.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/b3/analise/comparador?tickers=${encodeURIComponent(
          tickers
        )}&periodo=1y`,
        { method: "POST" }
      );
      const data = await res.json();
      setComparacao(data.comparacao || []);
    } catch (error) {
      console.error("Erro ao comparar ações:", error);
    } finally {
      setLoading(false);
    }
  };

  const scatterData = comparacao.map((item) => ({
    x: item.volatilidade * 100,
    y: item.retorno_total * 100,
    z: item.sharpe * 10,
    ticker: item.ticker,
    sharpe: item.sharpe,
  }));

  const getCor = (sharpe: number) => {
    if (sharpe > 1) return "#10B981";
    if (sharpe > 0.5) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <GitCompare className="w-6 h-6 text-orange-400" />
        <h3 className="text-xl font-bold text-white">Comparador Avançado de Ações</h3>
      </div>

      {/* Input */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Ex: PETR4,VALE3,ITUB4,BBDC4"
          value={tickers}
          onChange={(e) => setTickers(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={compararAcoes}
          disabled={loading || !tickers.trim()}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Comparando..." : "Comparar"}
        </button>
      </div>

      {comparacao.length > 0 && (
        <div className="space-y-6">
          {/* Scatter Plot: Retorno vs Risco */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 rounded-lg p-6"
          >
            <h4 className="text-lg font-bold text-white mb-4">📊 Retorno vs Risco (Volatilidade)</h4>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Volatilidade"
                  unit="%"
                  stroke="#9CA3AF"
                  label={{ value: "Volatilidade (%)", position: "insideBottom", offset: -10, fill: "#9CA3AF" }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Retorno"
                  unit="%"
                  stroke="#9CA3AF"
                  label={{ value: "Retorno (%)", angle: -90, position: "insideLeft", fill: "#9CA3AF" }}
                />
                <ZAxis type="number" dataKey="z" range={[100, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                          <p className="font-bold text-white mb-1">{data.ticker}</p>
                          <p className="text-sm text-gray-300">Retorno: {(data.y || 0).toFixed(2)}%</p>
                          <p className="text-sm text-gray-300">Volatilidade: {(data.x || 0).toFixed(2)}%</p>
                          <p className="text-sm text-gray-300">Sharpe: {(data.sharpe || 0).toFixed(2)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCor(entry.sharpe)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center gap-6 justify-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-400">Sharpe &gt; 1 (Ótimo)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-400">Sharpe 0.5-1 (Bom)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-gray-400">Sharpe &lt; 0.5 (Ruim)</span>
              </div>
            </div>
          </motion.div>

          {/* Tabela Comparativa */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-x-auto"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-700">
                  <th className="text-left text-sm text-gray-400 font-semibold p-3">Ticker</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">Retorno</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">Volatilidade</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">Sharpe</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">Beta</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">Max DD</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">RSI</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {comparacao.map((item, idx) => (
                  <motion.tr
                    key={item.ticker}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-3">
                      <span className="font-bold text-white">{item.ticker}</span>
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`font-semibold ${
                          (item.retorno_total || 0) > 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {(item.retorno_total || 0) > 0 ? "+" : ""}
                        {((item.retorno_total || 0) * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-3 text-right text-yellow-400 font-semibold">
                      {((item.volatilidade || 0) * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`font-semibold ${
                          (item.sharpe || 0) > 1
                            ? "text-green-400"
                            : (item.sharpe || 0) > 0.5
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {(item.sharpe || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3 text-right text-blue-400 font-semibold">
                      {(item.beta || 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-red-400 font-semibold">
                      {((item.max_drawdown || 0) * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-right text-purple-400 font-semibold">
                      {(item.rsi || 0).toFixed(1)}
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-bold text-cyan-400">{(item.score || 0).toFixed(0)}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Cards de Melhor/Pior */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-green-900/20 border-2 border-green-600 rounded-lg p-4"
            >
              <p className="text-xs text-gray-400 mb-1">🏆 Melhor Sharpe Ratio</p>
              <p className="text-2xl font-bold text-white">
                {comparacao.reduce((prev, curr) => ((prev.sharpe || 0) > (curr.sharpe || 0) ? prev : curr)).ticker}
              </p>
              <p className="text-sm text-green-400">
                {((comparacao.reduce((prev, curr) => ((prev.sharpe || 0) > (curr.sharpe || 0) ? prev : curr)).sharpe) || 0).toFixed(2)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-blue-900/20 border-2 border-blue-600 rounded-lg p-4"
            >
              <p className="text-xs text-gray-400 mb-1">📈 Maior Retorno</p>
              <p className="text-2xl font-bold text-white">
                {comparacao.reduce((prev, curr) => ((prev.retorno_total || 0) > (curr.retorno_total || 0) ? prev : curr)).ticker}
              </p>
              <p className="text-sm text-blue-400">
                +{(((comparacao.reduce((prev, curr) => ((prev.retorno_total || 0) > (curr.retorno_total || 0) ? prev : curr)).retorno_total) || 0) * 100).toFixed(2)}%
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-purple-900/20 border-2 border-purple-600 rounded-lg p-4"
            >
              <p className="text-xs text-gray-400 mb-1">🎯 Melhor Score</p>
              <p className="text-2xl font-bold text-white">
                {comparacao.reduce((prev, curr) => ((prev.score || 0) > (curr.score || 0) ? prev : curr)).ticker}
              </p>
              <p className="text-sm text-purple-400">
                {((comparacao.reduce((prev, curr) => ((prev.score || 0) > (curr.score || 0) ? prev : curr)).score) || 0).toFixed(0)} pontos
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {comparacao.length === 0 && !loading && (
        <div className="text-center py-12">
          <GitCompare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Digite os tickers separados por vírgula e clique em "Comparar"</p>
        </div>
      )}
    </motion.div>
  );
}

