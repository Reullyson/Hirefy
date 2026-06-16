import { useState, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { userService, companyService, jobService } from "@/services/api";
import {
  LayoutGrid,
  Users,
  Building2,
  Briefcase,
  ShieldCheck,
  Eye,
  EyeOff,
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
  | "job-detail"
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
  const [selectedJob, setSelectedJob] = useState<any>(null);
  
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
              {active === "job-detail" && "Dados da Vaga"}
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
          {active === "jobs" && (
            <JobsPage
              onOpenJob={(job: any) => {
                setSelectedJob(job);
                setActive("job-detail");
              }}
            />
          )}

          {active === "job-detail" && (
            <JobDetailPage
              job={selectedJob}
              onBack={() => setActive("jobs")}
            />
          )}
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
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [usersRes, companiesRes, jobsRes] = await Promise.all([
        userService.getAllUsers(),
        companyService.list(),
        jobService.list(),
      ]);

      return {
        users: usersRes.data ?? [],
        companies: companiesRes.data ?? [],
        jobs: jobsRes.data ?? [],
      };
    },
  });

  if (isLoading) {
    return <div className="panel">Carregando dashboard...</div>;
  }

  if (isError || !data) {
    return <div className="panel">Erro ao carregar dashboard.</div>;
  }

  const users = data.users as any[];
  const companies = data.companies as any[];
  const jobs = data.jobs as any[];

  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.user_type === "ALUNO").length;
  const totalRecruiters = users.filter((u) => u.user_type === "RECRUTADOR").length;
  const totalAdmins = users.filter((u) => u.user_type === "ADMIN").length;

  const approvedCompanies = companies.filter((c) => c.status === "APROVADA").length;
  const pendingCompanies = companies.filter((c) => c.status === "PENDENTE").length;
  const rejectedCompanies = companies.filter((c) => c.status === "REJEITADA").length;

  const activeJobs = jobs.filter((j) => j.status === "ATIVA").length;
  const pausedJobs = jobs.filter((j) => j.status === "PAUSADA").length;
  const closedJobs = jobs.filter((j) => j.status === "ENCERRADA").length;

  const recentUsers = [...users]
    .sort((a, b) => {
      const da = new Date(a.date_joined || a.created_at || 0).getTime();
      const db = new Date(b.date_joined || b.created_at || 0).getTime();
      return db - da;
    })
    .slice(0, 4);

  const recentCompanies = [...companies]
    .filter((c) => c.status === "PENDENTE" || c.status === "APROVADA")
    .slice(0, 4);

  const recentJobs = [...jobs]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 4);

  return (
    <>
      <div className="stats-grid">
        <StatCard
          icon={<Users size={18} />}
          value={String(totalUsers)}
          label="Total de usuários"
          delta={`${totalStudents} alunos / ${totalRecruiters} recrutadores`}
        />
        <StatCard
          icon={<Building2 size={18} />}
          value={String(companies.length)}
          label="Empresas cadastradas"
          delta={`${approvedCompanies} aprovadas / ${pendingCompanies} pendentes`}
        />
        <StatCard
          icon={<Briefcase size={18} />}
          value={String(jobs.length)}
          label="Vagas cadastradas"
          delta={`${activeJobs} ativas / ${pausedJobs} pausadas`}
        />
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <StatCard
          icon={<ShieldCheck size={18} />}
          value={String(totalAdmins)}
          label="Administradores"
          delta="Acesso total ao sistema"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          value={String(approvedCompanies)}
          label="Empresas homologadas"
          delta={`${rejectedCompanies} rejeitadas`}
        />
        <StatCard
          icon={<XCircle size={18} />}
          value={String(closedJobs)}
          label="Vagas encerradas"
          delta="Moderação concluída"
        />
      </div>

      <div className="panel">
        <h3>Atividades recentes</h3>

        <div className="activity-list">
          {recentCompanies.length > 0 && (
            <>
              {recentCompanies.map((company) => (
                <ActivityItem
                  key={`company-${company.id}`}
                  title={`Empresa ${company.name} - ${company.status}`}
                  subtitle={`CNPJ: ${company.cnpj}`}
                />
              ))}
            </>
          )}

          {recentJobs.length > 0 && (
            <>
              {recentJobs.map((job) => (
                <ActivityItem
                  key={`job-${job.id}`}
                  title={`Vaga: ${job.title}`}
                  subtitle={`Empresa: ${job.company_name || "Sem nome"} • Status: ${job.status}`}
                />
              ))}
            </>
          )}

          {recentUsers.length > 0 && (
            <>
              {recentUsers.map((user) => (
                <ActivityItem
                  key={`user-${user.id}`}
                  title={`Usuário cadastrado: ${user.nome}`}
                  subtitle={`Tipo: ${user.user_type} • Email: ${user.email}`}
                />
              ))}
            </>
          )}

          {recentUsers.length === 0 &&
            recentCompanies.length === 0 &&
            recentJobs.length === 0 && (
              <div style={{ color: "#94a3b8", padding: "8px 0" }}>
                Nenhuma atividade recente encontrada.
              </div>
            )}
        </div>
      </div>
    </>
  );
}

function UsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [expandedMode, setExpandedMode] = useState<"view" | "edit">("view");
  const [inviteOpen, setInviteOpen] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    nome: "",
    email: "",
    company_name: "",
    cnpj: "",
  });

  const [editForm, setEditForm] = useState({
    nome: "",
    email: "",
    user_type: "ALUNO",
  });

  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [editingTarget, setEditingTarget] = useState<any>(null);

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

  const openExpandedView = (user: any, mode: "view" | "edit") => {
    if (expandedUserId === user.id && expandedMode === mode) {
      setExpandedUserId(null);
      setEditingTarget(null);
      return;
    }

    setExpandedUserId(user.id);
    setExpandedMode(mode);
    setEditingTarget(user);

    setEditForm({
      nome: user.nome ?? "",
      email: user.email ?? "",
      user_type: user.user_type ?? "ALUNO",
    });
  };

  const closeExpanded = () => {
    setExpandedUserId(null);
    setEditingTarget(null);
  };

  const handleInvite = async () => {
    if (
      !inviteForm.email ||
      !inviteForm.nome ||
      !inviteForm.company_name ||
      !inviteForm.cnpj
    ) {
      setInviteFeedback({
        type: "error",
        message: "Por favor, preencha todos os campos do convite.",
      });
      return;
    }

    try {
      setInviteLoading(true);
      setInviteFeedback(null);

      const response = await userService.inviteRecruiter(inviteForm);

      setInviteFeedback({
        type: "success",
        message:
          response?.data?.detail ||
          `${inviteForm.email} foi convidado com sucesso.`,
      });

      setInviteForm({
        nome: "",
        email: "",
        company_name: "",
        cnpj: "",
      });

      setInviteOpen(false);
      await refetch();
    } catch (error: any) {
      setInviteFeedback({
        type: "error",
        message:
          error?.response?.data?.detail ||
          error?.response?.data?.email?.[0] ||
          error?.response?.data?.cnpj?.[0] ||
          "Erro ao enviar convite.",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingTarget) return;

    try {
      await userService.updateUser(editingTarget.id, {
        nome: editForm.nome,
        email: editForm.email,
        user_type: editForm.user_type,
      });

      await refetch();
      closeExpanded();
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
      alert(error?.response?.data?.detail || "Erro ao excluir usuário.");
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

        <button
          className="small-button primary"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
          onClick={() => setInviteOpen((prev) => !prev)}
        >
          <Mail size={16} />
          {inviteOpen ? "Fechar Convite" : "Convidar Empresa"}
        </button>
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

      <div
        className="stats-grid"
        style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "24px" }}
      >
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

      {inviteOpen && (
        <div
          className="detail-card"
          style={{
            marginBottom: "24px",
            border: "1px solid #334155",
            background:
              "linear-gradient(180deg, rgba(15,23,42,.95), rgba(15,23,42,.85))",
          }}
        >
          <div className="detail-header" style={{ marginBottom: "16px" }}>
            <div>
              <h3>Convidar Empresa</h3>
              <p className="muted">
                Envie um convite por e-mail para um novo recrutador.
              </p>
            </div>

            <button
              className="small-button secondary"
              onClick={() => setInviteOpen(false)}
              type="button"
            >
              Fechar
            </button>
          </div>

          {inviteFeedback && (
            <div
              className={`admin-feedback ${
                inviteFeedback.type === "success"
                  ? "admin-feedback-success"
                  : "admin-feedback-error"
              }`}
              style={{ marginBottom: "16px" }}
            >
              {inviteFeedback.message}
            </div>
          )}

          <div className="detail-grid">
            <div className="detail-card">
              <strong>Dados do Recrutador</strong>
              <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                <input
                  className="input"
                  value={inviteForm.nome}
                  onChange={(e) =>
                    setInviteForm((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  placeholder="Nome do Responsável"
                />
                <input
                  className="input"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="E-mail da Empresa"
                />
              </div>
            </div>

            <div className="detail-card">
              <strong>Dados da Empresa</strong>
              <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                <input
                  className="input"
                  value={inviteForm.company_name}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      company_name: e.target.value,
                    }))
                  }
                  placeholder="Nome Fantasia / Razão Social"
                />
                <input
                  className="input"
                  value={inviteForm.cnpj}
                  onChange={(e) =>
                    setInviteForm((prev) => ({ ...prev, cnpj: e.target.value }))
                  }
                  placeholder="CNPJ"
                />
              </div>
            </div>
          </div>

          <div
            className="action-row"
            style={{ marginTop: "16px", justifyContent: "flex-end" }}
          >
            <button
              className="small-button secondary"
              onClick={() => setInviteOpen(false)}
              type="button"
            >
              Cancelar
            </button>

            <button
              className="small-button primary"
              onClick={handleInvite}
              type="button"
              disabled={inviteLoading}
            >
              <Mail size={16} />
              {inviteLoading ? "Enviando..." : "Enviar Convite"}
            </button>
          </div>
        </div>
      )}

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
              <>
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
                        onClick={() => openExpandedView(user, "view")}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="icon-button"
                        title="Editar"
                        onClick={() => openExpandedView(user, "edit")}
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

                {expandedUserId === user.id && (
                  <tr>
                    <td colSpan={5} style={{ padding: 0, borderBottom: "1px solid #1f2937" }}>
                      <div
                        style={{
                          padding: "18px",
                          background: "rgba(15,23,42,0.75)",
                          borderTop: "1px solid #334155",
                        }}
                      >
                        <div className="detail-header" style={{ marginBottom: "16px" }}>
                          <div>
                            <h3 style={{ marginBottom: "4px" }}>
                              {expandedMode === "view"
                                ? "Detalhes do Usuário"
                                : "Editar Usuário"}
                            </h3>
                            <p className="muted">
                              {user.nome} • {user.email}
                            </p>
                          </div>

                          <button
                            className="small-button secondary"
                            onClick={closeExpanded}
                            type="button"
                          >
                            Fechar
                          </button>
                        </div>

                        {expandedMode === "view" ? (
                          <div className="detail-grid">
                            <div className="detail-card">
                              <strong>Dados principais</strong>
                              <p>Nome: {user.nome}</p>
                              <p>Email: {user.email}</p>
                              <p>Tipo: {user.user_type}</p>
                              <p>Status: {user.is_active ? "Ativo" : "Bloqueado"}</p>
                            </div>

                            <div className="detail-card">
                              <strong>Informações técnicas</strong>
                              <p>ID: {user.id}</p>
                              <p>Cadastro: {user.date_joined || "-"}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="detail-grid">
                            <div className="detail-card">
                              <strong>Dados do usuário</strong>
                              <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                                <input
                                  className="input"
                                  value={editForm.nome}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      nome: e.target.value,
                                    }))
                                  }
                                  placeholder="Nome"
                                />

                                <input
                                  className="input"
                                  value={editForm.email}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      email: e.target.value,
                                    }))
                                  }
                                  placeholder="Email"
                                />

                                <select
                                  className="input"
                                  value={editForm.user_type}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      user_type: e.target.value,
                                    }))
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
                        )}

                        {expandedMode === "edit" && (
                          <div
                            className="action-row"
                            style={{ marginTop: "16px", justifyContent: "flex-end" }}
                          >
                            <button
                              className="small-button secondary"
                              onClick={closeExpanded}
                              type="button"
                            >
                              Cancelar
                            </button>
                            <button
                              className="small-button primary"
                              onClick={handleSave}
                              type="button"
                            >
                              Salvar alterações
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={{ padding: "24px", color: "#94a3b8" }}>
            Nenhum usuário encontrado.
          </div>
        )}
      </div>
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

  const [statusById, setStatusById] = useState<Record<number, string>>({});

  const companies = data ?? [];

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const getEffectiveStatus = (company: any) => {
    return statusById[company.id] || company.status;
  };

  const handleApprove = async (company: any) => {
    try {
      setActioningId(company.id);
      setAnimatedId({ id: company.id, type: "approve" });

      await companyService.approve(company.id);

      setStatusById((prev) => ({
        ...prev,
        [company.id]: "APROVADA",
      }));

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

      setStatusById((prev) => ({
        ...prev,
        [company.id]: "REJEITADA",
      }));

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
      <div className="detail-header" style={{ marginBottom: "8px" }}>
        <div>
          <h3>Homologação de Empresas</h3>
          <p className="muted">
            Empresas cadastradas no sistema para aprovação ou rejeição.
          </p>
        </div>
      </div>

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

      {companies.length === 0 ? (
        <div style={{ padding: "24px", color: "#94a3b8" }}>
          Nenhuma empresa encontrada.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "14px" }}>
          {companies.map((company: any) => {
            const currentStatus = getEffectiveStatus(company);
            const isApproved = currentStatus === "APROVADA";
            const isRejected = currentStatus === "REJEITADA";
            const isDone = isApproved || isRejected;

            return (
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
                <div className="company-row">
                  <div className="company-main">
                    <div className="company-title-row">
                      <strong className="company-name">{company.name}</strong>

                      {isApproved ? (
                        <span className="company-status approved">
                          ✓ Aprovada
                        </span>
                      ) : isRejected ? (
                        <span className="company-status rejected">
                          ✕ Rejeitada
                        </span>
                      ) : (
                        <span className={`badge ${currentStatus === "PENDENTE" ? "warning" : "success"}`}>
                          {currentStatus}
                        </span>
                      )}
                    </div>

                    <div className="company-details">
                      <p>CNPJ: {company.cnpj}</p>
                      <p>Recrutador: {company.recruiter_email || "-"}</p>

                      {isDone && (
                        <p className="company-note">
                          {isApproved
                            ? "Esta empresa já foi aprovada."
                            : "Esta empresa já foi rejeitada."}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="company-actions">
                    <button
                      className="small-button primary"
                      onClick={() => onOpenCompany(company)}
                      type="button"
                    >
                      <Info size={16} /> Ver dados
                    </button>

                    <button
                      className="small-button primary"
                      onClick={() => handleApprove(company)}
                      disabled={actioningId === company.id || isDone}
                      type="button"
                    >
                      {actioningId === company.id ? (
                        "Processando..."
                      ) : isApproved ? (
                        "Já aprovada"
                      ) : (
                        <>
                          <CheckCircle2 size={16} /> Aprovar
                        </>
                      )}
                    </button>

                    <button
                      className="small-button secondary"
                      onClick={() => handleReject(company)}
                      disabled={actioningId === company.id || isDone}
                      type="button"
                    >
                      {actioningId === company.id ? (
                        "Processando..."
                      ) : isRejected ? (
                        "Já rejeitada"
                      ) : (
                        <>
                          <XCircle size={16} /> Rejeitar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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

function JobDetailPage({
  job,
  onBack,
}: {
  job: any;
  onBack: () => void;
}) {
  if (!job) {
    return (
      <div className="panel">
        Nenhuma vaga selecionada.
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="detail-header">
        <div>
          <h3>{job.title}</h3>

          <p className="muted">
            Dados completos da vaga cadastrada
          </p>
        </div>

        <button
          className="small-button secondary"
          onClick={onBack}
        >
          <ChevronRight size={16} />
          Voltar
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <strong>Informações gerais</strong>

          <p>Título: {job.title}</p>

          <p>
            Empresa: {job.company_name || "-"}
          </p>

          <p>
            Localização: {job.location || "-"}
          </p>

          <p>
            Modalidade: {job.modality || "-"}
          </p>

          <p>
            Tipo de contrato: {job.contract_type || "-"}
          </p>

          <p>
            Status: {job.status}
          </p>
        </div>

        <div className="detail-card">
          <strong>Descrição da vaga</strong>

          <p>
            {job.description || "Não informada."}
          </p>
        </div>

        <div className="detail-card">
          <strong>Requisitos</strong>

          <p>
            {job.requirements || "Não informados."}
          </p>
        </div>

        <div className="detail-card">
          <strong>Benefícios</strong>

          <p>
            {job.benefits || "Não informados."}
          </p>
        </div>

        <div className="detail-card">
          <strong>Faixa salarial</strong>

          <p>
            {job.salary || "Não informada."}
          </p>
        </div>

        <div className="detail-card">
          <strong>Informações técnicas</strong>

          <p>ID: {job.id}</p>

          <p>
            Criada em:
            {" "}
            {job.created_at
              ? new Date(job.created_at).toLocaleString("pt-BR")
              : "-"}
          </p>

          <p>
            Atualizada em:
            {" "}
            {job.updated_at
              ? new Date(job.updated_at).toLocaleString("pt-BR")
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

function JobsPage({
  onOpenJob,
}: {
  onOpenJob: (job: any) => void;
}) {
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
                      className="small-button primary"
                      onClick={() => onOpenJob(job)}
                      type="button"
                    >
                      <Info size={16} />
                      Ver detalhes
                    </button>
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
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await userService.getAllUsers();
      return response.data;
    },
  });

  const users = data ?? [];
  const admins = users.filter((u: any) => u.user_type === "ADMIN");

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleInvite = async () => {
    try {
      setLoading(true);

      const response = await userService.inviteAdmin({
        email,
        code,
      });

      showFeedback(
        "success",
        `${response.data.user?.email || email} foi convidado como administrador.`
      );

      setEmail("");
      setCode("");
      await refetch();
    } catch (error: any) {
      showFeedback(
        "error",
        error?.response?.data?.detail ||
          error?.response?.data?.email ||
          error?.response?.data?.code ||
          "Erro ao enviar convite."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="panel">Carregando administradores...</div>;
  }

  if (isError) {
    return <div className="panel">Erro ao carregar administradores.</div>;
  }

  return (
    <div className="panel">
      <h3>Gestão de Administradores</h3>
      <p className="muted">
        Convite para novos membros da coordenação via e-mail com código de validação.
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

      <div className="invite-box">
        <div className="input-group">
          <Mail size={16} color="#94a3b8" />
          <input
            className="input"
            type="email"
            placeholder="novo.admin@ifce.edu.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            className="input"
            type="text"
            placeholder="Código de validação"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <button className="green-button" onClick={handleInvite} disabled={loading}>
          <Plus size={16} />
          {loading ? "Enviando..." : "Enviar convite"}
        </button>
      </div>

      <div className="subsection">
        <div className="subsection-title">
          <ShieldCheck size={16} />
          <strong>Administradores cadastrados</strong>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Status</th>
              <th>Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin: any) => (
              <tr key={admin.id}>
                <td>{admin.nome}</td>
                <td>{admin.email}</td>
                <td>
                  <span className={admin.is_active ? "badge success" : "badge danger"}>
                    {admin.is_active ? "Ativo" : "Bloqueado"}
                  </span>
                </td>
                <td>{admin.date_joined ? new Date(admin.date_joined).toLocaleString("pt-BR") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {admins.length === 0 && (
          <div style={{ padding: "24px", color: "#94a3b8" }}>
            Nenhum administrador encontrado.
          </div>
        )}
      </div>
    </div>
  );
}

function UserSettingsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await userService.getMe();
      return response.data;
    },
  });

  const [profileForm, setProfileForm] = useState({
    nome: "",
    email: "",
    user_type: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // VISIBILIDADE DAS SENHAS
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (data) {
      setProfileForm({
        nome: data.nome || "",
        email: data.email || "",
        user_type: data.user_type || "",
      });
    }
  }, [data]);

  if (isLoading) {
    return <div className="panel">Carregando configurações...</div>;
  }

  if (isError || !data) {
    return <div className="panel">Erro ao carregar configurações.</div>;
  }

  const handleSaveProfile = async () => {
    try {
      await userService.updateMe({
        nome: profileForm.nome,
        email: profileForm.email,
      });

      await refetch();

      alert("Perfil atualizado com sucesso!");
    } catch (error: any) {
      alert(
        error?.response?.data?.detail ||
          error?.response?.data?.email?.[0] ||
          "Erro ao atualizar perfil."
      );
    }
  };

  const handleChangePassword = async () => {
    try {
      await userService.changePassword(passwordForm);

      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      alert("Senha alterada com sucesso!");
    } catch (error: any) {
      const data = error?.response?.data || {};

      const message =
        data.detail ||
        data.current_password?.[0] ||
        data.new_password?.[0] ||
        data.confirm_password?.[0] ||
        "Erro ao alterar senha.";

      alert(message);
    }
  };

  return (
    <div className="panel">
      <h3>Configurações do Usuário</h3>

      <p className="muted">
        Tela de configuração com ícone de engrenagem.
      </p>

      <div className="settings-grid">
        {/* PERFIL */}
        <div className="detail-card">
          <strong>Perfil</strong>

          <p>Nome: {profileForm.nome || "-"}</p>

          <p>E-mail: {profileForm.email || "-"}</p>

          <p>Função: {profileForm.user_type || "-"}</p>
        </div>

        {/* PREFERÊNCIAS */}
        <div className="detail-card">
          <strong>Preferências</strong>

          <p>Notificações: Ativas</p>

          <p>Idioma: Português</p>

          <p>Tema: Claro</p>
        </div>

        {/* AÇÕES */}
        <div className="detail-card">
          <strong>Ações rápidas</strong>

          <div
            style={{
              display: "grid",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            {/* PERFIL */}
            <div
              style={{
                display: "grid",
                gap: "10px",
              }}
            >
              <input
                className="input"
                value={profileForm.nome}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    nome: e.target.value,
                  }))
                }
                placeholder="Nome"
              />

              <input
                className="input"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="E-mail"
              />
            </div>

            <div className="settings-actions">
              <button
                className="small-button primary"
                onClick={handleSaveProfile}
              >
                <UserCog size={16} />
                Atualizar perfil
              </button>
            </div>

            {/* ALTERAR SENHA */}
            <div
              style={{
                borderTop: "1px solid #334155",
                paddingTop: "12px",
              }}
            >
              <p
                style={{
                  marginBottom: "10px",
                  fontSize: "13px",
                  color: "#94a3b8",
                }}
              >
                Alterar senha
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                {/* SENHA ATUAL */}
                <div className="password-input-wrapper">
                  <input
                    className="input"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={passwordForm.current_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        current_password: e.target.value,
                      }))
                    }
                    placeholder="Senha atual"
                  />

                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {/* NOVA SENHA */}
                <div className="password-input-wrapper">
                  <input
                    className="input"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        new_password: e.target.value,
                      }))
                    }
                    placeholder="Nova senha"
                  />

                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() =>
                      setShowNewPassword(!showNewPassword)
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {/* CONFIRMAR SENHA */}
                <div className="password-input-wrapper">
                  <input
                    className="input"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={passwordForm.confirm_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirm_password: e.target.value,
                      }))
                    }
                    placeholder="Confirmar nova senha"
                  />

                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                className="small-button secondary"
                onClick={handleChangePassword}
                style={{ marginTop: "12px" }}
              >
                <BookMarked size={16} />
                Alterar senha
              </button>
            </div>
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