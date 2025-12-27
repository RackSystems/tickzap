#!/bin/bash

API_REPO="https://github.com/seu-usuario/tickzap-api.git"
FRONTEND_REPO="https://github.com/seu-usuario/tickzap-frontend.git"
# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem cor

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}    Configuração do TickZap      ${NC}"
echo -e "${BLUE}==================================${NC}"

# Detectar diretório pai
PARENT_DIR="$(dirname "$(pwd)")"
echo -e "${YELLOW}Diretório pai detectado: ${PARENT_DIR}${NC}"

# Verificar e clonar o repositório
if [ -d "${PARENT_DIR}/tickzap-api" ]; then
  echo -e "${GREEN}Repositório tickzap-api já existe.${NC}"
else
  echo -e "${YELLOW}Clonando repositório tickzap-api...${NC}"
  cd "${PARENT_DIR}"
  git clone ${API_REPO}
  if [ $? -ne 0 ]; then
    echo -e "\033[0;31mErro ao clonar tickzap-api. Verifique a URL do repositório.${NC}"
    exit 1
  fi
fi

# Verificar e clonar o repositório do Frontend
if [ -d "${PARENT_DIR}/tickzap-frontend" ]; then
  echo -e "${GREEN}Repositório tickzap-frontend já existe. Atualizando...${NC}"
  cd "${PARENT_DIR}/tickzap-frontend"
  git pull
else
  echo -e "${YELLOW}Clonando repositório tickzap-frontend...${NC}"
  cd "${PARENT_DIR}"
  git clone ${FRONTEND_REPO}
  if [ $? -ne 0 ]; then
    echo -e "\033[0;31mErro ao clonar tickzap-frontend. Verifique a URL do repositório.${NC}"
    exit 1
  fi
fi

# Voltar para o diretório do projeto orquestrador
cd "$(dirname "$0")"

# Configurar arquivo .env se necessário
if [ -f .env.example ] && [ ! -f .env ]; then
  echo -e "${YELLOW}Criando arquivo .env a partir do exemplo...${NC}"
  cp .env.example .env
fi

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}  Configuração concluída com sucesso!  ${NC}"
echo -e "${GREEN}==================================${NC}"
echo -e "Estrutura de diretórios:"
echo -e "${BLUE}${PARENT_DIR}/tickzap${NC} (este repositório)"
echo -e "${BLUE}${PARENT_DIR}/tickzap-api${NC}"
echo -e "${BLUE}${PARENT_DIR}/tickzap-frontend${NC}"
echo
echo -e "Para iniciar os serviços, execute:"
echo -e "${YELLOW}docker-compose up -d${NC}"
echo
echo -e "${BLUE}==================================${NC}"