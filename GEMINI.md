# 🧠 Contexto Técnico e Diretrizes de IA - Hirefy

Este documento serve como a memória de longo prazo para assistentes de IA (como Gemini, ChatGPT, Claude) interagirem com o código-fonte do Hirefy. Ele define a arquitetura, padrões e convenções que devem ser seguidos rigorosamente.

---

## 🏗️ Arquitetura do Sistema

O Hirefy utiliza uma arquitetura de **Desacoplamento Total** entre Frontend e Backend:

- **Backend (API RESTful):** Construído com Django e Django REST Framework. Segue o padrão de roteamento `DefaultRouter` e utiliza `ViewSets` para operações CRUD.
- **Frontend (SPA):** Desenvolvido com React, TypeScript e Vite. Utiliza `wouter` para roteamento leve e `Tanstack Query` para gerenciamento de estado assíncrono e cache de API.
- **Autenticação:** Stateless via **JWT (SimpleJWT)**. O token deve ser enviado no header `Authorization: Bearer <token>`.

---

## 📂 Estrutura de Pastas Estratégicas

### Backend (`/backend`)
- `apps/users/`: Centraliza toda a lógica de autenticação e perfis (Aluno, Recrutador, Admin).
- `config/`: Configurações globais do Django (settings, urls, asgi/wsgi).
- `db.sqlite3`: Banco de dados de desenvolvimento (será migrado para MySQL/PostgreSQL em produção).

### Frontend (`/frontend`)
- `src/components/ui/`: Componentes atômicos baseados em Shadcn/UI (Radix + Tailwind). **Não modifique estes arquivos diretamente** a menos que seja para customização de tema global.
- `src/pages/`: Componentes de página que representam as rotas principais.
- `src/pages/admin/AdminPanel.tsx`: Painel centralizado de moderação e homologação.
- `src/hooks/`: Hooks customizados para lógica reutilizável.
- `src/lib/utils.ts`: Utilitários para manipulação de classes CSS (tailwind-merge + clsx).

---

## 🛠️ Convenções de Código

### Backend (Python/Django)
- **Serializers:** Sempre utilize `ModelSerializer` para mapear modelos para JSON.
- **Views:** Prefira `ViewSets` em vez de `APIView` para manter a consistência do roteamento.
- **Nomenclatura:** Snake_case para campos de modelo e funções.

### Frontend (TypeScript/React)
- **Componentes:** Use componentes funcionais e Arrow Functions.
- **Estilização:** Utilize exclusivamente **Tailwind CSS**. Evite CSS inline ou Styled Components.
- **Tipagem:** Strict mode ativo. Evite o uso de `any`. Defina interfaces para todas as respostas da API.
- **Data Fetching:** Utilize o hook `useQuery` ou `useMutation` do `@tanstack/react-query`.

---

## 🗺️ Roadmap de Desenvolvimento

1. **Fase 1 (Atual):** Estabilização do módulo de Usuários e Autenticação.
2. **Fase 2:** Implementação do CRUD de Vagas no Backend e integração com o Frontend (atualmente com mock data).
3. **Fase 3:** Desenvolvimento do motor de Scraping dedicado à importação de especificações de vagas via links da Gupy.
4. **Fase 4:** Implementação de PWA e Notificações Push.

## 📈 Histórico de Evolução (Git Context)

- **Abril 2026:**
  - `bdac3b7`: Commit inicial.
  - `944ea8e`: Rebranding do projeto de "Plataforma Inteligente" para **Hirefy**.
  - `2fbdc6b`: Estruturação da documentação inicial e definição de papéis.
- **Maio 2026:**
  - `f180532`: Implementação do **Backend Core** (CRUD de Usuários e Autenticação JWT).
  - `f7e096d`: Início da estrutura do **Frontend** (React + Vite).
  - `a9edb6c`: Integrações e ajustes finos na estrutura de pastas.

---

## 🤖 Contexto de Prompting para IA

Ao gerar código para este projeto, siga estas regras:

1. **Design UI:** Siga o padrão visual do Shadcn UI. Se precisar de um novo componente, verifique se ele já existe em `src/components/ui`.
2. **Backend:** Ao criar novos endpoints, certifique-se de adicionar as devidas permissões (`IsAuthenticated`, `IsAdminUser`, etc.).
3. **Frontend:** Sempre separe a lógica de busca de dados (Query) da lógica de apresentação.
4. **Segurança:** Nunca exponha senhas ou segredos. Utilize variáveis de ambiente (`.env`).
5. **Simplicidade:** O Hirefy preza pela performance. Evite bibliotecas pesadas se uma solução nativa ou leve (como `wouter`) for suficiente.

---

*Última atualização: Maio de 2026*
