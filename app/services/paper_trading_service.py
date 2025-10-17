"""
Serviço de Paper Trading (Simulação de Carteira)
Permite comprar/vender ações sem dinheiro real
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Any
from pathlib import Path

# Arquivo para persistir carteiras
CARTEIRAS_FILE = Path("paper_trading_carteiras.json")

class PaperTradingService:
    """Gerencia carteiras de paper trading"""
    
    def __init__(self):
        self.carteiras = self._carregar_carteiras()
    
    def _carregar_carteiras(self) -> Dict:
        """Carrega carteiras do arquivo"""
        if CARTEIRAS_FILE.exists():
            with open(CARTEIRAS_FILE, 'r') as f:
                return json.load(f)
        return {}
    
    def _salvar_carteiras(self):
        """Salva carteiras no arquivo"""
        with open(CARTEIRAS_FILE, 'w') as f:
            json.dump(self.carteiras, f, indent=2)
    
    def criar_carteira(self, usuario_id: str, capital_inicial: float = 10000.0) -> Dict:
        """Cria uma nova carteira"""
        if usuario_id in self.carteiras:
            return {"erro": "Carteira já existe"}
        
        self.carteiras[usuario_id] = {
            'capital_inicial': capital_inicial,
            'saldo_disponivel': capital_inicial,
            'posicoes': {},
            'historico': [],
            'criado_em': datetime.now().isoformat()
        }
        self._salvar_carteiras()
        
        return self.carteiras[usuario_id]
    
    def obter_carteira(self, usuario_id: str) -> Dict:
        """Retorna carteira do usuário"""
        if usuario_id not in self.carteiras:
            # Criar carteira automaticamente
            return self.criar_carteira(usuario_id)
        return self.carteiras[usuario_id]
    
    def comprar_acao(self, usuario_id: str, ticker: str, quantidade: int, preco: float) -> Dict:
        """Simula compra de ação"""
        carteira = self.obter_carteira(usuario_id)
        
        custo_total = quantidade * preco
        
        if custo_total > carteira['saldo_disponivel']:
            return {"erro": "Saldo insuficiente"}
        
        # Atualizar saldo
        carteira['saldo_disponivel'] -= custo_total
        
        # Atualizar posição
        if ticker in carteira['posicoes']:
            pos = carteira['posicoes'][ticker]
            # Média ponderada
            total_acoes = pos['quantidade'] + quantidade
            preco_medio = ((pos['preco_medio'] * pos['quantidade']) + (preco * quantidade)) / total_acoes
            pos['quantidade'] = total_acoes
            pos['preco_medio'] = preco_medio
        else:
            carteira['posicoes'][ticker] = {
                'quantidade': quantidade,
                'preco_medio': preco,
                'comprado_em': datetime.now().isoformat()
            }
        
        # Registrar no histórico
        carteira['historico'].append({
            'tipo': 'COMPRA',
            'ticker': ticker,
            'quantidade': quantidade,
            'preco': preco,
            'total': custo_total,
            'data': datetime.now().isoformat()
        })
        
        self._salvar_carteiras()
        
        return {
            "sucesso": True,
            "mensagem": f"Compra de {quantidade}x {ticker} a R$ {preco:.2f}",
            "carteira": carteira
        }
    
    def vender_acao(self, usuario_id: str, ticker: str, quantidade: int, preco: float) -> Dict:
        """Simula venda de ação"""
        carteira = self.obter_carteira(usuario_id)
        
        if ticker not in carteira['posicoes']:
            return {"erro": "Você não possui essa ação"}
        
        pos = carteira['posicoes'][ticker]
        
        if quantidade > pos['quantidade']:
            return {"erro": f"Você possui apenas {pos['quantidade']} ações"}
        
        valor_venda = quantidade * preco
        lucro = (preco - pos['preco_medio']) * quantidade
        
        # Atualizar saldo
        carteira['saldo_disponivel'] += valor_venda
        
        # Atualizar posição
        pos['quantidade'] -= quantidade
        if pos['quantidade'] == 0:
            del carteira['posicoes'][ticker]
        
        # Registrar no histórico
        carteira['historico'].append({
            'tipo': 'VENDA',
            'ticker': ticker,
            'quantidade': quantidade,
            'preco': preco,
            'total': valor_venda,
            'lucro': lucro,
            'data': datetime.now().isoformat()
        })
        
        self._salvar_carteiras()
        
        return {
            "sucesso": True,
            "mensagem": f"Venda de {quantidade}x {ticker} a R$ {preco:.2f}",
            "lucro": lucro,
            "carteira": carteira
        }
    
    def calcular_patrimonio(self, usuario_id: str, precos_atuais: Dict[str, float]) -> Dict:
        """Calcula patrimônio total da carteira"""
        carteira = self.obter_carteira(usuario_id)
        
        valor_posicoes = 0
        detalhes_posicoes = []
        
        for ticker, pos in carteira['posicoes'].items():
            preco_atual = precos_atuais.get(ticker, pos['preco_medio'])
            valor_total = pos['quantidade'] * preco_atual
            lucro = (preco_atual - pos['preco_medio']) * pos['quantidade']
            lucro_pct = ((preco_atual / pos['preco_medio']) - 1) * 100
            
            valor_posicoes += valor_total
            
            detalhes_posicoes.append({
                'ticker': ticker,
                'quantidade': pos['quantidade'],
                'preco_medio': pos['preco_medio'],
                'preco_atual': preco_atual,
                'valor_total': valor_total,
                'lucro': lucro,
                'lucro_pct': lucro_pct
            })
        
        patrimonio_total = carteira['saldo_disponivel'] + valor_posicoes
        rentabilidade = ((patrimonio_total / carteira['capital_inicial']) - 1) * 100
        
        return {
            'patrimonio_total': patrimonio_total,
            'saldo_disponivel': carteira['saldo_disponivel'],
            'valor_posicoes': valor_posicoes,
            'capital_inicial': carteira['capital_inicial'],
            'rentabilidade': rentabilidade,
            'posicoes': detalhes_posicoes
        }
    
    def resetar_carteira(self, usuario_id: str) -> Dict:
        """Reseta a carteira para o estado inicial"""
        if usuario_id in self.carteiras:
            capital = self.carteiras[usuario_id]['capital_inicial']
            del self.carteiras[usuario_id]
            self._salvar_carteiras()
            return self.criar_carteira(usuario_id, capital)
        return {"erro": "Carteira não encontrada"}


# Instância global
paper_trading_service = PaperTradingService()

