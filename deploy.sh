#!/bin/bash
# =============================================================================
# deploy.sh — Liaison Backend
# Uso: cd ~/liaison && ./deploy.sh
# Executa todos os passos de deploy após um merge na branch develop.
# =============================================================================
set -e  # Interrompe o script imediatamente se qualquer comando falhar

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}==============================${NC}"
echo -e "${YELLOW}     Deploy Liaison Backend   ${NC}"
echo -e "${YELLOW}==============================${NC}"
echo ""

# 1. Atualizar código
echo -e "${YELLOW}[1/6] Atualizando código da branch develop...${NC}"
cd ~/liaison
git checkout develop
git pull origin develop

# 2. Ativar ambiente virtual
echo -e "${YELLOW}[2/6] Ativando ambiente virtual...${NC}"
cd ~/liaison/backend
source venv/bin/activate

# 3. Instalar dependências
echo -e "${YELLOW}[3/6] Instalando dependências...${NC}"
pip install -r requirements.txt --quiet

# 4. Aplicar migrations
echo -e "${YELLOW}[4/6] Aplicando migrations...${NC}"
python manage.py migrate

# 5. Coletar arquivos estáticos
echo -e "${YELLOW}[5/6] Coletando arquivos estáticos...${NC}"
python manage.py collectstatic --no-input

# 6. Reiniciar serviço
echo -e "${YELLOW}[6/6] Reiniciando serviço Gunicorn...${NC}"
sudo systemctl restart liaison

# Resultado
echo ""
echo -e "${GREEN}✓ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}  Commit em produção: $(git log -1 --oneline)${NC}"
echo ""
sudo systemctl status liaison --no-pager
