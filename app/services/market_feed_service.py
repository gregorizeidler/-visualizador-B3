"""
Serviço de Feed de Mercado em Tempo Real
Simula eventos de mercado e envia via WebSocket
"""

import random
import asyncio
from datetime import datetime
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class MarketFeedService:
    """Gera eventos de mercado em tempo real"""
    
    # Ações principais para gerar eventos
    TICKERS = [
        'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'BBAS3', 
        'ABEV3', 'WEGE3', 'RENT3', 'MGLU3', 'B3SA3',
        'SUZB3', 'RADL3', 'VIVT3', 'ELET3', 'JBSS3'
    ]
    
    TIPOS_EVENTO = [
        'buy_order',      # Nova ordem de compra
        'sell_order',     # Nova ordem de venda
        'execution',      # Execução de ordem
        'market_depth',   # Atualização de profundidade
        'price_change',   # Mudança de preço
        'volume_spike',   # Pico de volume
    ]
    
    @staticmethod
    def gerar_evento() -> Dict[str, Any]:
        """Gera um evento aleatório de mercado"""
        ticker = random.choice(MarketFeedService.TICKERS)
        tipo = random.choice(MarketFeedService.TIPOS_EVENTO)
        timestamp = datetime.now().strftime("%I:%M:%S %p")
        
        # Variação de preço (-5% a +5%)
        variacao = round(random.uniform(-5, 5), 2)
        positivo = variacao >= 0
        
        # Preço base (entre R$10 e R$100)
        preco = round(random.uniform(10, 100), 2)
        
        # Volume (entre 10 e 1000 ações)
        quantidade = random.randint(10, 1000)
        volume_k = random.randint(100, 999)
        
        evento = {
            'id': f"{ticker}_{int(datetime.now().timestamp() * 1000)}",
            'ticker': ticker,
            'tipo': tipo,
            'timestamp': timestamp,
            'variacao': variacao,
            'positivo': positivo,
        }
        
        # Definir mensagem e dados específicos por tipo
        if tipo == 'buy_order':
            evento['mensagem'] = f"Nova ordem de COMPRA"
            evento['detalhes'] = f"{quantidade} ações a R$ {preco:.2f}"
            
        elif tipo == 'sell_order':
            evento['mensagem'] = f"Nova ordem de VENDA"
            evento['detalhes'] = f"{quantidade} ações a R$ {preco:.2f}"
            
        elif tipo == 'execution':
            evento['mensagem'] = f"Executado {quantidade} ações"
            evento['detalhes'] = f"Preço médio: R$ {preco:.2f}"
            
        elif tipo == 'market_depth':
            evento['mensagem'] = f"Profundidade de mercado"
            evento['detalhes'] = f"Volume: {volume_k}k ações"
            
        elif tipo == 'price_change':
            evento['mensagem'] = f"Mudança de preço"
            evento['detalhes'] = f"Novo preço: R$ {preco:.2f}"
            
        elif tipo == 'volume_spike':
            evento['mensagem'] = f"Pico de volume detectado"
            evento['detalhes'] = f"Volume: {volume_k * 2}k ações (+{random.randint(50, 200)}%)"
        
        return evento
    
    @staticmethod
    async def stream_eventos(websocket, intervalo: float = 2.0):
        """
        Envia eventos continuamente via WebSocket
        
        Args:
            websocket: Conexão WebSocket
            intervalo: Segundos entre eventos (padrão: 2s)
        """
        try:
            while True:
                evento = MarketFeedService.gerar_evento()
                await websocket.send_json(evento)
                logger.info(f"📡 Evento enviado: {evento['ticker']} - {evento['tipo']}")
                
                # Intervalo aleatório entre eventos (1-4 segundos)
                await asyncio.sleep(random.uniform(1.0, 4.0))
                
        except Exception as e:
            logger.error(f"Erro no stream de eventos: {e}")


market_feed_service = MarketFeedService()

