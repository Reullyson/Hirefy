import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService, companyService, jobService } from "@/services/api";
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
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

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
              onOpenCompany={(company: any) => {
              setSelectedCompany(company);
              setActive("company-detail");
            }}
            />
          )}
          {active === "company-detail" && (
            <CompanyDetailPage
              company={selectedCompany}
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

function CompaniesPage({ onOpenCompany }: { onOpenCompany: (company: any) => void }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: async () => {
      const response = await companyService.list();
      return response.data;
    },
  });

  const [actioningId, setActioningId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [animatedId, setAnimatedId] = useState<{
    id: number | null;
    type: "approve" | "reject" | null;
  }>({ id: null, type: null });

  const companies = data ?? [];

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleApprove = async (company: any) => {
    try {
      setActioningId(company.id);
      setAnimatedId({ id: company.id, type: "approve" });

      await companyService.approve(company.id);
      await refetch();

      showFeedback("success", `Empresa "${company.name}" aprovada com sucesso.`);
      setTimeout(() => setAnimatedId({ id: null, type: null }), 1200);
    } catch (err: any) {
      showFeedback("error", err?.response?.data?.detail || "Erro ao aprovar empresa.");
      setAnimatedId({ id: null, type: null });
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (company: any) => {
    try {
      setActioningId(company.id);
      setAnimatedId({ id: company.id, type: "reject" });

      await companyService.reject(company.id);
      await refetch();

      showFeedback("success", `Empresa "${company.name}" rejeitada.`);
      setTimeout(() => setAnimatedId({ id: null, type: null }), 1200);
    } catch (err: any) {
      showFeedback("error", err?.response?.data?.detail || "Erro ao rejeitar empresa.");
      setAnimatedId({ id: null, type: null });
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading) {
    return <div className="panel">Carregando empresas...</div>;
  }

  if (isError) {
    const message =
      (error as any)?.response?.data?.detail ||
      (error as any)?.response?.data?.message ||
      "Erro ao carregar empresas.";

    return <div className="panel">{message}</div>;
  }

  return (
    <div className="panel">
      <h3>Homologação de Empresas</h3>
      <p className="muted">
        Empresas cadastradas no sistema para aprovação ou rejeição.
      </p>

      {feedback && (
        <div
          className={`admin-feedback ${
            feedback.type === "success" ? "admin-feedback-success" : "admin-feedback-error"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {companies.length === 0 ? (
        <div style={{ padding: "24px", color: "#94a3b8" }}>
          Nenhuma empresa encontrada.
        </div>
      ) : (
        companies.map((company: any) => (
          <div
            key={company.id}
            className={`request-card company-action-card ${
              animatedId.id === company.id
                ? animatedId.type === "approve"
                  ? "company-approved"
                  : "company-rejected"
                : ""
            }`}
          >
            <div className="company-info">
              <strong>{company.name}</strong>

              <div className="company-details">
                <p>CNPJ: {company.cnpj}</p>
                <p>Status: {company.status}</p>
                <p>Recrutador: {company.recruiter_email || "-"}</p>
              </div>
            </div>

            <div className="action-row">
              <button
                className="small-button primary"
                onClick={() => onOpenCompany(company)}
              >
                <Info size={16} /> Ver dados
              </button>

              <button
                className="small-button primary"
                onClick={() => handleApprove(company)}
                disabled={actioningId === company.id}
              >
                {actioningId === company.id ? (
                  "Processando..."
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Aprovar
                  </>
                )}
              </button>

              <button
                className="small-button secondary"
                onClick={() => handleReject(company)}
                disabled={actioningId === company.id}
              >
                {actioningId === company.id ? (
                  "Processando..."
                ) : (
                  <>
                    <XCircle size={16} /> Rejeitar
                  </>
                )}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function CompanyDetailPage({
  company,
  onBack,
}: {
  company: any;
  onBack: () => void;
}) {
  if (!company) {
    return (
      <div className="panel">
        Nenhuma empresa selecionada.
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="detail-header">
        <div>
          <h3>{company.name}</h3>
          <p className="muted">Dados reais da empresa cadastrada</p>
        </div>

        <button className="small-button secondary" onClick={onBack}>
          <ChevronRight size={16} /> Voltar
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <strong>Dados cadastrais</strong>
          <p>CNPJ: {company.cnpj}</p>
          <p>Contato: {company.recruiter_email || "-"}</p>
          <p>Site: {company.site_url || "-"}</p>
          <p>Status: {company.status}</p>
        </div>

        <div className="detail-card">
          <strong>Informações adicionais</strong>
          <p>Logo: {company.logo_url || "Não informado"}</p>
        </div>
      </div>
    </div>
  );
}

function JobsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const response = await jobService.list();
      return response.data;
    },
  });

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [actioningId, setActioningId] = useState<number | null>(null);

  const jobs = data ?? [];

  const showFeedback = (
    type: "success" | "error",
    message: string
  ) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleApprove = async (job: any) => {
    try {
      setActioningId(job.id);

      await jobService.approve(job.id);

      await refetch();

      showFeedback(
        "success",
        `Vaga "${job.title}" aprovada com sucesso.`
      );
    } catch (error: any) {
      showFeedback(
        "error",
        error?.response?.data?.detail ||
          "Erro ao aprovar vaga."
      );
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (job: any) => {
    try {
      setActioningId(job.id);

      await jobService.reject(job.id);

      await refetch();

      showFeedback(
        "success",
        `Vaga "${job.title}" rejeitada.`
      );
    } catch (error: any) {
      showFeedback(
        "error",
        error?.response?.data?.detail ||
          "Erro ao rejeitar vaga."
      );
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading) {
    return <div className="panel">Carregando vagas...</div>;
  }

  if (isError) {
    return <div className="panel">Erro ao carregar vagas.</div>;
  }

  return (
    <div className="panel">
      <h3>Moderação de Vagas</h3>
      <p className="muted">
        Visualização e controle de todas as vagas publicadas.
      </p>

      {feedback && (
        <div
          className={`admin-feedback ${
            feedback.type === "success"
              ? "admin-feedback-success"
              : "admin-feedback-error"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {jobs.length === 0 ? (
        <div style={{ padding: "24px", color: "#94a3b8" }}>
          Nenhuma vaga encontrada.
        </div>
      ) : (
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
            {jobs.map((job: any) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.company_name || "-"}</td>

                <td>
                  <span
                    className={`badge ${
                      job.status === "ATIVA"
                        ? "success"
                        : job.status === "PAUSADA"
                        ? "warning"
                        : "danger"
                    }`}
                  >
                    {job.status}
                  </span>
                </td>

                <td>
                  <div className="actions">
                    <button
                      className="icon-button"
                      onClick={() => handleApprove(job)}
                      disabled={actioningId === job.id}
                    >
                      <CheckCircle2 size={16} />
                    </button>

                    <button
                      className="icon-button-danger"
                      onClick={() => handleReject(job)}
                      disabled={actioningId === job.id}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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