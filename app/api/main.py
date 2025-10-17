"""
API Principal - Visualizador B3
Sistema Avançado de Visualização de Ações Brasileiras
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Visualizador B3 API",
    description="Sistema Avançado de Visualização de Ações Brasileiras",
    version="2.0.0",
)

# CORS - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Start application."""
    logger.info("🚀 Visualizador B3 API iniciada")
    logger.info("📊 Servidor pronto para receber requisições")


@app.get("/")
def root():
    return {
        "message": "Visualizador B3 - API de Ações Brasileiras",
        "status": "ativo",
        "versao": "2.0.0",
        "mercado": "B3 - Brasil, Bolsa, Balcão"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Visualizador B3 API"
    }


# ============= Endpoints Específicos B3 =============

@app.get("/api/b3/acoes/principais")
def get_principais_acoes_b3():
    """Retorna as principais ações da B3 com dados em tempo real."""
    from ..services.b3_data_service import b3_service
    from ..services.cache_service import cache_service
    
    # Cache de 3 minutos
    cache_key = "acoes_principais"
    cached = cache_service.get(cache_key)
    if cached:
        return cached
    
    acoes = b3_service.obter_principais_acoes()
    result = {
        "acoes": acoes,
        "total": len(acoes),
        "mercado": "B3",
        "timestamp": datetime.now().isoformat(),
    }
    
    cache_service.set(cache_key, result, ttl_seconds=180)
    return result


@app.get("/api/b3/acao/{ticker}")
def get_dados_acao_b3(
    ticker: str,
    periodo: str = Query(default="1y", regex="^(1d|5d|1mo|3mo|6mo|1y|2y|5y|max)$")
):
    """Retorna dados históricos completos de uma ação brasileira."""
    from ..services.b3_data_service import b3_service
    
    dados = b3_service.buscar_dados_acao(ticker, periodo)
    info = b3_service.buscar_info_acao(ticker)
    
    if dados.empty:
        raise HTTPException(status_code=404, detail=f"Ação {ticker} não encontrada")
    
    # Converter para formato JSON
    dados_json = []
    for idx, row in dados.iterrows():
        dados_json.append({
            "data": idx.strftime("%Y-%m-%d"),
            "abertura": float(row['Open']) if pd.notna(row['Open']) else None,
            "maxima": float(row['High']) if pd.notna(row['High']) else None,
            "minima": float(row['Low']) if pd.notna(row['Low']) else None,
            "fechamento": float(row['Close']) if pd.notna(row['Close']) else None,
            "volume": int(row['Volume']) if pd.notna(row['Volume']) else None,
            "rsi": float(row['RSI']) if 'RSI' in row and pd.notna(row['RSI']) else None,
            "sma_20": float(row['SMA_20']) if 'SMA_20' in row and pd.notna(row['SMA_20']) else None,
            "sma_50": float(row['SMA_50']) if 'SMA_50' in row and pd.notna(row['SMA_50']) else None,
            "sma_200": float(row['SMA_200']) if 'SMA_200' in row and pd.notna(row['SMA_200']) else None,
            "macd": float(row['MACD']) if 'MACD' in row and pd.notna(row['MACD']) else None,
            "macd_signal": float(row['Signal']) if 'Signal' in row and pd.notna(row['Signal']) else None,
            "bb_upper": float(row['BB_Upper']) if 'BB_Upper' in row and pd.notna(row['BB_Upper']) else None,
            "bb_middle": float(row['BB_Middle']) if 'BB_Middle' in row and pd.notna(row['BB_Middle']) else None,
            "bb_lower": float(row['BB_Lower']) if 'BB_Lower' in row and pd.notna(row['BB_Lower']) else None,
            "volatilidade": float(row['Volatility']) if 'Volatility' in row and pd.notna(row['Volatility']) else None,
            })
        
        return {
        "ticker": ticker,
        "info": info,
        "dados": dados_json,
        "periodo": periodo,
        "total_registros": len(dados_json),
    }


