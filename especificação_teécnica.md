# Especificação Técnica de Requisitos e Casos de Uso - Hirefy

Este documento apresenta a especificação formal dos requisitos funcionais, não funcionais e os casos de uso do sistema Hirefy, otimizado para o gerenciamento de vagas e candidatos do IFCE Cedro.

---

## 1. Requisitos Funcionais (RF)

### 1.1 Módulo: Usuários e Administradores

| Identificador | Usuário | Nome do Requisito | Descrição |
| --- | --- | --- | --- |
| **RF001** | Estudante | Cadastrar Aluno | Permitir que o aluno realize o autocadastro no sistema informando e-mail institucional e senha. |

Prioridade

---

Essencial: Sim | Importante: Não | Desejável: Não

---

---

| Identificador | Usuário | Nome do Requisito | Descrição |
| --- | --- | --- | --- |
| **RF002** | Usuário | Autenticar Usuário | Permitir o acesso ao sistema mediante validação de e-mail e senha cadastrados. |

Prioridade

---

Essencial: Sim | Importante: Não | Desejável: Não

---

---

| Identificador | Usuário | Nome do Requisito | Descrição |
| --- | --- | --- | --- |
| **RF003** | Usuário | Atualizar Dados | Permitir a alteração de dados cadastrais, incluindo perfil acadêmico, experiências e cursos. |

Prioridade

---

Essencial: Sim | Importante: Não | Desejável: Não

---

---

| Identificador | Usuário | Nome do Requisito | Descrição |
| --- | --- | --- | --- |
| **RF004** | Usuário | Excluir Conta | Permitir a exclusão definitiva da conta e dos dados pessoais do usuário. |

Prioridade

---

Essencial: Não | Importante: Sim | Desejável: Não

---

---

| Identificador | Usuário | Nome do Requisito | Descrição |
| --- | --- | --- | --- |
| **RF005** | Administrador | Cadastrar Administrador | Permitir que um administrador convide outro via e-mail, exigindo validação por código enviado. |

Prioridade

---

Essencial: Sim | Importante: Não | Desejável: Não

---

---

| Identificador | Usuário | Nome do Requisito | Descrição |
| --- | --- | --- | --- |
| **RF006** | Administrador | Gerenciar Usuários | Permitir a ativação, desativação ou exclusão de contas de alunos e recrutadores. |

Prioridade

---

Essencial: Sim | Importante: Não | Desejável: Não

---

---

### 1.2 Módulo: Vagas

| Identificador | Usuário | Nome do Requisito | Descrição |
| --- | --- | --- | --- |
| **RF007** | Recrutador | Cadastrar Vaga | Permitir a inclusão de novas oportunidades seguindo a estrutura de dados definida. |

Prioridade

---

Essencial: Sim | Importante: Não | Desejável: Não

---

---

| Identificador | Usuário | Nome do Requisito | Descrição |
| --- | --- | --- | --- |
| **RF008** | Usuário | Visualizar Vagas | Permitir a consulta e visualização detalhada das vagas disponíveis no sistema. |

Prioridade

---

Essencial: Sim | Importante: Não | Desejável: Não

---

---

| Identificador | Usuário | Nome do Requisito | Descrição |
| --- | --- | --- | --- |
| **RF009** | Recrutador | Atualizar Vaga | Permitir a edição de dados de vagas publicadas pelo próprio recrutador. |

Prioridade

---

Essencial: Sim | Importante: Não | Desejável: Não

---

---

| Identificador | Usuário | Nome do Requisito | Descrição |
| --- | --- | --- | --- |
| **RF010** | Recrutador | Excluir Vaga | Permitir a remoção de vagas do sistema (exclusão lógica ou física). |

Prioridade

---

Essencial: Sim | Importante: Não | Desejável: Não

---

---

| Identificador | Usuário | Nome do Requisito | Descrição |
| --- | --- | --- | --- |
| **RF011** | Sistema | Estrutura de Dados da Vaga | O sistema DEVE considerar que uma vaga possui: Título, Código/ID, Empresa (Nome, CNPJ, Logo, Site), Descrição (Atividades), Requisitos (Obrigatórios, Desejáveis, Nível, Formação), Localização (Tipo, Cidade, Estado, País), Condições (Contrato, Carga Horária, Salário, Benefícios), Processo (Datas, Etapas, Link Gupy) e Controle (Status, Datas Criação/Update). |

Prioridade

---

Essencial: Sim | Importante: Não | Desejável: Não

---

---

## 4. Requisitos Não Funcionais (RNF)

### 4.1. Requisitos de Desempenho

