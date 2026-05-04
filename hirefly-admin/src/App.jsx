import { useState } from "react";
import {
  LayoutGrid,
  Users,
  Building2,
  Briefcase,
  ShieldCheck,
  Eye,
  Settings,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Mail,
  Plus,
  ChevronRight,
  GraduationCap,
  UserCog,
  BookMarked,
  Info,
} from "lucide-react";

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [selectedCompany, setSelectedCompany] = useState("Alpha Systems");

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">HF</div>
          <div>
            <h1>HireFly</h1>
            <p>IFCE Campus Cedro</p>
          </div>
        </div>

        <nav className="menu">
          <SidebarItem
            icon={<LayoutGrid size={18} />}
            label="Painel de Controle"
            active={active === "dashboard"}
            onClick={() => setActive("dashboard")}
          />

          <SidebarItem
            icon={<Users size={18} />}
            label="Gerenciamento de Usuários"
            active={active === "users"}
            onClick={() => setActive("users")}
          />

          <SidebarItem
            icon={<Building2 size={18} />}
            label="Homologação de Empresas"
            active={active === "companies" || active === "company-detail"}
            onClick={() => setActive("companies")}
          />

          <SidebarItem
            icon={<Briefcase size={18} />}
            label="Moderação de Vagas"
            active={active === "jobs"}
            onClick={() => setActive("jobs")}
          />

          <SidebarItem
            icon={<ShieldCheck size={18} />}
            label="Gestão de Administradores"
            active={active === "admins"}
            onClick={() => setActive("admins")}
          />

          <SidebarItem
            icon={<Settings size={18} />}
            label="Configurações do Usuário"
            active={active === "settings"}
            onClick={() => setActive("settings")}
          />
        </nav>

        <div className="sidebar-footer">
          <button className="profile-circle" onClick={() => setActive("settings")} title="Configurações do usuário">
            E
          </button>
          <div>
            <strong>Empresa Demo</strong>
            <p>Configurações</p>
          </div>
          <Settings size={16} className="footer-icon" />
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h2>
              {active === "dashboard" && "Dashboard"}
              {active === "users" && "Gerenciamento de Usuários"}
              {active === "companies" && "Homologação de Empresas"}
              {active === "company-detail" && "Dados da Empresa"}
              {active === "jobs" && "Moderação de Vagas"}
              {active === "admins" && "Gestão de Administradores"}
              {active === "settings" && "Configurações do Usuário"}
            </h2>
            <p>Bem-vindo ao painel de controle do HireFly</p>
          </div>
        </header>

        <section className="content">
          {active === "dashboard" && <Dashboard />}
          {active === "users" && <UsersPage />}
          {active === "companies" && (
            <CompaniesPage
              onOpenCompany={(name) => {
                setSelectedCompany(name);
                setActive("company-detail");
              }}
            />
          )}
          {active === "company-detail" && (
            <CompanyDetailPage companyName={selectedCompany} onBack={() => setActive("companies")} />
          )}
          {active === "jobs" && <JobsPage />}
          {active === "admins" && <AdminsPage />}
          {active === "settings" && <UserSettingsPage />}
        </section>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button className={`sidebar-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Dashboard() {
  return (
    <>
      <div className="stats-grid">
        <StatCard icon={<Users size={18} />} value="1.248" label="Total de usuários" delta="+12% este mês" />
        <StatCard icon={<Building2 size={18} />} value="84" label="Empresas homologadas" delta="+6 aprovadas" />
        <StatCard icon={<Briefcase size={18} />} value="156" label="Vagas ativas" delta="+19 novas" />
      </div>

      <div className="panel">
        <h3>Atividades Recentes</h3>

        <div className="activity-list">
          <ActivityItem title="Nova inscrição para Desenvolvedor Frontend" subtitle="Maria Silva • há 5 minutos" />
          <ActivityItem title="Empresa homologada: TechNova Ltda" subtitle="Coordenação • há 1 hora" />
          <ActivityItem title="Vaga moderada e publicada" subtitle="Sistema • há 2 horas" />
          <ActivityItem title="Novo administrador convidado" subtitle="Admin principal • há 3 horas" />
        </div>
      </div>
    </>
  );
}

function UsersPage() {
  return (
    <div className="panel">
      <h3>Gerenciamento de Usuários</h3>
      <p className="muted">
        Lista global de estudantes e recrutadores com ferramentas de moderação.
      </p>

      <div className="subsection">
        <div className="subsection-title">
          <GraduationCap size={16} />
          <strong>Alunos</strong>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Curso</th>
              <th>Status</th>
              <th>Vagas vinculadas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ana Clara Lima</td>
              <td>ADS</td>
              <td><span className="badge success">Ativo</span></td>
              <td>
                <div className="linked-jobs">
                  <span>Estágio em Desenvolvimento Web</span>
                  <span>•</span>
                  <span>UX/UI Júnior</span>
                </div>
              </td>
              <td>
                <div className="actions">
                  <button className="icon-button"><Eye size={16} /></button>
                  <button className="icon-button"><Pencil size={16} /></button>
                  <button className="icon-button-danger"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
            <tr>
              <td>Carlos Henrique</td>
              <td>SI</td>
              <td><span className="badge success">Ativo</span></td>
              <td>
                <div className="linked-jobs">
                  <span>Analista de Dados Júnior</span>
                </div>
              </td>
              <td>
                <div className="actions">
                  <button className="icon-button"><Eye size={16} /></button>
                  <button className="icon-button"><Pencil size={16} /></button>
                  <button className="icon-button-danger"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
            <tr>
              <td>João Pedro</td>
              <td>Redes</td>
              <td><span className="badge warning">Pendente</span></td>
              <td>
                <div className="linked-jobs muted-inline">
                  Nenhuma vaga vinculada
                </div>
              </td>
              <td>
                <div className="actions">
                  <button className="icon-button"><CheckCircle2 size={16} /></button>
                  <button className="icon-button"><XCircle size={16} /></button>
                  <button className="icon-button-danger"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="subsection">
        <div className="subsection-title">
          <Users size={16} />
          <strong>Recrutadores</strong>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Empresa</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Paula Mendes</td>
              <td>TechNova Ltda</td>
              <td><span className="badge success">Ativo</span></td>
              <td>
                <div className="actions">
                  <button className="icon-button"><Eye size={16} /></button>
                  <button className="icon-button-danger"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompaniesPage({ onOpenCompany }) {
  const companies = [
    {
      name: "Alpha Systems",
      cnpj: "12.345.678/0001-90",
      contato: "rh@alphasystems.com",
      cidade: "Fortaleza - CE",
    },
    {
      name: "InovaPrime",
      cnpj: "98.765.432/0001-10",
      contato: "people@inovaprime.com",
      cidade: "Sobral - CE",
    },
  ];

  return (
    <div className="panel">
      <h3>Homologação de Empresas</h3>
      <p className="muted">
        Fila de aprovação para novas empresas que desejam publicar vagas na plataforma.
      </p>

      {companies.map((company) => (
        <div key={company.name} className="request-card">
          <div className="company-info">
            <strong>{company.name}</strong>
            <div className="company-details">
              <p>CNPJ: {company.cnpj}</p>
              <p>Contato: {company.contato}</p>
              <p>Local: {company.cidade}</p>
            </div>
          </div>

          <div className="action-row">
            <button className="small-button primary" onClick={() => onOpenCompany(company.name)}>
              <Info size={16} /> Ver dados
            </button>
            <button className="small-button primary">
              <CheckCircle2 size={16} /> Aprovar
            </button>
            <button className="small-button secondary">
              <XCircle size={16} /> Rejeitar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompanyDetailPage({ companyName, onBack }) {
  const company =
    companyName === "InovaPrime"
      ? {
          name: "InovaPrime",
          cnpj: "98.765.432/0001-10",
          contato: "people@inovaprime.com",
          cidade: "Sobral - CE",
          site: "www.inovaprime.com",
          descricao: "Empresa focada em inovação, tecnologia e desenvolvimento de soluções digitais.",
          vagas: ["Estágio em UX/UI", "Analista de Dados Júnior"],
        }
      : {
          name: "Alpha Systems",
          cnpj: "12.345.678/0001-90",
          contato: "rh@alphasystems.com",
          cidade: "Fortaleza - CE",
          site: "www.alphasystems.com",
          descricao: "Empresa de tecnologia com atuação em software, serviços e transformação digital.",
          vagas: ["Desenvolvedor Frontend React", "Estágio em Desenvolvimento Web"],
        };

  return (
    <div className="panel">
      <div className="detail-header">
        <div>
          <h3>{company.name}</h3>
          <p className="muted">Tela com os dados da empresa homologada</p>
        </div>

        <button className="small-button secondary" onClick={onBack}>
          <ChevronRight size={16} /> Voltar
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <strong>Dados cadastrais</strong>
          <p>CNPJ: {company.cnpj}</p>
          <p>Contato: {company.contato}</p>
          <p>Local: {company.cidade}</p>
          <p>Site: {company.site}</p>
        </div>

        <div className="detail-card">
          <strong>Descrição</strong>
          <p>{company.descricao}</p>
        </div>

        <div className="detail-card">
          <strong>Vagas publicadas</strong>
          <div className="detail-tags">
            {company.vagas.map((vaga) => (
              <span key={vaga} className="detail-tag">{vaga}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function JobsPage() {
  return (
    <div className="panel">
      <h3>Moderação de Vagas</h3>
      <p className="muted">
        Visualização e controle de todas as vagas publicadas para garantir a integridade do conteúdo.
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>Vaga</th>
            <th>Empresa</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Desenvolvedor Frontend React</td>
            <td>TechNova Ltda</td>
            <td><span className="badge success">Publicado</span></td>
            <td>
              <div className="actions">
                <button className="icon-button"><Eye size={16} /></button>
                <button className="icon-button"><Pencil size={16} /></button>
                <button className="icon-button-danger"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>

          <tr>
            <td>Estágio em UX/UI</td>
            <td>InovaPrime</td>
            <td><span className="badge warning">Em revisão</span></td>
            <td>
              <div className="actions">
                <button className="icon-button"><CheckCircle2 size={16} /></button>
                <button className="icon-button"><XCircle size={16} /></button>
                <button className="icon-button-danger"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function AdminsPage() {
  return (
    <div className="panel">
      <h3>Gestão de Administradores</h3>
      <p className="muted">
        Convite para novos membros da coordenação via e-mail com código de validação.
      </p>

      <div className="invite-box">
        <div className="input-group">
          <Mail size={16} color="#94a3b8" />
          <input
            className="input"
            type="email"
            placeholder="novo.admin@ifce.edu.br"
          />
        </div>

        <div className="input-group">
          <input
            className="input"
            type="text"
            placeholder="Código de validação"
          />
        </div>

        <button className="green-button">
          <Plus size={16} />
          Enviar convite
        </button>
      </div>
    </div>
  );
}

function UserSettingsPage() {
  return (
    <div className="panel">
      <h3>Configurações do Usuário</h3>
      <p className="muted">Tela de configuração com ícone de engrenagem.</p>

      <div className="settings-grid">
        <div className="detail-card">
          <strong>Perfil</strong>
          <p>Nome: Empresa Demo</p>
          <p>E-mail: empresa@demo.com</p>
          <p>Função: Recrutador</p>
        </div>

        <div className="detail-card">
          <strong>Preferências</strong>
          <p>Notificações: Ativas</p>
          <p>Idioma: Português</p>
          <p>Tema: Claro</p>
        </div>

        <div className="detail-card">
          <strong>Ações rápidas</strong>
          <div className="settings-actions">
            <button className="small-button primary">
              <UserCog size={16} /> Atualizar perfil
            </button>
            <button className="small-button secondary">
              <BookMarked size={16} /> Alterar senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, delta }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-delta">{delta}</div>
    </div>
  );
}

function ActivityItem({ title, subtitle }) {
  return (
    <div className="activity-item">
      <span className="dot" />
      <div>
        <strong>{title}</strong>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
