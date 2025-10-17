"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface AcaoRanking {
  ticker: string;
  nome: string;
  preco_atual: number;
  variacao_dia: number;
  volume: number;
  market_cap?: number;
}

interface Props {
  acoes: AcaoRanking[];
  tipo: "variacao" | "volume";
}

export default function RankingAcoes({ acoes, tipo }: Props) {
  const formatarVolume = (volume: number) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
    return volume.toString();
  };

  const formatarMarketCap = (marketCap?: number) => {
    if (!marketCap) return "N/A";
    if (marketCap >= 1000000000) return `R$ ${(marketCap / 1000000000).toFixed(2)}B`;
    if (marketCap >= 1000000) return `R$ ${(marketCap / 1000000).toFixed(2)}M`;
    return `R$ ${marketCap.toFixed(0)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">
            {tipo === "variacao" ? "Maiores Altas e Quedas" : "Maior Volume"}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {tipo === "variacao" 
              ? "Ações com maior variação no dia" 
              : "Ações mais negociadas do dia"
            }
          </p>
        </div>
        <Activity className="w-8 h-8 text-blue-400" />
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
        {tipo === "variacao" && acoes.length > 0 && acoes[0].variacao_dia >= 0 && (
          <div className="flex items-center gap-3 pb-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
            <span className="text-sm font-semibold text-green-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              MAIORES ALTAS
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
          </div>
        )}

        {acoes.map((acao, index) => {
          // Detectar mudança de altas para quedas (quando variação vira negativa)
          const mostrarSeparador = tipo === "variacao" && index > 0 && 
            acoes[index - 1].variacao_dia >= 0 && acao.variacao_dia < 0;

          return (
            <div key={acao.ticker}>
              {mostrarSeparador && (
                <div className="flex items-center gap-3 py-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                  <span className="text-sm font-semibold text-red-400 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    MAIORES QUEDAS
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                </div>
              )}
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {acao.ticker.replace('.SA', '')}
                        </span>
                        {tipo === "variacao" && (
                          acao.variacao_dia >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">
                        {acao.nome}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          R$ {acao.preco_atual.toFixed(2)}
                        </p>
                        {tipo === "variacao" && (
                          <p className={`text-xs font-medium ${
                            acao.variacao_dia >= 0 ? "text-green-400" : "text-red-400"
                          }`}>
                            {acao.variacao_dia >= 0 ? "+" : ""}
                            {acao.variacao_dia.toFixed(2)}%
                          </p>
                        )}
                      </div>

                      {tipo === "volume" && (
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Volume</p>
                          <p className="text-sm font-semibold text-blue-400">
                            {formatarVolume(acao.volume)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {acao.market_cap && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                      Market Cap: <span className="text-gray-400">{formatarMarketCap(acao.market_cap)}</span>
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
