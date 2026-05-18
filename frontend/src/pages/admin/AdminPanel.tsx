import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/api";
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
  LogOut,
  Search,
  Filter,
  ShieldX,
} from "lucide-react";
import "./AdminPanel.css";

type ActiveSection =
  | "dashboard"
  | "users"
  | "companies"
  | "company-detail"
  | "jobs"
  | "admins"
  | "settings";

type AdminUser = {
  id: number;
  nome?: string;
  email?: string;
  user_type?: "ALUNO" | "RECRUTADOR" | "ADMIN";
  is_active?: boolean;
  date_joined?: string;
};

type CompanyItem = {
  name: string;
  cnpj: string;
  contato: string;
  cidade: string;
};

type CompanyDetails = CompanyItem & {
  site: string;
  descricao: string;
  vagas: string[];
};

export default function App() {
  const [active, setActive] = useState<ActiveSection>("dashboard");
  const [selectedCompany, setSelectedCompany] = useState("Alpha Systems");

  const handleLogout = () => {
    localStorage.removeItem("hirefy_access_token");
    localStorage.removeItem("hirefy_refresh_token");
    window.location.href = "/login";
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">HF</div>
          <div>
            <h1>Hirefy</h1>
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
          <button
            className="profile-circle"
            onClick={() => setActive("settings")}
            title="Configurações do usuário"
          >
            A
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong>Administrador</strong>
            <p>Configurações</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
            title="Sair"
          >
            <LogOut size={18} className="footer-icon hover:text-red-500 transition-colors" />
          </button>
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
            <p>Bem-vindo ao painel de controle do Hirefy</p>
          </div>
        </header>

        <section className="content">
          {active === "dashboard" && <Dashboard />}
          {active === "users" && <UsersPage />}
          {active === "companies" && (
            <CompaniesPage
              onOpenCompany={(name: string) => {
                setSelectedCompany(name);
                setActive("company-detail");
              }}
            />
          )}
          {active === "company-detail" && (
            <CompanyDetailPage
              companyName={selectedCompany}
              onBack={() => setActive("companies")}
            />
          )}
          {active === "jobs" && <JobsPage />}
          {active === "admins" && <AdminsPage />}
          {active === "settings" && <UserSettingsPage />}
        </section>
      </main>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
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
        <StatCard
          icon={<Users size={18} />}
          value="1.248"
          label="Total de usuários"
          delta="+12% este mês"
        />
        <StatCard
          icon={<Building2 size={18} />}
          value="84"
          label="Empresas homologadas"
          delta="+6 aprovadas"
        />
        <StatCard
          icon={<Briefcase size={18} />}
          value="156"
          label="Vagas ativas"
          delta="+19 novas"
        />
      </div>

      <div className="panel">
        <h3>Atividades Recentes</h3>

        <div className="activity-list">
          <ActivityItem
            title="Nova inscrição para Desenvolvedor Frontend"
            subtitle="Maria Silva • há 5 minutos"
          />
          <ActivityItem
            title="Empresa homologada: TechNova Ltda"
            subtitle="Coordenação • há 1 hora"
          />
          <ActivityItem
            title="Vaga moderada e publicada"
            subtitle="Sistema • há 2 horas"
          />
          <ActivityItem
            title="Novo administrador convidado"
            subtitle="Admin principal • há 3 horas"
          />
        </div>
      </div>
    </>
  );
}

function UsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    nome: "",
    email: "",
    user_type: "ALUNO",
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await userService.getAllUsers();
      return response.data;
    },
  });

  const users = data ?? [];

  const filteredUsers = users.filter((user: any) => {
    const nome = (user.nome ?? "").toLowerCase();
    const email = (user.email ?? "").toLowerCase();
    const tipo = (user.user_type ?? "").toLowerCase();

    const matchSearch =
      nome.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      tipo.includes(search.toLowerCase());

    const matchFilter = filter === "todos" || user.user_type === filter;

    return matchSearch && matchFilter;
  });

  const getBadgeClass = (active: boolean) => {
    return active ? "badge success" : "badge danger";
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditForm({
      nome: user.nome ?? "",
      email: user.email ?? "",
      user_type: user.user_type ?? "ALUNO",
    });
  };

  const closeModals = () => {
    setSelectedUser(null);
    setEditingUser(null);
  };

  const handleSave = async () => {
  if (!editingUser) return;

  try {
    await userService.updateUser(editingUser.id, {
      nome: editForm.nome,
      email: editForm.email,
      user_type: editForm.user_type,
    });

    await refetch();
    closeModals();
  } catch (error: any) {
    alert(error?.response?.data?.detail || "Erro ao atualizar usuário.");
  }
};

  const handleToggleActive = async (user: any) => {
  try {
    await userService.toggleUserActive(user.id);
    await refetch();
  } catch (error: any) {
    alert(error?.response?.data?.detail || "Erro ao bloquear/desbloquear usuário.");
  }
};

  const handleDelete = async (user: any) => {
    const ok = window.confirm(`Tem certeza que deseja excluir ${user.nome}?`);
    if (!ok) return;

    try {
      await userService.deleteUser(user.id);
      await refetch();
    } catch (error: any) {
      alert(
        error?.response?.data?.detail ||
        "Erro ao excluir usuário."
      );
    }
  };

  if (isLoading) {
    return <div className="panel">Carregando usuários...</div>;
  }

  if (isError) {
    return <div className="panel">Erro ao carregar usuários.</div>;
  }

  return (
    <div className="panel">
      <div className="detail-header">
        <div>
          <h3>Painel de Gestão de Usuários</h3>
          <p className="muted">
            Gerencie alunos, recrutadores e administradores da plataforma.
          </p>
        </div>
      </div>

      <div className="invite-box" style={{ marginBottom: "24px" }}>
        <div className="input-group">
          <Search size={16} color="#94a3b8" />
          <input
            className="input"
            type="text"
            placeholder="Buscar por nome, email ou tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="input-group" style={{ maxWidth: "220px" }}>
          <Filter size={16} color="#94a3b8" />
          <select
            className="input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="ALUNO">Alunos</option>
            <option value="RECRUTADOR">Empresas</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <StatCard
          icon={<Users size={18} />}
          value={String(users.length)}
          label="Total de usuários"
          delta="Na base"
        />
        <StatCard
          icon={<GraduationCap size={18} />}
          value={String(users.filter((u: any) => u.user_type === "ALUNO").length)}
          label="Alunos"
          delta="Cadastros"
        />
        <StatCard
          icon={<Building2 size={18} />}
          value={String(users.filter((u: any) => u.user_type === "RECRUTADOR").length)}
          label="Empresas"
          delta="Cadastros"
        />
        <StatCard
          icon={<ShieldCheck size={18} />}
          value={String(users.filter((u: any) => u.user_type === "ADMIN").length)}
          label="Admins"
          delta="Acesso total"
        />
      </div>

      <div className="subsection">
        <div className="subsection-title">
          <GraduationCap size={16} />
          <strong>Usuários cadastrados</strong>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user: any) => (
              <tr key={user.id}>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>{user.user_type}</td>
                <td>
                  <span className={getBadgeClass(!!user.is_active)}>
                    {user.is_active ? "Ativo" : "Bloqueado"}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button
                      className="icon-button"
                      title="Ver"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="icon-button"
                      title="Editar"
                      onClick={() => openEditModal(user)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="icon-button"
                      title="Bloquear / Desbloquear"
                      onClick={() => handleToggleActive(user)}
                    >
                      <ShieldX size={16} />
                    </button>

                    <button
                      className="icon-button-danger"
                      title="Excluir"
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={{ padding: "24px", color: "#94a3b8" }}>
            Nenhum usuário encontrado.
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="modal-backdrop" onClick={closeModals}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <div>
                <h3>Detalhes do Usuário</h3>
                <p className="muted">Visualização rápida do cadastro</p>
              </div>
              <button className="small-button secondary" onClick={closeModals}>
                Fechar
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-card">
                <strong>Dados principais</strong>
                <p>Nome: {selectedUser.nome}</p>
                <p>Email: {selectedUser.email}</p>
                <p>Tipo: {selectedUser.user_type}</p>
                <p>Status: {selectedUser.is_active ? "Ativo" : "Bloqueado"}</p>
              </div>

              <div className="detail-card">
                <strong>Informações técnicas</strong>
                <p>ID: {selectedUser.id}</p>
                <p>Cadastro: {selectedUser.date_joined || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="modal-backdrop" onClick={closeModals}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <div>
                <h3>Editar Usuário</h3>
                <p className="muted">Atualize os dados do cadastro</p>
              </div>
              <button className="small-button secondary" onClick={closeModals}>
                Fechar
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-card">
                <strong>Dados do usuário</strong>

                <div style={{ display: "grid", gap: "12px" }}>
                  <input
                    className="input"
                    value={editForm.nome}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, nome: e.target.value }))
                    }
                    placeholder="Nome"
                  />

                  <input
                    className="input"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Email"
                  />

                  <select
                    className="input"
                    value={editForm.user_type}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, user_type: e.target.value }))
                    }
                  >
                    <option value="ALUNO">ALUNO</option>
                    <option value="RECRUTADOR">RECRUTADOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="detail-card">
                <strong>Resumo</strong>
                <p>Nome: {editForm.nome}</p>
                <p>Email: {editForm.email}</p>
                <p>Tipo: {editForm.user_type}</p>
              </div>
            </div>

            <div className="action-row" style={{ marginTop: "16px", justifyContent: "flex-end" }}>
              <button className="small-button secondary" onClick={closeModals}>
                Cancelar
              </button>
              <button className="small-button primary" onClick={handleSave}>
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompaniesPage({ onOpenCompany }: { onOpenCompany: (name: string) => void }) {
  const companies: CompanyItem[] = [
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
            <button
              className="small-button primary"
              onClick={() => onOpenCompany(company.name)}
            >
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

function CompanyDetailPage({
  companyName,
  onBack,
}: {
  companyName: string;
  onBack: () => void;
}) {
  const company: CompanyDetails =
    companyName === "InovaPrime"
      ? {
          name: "InovaPrime",
          cnpj: "98.765.432/0001-10",
          contato: "people@inovaprime.com",
          cidade: "Sobral - CE",
          site: "www.inovaprime.com",
          descricao:
            "Empresa focada em inovação, tecnologia e desenvolvimento de soluções digitais.",
          vagas: ["Estágio em UX/UI", "Analista de Dados Júnior"],
        }
      : {
          name: "Alpha Systems",
          cnpj: "12.345.678/0001-90",
          contato: "rh@alphasystems.com",
          cidade: "Fortaleza - CE",
          site: "www.alphasystems.com",
          descricao:
            "Empresa de tecnologia com atuação em software, serviços e transformação digital.",
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
              <span key={vaga} className="detail-tag">
                {vaga}
              </span>
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
            <td>
              <span className="badge success">Publicado</span>
            </td>
            <td>
              <div className="actions">
                <button className="icon-button">
                  <Eye size={16} />
                </button>
                <button className="icon-button">
                  <Pencil size={16} />
                </button>
                <button className="icon-button-danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>

          <tr>
            <td>Estágio em UX/UI</td>
            <td>InovaPrime</td>
            <td>
              <span className="badge warning">Em revisão</span>
            </td>
            <td>
              <div className="actions">
                <button className="icon-button">
                  <CheckCircle2 size={16} />
                </button>
                <button className="icon-button">
                  <XCircle size={16} />
                </button>
                <button className="icon-button-danger">
                  <Trash2 size={16} />
                </button>
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
          <input className="input" type="text" placeholder="Código de validação" />
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

function StatCard({
  icon,
  value,
  label,
  delta,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delta: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-delta">{delta}</div>
    </div>
  );
}

function ActivityItem({ title, subtitle }: { title: string; subtitle: string }) {
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