import { Link, useLocation } from "wouter";
import { Filter, Search, X, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  job: string;
  appliedAt: string;
  status: "pending" | "reviewing" | "approved" | "rejected";
  avatar?: string;
  course: string;
}

export function CandidateManagement() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("vaga") || "");

  const clearFilter = () => {
    setSearchTerm("");
    setLocation("/candidatos");
  };

  // Mocks removidos - Lista inicia vazia até implementação do backend de candidaturas
  const candidates: Candidate[] = [];

  const getStatusBadge = (status: Candidate["status"]) => {
    const styles = {
      pending: "bg-yellow-50 text-yellow-700",
      reviewing: "bg-secondary/10 text-secondary",
      approved: "bg-primary/10 text-primary",
      rejected: "bg-destructive/10 text-destructive",
    };

    const labels = {
      pending: "Pendente",
      reviewing: "Em Análise",
      approved: "Aprovado",
      rejected: "Rejeitado",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesTab =
      activeTab === "all" || candidate.status === activeTab;
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = [
    { key: "all", label: "Todos", count: candidates.length },
    {
      key: "pending",
      label: "Pendentes",
      count: candidates.filter((c) => c.status === "pending").length,
    },
    {
      key: "approved",
      label: "Aprovados",
      count: candidates.filter((c) => c.status === "approved").length,
    },
    {
      key: "rejected",
      label: "Rejeitados",
      count: candidates.filter((c) => c.status === "rejected").length,
    },
  ];

  return (
    <div>
      {/* Header */}
      <header className="bg-primary px-4 py-4 md:px-8 md:py-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-primary-foreground text-2xl font-semibold">
              Gestão de Candidatos
            </h1>
            <p className="text-primary-foreground/90 text-sm mt-1">
              Visualize e gerencie todos os candidatos inscritos
            </p>
          </div>
          {searchParams.get("vaga") && (
            <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-sm w-fit">
              <p className="text-white text-xs font-medium uppercase tracking-wider opacity-70">Filtrando por vaga ID</p>
              <p className="text-white font-bold truncate max-w-xs">{searchParams.get("vaga")}</p>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="p-4 md:p-8">
        {/* Search and Filters */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
              />
              {(searchTerm || searchParams.get("vaga")) && (
                <button
                  onClick={clearFilter}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                  title="Limpar filtro"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2 w-full md:w-auto">
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
          <div className="flex border-b border-border overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "bg-secondary/10 text-secondary border-b-2 border-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Candidates List */}
        {filteredCandidates.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm border border-border p-12 text-center">
            <p className="text-muted-foreground text-lg">
              Nenhum candidato encontrado (Aguardando implementação da API de Candidaturas)
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow"
              >
                {/* ... renderização de candidato ... */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
