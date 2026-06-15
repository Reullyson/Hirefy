import { Link, useLocation } from "wouter";
import { Filter, Search, X, ArrowLeft, Loader2, User, Calendar, Building2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { applicationService } from "@/services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function CandidateManagement() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const [activeTab, setActiveTab] = useState<"all" | "PENDENTE" | "APROVADO" | "REPROVADO">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const jobId = searchParams.get("vaga");

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["candidates", jobId],
    queryFn: async () => {
      const response = await applicationService.list(jobId || undefined);
      return response.data;
    },
  });

  const clearFilter = () => {
    setSearchTerm("");
    setLocation("/candidatos");
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDENTE: "bg-yellow-50 text-yellow-700 border-yellow-100",
      EM_ANALISE: "bg-blue-50 text-blue-700 border-blue-100",
      APROVADO: "bg-green-50 text-green-700 border-green-100",
      REPROVADO: "bg-red-50 text-red-700 border-red-100",
    };

    const labels: Record<string, string> = {
      PENDENTE: "Pendente",
      EM_ANALISE: "Em Análise",
      APROVADO: "Aprovado",
      REPROVADO: "Rejeitado",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.PENDENTE}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredCandidates = candidates.filter((candidate: any) => {
    const matchesTab = activeTab === "all" || candidate.status === activeTab;
    const name = candidate.student_name || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = [
    { key: "all", label: "Todos", count: candidates.length },
    {
      key: "PENDENTE",
      label: "Pendentes",
      count: candidates.filter((c: any) => c.status === "PENDENTE").length,
    },
    {
      key: "APROVADO",
      label: "Aprovados",
      count: candidates.filter((c: any) => c.status === "APROVADO").length,
    },
    {
      key: "REPROVADO",
      label: "Rejeitados",
      count: candidates.filter((c: any) => c.status === "REPROVADO").length,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          {jobId && (
            <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-sm w-fit">
              <p className="text-white text-xs font-medium uppercase tracking-wider opacity-70">Filtrando por vaga ID</p>
              <p className="text-white font-bold truncate max-w-xs">{jobId}</p>
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
                placeholder="Buscar por nome do candidato..."
                className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
              />
              {(searchTerm || jobId) && (
                <button
                  onClick={clearFilter}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                  title="Limpar filtro"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
          <div className="flex border-b border-border overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary/5 text-primary border-b-2 border-primary"
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
              Nenhum candidato encontrado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((app: any) => (
              <div
                key={app.id}
                className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  {getStatusBadge(app.status)}
                </div>
                
                <Link href={`/candidatos/${app.student_user_id}`}>
                  <h3 className="font-bold text-lg text-foreground mb-1 hover:text-primary transition-colors cursor-pointer">{app.student_name}</h3>
                </Link>
                <p className="text-sm text-primary font-medium mb-4 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> {app.job_title}
                </p>
                
                <div className="mt-auto pt-4 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    Inscrito em {format(new Date(app.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                  
                  <Link 
                    href={`/vagas/${app.job}`}
                    className="block w-full text-center py-2 text-sm font-bold text-primary hover:underline"
                  >
                    Ver Candidatura Completa
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
