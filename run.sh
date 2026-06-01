#!/bin/bash

# Cores para o output
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Iniciando Hirefy via Docker...${NC}"

# Verifica se o arquivo .env existe
if [ ! -f .env ]; then
    echo "Aviso: Arquivo .env não encontrado. Criando a partir de .env.example..."
    cp .env.example .env
fi

# Sobe os containers
docker compose up --build -d

echo -e "${GREEN}Hirefy está rodando!${NC}"
echo -e "Backend: http://localhost:8000"
echo -e "Frontend: http://localhost:5173"
echo -e "Logs: docker compose logs -f"
