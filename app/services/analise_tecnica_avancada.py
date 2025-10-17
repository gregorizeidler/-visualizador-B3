"""
Módulo de Análise Técnica Avançada
Indicadores, Padrões e Análises Sofisticadas
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any
from datetime import datetime, timedelta


class AnaliseTecnicaAvancada:
    """Classe para análises técnicas avançadas"""
    
    @staticmethod
    def calcular_vwap(dados: pd.DataFrame) -> pd.Series:
        """Calcula VWAP (Volume Weighted Average Price)"""
        typical_price = (dados['High'] + dados['Low'] + dados['Close']) / 3
        vwap = (typical_price * dados['Volume']).cumsum() / dados['Volume'].cumsum()
        return vwap
    
    @staticmethod
    def calcular_fibonacci(dados: pd.DataFrame) -> Dict[str, Any]:
        """Calcula retrações e extensões de Fibonacci"""
        if len(dados) < 2:
            return {}
        
        # Encontrar máxima e mínima do período
        max_price = dados['High'].max()
        min_price = dados['Low'].min()
        diff = max_price - min_price
        
        # Níveis de Fibonacci (retrações)
        niveis_retracao = {
            '0.0%': float(max_price),
            '23.6%': float(max_price - (diff * 0.236)),
            '38.2%': float(max_price - (diff * 0.382)),
            '50.0%': float(max_price - (diff * 0.500)),
            '61.8%': float(max_price - (diff * 0.618)),
            '78.6%': float(max_price - (diff * 0.786)),
            '100.0%': float(min_price)
        }
        
        # Extensões de Fibonacci
        niveis_extensao = {
            '161.8%': float(max_price + (diff * 0.618)),
            '261.8%': float(max_price + (diff * 1.618)),
            '423.6%': float(max_price + (diff * 3.236))
        }
        
        # Pontos de Camarilla (R1-R4, S1-S4)
        ultimo = dados.iloc[-1]
        close = ultimo['Close']
        high = ultimo['High']
        low = ultimo['Low']
        
        diff_hl = high - low
        
        camarilla = {
            'R4': float(close + (diff_hl * 1.1) / 2),
            'R3': float(close + (diff_hl * 1.1) / 4),
            'R2': float(close + (diff_hl * 1.1) / 6),
            'R1': float(close + (diff_hl * 1.1) / 12),
            'PP': float((high + low + close) / 3),
            'S1': float(close - (diff_hl * 1.1) / 12),
            'S2': float(close - (diff_hl * 1.1) / 6),
            'S3': float(close - (diff_hl * 1.1) / 4),
            'S4': float(close - (diff_hl * 1.1) / 2)
        }
        
        return {
            'retracoes': niveis_retracao,
            'extensoes': niveis_extensao,
            'camarilla': camarilla,
            'max_price': float(max_price),
            'min_price': float(min_price),
            'preco_atual': float(close)
        }
    
    @staticmethod
    def calcular_obv(dados: pd.DataFrame) -> pd.Series:
        """Calcula OBV (On Balance Volume)"""
        obv = pd.Series(index=dados.index, dtype=float)
        obv.iloc[0] = dados['Volume'].iloc[0]
        
        for i in range(1, len(dados)):
            if dados['Close'].iloc[i] > dados['Close'].iloc[i-1]:
                obv.iloc[i] = obv.iloc[i-1] + dados['Volume'].iloc[i]
            elif dados['Close'].iloc[i] < dados['Close'].iloc[i-1]:
                obv.iloc[i] = obv.iloc[i-1] - dados['Volume'].iloc[i]
            else:
                obv.iloc[i] = obv.iloc[i-1]
        
        return obv
    
    @staticmethod
    def calcular_mfi(dados: pd.DataFrame, periodo: int = 14) -> pd.Series:
        """Calcula MFI (Money Flow Index)"""
        typical_price = (dados['High'] + dados['Low'] + dados['Close']) / 3
        money_flow = typical_price * dados['Volume']
        
        positive_flow = pd.Series(0, index=dados.index)
        negative_flow = pd.Series(0, index=dados.index)
        
        for i in range(1, len(dados)):
            if typical_price.iloc[i] > typical_price.iloc[i-1]:
                positive_flow.iloc[i] = money_flow.iloc[i]
            elif typical_price.iloc[i] < typical_price.iloc[i-1]:
                negative_flow.iloc[i] = money_flow.iloc[i]
        
        positive_mf = positive_flow.rolling(window=periodo).sum()
        negative_mf = negative_flow.rolling(window=periodo).sum()
        
        mfi = 100 - (100 / (1 + (positive_mf / negative_mf)))
        return mfi
    
    @staticmethod
    def calcular_force_index(dados: pd.DataFrame, periodo: int = 13) -> pd.Series:
        """Calcula Force Index"""
        force = (dados['Close'] - dados['Close'].shift(1)) * dados['Volume']
        force_ema = force.ewm(span=periodo, adjust=False).mean()
        return force_ema
    
    @staticmethod
    def calcular_accumulation_distribution(dados: pd.DataFrame) -> pd.Series:
        """Calcula Accumulation/Distribution Line"""
        clv = ((dados['Close'] - dados['Low']) - (dados['High'] - dados['Close'])) / (dados['High'] - dados['Low'])
        clv = clv.fillna(0)
        ad = (clv * dados['Volume']).cumsum()
        return ad
    
    @staticmethod
    def calcular_roc(dados: pd.DataFrame, periodo: int = 12) -> pd.Series:
        """Calcula Rate of Change"""
        roc = ((dados['Close'] - dados['Close'].shift(periodo)) / dados['Close'].shift(periodo)) * 100
        return roc
    
    @staticmethod
    def calcular_momentum(dados: pd.DataFrame, periodo: int = 10) -> pd.Series:
        """Calcula Momentum"""
        momentum = dados['Close'] - dados['Close'].shift(periodo)
        return momentum
    
    @staticmethod
    def calcular_adx(dados: pd.DataFrame, periodo: int = 14) -> pd.Series:
        """Calcula ADX (Average Directional Index)"""
        high = dados['High']
        low = dados['Low']
        close = dados['Close']
        
        plus_dm = high.diff()
        minus_dm = low.diff()
        plus_dm[plus_dm < 0] = 0
        minus_dm[minus_dm > 0] = 0
        minus_dm = abs(minus_dm)
        
        tr1 = high - low
        tr2 = abs(high - close.shift())
        tr3 = abs(low - close.shift())
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = tr.rolling(window=periodo).mean()
        
        plus_di = 100 * (plus_dm.rolling(window=periodo).mean() / atr)
        minus_di = 100 * (minus_dm.rolling(window=periodo).mean() / atr)
        
        dx = 100 * abs(plus_di - minus_di) / (plus_di + minus_di)
        adx = dx.rolling(window=periodo).mean()
        
        return adx
    
    @staticmethod
    def detectar_doji(dados: pd.DataFrame) -> pd.Series:
        """Detecta padrão Doji"""
        body = abs(dados['Close'] - dados['Open'])
        range_total = dados['High'] - dados['Low']
        doji = (body / range_total < 0.1) & (range_total > 0)
        return doji
    
    @staticmethod
    def detectar_martelo(dados: pd.DataFrame) -> pd.Series:
        """Detecta padrão Martelo (Hammer)"""
        body = abs(dados['Close'] - dados['Open'])
        lower_shadow = dados[['Open', 'Close']].min(axis=1) - dados['Low']
        upper_shadow = dados['High'] - dados[['Open', 'Close']].max(axis=1)
        
        martelo = (
            (lower_shadow > 2 * body) &
            (upper_shadow < body * 0.3) &
            (dados['Close'] > dados['Open'])
        )
        return martelo
    
    @staticmethod
    def detectar_engolfo_alta(dados: pd.DataFrame) -> pd.Series:
        """Detecta padrão Engolfo de Alta"""
        prev_red = dados['Close'].shift(1) < dados['Open'].shift(1)
        curr_green = dados['Close'] > dados['Open']
        engolfo = (
            prev_red & curr_green &
            (dados['Open'] < dados['Close'].shift(1)) &
            (dados['Close'] > dados['Open'].shift(1))
        )
        return engolfo
    
    @staticmethod
    def detectar_engolfo_baixa(dados: pd.DataFrame) -> pd.Series:
        """Detecta padrão Engolfo de Baixa"""
        prev_green = dados['Close'].shift(1) > dados['Open'].shift(1)
        curr_red = dados['Close'] < dados['Open']
        engolfo = (
            prev_green & curr_red &
            (dados['Open'] > dados['Close'].shift(1)) &
            (dados['Close'] < dados['Open'].shift(1))
        )
        return engolfo
    
    @staticmethod
    def calcular_pivot_points(dados: pd.DataFrame) -> Dict[str, float]:
        """Calcula Pivot Points (S1, S2, S3, R1, R2, R3)"""
        ultimo = dados.iloc[-1]
        high = ultimo['High']
        low = ultimo['Low']
        close = ultimo['Close']
        
        pivot = (high + low + close) / 3
        
        r1 = 2 * pivot - low
        r2 = pivot + (high - low)
        r3 = high + 2 * (pivot - low)
        
        s1 = 2 * pivot - high
        s2 = pivot - (high - low)
        s3 = low - 2 * (high - pivot)
        
        return {
            'pivot': pivot,
            'r1': r1, 'r2': r2, 'r3': r3,
            's1': s1, 's2': s2, 's3': s3
        }
    
    @staticmethod
    def detectar_suportes_resistencias(dados: pd.DataFrame, janela: int = 20) -> Dict[str, List[float]]:
        """Detecta níveis de suporte e resistência"""
        highs = dados['High'].rolling(window=janela, center=True).max()
        lows = dados['Low'].rolling(window=janela, center=True).min()
        
        resistencias = []
        suportes = []
        
        for i in range(janela, len(dados) - janela):
            if dados['High'].iloc[i] == highs.iloc[i]:
                resistencias.append(dados['High'].iloc[i])
            if dados['Low'].iloc[i] == lows.iloc[i]:
                suportes.append(dados['Low'].iloc[i])
        
        # Agrupar níveis próximos
        resistencias = list(set([round(r, 2) for r in resistencias]))
        suportes = list(set([round(s, 2) for s in suportes]))
        
        return {
            'resistencias': sorted(resistencias, reverse=True)[:5],
            'suportes': sorted(suportes, reverse=True)[:5]
        }
    
    @staticmethod
    def calcular_score_tecnico(dados: pd.DataFrame) -> Dict[str, Any]:
        """Calcula Score Técnico Geral (0-100)"""
        ultimo = dados.iloc[-1]
        
        scores = []
        sinais = []
        
        # RSI Score
        rsi = ultimo.get('RSI', 50)
        if rsi < 30:
            scores.append(100)
            sinais.append('RSI Sobrevendido (COMPRA)')
        elif rsi > 70:
            scores.append(0)
            sinais.append('RSI Sobrecomprado (VENDA)')
        else:
            scores.append(50)
            sinais.append('RSI Neutro')
        
        # MACD Score
        macd = ultimo.get('MACD', 0)
        macd_signal = ultimo.get('Signal', 0)
        if macd > macd_signal:
            scores.append(75)
            sinais.append('MACD Positivo (COMPRA)')
        else:
            scores.append(25)
            sinais.append('MACD Negativo (VENDA)')
        
        # Médias Móveis
        close = ultimo['Close']
        sma_20 = ultimo.get('SMA_20', close)
        sma_50 = ultimo.get('SMA_50', close)
        
        if close > sma_20 > sma_50:
            scores.append(100)
            sinais.append('Tendência de Alta')
        elif close < sma_20 < sma_50:
            scores.append(0)
            sinais.append('Tendência de Baixa')
        else:
            scores.append(50)
            sinais.append('Tendência Indefinida')
        
        # Volume
        volume_atual = ultimo['Volume']
        volume_medio = dados['Volume'].rolling(20).mean().iloc[-1]
        if volume_atual > volume_medio * 1.5:
            scores.append(75)
            sinais.append('Volume Alto')
        elif volume_atual < volume_medio * 0.5:
            scores.append(25)
            sinais.append('Volume Baixo')
        else:
            scores.append(50)
            sinais.append('Volume Normal')
        
        score_final = sum(scores) / len(scores)
        
        if score_final >= 75:
            recomendacao = 'COMPRA FORTE 🟢🟢'
        elif score_final >= 60:
            recomendacao = 'COMPRA 🟢'
        elif score_final >= 40:
            recomendacao = 'NEUTRO 🟡'
        elif score_final >= 25:
            recomendacao = 'VENDA 🔴'
        else:
            recomendacao = 'VENDA FORTE 🔴🔴'
        
        return {
            'score': round(score_final, 1),
            'recomendacao': recomendacao,
            'sinais': sinais
        }
    
    @staticmethod
    def detectar_anomalias(dados: pd.DataFrame) -> List[Dict[str, Any]]:
        """Detecta anomalias no comportamento da ação"""
        anomalias = []
        
        if len(dados) < 20:
            return anomalias
        
        ultimo = dados.iloc[-1]
        
        # Volume anormal
        volume_medio = dados['Volume'].rolling(20).mean().iloc[-2]
        volume_atual = ultimo['Volume']
        if volume_atual > volume_medio * 3:
            anomalias.append({
                'tipo': 'VOLUME_ALTO',
                'mensagem': f'Volume 3x acima da média! ({volume_atual/1e6:.1f}M vs {volume_medio/1e6:.1f}M)',
                'severidade': 'alta'
            })
        
        # Gap de abertura
        close_anterior = dados['Close'].iloc[-2]
        open_atual = ultimo['Open']
        gap_pct = abs((open_atual - close_anterior) / close_anterior) * 100
        if gap_pct > 5:
            anomalias.append({
                'tipo': 'GAP',
                'mensagem': f'Gap de {gap_pct:.1f}% na abertura!',
                'severidade': 'alta'
            })
        
        # Volatilidade súbita
        volatilidade_media = dados['Close'].pct_change().rolling(20).std().iloc[-2]
        volatilidade_atual = abs(dados['Close'].pct_change().iloc[-1])
        if volatilidade_atual > volatilidade_media * 3:
            anomalias.append({
                'tipo': 'VOLATILIDADE',
                'mensagem': f'Volatilidade 3x acima do normal!',
                'severidade': 'media'
            })
        
        # Variação intraday extrema
        variacao_intraday = ((ultimo['High'] - ultimo['Low']) / ultimo['Low']) * 100
        if variacao_intraday > 10:
            anomalias.append({
                'tipo': 'VARIACAO_INTRADAY',
                'mensagem': f'Variação intraday de {variacao_intraday:.1f}%!',
                'severidade': 'media'
            })
        
        return anomalias
    
    @staticmethod
    def calcular_volume_profile(dados: pd.DataFrame, bins: int = 20) -> Dict[str, Any]:
        """Calcula Volume Profile"""
        price_min = dados['Low'].min()
        price_max = dados['High'].max()
        
        price_bins = np.linspace(price_min, price_max, bins + 1)
        volume_at_price = np.zeros(bins)
        
        for _, row in dados.iterrows():
            typical_price = (row['High'] + row['Low'] + row['Close']) / 3
            bin_idx = np.digitize(typical_price, price_bins) - 1
            if 0 <= bin_idx < bins:
                volume_at_price[bin_idx] += row['Volume']
        
        # Encontrar POC (Point of Control) - preço com maior volume
        poc_idx = np.argmax(volume_at_price)
        poc_price = (price_bins[poc_idx] + price_bins[poc_idx + 1]) / 2
        
        profile = [
            {
                'preco_min': float(price_bins[i]),
                'preco_max': float(price_bins[i + 1]),
                'volume': float(volume_at_price[i])
            }
            for i in range(bins)
        ]
        
        return {
            'profile': profile,
            'poc': float(poc_price),
            'volume_total': float(dados['Volume'].sum())
        }


class ComparadorAcoes:
    """Classe para comparar múltiplas ações"""
    
    @staticmethod
    def calcular_sharpe_ratio(retornos: pd.Series, rf_rate: float = 0.1) -> float:
        """Calcula Sharpe Ratio - sempre retorna um número válido"""
        try:
            # Verificar se temos dados suficientes
            if retornos is None or len(retornos) < 2:
                return 0.0
            
            # Remover valores nulos
            retornos_limpos = retornos.dropna()
            if len(retornos_limpos) < 2:
                return 0.0
            
            retorno_medio = retornos_limpos.mean() * 252  # Anualizado
            volatilidade = retornos_limpos.std() * np.sqrt(252)  # Anualizada
            
            # Verificar se volatilidade é válida
            if volatilidade <= 0 or pd.isna(volatilidade):
                return 0.0
            
            sharpe = (retorno_medio - rf_rate) / volatilidade
            
            # Garantir que não é NaN ou infinito
            if pd.isna(sharpe) or np.isinf(sharpe):
                return 0.0
            
            return float(sharpe)
        except Exception as e:
            logger.error(f"Erro ao calcular Sharpe Ratio: {e}")
            return 0.0
    
    @staticmethod
    def calcular_beta(retornos_acao: pd.Series, retornos_mercado: pd.Series) -> float:
        """Calcula Beta em relação ao mercado"""
        covariancia = retornos_acao.cov(retornos_mercado)
        variancia_mercado = retornos_mercado.var()
        beta = covariancia / variancia_mercado if variancia_mercado > 0 else 1
        return beta
    
    @staticmethod
    def comparar_metricas(acoes_dados: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Compara métricas de múltiplas ações - sempre retorna valores válidos"""
        resultados = []
        
        for ticker, dados in acoes_dados.items():
            if len(dados) < 20:
                continue
            
            try:
                retornos = dados['Close'].pct_change().dropna()
                
                # Calcular cada métrica com tratamento de erro
                retorno_total = 0.0
                try:
                    retorno_total = float(((dados['Close'].iloc[-1] / dados['Close'].iloc[0]) - 1) * 100)
                    if pd.isna(retorno_total) or np.isinf(retorno_total):
                        retorno_total = 0.0
                except:
                    retorno_total = 0.0
                
                volatilidade = 0.0
                try:
                    volatilidade = float(retornos.std() * np.sqrt(252) * 100)
                    if pd.isna(volatilidade) or np.isinf(volatilidade):
                        volatilidade = 0.0
                except:
                    volatilidade = 0.0
                
                sharpe_ratio = ComparadorAcoes.calcular_sharpe_ratio(retornos)
                
                max_drawdown = 0.0
                try:
                    max_drawdown = float(((dados['Close'].cummax() - dados['Close']) / dados['Close'].cummax()).max() * 100)
                    if pd.isna(max_drawdown) or np.isinf(max_drawdown):
                        max_drawdown = 0.0
                except:
                    max_drawdown = 0.0
                
                preco_atual = 0.0
                try:
                    preco_atual = float(dados['Close'].iloc[-1])
                    if pd.isna(preco_atual) or np.isinf(preco_atual):
                        preco_atual = 0.0
                except:
                    preco_atual = 0.0
                
                metricas = {
                    'ticker': ticker,
                    'retorno_total': retorno_total,
                    'volatilidade': volatilidade,
                    'sharpe_ratio': sharpe_ratio,
                    'max_drawdown': max_drawdown,
                    'preco_atual': preco_atual
                }
                resultados.append(metricas)
                
            except Exception as e:
                logger.error(f"Erro ao calcular métricas para {ticker}: {e}")
                # Adicionar valores padrão em caso de erro total
                metricas = {
                    'ticker': ticker,
                    'retorno_total': 0.0,
                    'volatilidade': 0.0,
                    'sharpe_ratio': 0.0,
                    'max_drawdown': 0.0,
                    'preco_atual': 0.0
                }
                resultados.append(metricas)
        
        return pd.DataFrame(resultados)

