"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DadosIbov {
  data: string;
  fechamento: number;
  volume: number;
}

interface Props {
  dados: DadosIbov[];
  variacao: number;
}

export default function GraficoIbovespa({ dados, variacao }: Props) {
  const valorAtual = dados[dados.length - 1]?.fechamento || 0;
  const valorAnterior = dados[dados.length - 2]?.fechamento || valorAtual;
  const variacaoDia = ((valorAtual - valorAnterior) / valorAnterior) * 100;

  const maxima = Math.max(...dados.map(d => d.fechamento));
  const minima = Math.min(...dados.map(d => d.fechamento));
  const media = dados.reduce((acc, d) => acc + d.fechamento, 0) / dados.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">IBOVESPA</h3>
          <p className="text-sm text-gray-400 mt-1">
            Índice Bovespa - B3
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">
            {valorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
          <div className="flex items-center justify-end gap-2 mt-1">
            <span className={`text-sm font-medium ${
              variacaoDia >= 0 ? "text-green-400" : "text-red-400"
            }`}>
              {variacaoDia >= 0 ? "+" : ""}
              {variacaoDia.toFixed(2)}%
            </span>
            {variacaoDia >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={dados}>
          <defs>
            <linearGradient id="colorIbov" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
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
          <YAxis
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            domain={['dataMin - 5000', 'dataMax + 5000']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#F3F4F6" }}
            formatter={(value: any) => [
              value.toLocaleString('pt-BR', { minimumFractionDigits: 0 }),
              "IBOVESPA"
            ]}
          />
          <Area
            type="monotone"
            dataKey="fechamento"
            stroke="#3B82F6"
            strokeWidth={3}
            fill="url(#colorIbov)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
        <div>
          <p className="text-xs text-gray-400 mb-1">Variação no Período</p>
          <p className={`text-lg font-bold ${
            variacao >= 0 ? "text-green-400" : "text-red-400"
          }`}>
            {variacao >= 0 ? "+" : ""}
            {variacao.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Máxima</p>
          <p className="text-lg font-bold text-white">
            {maxima.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Mínima</p>
          <p className="text-lg font-bold text-white">
            {minima.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Média</p>
          <p className="text-lg font-bold text-white">
            {media.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