| Identificador | Nome do Requisito | Descrição |
| --- | --- | --- |
| **RNF01** | Tempo de Resposta | O sistema deve processar requisições de consulta de vagas e perfis em um tempo máximo de 2 segundos para 95% das solicitações em condições normais de tráfego. |

| Prioridade | Essencial | Importante | Desejável |
| --- | --- | --- | --- |
|  | Não | Sim | Não |

---

### 4.2. Requisitos de Segurança

| Identificador | Nome do Requisito | Descrição |
| --- | --- | --- |
| **RNF02** | Proteção de Credenciais | Todas as senhas de usuários devem ser criptografadas no banco de dados utilizando o algoritmo de hashing Bcrypt ou Argon2 com fator de custo adequado. |

| Prioridade | Essencial | Importante | Desejável |
| --- | --- | --- | --- |
|  | Sim | Não | Não |

---

| Identificador | Nome do Requisito | Descrição |
| --- | --- | --- |
| **RNF03** | Controle de Acesso | Operações de criação, edição e exclusão de vagas e usuários devem exigir autenticação via token JWT (JSON Web Token) válido e com escopo de permissão adequado. |

| Prioridade | Essencial | Importante | Desejável |
| --- | --- | --- | --- |
|  | Sim | Não | Não |

---

### 4.3. Requisitos de Usabilidade

| Identificador | Nome do Requisito | Descrição |
| --- | --- | --- |
| **RNF04** | Responsividade | A interface do usuário deve ser adaptável (layout responsivo), garantindo funcionalidade completa em resoluções de desktop (1920x1080) e dispositivos móveis (mínimo 360px de largura). |

| Prioridade | Essencial | Importante | Desejável |
| --- | --- | --- | --- |
|  | Sim | Não | Não |

---

### 4.4. Requisitos de Confiabilidade

| Identificador | Nome do Requisito | Descrição |
| --- | --- | --- |
| **RNF05** | Disponibilidade (SLA) | O sistema deve manter uma taxa de disponibilidade (uptime) mínima de 99,5% calculada mensalmente, excluindo janelas de manutenção programada. |

| Prioridade | Essencial | Importante | Desejável |
| --- | --- | --- | --- |
|  | Não | Sim | Não |

---

| Identificador | Nome do Requisito | Descrição |
| --- | --- | --- |
| **RNF06** | Integridade de Dados | O sistema deve garantir a integridade referencial em operações de exclusão, impedindo a existência de registros órfãos (ex: candidaturas sem vaga ou sem aluno). |

| Prioridade | Essencial | Importante | Desejável |
| --- | --- | --- | --- |
|  | Sim | Não | Não |

---

### 4.5. Requisitos de Escalabilidade

| Identificador | Nome do Requisito | Descrição |
| --- | --- | --- |
| **RNF07** | Escalabilidade de Usuários | A arquitetura do sistema deve suportar o incremento de até 100 usuários simultâneos sem que o tempo de resposta exceda o limite definido no RNF01 em mais de 50%. |

| Prioridade | Essencial | Importante | Desejável |
| --- | --- | --- | --- |
|  | Não | Não | Sim |

---

### 4.6. Requisitos de Manutenibilidade

| Identificador | Nome do Requisito | Descrição |
| --- | --- | --- |
| **RNF08** | Modularização | O backend deve seguir o padrão de arquitetura RESTful, garantindo o desacoplamento total entre as camadas de apresentação (frontend) e de lógica de negócio (API). |

| Prioridade | Essencial | Importante | Desejável |
| --- | --- | --- | --- |
|  | Não | Sim | Não |

---

### 4.7. Requisitos de Portabilidade

| Identificador | Nome do Requisito | Descrição |
| --- | --- | --- |
| **RNF09** | Compatibilidade Web | O sistema deve ser compatível exclusivamente com as versões estáveis atuais dos navegadores Google Chrome e Mozilla Firefox em ambientes desktop. |

| Prioridade | Essencial | Importante | Desejável |
| --- | --- | --- | --- |
|  | Não | Sim | Não |

---

| Identificador | Nome do Requisito | Descrição |
| --- | --- | --- |
| **RNF10** | Suporte Mobile (PWA) | O sistema deve implementar a tecnologia PWA (Progressive Web App), permitindo sua instalação e uso otimizado como aplicativo em dispositivos móveis. |

| Prioridade | Essencial | Importante | Desejável |
| --- | --- | --- | --- |
|  | Não | Sim | Não |

---

## 3. Casos de Uso (UC)

### UC001 - Cadastrar Aluno

