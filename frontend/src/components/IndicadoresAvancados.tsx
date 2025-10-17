"use client";

import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface IndicadoresData {
  ticker: string;
  preco_atual: number;
  vwap: number;
  obv: number;
  mfi: number;
  force_index: number;
  accumulation_distribution: number;
  roc: number;
  momentum: number;
  adx: number;
  historico: any[];
}

interface Props {
  ticker: string;
}

export default function IndicadoresAvancados({ ticker }: Props) {
  const [data, setData] = useState<IndicadoresData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndicadores();
  }, [ticker]);

  const fetchIndicadores = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/b3/analise/indicadores-avancados/${ticker}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Erro ao buscar indicadores:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-40 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const indicadores = [
    { 
      nome: "VWAP", 
      valor: data.vwap, 
      descricao: "Volume Weighted Avg Price",
      formato: "R$",
      cor: "text-blue-400"
    },
    { 
      nome: "MFI", 
      valor: data.mfi, 
      descricao: "Money Flow Index",
      formato: "",
      cor: data.mfi > 80 ? "text-red-400" : data.mfi < 20 ? "text-green-400" : "text-yellow-400"
    },
    { 
      nome: "ROC", 
      valor: data.roc, 
      descricao: "Rate of Change",
      formato: "%",
      cor: data.roc > 0 ? "text-green-400" : "text-red-400"
    },
    { 
      nome: "ADX", 
      valor: data.adx, 
      descricao: "Força da Tendência",
      formato: "",
      cor: data.adx > 25 ? "text-green-400" : "text-yellow-400"
    },
    { 
      nome: "Momentum", 
      valor: data.momentum, 
      descricao: "Momento do Preço",
      formato: "R$",
      cor: data.momentum > 0 ? "text-green-400" : "text-red-400"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Indicadores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Indicadores Avançados</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {indicadores.map((ind, idx) => (
            <motion.div
              key={ind.nome}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800/50 rounded-lg p-4"
            >
              <p className="text-xs text-gray-400 mb-1">{ind.descricao}</p>
              <p className="text-2xl font-bold mb-1">
                <span className={ind.cor}>
                  {ind.formato === "R$" && "R$ "}
                  {ind.valor?.toFixed(2)}
                  {ind.formato === "%" && "%"}
                </span>
              </p>
              <p className="text-sm font-medium text-white">{ind.nome}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Gráfico de MFI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">💹 MFI - Money Flow Index (30 dias)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.historico}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="data"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#F3F4F6" }}
            />
            <ReferenceLine y={80} stroke="#EF4444" strokeDasharray="3 3" label="Sobrecompra" />
            <ReferenceLine y={20} stroke="#10B981" strokeDasharray="3 3" label="Sobrevenda" />
            <Line
              type="monotone"
              dataKey="mfi"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              name="MFI"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Gráfico de ADX */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">💪 ADX - Força da Tendência (30 dias)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.historico}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="data"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#F3F4F6" }}
            />
            <ReferenceLine y={25} stroke="#F59E0B" strokeDasharray="3 3" label="Tendência Forte" />
            <Line
              type="monotone"
              dataKey="adx"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              name="ADX"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
          <p className="text-xs text-gray-300">
            💡 <strong>ADX &gt; 25:</strong> Tendência forte | <strong>ADX &lt; 25:</strong> Tendência fraca ou lateral
          </p>
        </div>
      </motion.div>

      {/* Detalhes OBV e A/D */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">📊 OBV</h3>
          <p className="text-3xl font-bold text-blue-400 mb-2">
            {(data.obv / 1e6).toFixed(1)}M
          </p>
          <p className="text-sm text-gray-400">On Balance Volume</p>
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-300">
              Acumula volume em dias de alta e subtrai em dias de baixa.
              Confirma tendências de preço.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">🌊 A/D Line</h3>
          <p className="text-3xl font-bold text-purple-400 mb-2">
            {(data.accumulation_distribution / 1e6).toFixed(1)}M
          </p>
          <p className="text-sm text-gray-400">Accumulation/Distribution</p>
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-300">
              Mede fluxo de dinheiro. Valores crescentes indicam acumulação (compra).
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

