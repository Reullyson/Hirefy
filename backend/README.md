# HireFly Backend

Boilerplate inicial do backend para o sistema HireFly.

## 🚀 Como rodar

1. **Crie um ambiente virtual:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # ou
   venv\Scripts\activate     # Windows
   ```

2. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Execute as migrações:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Inicie o servidor:**
   ```bash
   python manage.py runserver
   ```

## 🔌 Endpoints Principais

- `POST /api/users/` - Cadastro de usuário (estudante)
- `POST /api/auth/login/` - Login (retorna JWT)
- `GET /api/users/me/` - Dados do usuário logado
- `PUT /api/users/me/` - Atualizar perfil
- `DELETE /api/users/me/` - Deletar conta

## 🛠️ Tecnologias
- Django 
- Django REST Framework
- JWT (SimpleJWT)
- SQLite (Desenvolvimento)
