"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import GraficoCandlestick from "@/components/GraficoCandlestick";
import GraficoIndicadores from "@/components/GraficoIndicadores";
import HeatmapSetores from "@/components/HeatmapSetores";
import RankingAcoes from "@/components/RankingAcoes";
import GraficoComparacao from "@/components/GraficoComparacao";
import PainelAcoes from "@/components/PainelAcoes";
import GraficoIbovespa from "@/components/GraficoIbovespa";
import LiveMarketFeed from "@/components/LiveMarketFeed";
import { TrendingUp, Activity, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [abaAtiva, setAbaAtiva] = useState("visao-geral");
  const [tickerSelecionado, setTickerSelecionado] = useState("PETR4");
  const [periodo, setPeriodo] = useState("1y");
  const [carregando, setCarregando] = useState(false);

  // Estados para dados
  const [dadosAcao, setDadosAcao] = useState<any>(null);
  const [setores, setSetores] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [comparacao, setComparacao] = useState<any>(null);
  const [ibovespa, setIbovespa] = useState<any>(null);

  // Carregar dados da ação selecionada
  useEffect(() => {
    carregarDadosAcao();
  }, [tickerSelecionado, periodo]);

  // Carregar dados gerais
  useEffect(() => {
    carregarDadosGerais();
  }, []);

  const carregarDadosAcao = async () => {
    setCarregando(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/b3/acao/${tickerSelecionado}?periodo=${periodo}`
      );
      const data = await response.json();
      setDadosAcao(data);
    } catch (error) {
      console.error("Erro ao carregar dados da ação:", error);
    } finally {
      setCarregando(false);
    }
  };

  const carregarDadosGerais = async () => {
    try {
      // Carregar setores
      const resSetores = await fetch("http://localhost:8000/api/b3/setores");
      const dataSetores = await resSetores.json();
      setSetores(dataSetores.setores || []);

      // Carregar ranking
      const resRanking = await fetch("http://localhost:8000/api/b3/ranking?tipo=variacao");
      const dataRanking = await resRanking.json();
      setRanking(dataRanking.ranking || []);

      // Carregar IBOVESPA
      const resIbov = await fetch("http://localhost:8000/api/b3/ibovespa?periodo=1y");
      const dataIbov = await resIbov.json();
      setIbovespa(dataIbov);

      // Carregar comparação (TOP 10 IBOVESPA por peso/importância)
      const tickersComparacao = "PETR4,VALE3,ITUB4,BBDC4,BBAS3,B3SA3,WEGE3,RENT3,ABEV3,SUZB3";
      const resComp = await fetch(
        `http://localhost:8000/api/b3/comparacao?tickers=${tickersComparacao}&periodo=1y`
      );
      const dataComp = await resComp.json();
      setComparacao(dataComp);
    } catch (error) {
      console.error("Erro ao carregar dados gerais:", error);
    }
  };

  const periodos = [
    { valor: "1mo", label: "1M" },
    { valor: "3mo", label: "3M" },
    { valor: "6mo", label: "6M" },
    { valor: "1y", label: "1A" },
    { valor: "2y", label: "2A" },
    { valor: "5y", label: "5A" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar activeTab={abaAtiva} onTabChange={setAbaAtiva} />
      
      <div className="ml-64 p-8">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Visualizador B3
          </h1>
          <p className="text-gray-400">
            Plataforma Avançada de Análise de Ações Brasileiras
          </p>
        </motion.div>

        {/* Conteúdo Principal */}
        {abaAtiva === "visao-geral" && (
          <div className="space-y-6">
            {/* Botões de Acesso Rápido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.a
                href="/analise"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-xl p-6 hover:bg-gray-800/60 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">Análise Técnica Avançada</h3>
                    <p className="text-sm text-gray-400">
                      Score técnico, padrões de candles, volume profile e indicadores avançados
                    </p>
                  </div>
                </div>
              </motion.a>

              <motion.a
                href="/ferramentas"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-xl p-6 hover:bg-gray-800/60 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">Ferramentas Avançadas</h3>
                    <p className="text-sm text-gray-400">
                      Screener, comparador de ações e treemap de market cap
                    </p>
                  </div>
                </div>
              </motion.a>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">IBOVESPA</h3>
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                {ibovespa && (
                  <>
                    <p className="text-2xl font-bold text-white">
                      {ibovespa.dados[ibovespa.dados.length - 1]?.fechamento.toLocaleString('pt-BR')}
                    </p>
                    <p className={`text-sm font-medium mt-1 ${
                      ibovespa.variacao_dia >= 0 ? "text-green-400" : "text-red-400"
                    }`}>
                      {ibovespa.variacao_dia >= 0 ? "+" : ""}
                      {ibovespa.variacao_dia}% hoje
                    </p>
                  </>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Setores em Alta</h3>
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {setores.filter(s => s.variacao > 0).length}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  de {setores.length} setores
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Ações Monitoradas</h3>
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">150+</p>
                <p className="text-sm text-gray-400 mt-1">ações disponíveis da B3</p>
              </motion.div>
            </div>

            {/* Gráfico IBOVESPA */}
            {ibovespa && (
              <GraficoIbovespa dados={ibovespa.dados} variacao={ibovespa.variacao_periodo} />
            )}

            {/* Live Market Feed */}
            <LiveMarketFeed />

            {/* Grid de Gráficos */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <HeatmapSetores setores={setores} />
              <RankingAcoes acoes={ranking.slice(0, 20)} tipo="variacao" />
            </div>

            {/* Comparação de Ações */}
            {comparacao && (
              <GraficoComparacao 
                dados={comparacao.comparacao} 
                tickers={comparacao.tickers}
              />
            )}
          </div>
        )}

        {abaAtiva === "analise" && (
          <div className="space-y-6">
            {/* Seletor de Ação */}
            <PainelAcoes 
              tickerSelecionado={tickerSelecionado}
              onTickerChange={setTickerSelecionado}
            />

            {/* Controles de Período */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Período de Análise</h3>
                <div className="flex gap-2">
                  {periodos.map((p) => (
                    <button
                      key={p.valor}
                      onClick={() => setPeriodo(p.valor)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        periodo === p.valor
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Gráfico Candlestick */}
            {dadosAcao && !carregando && (
              <>
                <GraficoCandlestick
                  ticker={tickerSelecionado}
                  dados={dadosAcao.dados}
                  mostrarVolume={true}
                  altura={500}
                />

                {/* Indicadores Técnicos */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <GraficoIndicadores
                    dados={dadosAcao.dados}
                    tipo="rsi"
                    ticker={tickerSelecionado}
                  />
                  <GraficoIndicadores
                    dados={dadosAcao.dados}
                    tipo="macd"
                    ticker={tickerSelecionado}
                  />
                </div>

                <GraficoIndicadores
                  dados={dadosAcao.dados}
                  tipo="bollinger"
                  ticker={tickerSelecionado}
                />
              </>
            )}

            {carregando && (
              <div className="glass rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Carregando dados...</p>
              </div>
            )}
          </div>
        )}

        {abaAtiva === "ranking" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <RankingAcoes acoes={ranking} tipo="variacao" />
              {/* Aqui pode adicionar ranking por volume */}
            </div>
          </div>
        )}

        {abaAtiva === "setores" && (
          <div className="space-y-6">
            <HeatmapSetores setores={setores} />
            
            {/* Detalhes dos Setores */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Análise Detalhada por Setor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {setores.map((setor, index) => (
                  <motion.div
                    key={setor.setor}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-800/50 rounded-lg p-4"
                  >
                    <h4 className="font-semibold text-white mb-2">{setor.setor}</h4>
                    <p className={`text-2xl font-bold ${
                      setor.variacao >= 0 ? "text-green-400" : "text-red-400"
                    }`}>
                      {setor.variacao >= 0 ? "+" : ""}
                      {setor.variacao.toFixed(2)}%
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {abaAtiva === "comparacao" && comparacao && (
          <div className="space-y-6">
            <GraficoComparacao 
              dados={comparacao.comparacao} 
              tickers={comparacao.tickers}
            />
          </div>
        )}
      </div>
    </div>
  );
}
