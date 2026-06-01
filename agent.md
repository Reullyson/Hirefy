# 🤖 Memória de Desenvolvimento do Agente - Hirefy

Este arquivo serve como o repositório de conhecimento sobre as decisões técnicas, progresso de implementação e padrões estabelecidos durante as sessões de desenvolvimento com agentes de IA.

---

## 🚀 Progresso da Implementação (Maio de 2026)

### ✅ Ciclo de Vida da Candidatura (Finalizado)
- **Modelo de Dados:** Implementado `Application` com estados `PENDENTE`, `EM_ANALISE`, `APROVADO` e `REPROVADO`.
- **Backend API:**
    - `ApplicationViewSet` com suporte a filtros por `job_id`.
    - Lógica de permissões: Alunos veem suas candidaturas; Recrutadores veem candidatos das suas empresas.
    - `JobSerializer` atualizado para retornar status de candidatura do usuário logado (`user_has_applied`, `user_application_status`).
- **Frontend SPA:**
    - Botão "Candidatar-se" funcional na tela de listagem de vagas.
    - Tela "Minhas Candidaturas" consumindo dados reais.
    - Dashboard do Recrutador mostrando métricas reais de inscritos.

### 📧 Sistema de E-mails Transacionais (Ativo na branch `email-vaga-aluno`)
- **Motor Central:** `backend/apps/jobs/emails.py` utilizando `EmailMultiAlternatives`.
- **Gatilhos Automáticos (Signals):**
    1.  **Confirmação de Inscrição:** Ao criar um `Application`.
    2.  **Atualização de Status:** Ao mudar o campo `status` da candidatura.
    3.  **Encerramento de Vaga:** Notifica todos os candidatos quando uma vaga é fechada.
    4.  **Atualização de Vaga:** Notifica sobre mudanças críticas na descrição.
- **Templates:** HTML estilizado com branding Hirefy em `backend/apps/jobs/templates/emails/`.

### 👤 Perfil do Aluno
- **Cursos e Certificações:** Implementado suporte para múltiplos cursos com carga horária e link de certificado.
- **Experiências:** Refatorado para salvar dinamicamente via `UserSerializer`.

### 🧪 Qualidade e Testes
- **Backend:** 25 testes cobrindo CRUD, validações de e-mail institucional e fluxo E2E de candidaturas.
- **Scraping:** 7 testes validando extração de dados e mocks de integração com Gupy e RemoteOK.

---

## 🛠️ Convenções e Decisões Técnicas

1.  **Nomenclatura:**
    - Backend: `snake_case` (Django/Python).
    - Frontend: `PascalCase` para componentes, `camelCase` para funções/variáveis (React/TS).
2.  **Autenticação:** JWT (SimpleJWT). O token deve ser persistido em `localStorage` como `hirefy_access_token`.
3.  **E-mails:** Usar `django.core.mail.backends.console.EmailBackend` em desenvolvimento para inspeção rápida.
4.  **Permissões:** Sempre verificar o `user_type` (ALUNO, RECRUTADOR, ADMIN) antes de permitir operações sensíveis.

---

## 📋 Backlog Prioritário

1.  **Scraping em Background:** Migrar execução do scraping para tarefas assíncronas (Celery) para não travar a API.
2.  **Notificações Push:** Implementar PWA para alertas de status de candidatura no mobile.
3.  **Chat Direto:** Sistema de mensagens entre Recrutador e Aluno após a aprovação inicial.