- **ID:** UC001
- **Atores:** Estudante
- **Descrição:** Registra um novo aluno no sistema.
- **Pré-condições:** Nenhuma.
- **Pós-condições:** Conta de aluno criada e pendente de login.
- **Fluxo Principal:**
    1. O sistema solicita e-mail institucional, matrícula e senha.
    2. O ator preenche os dados e confirma.
    3. O sistema valida a unicidade do e-mail, da matrícula e o formato da senha.
    4. O sistema persiste os dados e confirma o cadastro.
- **Regras de Negócio:** E-mail deve pertencer ao domínio `@aluno.ifce.edu.br`. A matrícula deve ser única no sistema.
- **Exceções:** E-mail ou matrícula já cadastrados (Sistema informa erro de duplicidade).
- **Rastreabilidade:** RF001, RNF001.

---

### UC002 - Autenticar Usuário

- **ID:** UC002
- **Atores:** Usuário (Estudante, Recrutador ou Administrador)
- **Descrição:** Realiza o login no sistema.
- **Pré-condições:** Usuário previamente cadastrado.
- **Pós-condições:** Sessão iniciada e acesso liberado às funcionalidades do perfil.
- **Fluxo Principal:**
    1. O ator informa e-mail e senha.
    2. O sistema valida as credenciais.
    3. O sistema concede acesso e redireciona para o dashboard correspondente.
- **Exceções:** Credenciais inválidas (Sistema informa erro e permite nova tentativa).
- **Rastreabilidade:** RF002, RNF001.

---

### UC003 - Atualizar Dados do Usuário

- **ID:** UC003
- **Atores:** Usuário
- **Descrição:** Permite a manutenção de dados do perfil, incluindo experiências e cursos.
- **Pré-condições:** Usuário autenticado.
- **Pós-condições:** Dados atualizados na base de dados.
- **Fluxo Principal:**
    1. O ator acessa a edição de perfil.
    2. O ator modifica campos (Dados pessoais, experiências ou cursos).
    3. O ator confirma as alterações.
    4. O sistema valida as datas (Início <= Fim) e links informados.
    5. O sistema persiste as atualizações.
- **Exceções:** Formato de link inválido; Datas inconsistentes.
- **Rastreabilidade:** RF003.

---

### UC004 - Cadastrar Administrador (via Convite)

- **ID:** UC004
- **Atores:** Administrador
- **Descrição:** Adiciona um novo administrador através de convite e código.
- **Pré-condições:** Administrador autenticado.
- **Pós-condições:** Novo administrador cadastrado.
- **Fluxo Principal:**
    1. O Administrador informa o e-mail do convidado.
    2. O sistema envia um código de validação para o e-mail informado.
    3. O convidado informa o código recebido no sistema.
    4. O sistema valida o código e solicita a definição de senha.
    5. O sistema ativa a conta administrativa.
- **Regras de Negócio:** Código expira em 24 horas.
- **Rastreabilidade:** RF005.

---

### UC005 - Cadastrar Vaga

- **ID:** UC005
- **Atores:** Recrutador
- **Descrição:** Cria uma nova oportunidade de trabalho.
- **Pré-condições:** Recrutador autenticado e homologado.
- **Pós-condições:** Vaga publicada e visível para estudantes.
- **Fluxo Principal:**
    1. O ator seleciona "Nova Vaga".
    2. O ator preenche a estrutura completa (Título, Empresa, Requisitos, Localização, etc).
    3. O ator confirma a publicação.
    4. O sistema valida os campos obrigatórios e persiste a vaga.
- **Fluxo Alternativo (A1):** Inserção de link externo (Gupy). O sistema associa o link à vaga.
- **Rastreabilidade:** RF007, RF011.

---

### UC006 - Visualizar e Gerenciar Vagas (CRUD)

- **ID:** UC006
- **Atores:** Recrutador, Administrador, Estudante (apenas visualizar)
- **Descrição:** Operações de consulta, edição e exclusão de vagas.
- **Pré-condições:** Autenticação para Editar/Excluir.
- **Pós-condições:** Dados da vaga atualizados ou removidos.
- **Fluxo Principal:**
    1. O ator visualiza a lista de vagas.
    2. O ator seleciona uma vaga específica.
    3. (Se Recrutador/Adm) O ator seleciona Editar ou Excluir.
    4. O sistema processa a operação e atualiza a base.
- **Regras de Negócio:** Recrutadores só editam/excluem suas próprias vagas. Administradores podem gerenciar qualquer vaga.
- **Rastreabilidade:** RF008, RF009, RF010, RF011.