#!/bin/bash

# Script para testar a API do HireFly

BASE_URL="http://127.0.0.1:8000/api"

echo "1. Tentando cadastrar usuário..."
curl -X POST "$BASE_URL/users/" \
     -H "Content-Type: application/json" \
     -d '{"nome": "Fulano de Tal", "email": "fulano@aluno.ifce.edu.br", "password": "Password123"}'

echo -e "\n\n2. Tentando fazer login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login/" \
     -H "Content-Type: application/json" \
     -d '{"email": "fulano@aluno.ifce.edu.br", "password": "Password123"}')

echo $LOGIN_RESPONSE

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -oP '(?<="access":")[^"]*')

if [ -z "$ACCESS_TOKEN" ]; then
    echo "Erro ao obter token de acesso."
    exit 1
fi

echo -e "\n\n3. Acessando /me com o token..."
curl -X GET "$BASE_URL/users/me/" \
     -H "Authorization: Bearer $ACCESS_TOKEN"

echo -e "\n"
