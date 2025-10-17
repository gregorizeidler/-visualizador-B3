"use client";

import { motion } from "framer-motion";
import { CandlestickChart } from "lucide-react";
import { useEffect, useState } from "react";

interface Padrao {
  data: string;
  padroes: string[];
  preco: number;
}

interface Props {
  ticker: string;
}

export default function PadroesCandles({ ticker }: Props) {
  const [padroes, setPadroes] = useState<Padrao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPadroes();
  }, [ticker]);

  const fetchPadroes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/b3/analise/padroes/${ticker}`);
      const data = await res.json();
      setPadroes(data.padroes || []);
    } catch (error) {
      console.error("Erro ao buscar padrões:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPadraoIcon = (padrao: string) => {
    if (padrao.includes("Martelo")) return "🔨";
    if (padrao.includes("Doji")) return "➕";
    if (padrao.includes("Engolfo de Alta")) return "🟢";
    if (padrao.includes("Engolfo de Baixa")) return "🔴";
    return "🕯️";
  };

  const getPadraoColor = (padrao: string) => {
    if (padrao.includes("Alta") || padrao.includes("Martelo")) return "border-green-500 bg-green-900/20";
    if (padrao.includes("Baixa")) return "border-red-500 bg-red-900/20";
    return "border-yellow-500 bg-yellow-900/20";
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
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
      <div className="flex items-center gap-3 mb-6">
        <CandlestickChart className="w-6 h-6 text-orange-400" />
        <h3 className="text-xl font-bold text-white">Padrões de Candles Detectados</h3>
      </div>

      {padroes.length > 0 ? (
        <div className="space-y-4">
          {padroes.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="border-l-4 border-blue-500 bg-gray-800/50 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-2">
                    📅 {new Date(item.data).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.padroes.map((padrao, pIdx) => (
                      <span
                        key={pIdx}
                        className={`px-3 py-1 rounded-lg text-sm font-medium border-2 ${getPadraoColor(padrao)}`}
                      >
                        {getPadraoIcon(padrao)} {padrao}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-400">Preço</p>
                  <p className="text-lg font-bold text-white">R$ {item.preco.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CandlestickChart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum padrão detectado nos últimos 10 dias</p>
          <p className="text-sm text-gray-500 mt-2">
            Padrões: Doji, Martelo, Engolfo de Alta/Baixa
          </p>
        </div>
      )}

      {/* Legenda */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-sm font-semibold text-gray-400 mb-3">📖 Legenda:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span>🔨</span>
            <span className="text-gray-400">Martelo (Alta)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>➕</span>
            <span className="text-gray-400">Doji (Indecisão)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🟢</span>
            <span className="text-gray-400">Engolfo de Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔴</span>
            <span className="text-gray-400">Engolfo de Baixa</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