@app.get("/api/b3/ibovespa")
def get_ibovespa(periodo: str = Query(default="1y")):
    """Retorna dados históricos do índice IBOVESPA."""
    from ..services.b3_data_service import b3_service
    from ..services.cache_service import cache_service
    
    # Cache de 5 minutos por período
    cache_key = f"ibovespa_{periodo}"
    cached = cache_service.get(cache_key)
    if cached:
        return cached
    
    dados = b3_service.buscar_ibovespa(periodo)
    
    if dados.empty:
        raise HTTPException(status_code=404, detail="Dados do IBOVESPA não disponíveis")
    
    dados_json = []
    for idx, row in dados.iterrows():
        dados_json.append({
            "data": idx.strftime("%Y-%m-%d"),
            "fechamento": float(row['Close']),
            "volume": int(row['Volume']) if pd.notna(row['Volume']) else 0,
        })
    
    # Calcular variação
    variacao_dia = 0
    variacao_periodo = 0
    if len(dados_json) >= 2:
        variacao_dia = ((dados_json[-1]['fechamento'] / dados_json[-2]['fechamento']) - 1) * 100
        variacao_periodo = ((dados_json[-1]['fechamento'] / dados_json[0]['fechamento']) - 1) * 100
    
    result = {
        "indice": "IBOVESPA",
        "dados": dados_json,
        "variacao_dia": round(variacao_dia, 2),
        "variacao_periodo": round(variacao_periodo, 2),
        "periodo": periodo,
    }
    
    cache_service.set(cache_key, result, ttl_seconds=300)
    return result


@app.get("/api/b3/setores")
def get_desempenho_setores():
    """Retorna o desempenho dos setores da B3."""
    from ..services.b3_data_service import b3_service
    from ..services.cache_service import cache_service
    
    # Cache de 5 minutos
    cache_key = "setores"
    cached = cache_service.get(cache_key)
    if cached:
        return cached
    
    setores = b3_service.buscar_comparacao_setores()
    
    setores_lista = [
        {"setor": setor, "variacao": round(var, 2)}
        for setor, var in setores.items()
    ]
    
    # Ordenar por variação
    setores_lista = sorted(setores_lista, key=lambda x: x['variacao'], reverse=True)
    
    result = {
        "setores": setores_lista,
        "total": len(setores_lista),
        "timestamp": datetime.now().isoformat(),
    }
    
    cache_service.set(cache_key, result, ttl_seconds=300)
    return result


@app.get("/api/b3/ranking")
def get_ranking_acoes(tipo: str = Query(default="variacao", regex="^(variacao|volume)$")):
    """Retorna ranking de ações por variação ou volume."""
    from ..services.b3_data_service import b3_service
    from ..services.cache_service import cache_service
    
    # Tentar cache primeiro (2 minutos)
    cache_key = f"ranking_{tipo}"
    cached = cache_service.get(cache_key)
    if cached:
        return cached
    
    if tipo == "variacao":
        ranking = b3_service.buscar_ranking_variacao(limit=20)
    else:
        ranking = b3_service.obter_principais_acoes()
        ranking = sorted(ranking, key=lambda x: x.get('volume', 0), reverse=True)[:20]
    
    result = {
        "ranking": ranking,
        "tipo": tipo,
        "total": len(ranking),
        "timestamp": datetime.now().isoformat(),
    }
    
    # Cachear por 2 minutos
    cache_service.set(cache_key, result, ttl_seconds=120)
    
    return result


@app.get("/api/b3/correlacoes")
def get_correlacoes(
    tickers: str = Query(..., description="Tickers separados por vírgula (ex: PETR4,VALE3,ITUB4)"),
    periodo: str = Query(default="6mo")
):
    """Retorna matriz de correlação entre ações com dados avançados."""
    from ..services.b3_data_service import b3_service
    
    lista_tickers = [t.strip() for t in tickers.split(',')]
    
    if len(lista_tickers) < 2:
        raise HTTPException(status_code=400, detail="Forneça ao menos 2 tickers")
    
    correlacoes = b3_service.calcular_correlacoes(lista_tickers, periodo)
    
    if correlacoes.empty:
        raise HTTPException(status_code=404, detail="Não foi possível calcular correlações")
    
    # Converter para formato JSON
    correlacoes_json = {}
    for ticker1 in correlacoes.columns:
        correlacoes_json[ticker1] = {}
        for ticker2 in correlacoes.columns:
            valor = correlacoes.loc[ticker1, ticker2]
            correlacoes_json[ticker1][ticker2] = round(float(valor), 3) if pd.notna(valor) else None
    
    # Criar pares de correlação para network graph
    pares = []
    for i, ticker1 in enumerate(lista_tickers):
        for ticker2 in lista_tickers[i+1:]:
            t1_sa = f"{ticker1}.SA" if not ticker1.endswith('.SA') else ticker1
            t2_sa = f"{ticker2}.SA" if not ticker2.endswith('.SA') else ticker2
            
            if t1_sa in correlacoes.columns and t2_sa in correlacoes.columns:
                corr = correlacoes.loc[t1_sa, t2_sa]
                if pd.notna(corr):
                    pares.append({
                        'source': ticker1,
                        'target': ticker2,
                        'correlacao': round(float(corr), 3),
                        'forca': abs(float(corr))  # Para espessura da linha
                    })
        
        return {
        "correlacoes": correlacoes_json,
        "pares": pares,
        "tickers": lista_tickers,
        "periodo": periodo,
    }


