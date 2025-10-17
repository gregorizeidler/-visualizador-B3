"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DadosComparacao {
  [ticker: string]: {
    dados: Array<{
      data: string;
      valor_normalizado: number;
    }>;
    variacao_periodo: number;
  };
}

interface Props {
  dados: DadosComparacao;
  tickers: string[];
}

const CORES = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
];

export default function GraficoComparacao({ dados, tickers }: Props) {
  const [tickersVisiveis, setTickersVisiveis] = useState<Set<string>>(
    new Set(tickers)
  );

  // Converter dados para formato do gráfico
  const dadosGrafico = useMemo(() => {
    if (!dados || Object.keys(dados).length === 0) return [];

    // Obter todas as datas únicas
    const todasDatas = new Set<string>();
    Object.values(dados).forEach((info) => {
      info.dados.forEach((d) => todasDatas.add(d.data));
    });

    const datasOrdenadas = Array.from(todasDatas).sort();

    // Criar objeto combinado
    return datasOrdenadas.map((data) => {
      const ponto: any = { data };
      Object.entries(dados).forEach(([ticker, info]) => {
        const dadoDia = info.dados.find((d) => d.data === data);
        ponto[ticker] = dadoDia?.valor_normalizado || null;
      });
      return ponto;
    });
  }, [dados]);

  const toggleTicker = (ticker: string) => {
    const novoSet = new Set(tickersVisiveis);
    if (novoSet.has(ticker)) {
      novoSet.delete(ticker);
    } else {
      novoSet.add(ticker);
    }
    setTickersVisiveis(novoSet);
  };

  const obterVariacao = (ticker: string) => {
    return dados[ticker]?.variacao_periodo || 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white">Comparação de Desempenho</h3>
        <p className="text-sm text-gray-400 mt-1">
          Desempenho relativo normalizado (Base 100)
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {tickers.map((ticker, index) => {
          const visivel = tickersVisiveis.has(ticker);
          const variacao = obterVariacao(ticker);
          const cor = CORES[index % CORES.length];

          return (
            <motion.button
              key={ticker}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleTicker(ticker)}
              className={`
                px-4 py-2 rounded-lg transition-all
                ${visivel 
                  ? "bg-gray-700 border-2" 
                  : "bg-gray-800/50 border-2 border-transparent opacity-50"
                }
              `}
              style={{ borderColor: visivel ? cor : "transparent" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cor }}
                />
                <span className="font-semibold text-white text-sm">
                  {ticker.replace('.SA', '')}
                </span>
                <span
                  className={`text-xs font-medium ml-2 ${
                    variacao >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {variacao >= 0 ? "+" : ""}
                  {variacao.toFixed(2)}%
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={dadosGrafico}>
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
            label={{ value: "Base 100", angle: -90, position: "insideLeft", fill: "#9CA3AF" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#F3F4F6" }}
          />
          <Legend />
          {tickers.map((ticker, index) => (
            tickersVisiveis.has(ticker) && (
              <Line
                key={ticker}
                type="monotone"
                dataKey={ticker}
                stroke={CORES[index % CORES.length]}
                strokeWidth={2}
                dot={false}
                name={ticker.replace('.SA', '')}
                connectNulls
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {tickers.map((ticker, index) => {
          const variacao = obterVariacao(ticker);
          const cor = CORES[index % CORES.length];

          return (
            <div key={ticker} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cor }}
                />
                <span className="text-sm font-semibold text-white">
                  {ticker.replace('.SA', '')}
                </span>
              </div>
              <p className={`text-lg font-bold ${
                variacao >= 0 ? "text-green-400" : "text-red-400"
              }`}>
                {variacao >= 0 ? "+" : ""}
                {variacao.toFixed(2)}%
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

