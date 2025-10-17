"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";

interface Props {
  tickerSelecionado: string;
  onTickerChange: (ticker: string) => void;
}

const ACOES_POPULARES = [
  // Petróleo e Gás
  { ticker: "PETR3", nome: "Petrobras ON" },
  { ticker: "PETR4", nome: "Petrobras PN" },
  { ticker: "PRIO3", nome: "PetroRio ON" },
  { ticker: "RRRP3", nome: "3R Petroleum ON" },
  { ticker: "RECV3", nome: "Recrusul ON" },
  { ticker: "CSAN3", nome: "Cosan ON" },
  
  // Mineração e Siderurgia
  { ticker: "VALE3", nome: "Vale ON" },
  { ticker: "GGBR4", nome: "Gerdau PN" },
  { ticker: "CSNA3", nome: "CSN ON" },
  { ticker: "USIM5", nome: "Usiminas PNA" },
  { ticker: "GOAU4", nome: "Gerdau Metalúrgica PN" },
  
  // Bancos
  { ticker: "ITUB4", nome: "Itaú Unibanco PN" },
  { ticker: "BBDC4", nome: "Bradesco PN" },
  { ticker: "BBAS3", nome: "Banco do Brasil ON" },
  { ticker: "SANB11", nome: "Santander Units" },
  { ticker: "BPAC11", nome: "BTG Pactual Units" },
  { ticker: "ITUB3", nome: "Itaú Unibanco ON" },
  { ticker: "BBDC3", nome: "Bradesco ON" },
  
  // Varejo
  { ticker: "MGLU3", nome: "Magazine Luiza ON" },
  { ticker: "LREN3", nome: "Lojas Renner ON" },
  { ticker: "AMER3", nome: "Americanas ON" },
  { ticker: "VIAV3", nome: "Via ON" },
  { ticker: "ASAI3", nome: "Assaí ON" },
  { ticker: "CRFB3", nome: "Carrefour Brasil ON" },
  { ticker: "PCAR3", nome: "Grupo Pão de Açúcar ON" },
  { ticker: "PETZ3", nome: "Petz ON" },
  { ticker: "SOMA3", nome: "Grupo Soma ON" },
  
  // Energia Elétrica
  { ticker: "ELET3", nome: "Eletrobras ON" },
  { ticker: "ELET6", nome: "Eletrobras PNB" },
  { ticker: "EGIE3", nome: "Engie Brasil ON" },
  { ticker: "TAEE11", nome: "Taesa Units" },
  { ticker: "CMIG4", nome: "Cemig PN" },
  { ticker: "CPFE3", nome: "CPFL Energia ON" },
  { ticker: "ENGI11", nome: "Energisa Units" },
  
  // Alimentos e Bebidas
  { ticker: "ABEV3", nome: "Ambev ON" },
  { ticker: "JBSS3", nome: "JBS ON" },
  { ticker: "BRFS3", nome: "BRF ON" },
  { ticker: "BEEF3", nome: "Minerva ON" },
  { ticker: "MRFG3", nome: "Marfrig ON" },
  { ticker: "SMTO3", nome: "São Martinho ON" },
  
  // Telecomunicações
  { ticker: "VIVT3", nome: "Vivo ON" },
  { ticker: "TIMS3", nome: "TIM ON" },
  
  // Construção Civil
  { ticker: "CYRE3", nome: "Cyrela ON" },
  { ticker: "MRVE3", nome: "MRV ON" },
  { ticker: "EZTC3", nome: "EzTec ON" },
  { ticker: "TEND3", nome: "Tenda ON" },
  
  // Logística e Transporte
  { ticker: "RAIL3", nome: "Rumo ON" },
  { ticker: "RENT3", nome: "Localiza ON" },
  { ticker: "CCRO3", nome: "CCR ON" },
  { ticker: "ECOR3", nome: "Ecorodovias ON" },
  { ticker: "AZUL4", nome: "Azul PN" },
  { ticker: "GOLL4", nome: "Gol PN" },
  { ticker: "EMBR3", nome: "Embraer ON" },
  
  // Indústria
  { ticker: "WEGE3", nome: "WEG ON" },
  { ticker: "RAIZ4", nome: "Raízen PN" },
  { ticker: "LEVE3", nome: "Mahle-Metal Leve ON" },
  { ticker: "TUPY3", nome: "Tupy ON" },
  
  // Tecnologia
  { ticker: "TOTS3", nome: "TOTVS ON" },
  { ticker: "LWSA3", nome: "Locaweb ON" },
  { ticker: "POSI3", nome: "Positivo ON" },
  { ticker: "MOVI3", nome: "Movida ON" },
  { ticker: "LOGN3", nome: "Log-In ON" },
  
  // Saúde
  { ticker: "RADL3", nome: "Raia Drogasil ON" },
  { ticker: "HAPV3", nome: "Hapvida ON" },
  { ticker: "FLRY3", nome: "Fleury ON" },
  { ticker: "PNVL3", nome: "Dasa ON" },
  { ticker: "GNDI3", nome: "NotreDame Intermédica ON" },
  { ticker: "RDOR3", nome: "Rede D'Or ON" },
  
  // Educação
  { ticker: "YDUQ3", nome: "Yduqs ON" },
  { ticker: "COGN3", nome: "Cogna ON" },
  
  // Papel e Celulose
  { ticker: "SUZB3", nome: "Suzano ON" },
  { ticker: "KLBN11", nome: "Klabin Units" },
  
  // Serviços Financeiros
  { ticker: "B3SA3", nome: "B3 ON" },
  { ticker: "CIEL3", nome: "Cielo ON" },
  
  // Shoppings
  { ticker: "MULT3", nome: "Multiplan ON" },
  { ticker: "BRML3", nome: "BR Malls ON" },
];

export default function PainelAcoes({ tickerSelecionado, onTickerChange }: Props) {
  const [busca, setBusca] = useState("");

  const acoesFiltradas = ACOES_POPULARES.filter(
    (acao) =>
      acao.ticker.toLowerCase().includes(busca.toLowerCase()) ||
      acao.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-4">
          Selecionar Ação para Análise
        </h3>
        
        {/* Barra de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ticker ou nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grid de Ações */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 max-h-[500px] overflow-y-auto custom-scrollbar">
        {acoesFiltradas.map((acao) => (
          <motion.button
            key={acao.ticker}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTickerChange(acao.ticker)}
            className={`
              p-4 rounded-lg transition-all text-left
              ${
                tickerSelecionado === acao.ticker
                  ? "bg-blue-600 border-2 border-blue-400"
                  : "bg-gray-800/50 border-2 border-transparent hover:bg-gray-800"
              }
            `}
          >
            <p className="font-bold text-white text-sm">{acao.ticker}</p>
            <p className="text-xs text-gray-400 mt-1 truncate">{acao.nome}</p>
          </motion.button>
        ))}
      </div>

      {acoesFiltradas.length === 0 && (
        <p className="text-center text-gray-400 py-8">
          Nenhuma ação encontrada
        </p>
      )}
    </motion.div>
  );
}

