import { useState } from "react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  ShieldX,
  Users
} from "lucide-react";

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");

  const users = [
    {
      id: 1,
      nome: "Maria Silva",
      email: "maria@ifce.edu.br",
      tipo: "ALUNO",
      status: "Ativo",
    },
    {
      id: 2,
      nome: "TechNova Ltda",
      email: "rh@technova.com",
      tipo: "RECRUTADOR",
      status: "Ativo",
    },
    {
      id: 3,
      nome: "Administrador Geral",
      email: "admin@ifce.edu.br",
      tipo: "ADMIN",
      status: "Ativo",
    },
    {
      id: 4,
      nome: "João Pedro",
      email: "joao@ifce.edu.br",
      tipo: "ALUNO",
      status: "Bloqueado",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.nome.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "todos" || user.tipo === filter;

    return matchSearch && matchFilter;
  });

  return (
    <div className="panel">
      <h3>Painel de Gestão de Usuários</h3>
      <p className="muted">
        Gerencie alunos, recrutadores e administradores da plataforma.
      </p>

      {/* filtros */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="ALUNO">Alunos</option>
          <option value="RECRUTADOR">Empresas</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* tabela */}
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
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.nome}</td>
              <td>{user.email}</td>
              <td>{user.tipo}</td>
              <td>
                <span
                  className={`badge ${
                    user.status === "Ativo"
                      ? "success"
                      : "warning"
                  }`}
                >
                  {user.status}
                </span>
              </td>

              <td>
                <div className="actions">
                  <button className="icon-button">
                    <Eye size={16} />
                  </button>

                  <button className="icon-button">
                    <Pencil size={16} />
                  </button>

                  <button className="icon-button">
                    <ShieldX size={16} />
                  </button>

                  <button className="icon-button-danger">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredUsers.length === 0 && (
        <div className="empty-state">
          <Users size={40} />
          <p>Nenhum usuário encontrado.</p>
        </div>
      )}
    </div>
  );
}