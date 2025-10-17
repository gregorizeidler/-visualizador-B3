#!/bin/bash

# Script de inicialização do Visualizador B3
# Plataforma Avançada de Análise de Ações Brasileiras

echo "🚀 Iniciando Visualizador B3..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 não encontrado. Por favor, instale Python 3.11+${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Python encontrado: $(python3 --version)"

# Verificar Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Por favor, instale Node.js 18+${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js encontrado: $(node --version)"
echo ""

# Verificar/criar ambiente virtual
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Criando ambiente virtual...${NC}"
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo -e "${BLUE}🔧 Ativando ambiente virtual...${NC}"
source venv/bin/activate

# Instalar dependências Python
echo -e "${BLUE}📦 Verificando dependências Python...${NC}"
pip install -q -r requirements.txt

# Verificar dependências Node
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do frontend (isso pode demorar)...${NC}"
    cd frontend
    npm install
    cd ..
fi

echo ""
echo -e "${GREEN}✅ Ambiente configurado!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 Visualizador B3 - Análise de Ações Brasileiras${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Iniciando servidores...${NC}"
echo ""

# Função para matar processos ao sair
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Encerrando servidores...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar backend em background
echo -e "${BLUE}🔧 Iniciando API Backend (porta 8000)...${NC}"
python -m uvicorn app.api.main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!

# Aguardar backend iniciar
sleep 3

# Verificar se backend iniciou
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Erro ao iniciar backend. Verifique backend.log${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Backend iniciado (PID: $BACKEND_PID)"

# Iniciar frontend em background
echo -e "${BLUE}🎨 Iniciando Frontend (porta 3000)...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Aguardar frontend iniciar
sleep 5

# Verificar se frontend iniciou
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Erro ao iniciar frontend. Verifique frontend.log${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✓${NC} Frontend iniciado (PID: $FRONTEND_PID)"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Visualizador B3 está rodando!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📊 ${GREEN}Dashboard:${NC}    http://localhost:3000"
echo -e "🔧 ${GREEN}API Backend:${NC}  http://localhost:8000"
echo -e "📚 ${GREEN}API Docs:${NC}     http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}💡 Dicas:${NC}"
echo -e "   • Use Ctrl+C para parar os servidores"
echo -e "   • Logs: backend.log e frontend.log"
echo -e "   • Consulte README.md para mais informações"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Aguardar ambos os processos
wait $BACKEND_PID $FRONTEND_PID