@app.get("/api/b3/comparacao")
def get_comparacao_acoes(
    tickers: str = Query(..., description="Tickers separados por vírgula"),
    periodo: str = Query(default="1y")
):
    """Compara o desempenho de múltiplas ações."""
    from ..services.b3_data_service import b3_service
    
    lista_tickers = [t.strip() for t in tickers.split(',')]
    
    if len(lista_tickers) < 2:
        raise HTTPException(status_code=400, detail="Forneça ao menos 2 tickers para comparação")
    
    comparacao = {}
    
    for ticker in lista_tickers:
        dados = b3_service.buscar_dados_acao(ticker, periodo)
        if not dados.empty:
            # Normalizar preços (base 100)
            precos_normalizados = (dados['Close'] / dados['Close'].iloc[0]) * 100
            
            comparacao[ticker] = {
                "dados": [
                    {
                        "data": idx.strftime("%Y-%m-%d"),
                        "valor_normalizado": round(float(val), 2)
                    }
                    for idx, val in precos_normalizados.items()
                ],
                "variacao_periodo": round(((dados['Close'].iloc[-1] / dados['Close'].iloc[0]) - 1) * 100, 2),
            }
    
    return {
        "comparacao": comparacao,
        "tickers": lista_tickers,
        "periodo": periodo,
        "base": 100,
    }


# ============= Endpoints de Análise Avançada =============

