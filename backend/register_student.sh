#!/bin/bash

# Configurações
BASE_URL="http://127.0.0.1:8000/api"

echo "🚀 Iniciando cadastro de novo aluno..."

# Dados do JSON de cadastro
JSON_DATA='{
    "nome": "João Silva",
    "email": "joao.silva@aluno.ifce.edu.br",
    "password": "Password123",
    "full_name": "João da Silva Sauro",
    "enrollment": "IFCE2024001",
    "city": "Cedro",
    "semester": 5,
    "github_url": "https://github.com/joaosilva",
    "linkedin_url": "https://linkedin.com/in/joaosilva",
    "experiences": [
        {
            "title": "Estagiário de TI",
            "institution": "Prefeitura de Cedro",
            "description": "Suporte técnico e manutenção de redes.",
            "start_date": "2023-01-10",
            "is_current": true
        }
    ],
    "courses": [
        {
            "name": "Desenvolvimento Web com Django",
            "issuer": "Udemy",
            "workload": 40,
            "completion_date": "2023-12-20",
            "certificate_url": "https://udemy.com/cert/123"
        }
    ]
}'

# Executa o POST para criar o usuário
RESPONSE=$(curl -s -X POST "$BASE_URL/users/" \
     -H "Content-Type: application/json" \
     -d "$JSON_DATA")

# Verifica se o cadastro foi bem sucedido
if echo "$RESPONSE" | grep -q "id"; then
    echo "✅ Cadastro realizado com sucesso!"
    echo "--- Resposta do Servidor ---"
    echo "$RESPONSE" | python3 -m json.tool
else
    echo "❌ Erro no cadastro:"
    echo "$RESPONSE" | python3 -m json.tool
fi
