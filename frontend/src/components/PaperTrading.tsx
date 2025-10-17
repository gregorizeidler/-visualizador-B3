"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, ShoppingCart, DollarSign, RotateCcw, History } from "lucide-react";
import { useEffect, useState } from "react";

interface Posicao {
  ticker: string;
  quantidade: number;
  preco_medio: number;
  preco_atual: number;
  valor_total: number;
  lucro: number;
  lucro_pct: number;
}

interface Patrimonio {
  patrimonio_total: number;
  saldo_disponivel: number;
  valor_posicoes: number;
  capital_inicial: number;
  rentabilidade: number;
  posicoes: Posicao[];
}

interface HistoricoItem {
  tipo: string;
  ticker: string;
  quantidade: number;
  preco: number;
  total: number;
  lucro?: number;
  data: string;
}

export default function PaperTrading() {
  const [usuarioId] = useState("demo_user"); // Pode ser dinâmico depois
  const [patrimonio, setPatrimonio] = useState<Patrimonio | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [aba, setAba] = useState<"carteira" | "operar" | "historico">("carteira");

  // Formulário de operação
  const [ticker, setTicker] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [tipoOperacao, setTipoOperacao] = useState<"compra" | "venda">("compra");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Buscar patrimônio
      const resPatrimonio = await fetch(`http://localhost:8000/api/paper-trading/patrimonio/${usuarioId}`);
      const dataPatrimonio = await resPatrimonio.json();
      setPatrimonio(dataPatrimonio);

      // Buscar carteira para histórico
      const resCarteira = await fetch(`http://localhost:8000/api/paper-trading/carteira/${usuarioId}`);
      const dataCarteira = await resCarteira.json();
      setHistorico(dataCarteira.historico || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarPrecoAtual = async (tickerBusca: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/b3/info/${tickerBusca}`);
      const data = await res.json();
      setPreco(data.preco_atual.toFixed(2));
    } catch (error) {
      console.error("Erro ao buscar preço:", error);
    }
  };

  const executarOperacao = async () => {
    if (!ticker || !quantidade || !preco) {
      setMensagem("⚠️ Preencha todos os campos");
      return;
    }

    setLoading(true);
    setMensagem("");

    try {
      const endpoint = tipoOperacao === "compra" 
        ? `/api/paper-trading/comprar?usuario_id=${usuarioId}&ticker=${ticker}&quantidade=${quantidade}&preco=${preco}`
        : `/api/paper-trading/vender?usuario_id=${usuarioId}&ticker=${ticker}&quantidade=${quantidade}&preco=${preco}`;

      const res = await fetch(`http://localhost:8000${endpoint}`, { method: "POST" });
      const data = await res.json();

      if (data.erro) {
        setMensagem(`❌ ${data.erro}`);
      } else if (data.sucesso) {
        setMensagem(`✅ ${data.mensagem}`);
        setTicker("");
        setQuantidade("");
        setPreco("");
        await carregarDados();
      }
    } catch (error) {
      setMensagem("❌ Erro ao executar operação");
    } finally {
      setLoading(false);
    }
  };

  const resetarCarteira = async () => {
    if (!confirm("Tem certeza que deseja resetar sua carteira? Todas as posições serão perdidas.")) {
      return;
    }

    try {
      await fetch(`http://localhost:8000/api/paper-trading/resetar/${usuarioId}`, { method: "POST" });
      setMensagem("✅ Carteira resetada!");
      await carregarDados();
    } catch (error) {
      setMensagem("❌ Erro ao resetar carteira");
    }
  };

  if (loading && !patrimonio) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
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
          <Wallet className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">Paper Trading</h3>
          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">SIMULAÇÃO</span>
        </div>
        <button
          onClick={resetarCarteira}
          className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-semibold transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Resetar
        </button>
      </div>

      {/* Cards de Resumo */}
      {patrimonio && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-900/30 to-green-600/30 border-2 border-green-500 rounded-lg p-4"
          >
            <p className="text-xs text-gray-300 mb-1">💰 Patrimônio Total</p>
            <p className="text-2xl font-bold text-white">
              R$ {patrimonio.patrimonio_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className={`text-sm font-semibold mt-1 ${patrimonio.rentabilidade >= 0 ? "text-green-400" : "text-red-400"}`}>
              {patrimonio.rentabilidade >= 0 ? "+" : ""}{patrimonio.rentabilidade.toFixed(2)}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 rounded-lg p-4"
          >
            <p className="text-xs text-gray-400 mb-1">💵 Saldo Disponível</p>
            <p className="text-xl font-bold text-white">
              R$ {patrimonio.saldo_disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-lg p-4"
          >
            <p className="text-xs text-gray-400 mb-1">📊 Valor em Ações</p>
            <p className="text-xl font-bold text-white">
              R$ {patrimonio.valor_posicoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 rounded-lg p-4"
          >
            <p className="text-xs text-gray-400 mb-1">🎯 Posições Abertas</p>
            <p className="text-xl font-bold text-white">{patrimonio.posicoes.length}</p>
          </motion.div>
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        <button
          onClick={() => setAba("carteira")}
          className={`px-4 py-2 font-semibold transition-all ${
            aba === "carteira"
              ? "text-green-400 border-b-2 border-green-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          📊 Carteira
        </button>
        <button
          onClick={() => setAba("operar")}
          className={`px-4 py-2 font-semibold transition-all ${
            aba === "operar"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          💹 Operar
        </button>
        <button
          onClick={() => setAba("historico")}
          className={`px-4 py-2 font-semibold transition-all ${
            aba === "historico"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          📜 Histórico
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <AnimatePresence mode="wait">
        {aba === "carteira" && patrimonio && (
          <motion.div
            key="carteira"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {patrimonio.posicoes.length > 0 ? (
              <div className="space-y-3">
                {patrimonio.posicoes.map((pos, idx) => (
                  <motion.div
                    key={pos.ticker}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gray-800/50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-white">{pos.ticker}</h4>
                          <span className="text-sm text-gray-400">{pos.quantidade}x ações</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Preço Médio</p>
                            <p className="text-white font-semibold">R$ {pos.preco_medio.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Preço Atual</p>
                            <p className="text-white font-semibold">R$ {pos.preco_atual.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Valor Total</p>
                            <p className="text-white font-semibold">R$ {pos.valor_total.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Lucro/Prejuízo</p>
                            <p className={`font-bold ${pos.lucro >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {pos.lucro >= 0 ? "+" : ""}R$ {pos.lucro.toFixed(2)} ({pos.lucro_pct.toFixed(2)}%)
                            </p>
                          </div>
                        </div>
                      </div>
                      {pos.lucro >= 0 ? (
                        <TrendingUp className="w-8 h-8 text-green-400" />
                      ) : (
                        <TrendingDown className="w-8 h-8 text-red-400" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Você ainda não possui posições</p>
                <p className="text-sm text-gray-500 mt-2">Vá para "Operar" para começar</p>
              </div>
            )}
          </motion.div>
        )}

        {aba === "operar" && (
          <motion.div
            key="operar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="max-w-2xl mx-auto">
              {/* Toggle Compra/Venda */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setTipoOperacao("compra")}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    tipoOperacao === "compra"
                      ? "bg-green-600 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 inline-block mr-2" />
                  Comprar
                </button>
                <button
                  onClick={() => setTipoOperacao("venda")}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    tipoOperacao === "venda"
                      ? "bg-red-600 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  <DollarSign className="w-5 h-5 inline-block mr-2" />
                  Vender
                </button>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ticker da Ação</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: PETR4"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value.toUpperCase())}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => buscarPrecoAtual(ticker)}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                    >
                      Buscar Preço
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Quantidade</label>
                  <input
                    type="number"
                    placeholder="Ex: 100"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Preço por Ação</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 28.50"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Cálculo Total */}
                {ticker && quantidade && preco && (
                  <div className="p-4 bg-blue-900/20 border-2 border-blue-500 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Total da Operação:</p>
                    <p className="text-2xl font-bold text-white">
                      R$ {(parseFloat(quantidade) * parseFloat(preco)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}

                {/* Mensagem */}
                {mensagem && (
                  <div className={`p-4 rounded-lg ${mensagem.includes("✅") ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                    {mensagem}
                  </div>
                )}

                {/* Botão Executar */}
                <button
                  onClick={executarOperacao}
                  disabled={loading}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 ${
                    tipoOperacao === "compra"
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                      : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  }`}
                >
                  {loading ? "Processando..." : tipoOperacao === "compra" ? "🛒 Executar Compra" : "💰 Executar Venda"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {aba === "historico" && (
          <motion.div
            key="historico"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {historico.length > 0 ? (
              <div className="space-y-2">
                {[...historico].reverse().map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      item.tipo === "COMPRA" ? "bg-green-900/20" : "bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        item.tipo === "COMPRA" ? "bg-green-600" : "bg-red-600"
                      }`}>
                        {item.tipo === "COMPRA" ? (
                          <ShoppingCart className="w-5 h-5 text-white" />
                        ) : (
                          <DollarSign className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {item.tipo} {item.quantidade}x {item.ticker}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.data).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">R$ {item.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">@ R$ {item.preco.toFixed(2)}</p>
                      {item.lucro !== undefined && (
                        <p className={`text-sm font-semibold ${item.lucro >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {item.lucro >= 0 ? "+" : ""}R$ {item.lucro.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma operação realizada ainda</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