@app.get("/api/b3/analise/score/{ticker}")
def get_score_tecnico(ticker: str, periodo: str = Query(default="3mo")):
    """Retorna Score Técnico e Recomendação Automática"""
    from ..services.b3_data_service import b3_service
    from ..services.analise_tecnica_avancada import AnaliseTecnicaAvancada
    
    dados = b3_service.buscar_dados_acao(ticker, periodo)
    if dados.empty:
        raise HTTPException(status_code=404, detail=f"Ação {ticker} não encontrada")
    
    score = AnaliseTecnicaAvancada.calcular_score_tecnico(dados)
    pivot = AnaliseTecnicaAvancada.calcular_pivot_points(dados)
    anomalias = AnaliseTecnicaAvancada.detectar_anomalias(dados)
    suporte_resistencia = AnaliseTecnicaAvancada.detectar_suportes_resistencias(dados)
        
        return {
        "ticker": ticker,
        "score": score['score'],
        "recomendacao": score['recomendacao'],
        "sinais": score['sinais'],
        "pivot_points": pivot,
        "suportes": suporte_resistencia['suportes'],
        "resistencias": suporte_resistencia['resistencias'],
        "anomalias": anomalias,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/b3/analise/padroes/{ticker}")
def get_padroes_candles(ticker: str, periodo: str = Query(default="1mo")):
    """Detecta padrões de candles"""
    from ..services.b3_data_service import b3_service
    
    dados = b3_service.buscar_dados_acao(ticker, periodo)
    if dados.empty:
        raise HTTPException(status_code=404, detail=f"Ação {ticker} não encontrada")
    
    # Últimos 10 dias com padrões
    padroes_encontrados = []
    for i in range(max(0, len(dados) - 10), len(dados)):
        row = dados.iloc[i]
        padroes_dia = []
    
        if row.get('Doji', False):
            padroes_dia.append('Doji')
        if row.get('Martelo', False):
            padroes_dia.append('Martelo (Alta)')
        if row.get('Engolfo_Alta', False):
            padroes_dia.append('Engolfo de Alta')
        if row.get('Engolfo_Baixa', False):
            padroes_dia.append('Engolfo de Baixa')
    
        if padroes_dia:
            padroes_encontrados.append({
                'data': row.name.strftime("%Y-%m-%d"),
                'padroes': padroes_dia,
                'preco': float(row['Close'])
            })
        
        return {
        "ticker": ticker,
        "padroes": padroes_encontrados,
        "total": len(padroes_encontrados)
    }


@app.get("/api/b3/analise/volume-profile/{ticker}")
def get_volume_profile(ticker: str, periodo: str = Query(default="3mo")):
    """Retorna Volume Profile da ação"""
    from ..services.b3_data_service import b3_service
    from ..services.analise_tecnica_avancada import AnaliseTecnicaAvancada
    
    dados = b3_service.buscar_dados_acao(ticker, periodo)
    if dados.empty:
        raise HTTPException(status_code=404, detail=f"Ação {ticker} não encontrada")
    
    volume_profile = AnaliseTecnicaAvancada.calcular_volume_profile(dados)
        
        return {
        "ticker": ticker,
        "profile": volume_profile['profile'],
        "poc": volume_profile['poc'],
        "volume_total": volume_profile['volume_total'],
        "periodo": periodo
    }


@app.get("/api/b3/analise/indicadores-avancados/{ticker}")
def get_indicadores_avancados(ticker: str, periodo: str = Query(default="6mo")):
    """Retorna todos os indicadores avançados"""
    from ..services.b3_data_service import b3_service
    
    dados = b3_service.buscar_dados_acao(ticker, periodo)
    if dados.empty:
        raise HTTPException(status_code=404, detail=f"Ação {ticker} não encontrada")
    
    ultimo = dados.iloc[-1]
    
    indicadores = {
        "ticker": ticker,
        "preco_atual": float(ultimo['Close']),
        "vwap": float(ultimo.get('VWAP', 0)) if pd.notna(ultimo.get('VWAP')) else None,
        "obv": float(ultimo.get('OBV', 0)) if pd.notna(ultimo.get('OBV')) else None,
        "mfi": float(ultimo.get('MFI', 0)) if pd.notna(ultimo.get('MFI')) else None,
        "force_index": float(ultimo.get('Force_Index', 0)) if pd.notna(ultimo.get('Force_Index')) else None,
        "accumulation_distribution": float(ultimo.get('AD', 0)) if pd.notna(ultimo.get('AD')) else None,
        "roc": float(ultimo.get('ROC', 0)) if pd.notna(ultimo.get('ROC')) else None,
        "momentum": float(ultimo.get('Momentum', 0)) if pd.notna(ultimo.get('Momentum')) else None,
        "adx": float(ultimo.get('ADX', 0)) if pd.notna(ultimo.get('ADX')) else None,
    
        # Série temporal dos últimos 30 dias
        "historico": [
            {
                "data": idx.strftime("%Y-%m-%d"),
                "vwap": float(row.get('VWAP', 0)) if pd.notna(row.get('VWAP')) else None,
                "obv": float(row.get('OBV', 0)) if pd.notna(row.get('OBV')) else None,
                "mfi": float(row.get('MFI', 0)) if pd.notna(row.get('MFI')) else None,
                "adx": float(row.get('ADX', 0)) if pd.notna(row.get('ADX')) else None,
            }
            for idx, row in dados.tail(30).iterrows()
        ]
    }
    
    return indicadores


@app.post("/api/b3/analise/comparador")
def comparar_acoes_avancado(
    tickers: str = Query(..., description="Tickers separados por vírgula"),
    periodo: str = Query(default="1y")
):
    """Compara múltiplas ações com métricas avançadas"""
    from ..services.b3_data_service import b3_service
    from ..services.analise_tecnica_avancada import ComparadorAcoes
    
    lista_tickers = [t.strip() for t in tickers.split(',')]
    
    if len(lista_tickers) < 2:
        raise HTTPException(status_code=400, detail="Forneça ao menos 2 tickers")
    
    acoes_dados = {}
    for ticker in lista_tickers:
        dados = b3_service.buscar_dados_acao(ticker, periodo)
        if not dados.empty:
            acoes_dados[ticker] = dados
    
    comparacao = ComparadorAcoes.comparar_metricas(acoes_dados)
    
    return {
        "comparacao": comparacao.to_dict(orient='records'),
        "tickers": lista_tickers,
        "periodo": periodo
    }


@app.get("/api/b3/analise/fibonacci/{ticker}")
def get_fibonacci(ticker: str, periodo: str = Query(default="3mo")):
    """Retorna níveis de Fibonacci, Camarilla e extensões"""
    from ..services.b3_data_service import b3_service
    from ..services.analise_tecnica_avancada import AnaliseTecnicaAvancada

    dados = b3_service.buscar_dados_acao(ticker, periodo)
    if dados.empty:
        raise HTTPException(status_code=404, detail=f"Ação {ticker} não encontrada")

    fibonacci = AnaliseTecnicaAvancada.calcular_fibonacci(dados)
        
        return {
        "ticker": ticker,
        **fibonacci,
        "periodo": periodo,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/b3/screener")
def screener_acoes(
    pl_max: float = Query(default=None),
    rsi_max: float = Query(default=None),
    rsi_min: float = Query(default=None),
    score_min: float = Query(default=None),
    volume_min: float = Query(default=None)
):
    """
    Screener de ações com filtros personalizados (com cache de 5 minutos)
    """
    from ..services.b3_data_service import b3_service
    from ..services.analise_tecnica_avancada import AnaliseTecnicaAvancada
    from ..services.cache_service import cache_service
    
    # Criar chave única para este filtro
    cache_key = f"screener_{pl_max}_{rsi_max}_{rsi_min}_{score_min}_{volume_min}"
    
    # Verificar cache (5 minutos)
    cached = cache_service.get(cache_key)
    if cached is not None:
        logger.info(f"📦 Screener retornado do cache")
        return cached
    
    logger.info(f"🔍 Processando Screener (sem cache)...")
    resultados = []
    
    # Buscar apenas 15 ações para não demorar muito
    acoes_para_analisar = b3_service.PRINCIPAIS_ACOES[:15]
    
    for ticker_sa in acoes_para_analisar:
        try:
            ticker = ticker_sa.replace('.SA', '')
            dados = b3_service.buscar_dados_acao(ticker, '3mo')
            
            if dados.empty or len(dados) < 20:
                continue
            
            info = b3_service.buscar_info_acao(ticker)
            ultimo = dados.iloc[-1]
            
            # Extrair valores com proteção contra None/NaN
            pl_valor = float(info.get('p_l', 0)) if info.get('p_l') and pd.notna(info.get('p_l')) else 999999
            rsi_valor = float(ultimo.get('RSI', 50)) if pd.notna(ultimo.get('RSI')) else 50
            volume_valor = float(ultimo.get('Volume', 0)) if pd.notna(ultimo.get('Volume')) else 0
            
            # Aplicar filtros
            if pl_max and pl_valor > pl_max:
                continue
            if rsi_max and rsi_valor > rsi_max:
                continue
            if rsi_min and rsi_valor < rsi_min:
                continue
            if volume_min and volume_valor < volume_min:
                continue
            
            # Calcular score
            score_data = AnaliseTecnicaAvancada.calcular_score_tecnico(dados)
            
            if score_min and score_data['score'] < score_min:
                continue
            
            resultados.append({
                'ticker': str(ticker),
                'nome': str(info.get('nome', ticker)),
                'preco': float(info.get('preco_atual', 0)) if info.get('preco_atual') else 0.0,
                'pl': float(pl_valor) if pl_valor < 999999 else 0.0,
                'rsi': float(rsi_valor),
                'score': float(score_data['score']),
                'recomendacao': str(score_data['recomendacao']),
                'volume': float(volume_valor)
            })
            
        except Exception as e:
            logger.error(f"❌ Erro ao analisar {ticker_sa} no screener: {e}")
            continue
    
    # Ordenar por score
    resultados = sorted(resultados, key=lambda x: x['score'], reverse=True)
    
    response = {
        "resultados": resultados,
        "total": len(resultados),
        "filtros_aplicados": {
            "pl_max": pl_max,
            "rsi_max": rsi_max,
            "rsi_min": rsi_min,
            "score_min": score_min,
            "volume_min": volume_min
        }
    }
    
    # Cachear resultado por 5 minutos (300 segundos)
    cache_service.set(cache_key, response, ttl=300)
    logger.info(f"✅ Screener processado e cacheado: {len(resultados)} resultados")
    
    return response


@app.get("/api/b3/heatmap/market-cap")
def get_heatmap_market_cap():
    """Retorna dados para Treemap de Market Cap"""
    from ..services.b3_data_service import b3_service

    acoes = b3_service.obter_principais_acoes()

    # Agrupar por setor
    setores_data = {}
    for acao in acoes:
        setor = acao.get('setor', 'Outros')
        if setor not in setores_data:
            setores_data[setor] = []

        setores_data[setor].append({
            'ticker': acao['ticker'].replace('.SA', ''),
            'nome': acao['nome'],
            'market_cap': acao.get('market_cap', 0),
            'variacao': acao.get('variacao_dia', 0),
            'preco': acao.get('preco_atual', 0)
        })
        
        return {
        "setores": setores_data,
        "total_acoes": len(acoes)
    }


# ============= Paper Trading Endpoints =============

@app.get("/api/paper-trading/carteira/{usuario_id}")
def get_carteira_paper_trading(usuario_id: str):
    """Retorna carteira de paper trading do usuário"""
    from ..services.paper_trading_service import paper_trading_service
    
    carteira = paper_trading_service.obter_carteira(usuario_id)
    return carteira


@app.post("/api/paper-trading/comprar")
def comprar_acao_paper_trading(
    usuario_id: str = Query(...),
    ticker: str = Query(...),
    quantidade: int = Query(...),
    preco: float = Query(...)
):
    """Simula compra de ação"""
    from ..services.paper_trading_service import paper_trading_service
    
    resultado = paper_trading_service.comprar_acao(usuario_id, ticker, quantidade, preco)
    return resultado


@app.post("/api/paper-trading/vender")
def vender_acao_paper_trading(
    usuario_id: str = Query(...),
    ticker: str = Query(...),
    quantidade: int = Query(...),
    preco: float = Query(...)
):
    """Simula venda de ação"""
    from ..services.paper_trading_service import paper_trading_service
    
    resultado = paper_trading_service.vender_acao(usuario_id, ticker, quantidade, preco)
    return resultado


@app.get("/api/paper-trading/patrimonio/{usuario_id}")
def get_patrimonio_paper_trading(usuario_id: str, tickers: str = Query(default="")):
    """Calcula patrimônio total da carteira"""
    from ..services.paper_trading_service import paper_trading_service
    from ..services.b3_data_service import b3_service
    
    carteira = paper_trading_service.obter_carteira(usuario_id)
    
    # Buscar preços atuais
    precos_atuais = {}
    for ticker in carteira['posicoes'].keys():
        try:
            info = b3_service.buscar_info_acao(ticker)
            precos_atuais[ticker] = info.get('preco_atual', 0)
        except:
            precos_atuais[ticker] = carteira['posicoes'][ticker]['preco_medio']
    
    patrimonio = paper_trading_service.calcular_patrimonio(usuario_id, precos_atuais)
    return patrimonio


@app.post("/api/paper-trading/resetar/{usuario_id}")
def resetar_carteira_paper_trading(usuario_id: str):
    """Reseta a carteira para o estado inicial"""
    from ..services.paper_trading_service import paper_trading_service
    
    resultado = paper_trading_service.resetar_carteira(usuario_id)
    return resultado


# ============= WebSocket - Live Market Feed =============

@app.websocket("/ws/market-feed")
async def websocket_market_feed(websocket: WebSocket):
    """
    WebSocket para feed de mercado em tempo real
    Envia eventos de compra/venda/mudanças de preço continuamente
    """
    await websocket.accept()
    logger.info("🔌 Cliente conectado ao Market Feed")
    
    try:
        from ..services.market_feed_service import market_feed_service
        await market_feed_service.stream_eventos(websocket)
    
    except WebSocketDisconnect:
        logger.info("🔌 Cliente desconectado do Market Feed")
    except Exception as e:
        logger.error(f"❌ Erro no WebSocket: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
