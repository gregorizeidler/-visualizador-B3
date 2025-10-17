import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error);
    return Promise.reject(error);
  }
);

// ========== Endpoints B3 ==========

export const buscarPrincipaisAcoes = async () => {
  const response = await api.get('/api/b3/acoes/principais');
  return response.data;
};

export const buscarDadosAcao = async (ticker: string, periodo: string = '1y') => {
  const response = await api.get(`/api/b3/acao/${ticker}`, {
    params: { periodo },
  });
  return response.data;
};

export const buscarIbovespa = async (periodo: string = '1y') => {
  const response = await api.get('/api/b3/ibovespa', {
    params: { periodo },
  });
  return response.data;
};

export const buscarDesempenhoSetores = async () => {
  const response = await api.get('/api/b3/setores');
  return response.data;
};

export const buscarRankingAcoes = async (tipo: 'variacao' | 'volume' = 'variacao') => {
  const response = await api.get('/api/b3/ranking', {
    params: { tipo },
  });
  return response.data;
};

export const buscarCorrelacoes = async (tickers: string[], periodo: string = '6mo') => {
  const tickersStr = tickers.join(',');
  const response = await api.get('/api/b3/correlacoes', {
    params: { tickers: tickersStr, periodo },
  });
  return response.data;
};

export const buscarComparacaoAcoes = async (tickers: string[], periodo: string = '1y') => {
  const tickersStr = tickers.join(',');
  const response = await api.get('/api/b3/comparacao', {
    params: { tickers: tickersStr, periodo },
  });
  return response.data;
};

// ========== Funções auxiliares ==========

export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

export const formatarNumero = (valor: number, decimais: number = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  }).format(valor);
};

export const formatarVolume = (volume: number): string => {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`;
  }
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`;
  }
  return volume.toString();
};

export const formatarData = (data: string): string => {
  return new Date(data).toLocaleDateString('pt-BR');
};

export default api;


// ========== Funções legadas (compatibilidade) ==========

export const fetchPortfolioOverview = async () => {
  try {
    const response = await api.get('/api/portfolio/overview');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar overview do portfolio:', error);
    return null;
  }
};
