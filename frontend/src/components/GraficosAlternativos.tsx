"use client";

import { motion } from "framer-motion";
import { BarChart2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  ticker: string;
}

export default function GraficosAlternativos({ ticker }: Props) {
  const [dados, setDados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoGrafico, setTipoGrafico] = useState<"renko" | "kagi" | "point_figure" | "range">("renko");

  useEffect(() => {
    fetchDados();
  }, [ticker]);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/b3/acao/${ticker}?periodo=3mo`);
      const json = await res.json();
      setDados(json.dados || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Algoritmo Renko
  const calcularRenko = (dados: any[], brickSize: number = 2) => {
    if (dados.length === 0) return [];
    
    const renkoBricks = [];
    let currentPrice = dados[0].fechamento;
    let direction = 0; // 1 = up, -1 = down

    dados.forEach((candle, idx) => {
      const price = candle.fechamento;
      const diff = price - currentPrice;

      if (Math.abs(diff) >= brickSize) {
        const numBricks = Math.floor(Math.abs(diff) / brickSize);
        const newDirection = diff > 0 ? 1 : -1;

        for (let i = 0; i < numBricks; i++) {
          currentPrice += brickSize * newDirection;
          renkoBricks.push({
            index: idx,
            price: currentPrice,
            direction: newDirection,
            low: currentPrice - (newDirection > 0 ? 0 : brickSize),
            high: currentPrice + (newDirection > 0 ? brickSize : 0)
          });
        }
        direction = newDirection;
      }
    });

    return renkoBricks.slice(-30); // Últimos 30 bricks
  };

  // Algoritmo Kagi (Simplificado)
  const calcularKagi = (dados: any[], reversalAmount: number = 3) => {
    if (dados.length === 0) return [];
    
    const kagiLines = [];
    let currentTrend = "up";
    let lastHigh = dados[0].fechamento;
    let lastLow = dados[0].fechamento;

    dados.forEach((candle, idx) => {
      const price = candle.fechamento;

      if (currentTrend === "up") {
        if (price > lastHigh) {
          lastHigh = price;
          kagiLines.push({ index: idx, price, trend: "up" });
        } else if (price < lastHigh - reversalAmount) {
          currentTrend = "down";
          lastLow = price;
          kagiLines.push({ index: idx, price, trend: "down" });
        }
      } else {
        if (price < lastLow) {
          lastLow = price;
          kagiLines.push({ index: idx, price, trend: "down" });
        } else if (price > lastLow + reversalAmount) {
          currentTrend = "up";
          lastHigh = price;
          kagiLines.push({ index: idx, price, trend: "up" });
        }
      }
    });

    return kagiLines.slice(-40);
  };

  // Point & Figure (Simplificado)
  const calcularPointFigure = (dados: any[], boxSize: number = 1, reversalSize: number = 3) => {
    if (dados.length === 0) return [];
    
    const points = [];
    let column = 0;
    let direction = 0; // 1 = X (up), -1 = O (down)
    let currentPrice = Math.round(dados[0].fechamento);

    dados.forEach((candle, idx) => {
      const price = Math.round(candle.fechamento);
      
      if (direction === 0) {
        direction = price > currentPrice ? 1 : -1;
        column++;
      }

      if (direction === 1 && price >= currentPrice + boxSize) {
        while (price >= currentPrice + boxSize) {
          currentPrice += boxSize;
          points.push({ column, price: currentPrice, type: "X" });
        }
      } else if (direction === -1 && price <= currentPrice - boxSize) {
        while (price <= currentPrice - boxSize) {
          currentPrice -= boxSize;
          points.push({ column, price: currentPrice, type: "O" });
        }
      } else if ((direction === 1 && price <= currentPrice - (boxSize * reversalSize)) ||
                 (direction === -1 && price >= currentPrice + (boxSize * reversalSize))) {
        direction = -direction;
        column++;
        currentPrice = price;
      }
    });

    return points.slice(-50);
  };

  // Range Bars (Barras de Alcance)
  const calcularRangeBars = (dados: any[], rangeSize: number = 2) => {
    if (dados.length === 0) return [];
    
    const rangeBars = [];
    let tempBar: any = null;

    dados.forEach((candle, idx) => {
      if (!tempBar) {
        tempBar = {
          open: candle.abertura,
          high: candle.maxima,
          low: candle.minima,
          close: candle.fechamento,
          index: idx
        };
      }

      tempBar.high = Math.max(tempBar.high, candle.maxima);
      tempBar.low = Math.min(tempBar.low, candle.minima);
      tempBar.close = candle.fechamento;

      if (tempBar.high - tempBar.low >= rangeSize) {
        rangeBars.push({ ...tempBar });
        tempBar = null;
      }
    });

    return rangeBars.slice(-30);
  };

  const renkoBricks = calcularRenko(dados, 2);
  const kagiLines = calcularKagi(dados, 3);
  const pointFigure = calcularPointFigure(dados, 1, 3);
  const rangeBars = calcularRangeBars(dados, 2);

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Gráficos Alternativos</h3>
        </div>
      </div>

      {/* Toggle de Tipos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <button
          onClick={() => setTipoGrafico("renko")}
          className={`py-2 px-4 rounded-lg font-semibold transition-all ${
            tipoGrafico === "renko"
              ? "bg-cyan-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          🧱 Renko
        </button>
        <button
          onClick={() => setTipoGrafico("kagi")}
          className={`py-2 px-4 rounded-lg font-semibold transition-all ${
            tipoGrafico === "kagi"
              ? "bg-cyan-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          📈 Kagi
        </button>
        <button
          onClick={() => setTipoGrafico("point_figure")}
          className={`py-2 px-4 rounded-lg font-semibold transition-all ${
            tipoGrafico === "point_figure"
              ? "bg-cyan-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          ⭕ P&F
        </button>
        <button
          onClick={() => setTipoGrafico("range")}
          className={`py-2 px-4 rounded-lg font-semibold transition-all ${
            tipoGrafico === "range"
              ? "bg-cyan-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          📊 Range Bars
        </button>
      </div>

      {/* Gráfico Renko */}
      {tipoGrafico === "renko" && (
        <div>
          <h4 className="text-lg font-bold text-white mb-4">🧱 Renko Chart</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={renkoBricks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="price" name="Preço">
                {renkoBricks.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.direction > 0 ? "#10B981" : "#EF4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-300">
              💡 <strong>Renko</strong> filtra o ruído, mostrando apenas movimentos significativos de preço.
            </p>
          </div>
        </div>
      )}

      {/* Gráfico Kagi */}
      {tipoGrafico === "kagi" && (
        <div>
          <h4 className="text-lg font-bold text-white mb-4">📈 Kagi Chart</h4>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={kagiLines}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Line type="stepAfter" dataKey="price" stroke="#06B6D4" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-300">
              💡 <strong>Kagi</strong> ignora o tempo, focando apenas em reversões significativas.
            </p>
          </div>
        </div>
      )}

      {/* Point & Figure */}
      {tipoGrafico === "point_figure" && (
        <div>
          <h4 className="text-lg font-bold text-white mb-4">⭕ Point & Figure</h4>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" dataKey="column" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis type="number" dataKey="price" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Scatter data={pointFigure} shape="circle">
                {pointFigure.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.type === "X" ? "#10B981" : "#EF4444"} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-300">
              💡 <strong>Point & Figure</strong> usa X (alta) e O (baixa) para representar movimentos.
            </p>
          </div>
        </div>
      )}

      {/* Range Bars */}
      {tipoGrafico === "range" && (
        <div>
          <h4 className="text-lg font-bold text-white mb-4">📊 Range Bars</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={rangeBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="close" name="Fechamento">
                {rangeBars.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.close > entry.open ? "#10B981" : "#EF4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-300">
              💡 <strong>Range Bars</strong> cria barras baseadas em alcance de preço, não tempo.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

