# 1. Usa uma imagem que já tem Python e dependências de sistema para navegadores
FROM mcr.microsoft.com/playwright/python:v1.43.0-jammy

WORKDIR /app

# 2. Copia a lista de bibliotecas e instala automaticamente
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. COMANDO CHAVE: Baixa o Chromium automaticamente durante o build
RUN playwright install chromium
RUN playwright install-deps chromium

# 4. Copia o seu código para dentro do container
COPY . .

EXPOSE 5000

CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]