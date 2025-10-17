"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";

interface DadosIndicador {
  data: string;
  rsi?: number;
  macd?: number;
  macd_signal?: number;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  fechamento?: number;
}

interface Props {
  dados: DadosIndicador[];
  tipo: "rsi" | "macd" | "bollinger";
  ticker?: string;
}

export default function GraficoIndicadores({ dados, tipo, ticker }: Props) {
  const renderGraficoRSI = () => (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={dados}>
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
        <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" label="Sobrecompra" />
        <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 3" label="Sobrevenda" />
        <Line
          type="monotone"
          dataKey="rsi"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
          name="RSI"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderGraficoMACD = () => (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={dados}>
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
        <ReferenceLine y={0} stroke="#6B7280" />
        <Line
          type="monotone"
          dataKey="macd"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
          name="MACD"
        />
        <Line
          type="monotone"
          dataKey="macd_signal"
          stroke="#F59E0B"
          strokeWidth={2}
          dot={false}
          name="Sinal"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderGraficoBollinger = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={dados}>
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
        <Area
          type="monotone"
          dataKey="bb_upper"
          stroke="#EF4444"
          fill="#EF444420"
          strokeWidth={1}
          name="Banda Superior"
        />
        <Line
          type="monotone"
          dataKey="bb_middle"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
          name="Média"
        />
        <Area
          type="monotone"
          dataKey="bb_lower"
          stroke="#10B981"
          fill="#10B98120"
          strokeWidth={1}
          name="Banda Inferior"
        />
        <Line
          type="monotone"
          dataKey="fechamento"
          stroke="#F59E0B"
          strokeWidth={2}
          dot={false}
          name="Preço"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const getTitulo = () => {
    switch (tipo) {
      case "rsi":
        return "RSI - Índice de Força Relativa";
      case "macd":
        return "MACD - Convergência/Divergência de Médias Móveis";
      case "bollinger":
        return "Bandas de Bollinger";
      default:
        return "Indicador Técnico";
    }
  };

  const getDescricao = () => {
    switch (tipo) {
      case "rsi":
        return "Mede a velocidade e magnitude das mudanças de preço. Acima de 70 indica sobrecompra, abaixo de 30 indica sobrevenda.";
      case "macd":
        return "Mostra a relação entre duas médias móveis. Cruzamentos indicam possíveis mudanças de tendência.";
      case "bollinger":
        return "Bandas que se expandem e contraem com a volatilidade. Preço nas bandas pode indicar reversão.";
      default:
        return "";
    }
  };

  const calcularSinalAtual = () => {
    if (dados.length === 0) return { texto: "Sem dados", cor: "text-gray-400" };

    const ultimo = dados[dados.length - 1];

    switch (tipo) {
      case "rsi":
        if (!ultimo.rsi) return { texto: "N/A", cor: "text-gray-400" };
        if (ultimo.rsi > 70) return { texto: "Sobrecompra", cor: "text-red-400" };
        if (ultimo.rsi < 30) return { texto: "Sobrevenda", cor: "text-green-400" };
        return { texto: "Neutro", cor: "text-blue-400" };
      
      case "macd":
        if (!ultimo.macd || !ultimo.macd_signal) return { texto: "N/A", cor: "text-gray-400" };
        if (ultimo.macd > ultimo.macd_signal) return { texto: "Alta", cor: "text-green-400" };
        return { texto: "Baixa", cor: "text-red-400" };
      
      case "bollinger":
        if (!ultimo.fechamento || !ultimo.bb_upper || !ultimo.bb_lower) 
          return { texto: "N/A", cor: "text-gray-400" };
        if (ultimo.fechamento >= ultimo.bb_upper) return { texto: "Próximo à banda superior", cor: "text-red-400" };
        if (ultimo.fechamento <= ultimo.bb_lower) return { texto: "Próximo à banda inferior", cor: "text-green-400" };
        return { texto: "Dentro das bandas", cor: "text-blue-400" };
      
      default:
        return { texto: "N/A", cor: "text-gray-400" };
    }
  };

  const sinal = calcularSinalAtual();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{getTitulo()}</h3>
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${sinal.cor} bg-gray-800`}>
            {sinal.texto}
          </span>
        </div>
        {ticker && (
          <p className="text-sm text-gray-400 mt-1">{ticker}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">{getDescricao()}</p>
      </div>

      <div className="mt-4">
        {tipo === "rsi" && renderGraficoRSI()}
        {tipo === "macd" && renderGraficoMACD()}
        {tipo === "bollinger" && renderGraficoBollinger()}
      </div>
    </motion.div>
  );
}

