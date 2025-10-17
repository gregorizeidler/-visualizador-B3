"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Pause, 
  Play, 
  TrendingUp, 
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  DollarSign,
  Zap
} from "lucide-react";

interface MarketEvent {
  id: string;
  ticker: string;
  tipo: string;
  timestamp: string;
  mensagem: string;
  detalhes: string;
  variacao: number;
  positivo: boolean;
}

export default function LiveMarketFeed() {
  const [eventos, setEventos] = useState<MarketEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0 });
  const wsRef = useRef<WebSocket | null>(null);
  const pausedEventsRef = useRef<MarketEvent[]>([]);

  useEffect(() => {
    // Conectar ao WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws/market-feed');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🔌 Conectado ao Market Feed');
    };

    ws.onmessage = (event) => {
      const novoEvento: MarketEvent = JSON.parse(event.data);
      
      if (isPaused) {
        // Se pausado, armazenar eventos
        pausedEventsRef.current.push(novoEvento);
      } else {
        // Adicionar evento e manter últimos 10
        setEventos(prev => [novoEvento, ...prev].slice(0, 10));
        
        // Atualizar estatísticas
        setStats(prev => ({
          total: prev.total + 1,
          positive: prev.positive + (novoEvento.positivo ? 1 : 0),
          negative: prev.negative + (!novoEvento.positivo ? 1 : 0),
        }));
      }
    };

    ws.onerror = (error) => {
      console.error('❌ Erro no WebSocket:', error);
    };

    ws.onclose = () => {
      console.log('🔌 Desconectado do Market Feed');
    };

    return () => {
      ws.close();
    };
  }, [isPaused]);

  const togglePause = () => {
    setIsPaused(!isPaused);
    
    // Se despausar, adicionar eventos acumulados
    if (isPaused && pausedEventsRef.current.length > 0) {
      setEventos(prev => [...pausedEventsRef.current, ...prev].slice(0, 10));
      pausedEventsRef.current = [];
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'buy_order':
        return <ArrowUpCircle className="w-5 h-5" />;
      case 'sell_order':
        return <ArrowDownCircle className="w-5 h-5" />;
      case 'execution':
        return <DollarSign className="w-5 h-5" />;
      case 'market_depth':
        return <BarChart3 className="w-5 h-5" />;
      case 'volume_spike':
        return <Zap className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getEventColor = (tipo: string, positivo: boolean) => {
    if (tipo === 'buy_order' || (tipo === 'execution' && positivo)) {
      return 'from-green-500/20 to-green-600/20 border-green-500/30';
    }
    if (tipo === 'sell_order' || tipo === 'market_depth') {
      return 'from-red-500/20 to-red-600/20 border-red-500/30';
    }
    return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
  };

  const getIconColor = (tipo: string, positivo: boolean) => {
    if (tipo === 'buy_order' || (positivo && tipo === 'execution')) {
      return 'text-green-400';
    }
    if (tipo === 'sell_order' || tipo === 'market_depth') {
      return 'text-red-400';
    }
    return 'text-blue-400';
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Activity className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Live Market Feed</h3>
            <p className="text-sm text-gray-400">Real-time trades & price changes</p>
          </div>
        </div>

        <button
          onClick={togglePause}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-all duration-200
            ${isPaused 
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }
          `}
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Play
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          )}
        </button>
      </div>

      {/* Feed de Eventos */}
      <div className="space-y-3 mb-6 max-h-[500px] overflow-y-auto custom-scrollbar">
        <AnimatePresence initial={false}>
          {eventos.map((evento, index) => (
            <motion.div
              key={evento.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05 
              }}
              className={`
                p-4 rounded-lg border bg-gradient-to-br
                ${getEventColor(evento.tipo, evento.positivo)}
                hover:scale-[1.02] transition-transform
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`${getIconColor(evento.tipo, evento.positivo)}`}>
                    {getIcon(evento.tipo)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold text-lg">
                        {evento.ticker}
                      </span>
                      <span className="text-xs text-gray-400">
                        {evento.timestamp}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      {evento.mensagem}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {evento.detalhes}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {evento.positivo ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`
                    text-lg font-bold
                    ${evento.positivo ? 'text-green-400' : 'text-red-400'}
                  `}>
                    {evento.positivo ? '+' : ''}{evento.variacao.toFixed(2)}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {eventos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
            <p>Aguardando eventos do mercado...</p>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700/50">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">
            {stats.total}
          </div>
          <div className="text-sm text-gray-400">Total Items</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">
            {stats.positive}
          </div>
          <div className="text-sm text-gray-400">Positive</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-red-400 mb-1">
            {stats.negative}
          </div>
          <div className="text-sm text-gray-400">Negative</div>
        </div>
      </div>

      {/* Indicador de Conexão */}
      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-700/50">
        <div className={`
          w-2 h-2 rounded-full animate-pulse
          ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}
        `} />
        <span className="text-xs text-gray-400">
          {isPaused ? 'Feed pausado' : 'Dados em tempo real'}
        </span>
      </div>
    </div>
  );
}

