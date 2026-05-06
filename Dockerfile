# Stage 1: Dependencies
FROM python:3.12-slim AS backend-deps

WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Backend
FROM python:3.12-slim AS backend-runner

WORKDIR /app/backend

RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=backend-deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend-deps /usr/local/bin /usr/local/bin

COPY backend/ ./backend/
EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=config.settings
ENV SECRET_KEY=django-insecure-hirefy-docker-key
ENV DEBUG=True
ENV ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]