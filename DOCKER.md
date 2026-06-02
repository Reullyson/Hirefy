# HireFy Docker Setup

## Quick Start

```bash
# Build and run all services
docker-compose up --build

# Stop services
docker-compose down
```

## Services

| Service | Port | URL |
|---------|------|-----|
| Backend (Django) | 8000 | http://localhost:8000 |
| Frontend (Vite) | 5173 | http://localhost:5173 |

## Environment Variables

Create a `.env` file in the project root:

```env
# Backend
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Frontend
VITE_API_URL=http://localhost:8000/api/
```

## Commands

```bash
# Development
docker-compose up --build

# Production
docker-compose -f docker-compose.prod.yml up --build

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build frontend
```