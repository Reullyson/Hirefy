# Hirefy - Plataforma de Conexão de Talentos (IFCE Cedro)

> **Status do Projeto:** 🛠️ Em Desenvolvimento

O **Hirefy** é um ecossistema digital desenvolvido especificamente para o campus do IFCE Cedro, com o objetivo de centralizar oportunidades de carreira e otimizar o processo de candidatura para os alunos de Sistemas de Informação e áreas correlatas.

---

## 🛠️ Tech Stack

### Frontend
- **React** (TypeScript), **TailwindCSS**, **Vite**, **Shadcn/UI**.

### Backend
- **Django**, **Django REST Framework**, **SQLite**, **JWT Auth**.

---

## 🚀 Como Executar com Docker (Recomendado)

A forma mais rápida de testar o projeto é utilizando o **Docker Compose**.

### Pré-requisitos
- Docker instalado.
- Docker Compose instalado.

### Passo a Passo

1. **Subir os containers:**
   No diretório raiz do projeto, execute:
   ```bash
   docker-compose up --build
   ```

2. **Acessar as aplicações:**
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend (API):** [http://localhost:8000/api/](http://localhost:8000/api/)
   - **Django Admin:** [http://localhost:8000/admin/](http://localhost:8000/admin/)

3. **Credenciais de Administrador (Seed):**
   O sistema já vem com administradores pré-configurados para teste:
   - **Email:** `admin1@hirefy.com`
   - **Senha:** `AdminPassword123!`

---

## 🛠️ Desenvolvimento Local (Sem Docker)

### 1. Backend (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_admins  # Para criar os admins iniciais
python manage.py runserver
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Estrutura do Projeto
- `/backend`: API RESTful em Django.
- `/frontend`: Interface SPA em React.

---

## 👥 Equipe
- **Ian Kilwiny**, **Marcus Vinícius**, **Reullyson**, **Ivo**, **Bruno**.
