"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SetorData {
  setor: string;
  variacao: number;
}

interface Props {
  setores: SetorData[];
}

export default function HeatmapSetores({ setores }: Props) {
  const getCorVariacao = (variacao: number) => {
    if (variacao >= 3) return "bg-green-600";
    if (variacao >= 1) return "bg-green-500";
    if (variacao >= 0) return "bg-green-400";
    if (variacao >= -1) return "bg-red-400";
    if (variacao >= -3) return "bg-red-500";
    return "bg-red-600";
  };

  const getOpacidade = (variacao: number) => {
    const abs = Math.abs(variacao);
    if (abs >= 5) return "opacity-100";
    if (abs >= 3) return "opacity-90";
    if (abs >= 2) return "opacity-80";
    if (abs >= 1) return "opacity-70";
    return "opacity-60";
  };

  const getTamanho = (index: number, total: number) => {
    // Distribuir tamanhos de forma equilibrada
    if (total <= 6) return "col-span-2 row-span-2";
    if (index < 3) return "col-span-2 row-span-2";
    if (index < 8) return "col-span-1 row-span-1";
    return "col-span-1 row-span-1";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white">Desempenho por Setor</h3>
        <p className="text-sm text-gray-400 mt-1">
          Heatmap de variação dos setores da B3
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 auto-rows-fr">
        {setores.map((setor, index) => (
          <motion.div
            key={setor.setor}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`
              ${getTamanho(index, setores.length)}
              ${getCorVariacao(setor.variacao)}
              ${getOpacidade(setor.variacao)}
              rounded-lg p-4 flex flex-col justify-between
              hover:scale-105 transition-transform cursor-pointer
              shadow-lg
            `}
          >
            <div>
              <p className="text-white font-semibold text-sm mb-1 leading-tight">
                {setor.setor}
              </p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white font-bold text-lg">
                {setor.variacao >= 0 ? "+" : ""}
                {setor.variacao.toFixed(2)}%
              </span>
              {setor.variacao >= 0 ? (
                <TrendingUp className="w-5 h-5 text-white" />
              ) : (
                <TrendingDown className="w-5 h-5 text-white" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 bg-green-600 rounded"></div>
          <span className="text-gray-400">Alta forte</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 bg-green-400 rounded"></div>
          <span className="text-gray-400">Alta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 bg-gray-500 rounded"></div>
          <span className="text-gray-400">Neutro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 bg-red-400 rounded"></div>
          <span className="text-gray-400">Queda</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 bg-red-600 rounded"></div>
          <span className="text-gray-400">Queda forte</span>
        </div>
      </div>
    </motion.div>
  );
}

