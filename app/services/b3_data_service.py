"""
Serviço de dados para o mercado brasileiro (B3)
Busca e processa dados de ações brasileiras
"""

from __future__ import annotations

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging
from .analise_tecnica_avancada import AnaliseTecnicaAvancada, ComparadorAcoes

logger = logging.getLogger(__name__)


class B3DataService:
    """Serviço para buscar dados de ações da B3"""
    
    # TODAS as principais ações da B3 disponíveis no Yahoo Finance
    PRINCIPAIS_ACOES = [
        # Petróleo, Gás e Combustíveis
        'PETR3.SA', 'PETR4.SA', 'PRIO3.SA', 'RRRP3.SA', 'RECV3.SA', 
        'UGPA3.SA', 'CSAN3.SA', 'ENAT3.SA', '3R_PETROLEUM',
        
        # Mineração e Siderurgia
        'VALE3.SA', 'GGBR4.SA', 'CSNA3.SA', 'USIM5.SA', 'GOAU4.SA',
        'CMIN3.SA', 'CGRA4.SA',
        
        # Bancos
        'ITUB4.SA', 'BBDC4.SA', 'BBAS3.SA', 'SANB11.SA', 'BPAC11.SA',
        'BBDC3.SA', 'ITUB3.SA', 'BBSE3.SA', 'BPAN4.SA', 'PINE4.SA',
        'BIDI11.SA', 'BIDI4.SA',
        
        # Varejo
        'MGLU3.SA', 'LREN3.SA', 'AMER3.SA', 'VIAV3.SA', 'BHIA3.SA',
        'GUAR3.SA', 'PETZ3.SA', 'SOMA3.SA', 'CEAB3.SA', 'AMAR3.SA',
        'ASAI3.SA', 'CRFB3.SA', 'PCAR3.SA',
        
        # Energia Elétrica
        'ELET3.SA', 'ELET6.SA', 'EGIE3.SA', 'TAEE11.SA', 'CMIG4.SA',
        'CPFE3.SA', 'TRPL4.SA', 'ENBR3.SA', 'ENGI11.SA', 'ENEV3.SA',
        'CPLE6.SA', 'NEOE3.SA', 'AURE3.SA', 'MEGA3.SA',
        
        # Bebidas e Alimentos
        'ABEV3.SA', 'AMBP3.SA', 'JBSS3.SA', 'BRFS3.SA', 'BEEF3.SA',
        'MRFG3.SA', 'SMTO3.SA', 'SLCE3.SA', 'CAML3.SA',
        
        # Telecomunicações
        'VIVT3.SA', 'TIMS3.SA', 'OIBR3.SA', 'ALPA4.SA',
        
        # Construção Civil e Materiais
        'CYRE3.SA', 'MRVE3.SA', 'EZTC3.SA', 'TEND3.SA', 'JHSF3.SA',
        'DIRR3.SA', 'EVEN3.SA', 'HBOR3.SA', 'LAVV3.SA', 'IGTI11.SA',
        'KLBN11.SA', 'SUZB3.SA', 'RANI3.SA',
        
        # Logística e Transporte  
        'RAIL3.SA', 'RENT3.SA', 'ECOR3.SA', 'CCRO3.SA', 'MOVT3.SA',
        'AZUL4.SA', 'GOLL4.SA', 'EMBR3.SA', 'SIMH3.SA',
        
        # Indústria
        'WEGE3.SA', 'RAIZ4.SA', 'LEVE3.SA', 'TUPY3.SA', 'FRAS3.SA',
        'POMO4.SA', 'MILS3.SA', 'KEPL3.SA', 'LJQQ3.SA',
        
        # Tecnologia e Telecom
        'TOTS3.SA', 'LWSA3.SA', 'POSI3.SA', 'CASH3.SA', 'IFCM3.SA',
        'MOVI3.SA', 'LOGN3.SA', 'SQIA3.SA', 'DESK3.SA',
        
        # Saúde
        'RADL3.SA', 'HAPV3.SA', 'FLRY3.SA', 'PNVL3.SA', 'GNDI3.SA',
        'RDOR3.SA', 'QUAL3.SA', 'MATD3.SA', 'ONCO3.SA', 'HYPE3.SA',
        
        # Educação
        'YDUQ3.SA', 'COGN3.SA', 'SEER3.SA', 'ANIM3.SA',
        
        # Papel e Celulose
        'SUZB3.SA', 'KLBN11.SA', 'RANI3.SA',
        
        # Agronegócio
        'SLCE3.SA', 'JALL3.SA', 'AGRO3.SA', 'SOJA3.SA',
        
        # Serviços Financeiros
        'B3SA3.SA', 'CIEL3.SA', 'CIELO', 'PAGS34.SA', 'STBP3.SA',
        'SULA11.SA', 'BRSR6.SA', 'BBSE3.SA',
        
        # Imobiliário e Shoppings
        'MULT3.SA', 'BRML3.SA', 'IGTI11.SA', 'BRPR3.SA', 'ALSO3.SA',
        
        # Químicos e Petroquímicos
        'BRASKEM', 'UNIP6.SA', 'BRKM5.SA',
        
        # Seguros
        'BBSE3.SA', 'SULA11.SA', 'PSSA3.SA', 'WIZS3.SA',
        
        # Outras
        'IRBR3.SA', 'NTCO3.SA', 'AZZA3.SA', 'DXCO3.SA', 'INTB3.SA',
        'HAPV3.SA', 'VBBR3.SA', 'VLID3.SA', 'CLSA3.SA', 'VULC3.SA',
        'GRND3.SA', 'MEAL3.SA', 'AESB3.SA', 'AZEV4.SA', 'COCE5.SA',
    ]
    
    SETORES = {
        'Petróleo e Gás': ['PETR3.SA', 'PETR4.SA', 'PRIO3.SA', 'RRRP3.SA', 'RECV3.SA'],
        'Mineração': ['VALE3.SA', 'GGBR4.SA', 'CSNA3.SA', 'USIM5.SA', 'GOAU4.SA', 'CMIN3.SA'],
        'Bancos': ['ITUB4.SA', 'BBDC4.SA', 'BBAS3.SA', 'SANB11.SA', 'BPAC11.SA', 'BBSE3.SA'],
        'Varejo': ['MGLU3.SA', 'LREN3.SA', 'AMER3.SA', 'VIAV3.SA', 'BHIA3.SA', 'ASAI3.SA', 'CRFB3.SA'],
        'Energia': ['ELET3.SA', 'ELET6.SA', 'EGIE3.SA', 'TAEE11.SA', 'CMIG4.SA', 'CPFE3.SA', 'ENGI11.SA'],
        'Bebidas': ['ABEV3.SA', 'AMBP3.SA'],
        'Alimentos': ['JBSS3.SA', 'BRFS3.SA', 'BEEF3.SA', 'MRFG3.SA', 'SMTO3.SA'],
        'Telecomunicações': ['VIVT3.SA', 'TIMS3.SA', 'OIBR3.SA'],
        'Educação': ['YDUQ3.SA', 'COGN3.SA', 'SEER3.SA', 'ANIM3.SA'],
        'Construção': ['CYRE3.SA', 'MRVE3.SA', 'EZTC3.SA', 'TEND3.SA', 'JHSF3.SA', 'DIRR3.SA'],
        'Logística': ['RAIL3.SA', 'RENT3.SA', 'ECOR3.SA', 'CCRO3.SA', 'AZUL4.SA', 'GOLL4.SA'],
        'Indústria': ['WEGE3.SA', 'EMBR3.SA', 'SUZB3.SA', 'LEVE3.SA', 'RAIZ4.SA', 'TUPY3.SA'],
        'Tecnologia': ['TOTS3.SA', 'LWSA3.SA', 'POSI3.SA', 'CASH3.SA', 'MOVI3.SA', 'LOGN3.SA'],
        'Saúde': ['RADL3.SA', 'HAPV3.SA', 'FLRY3.SA', 'PNVL3.SA', 'GNDI3.SA', 'RDOR3.SA'],
        'B3 e Serviços Financeiros': ['B3SA3.SA', 'CIEL3.SA', 'PAGS34.SA'],
        'Papel e Celulose': ['SUZB3.SA', 'KLBN11.SA', 'RANI3.SA'],
        'Shoppings': ['MULT3.SA', 'BRML3.SA', 'IGTI11.SA', 'ALSO3.SA'],
    }
    
    def __init__(self):
        self.cache: Dict[str, Any] = {}
        
    def buscar_dados_acao(self, ticker: str, periodo: str = '1y') -> pd.DataFrame:
        """
        Busca dados históricos de uma ação
        
        Args:
            ticker: Código da ação (ex: 'PETR4.SA')
            periodo: Período de dados ('1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max')
        """
        try:
            if not ticker.endswith('.SA'):
                ticker = f"{ticker}.SA"
                
            acao = yf.Ticker(ticker)
            dados = acao.history(period=periodo)
            
            if dados.empty:
                logger.warning(f"Sem dados para {ticker}")
                return pd.DataFrame()
            
            # Adicionar indicadores técnicos
            dados = self._calcular_indicadores(dados)
            
            return dados
        except Exception as e:
            logger.error(f"Erro ao buscar {ticker}: {e}")
            return pd.DataFrame()
    
    def buscar_info_acao(self, ticker: str) -> Dict[str, Any]:
        """Busca informações detalhadas de uma ação"""
        try:
            if not ticker.endswith('.SA'):
                ticker = f"{ticker}.SA"
            
            acao = yf.Ticker(ticker)
            info = acao.info
            
            return {
                'ticker': ticker,
                'nome': info.get('longName', ticker),
                'setor': info.get('sector', 'N/A'),
                'preco_atual': info.get('currentPrice', 0),
                'variacao_dia': info.get('regularMarketChangePercent', 0),
                'volume': info.get('volume', 0),
                'market_cap': info.get('marketCap', 0),
                'p_l': info.get('trailingPE', 0),
                'dividend_yield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0,
                'minima_52s': info.get('fiftyTwoWeekLow', 0),
                'maxima_52s': info.get('fiftyTwoWeekHigh', 0),
                'volume_medio': info.get('averageVolume', 0),
            }
        except Exception as e:
            logger.error(f"Erro ao buscar info de {ticker}: {e}")
            return {'ticker': ticker, 'nome': ticker, 'erro': str(e)}
    
    def buscar_cotacao_tempo_real(self, tickers: List[str]) -> pd.DataFrame:
        """Busca cotações em tempo real de múltiplas ações"""
        try:
            tickers_sa = [t if t.endswith('.SA') else f"{t}.SA" for t in tickers]
            dados = yf.download(tickers_sa, period='1d', interval='1m', progress=False)
            return dados
        except Exception as e:
            logger.error(f"Erro ao buscar cotações: {e}")
            return pd.DataFrame()
    
    def buscar_ibovespa(self, periodo: str = '1y') -> pd.DataFrame:
        """Busca dados do índice IBOVESPA"""
        try:
            ibov = yf.Ticker('^BVSP')
            dados = ibov.history(period=periodo)
            return dados
        except Exception as e:
            logger.error(f"Erro ao buscar IBOVESPA: {e}")
            return pd.DataFrame()
    
    def buscar_comparacao_setores(self) -> Dict[str, float]:
        """Busca performance dos setores"""
        desempenho_setores = {}
        
        for setor, tickers in self.SETORES.items():
            try:
                variacoes = []
                for ticker in tickers[:3]:  # Pegar top 3 de cada setor
                    info = self.buscar_info_acao(ticker)
                    if 'variacao_dia' in info:
                        variacoes.append(info['variacao_dia'])
                
                if variacoes:
                    desempenho_setores[setor] = np.mean(variacoes)
            except Exception as e:
                logger.error(f"Erro ao processar setor {setor}: {e}")
        
        return desempenho_setores
    
    def _calcular_indicadores(self, dados: pd.DataFrame) -> pd.DataFrame:
        """Calcula indicadores técnicos"""
        try:
            # RSI (Relative Strength Index)
            delta = dados['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            dados['RSI'] = 100 - (100 / (1 + rs))
            
            # Médias Móveis
            dados['SMA_20'] = dados['Close'].rolling(window=20).mean()
            dados['SMA_50'] = dados['Close'].rolling(window=50).mean()
            dados['SMA_200'] = dados['Close'].rolling(window=200).mean()
            
            # MACD
            exp1 = dados['Close'].ewm(span=12, adjust=False).mean()
            exp2 = dados['Close'].ewm(span=26, adjust=False).mean()
            dados['MACD'] = exp1 - exp2
            dados['Signal'] = dados['MACD'].ewm(span=9, adjust=False).mean()
            dados['MACD_Histogram'] = dados['MACD'] - dados['Signal']
            
            # Bandas de Bollinger
            dados['BB_Middle'] = dados['Close'].rolling(window=20).mean()
            std = dados['Close'].rolling(window=20).std()
            dados['BB_Upper'] = dados['BB_Middle'] + (std * 2)
            dados['BB_Lower'] = dados['BB_Middle'] - (std * 2)
            
            # Volatilidade
            dados['Volatility'] = dados['Close'].pct_change().rolling(window=20).std() * np.sqrt(252) * 100
            
            # Volume médio
            dados['Volume_SMA'] = dados['Volume'].rolling(window=20).mean()
            
            # Indicadores Avançados
            dados['VWAP'] = AnaliseTecnicaAvancada.calcular_vwap(dados)
            dados['OBV'] = AnaliseTecnicaAvancada.calcular_obv(dados)
            dados['MFI'] = AnaliseTecnicaAvancada.calcular_mfi(dados)
            dados['Force_Index'] = AnaliseTecnicaAvancada.calcular_force_index(dados)
            dados['AD'] = AnaliseTecnicaAvancada.calcular_accumulation_distribution(dados)
            dados['ROC'] = AnaliseTecnicaAvancada.calcular_roc(dados)
            dados['Momentum'] = AnaliseTecnicaAvancada.calcular_momentum(dados)
            dados['ADX'] = AnaliseTecnicaAvancada.calcular_adx(dados)
            
            # Detectar Padrões
            dados['Doji'] = AnaliseTecnicaAvancada.detectar_doji(dados)
            dados['Martelo'] = AnaliseTecnicaAvancada.detectar_martelo(dados)
            dados['Engolfo_Alta'] = AnaliseTecnicaAvancada.detectar_engolfo_alta(dados)
            dados['Engolfo_Baixa'] = AnaliseTecnicaAvancada.detectar_engolfo_baixa(dados)
            
            return dados
        except Exception as e:
            logger.error(f"Erro ao calcular indicadores: {e}")
            return dados
    
    def obter_principais_acoes(self) -> List[Dict[str, Any]]:
        """Retorna lista das principais ações com informações básicas"""
        acoes = []
        for ticker in self.PRINCIPAIS_ACOES[:15]:  # Top 15
            try:
                info = self.buscar_info_acao(ticker)
                acoes.append(info)
            except Exception as e:
                logger.error(f"Erro ao buscar {ticker}: {e}")
        
        return acoes
    
    def buscar_ranking_variacao(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retorna ranking de ações por variação do dia (metade altas, metade quedas)"""
        from .cache_service import cache_service
        
        # CACHE: evitar buscar 150+ ações toda vez (2 minutos)
        cache_key = f"ranking_raw_{limit}"
        cached = cache_service.get(cache_key)
        if cached:
            logger.info("🚀 Ranking retornado do CACHE!")
            return cached
        
        logger.info(f"⏳ Buscando {len(self.PRINCIPAIS_ACOES)} ações (vai demorar ~90s)...")
        acoes = []
        for ticker in self.PRINCIPAIS_ACOES:
            try:
                info = self.buscar_info_acao(ticker)
                if 'variacao_dia' in info:
                    acoes.append(info)
            except Exception as e:
                logger.error(f"Erro ao buscar {ticker}: {e}")
        
        # Ordenar por variação (maior para menor)
        acoes_ordenadas = sorted(acoes, key=lambda x: x.get('variacao_dia', 0), reverse=True)
        
        # Pegar metade das maiores altas e metade das maiores quedas
        metade = limit // 2
        maiores_altas = acoes_ordenadas[:metade]
        maiores_quedas = acoes_ordenadas[-metade:]
        maiores_quedas.reverse()  # Inverter para mostrar da maior queda para menor
        
        # Combinar: altas primeiro, depois quedas
        resultado = maiores_altas + maiores_quedas
        
        # Cachear por 2 minutos
        cache_service.set(cache_key, resultado, ttl_seconds=120)
        logger.info(f"✅ Ranking de {len(resultado)} ações cacheado!")
        
        return resultado
    
    def calcular_correlacoes(self, tickers: List[str], periodo: str = '6mo') -> pd.DataFrame:
        """Calcula matriz de correlação entre ações"""
        try:
            tickers_sa = [t if t.endswith('.SA') else f"{t}.SA" for t in tickers]
            dados = yf.download(tickers_sa, period=periodo, progress=False)['Close']
            
            if isinstance(dados, pd.Series):
                return pd.DataFrame()
            
            retornos = dados.pct_change().dropna()
            correlacoes = retornos.corr()
            
            return correlacoes
        except Exception as e:
            logger.error(f"Erro ao calcular correlações: {e}")
            return pd.DataFrame()


# Instância global
b3_service = B3DataService()

