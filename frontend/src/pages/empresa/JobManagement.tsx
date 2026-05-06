import { Link, useLocation } from "wouter";
import { Plus, Edit2, Trash2, Eye, Pause, Play, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/services/api";
import { toast } from "sonner";

interface Job {
  id: number;
  title: string;
  company_name: string;
  location_type: string;
  level: string;
  status: string;
  created_at: string;
  // Campos extras que podem vir da API ou ser calculados
  department?: string;
  applications?: number;
}

export function JobManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Busca real das vagas via API
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await jobService.list();
      return response.data;
    },
  });

  // Mutação para deletar vaga
  const deleteMutation = useMutation({
    mutationFn: (id: number) => jobService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Vaga excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir vaga.");
    }
  });

  // Mutação para alterar status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      jobService.update(id, { status: status === "ATIVA" ? "PAUSADA" : "ATIVA" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Status da vaga atualizado!");
    }
  });

  const filteredJobs = jobs.filter((job: Job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ATIVA: "bg-primary/10 text-primary",
      PAUSADA: "bg-muted text-muted-foreground",
      ENCERRADA: "bg-destructive/10 text-destructive",
    };

    const labels: Record<string, string> = {
      ATIVA: "Ativa",
      PAUSADA: "Pausada",
      ENCERRADA: "Encerrada",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.PAUSADA}`}
      >
        {labels[status] || status}
      </span>
    );
  };

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
              Gestão de Vagas
            </h1>
            <p className="text-primary-foreground/90 text-sm mt-1">
              Gerencie todas as vagas publicadas pela sua empresa
            </p>
          </div>
          <Link
            href="/vagas/nova"
            className="bg-card text-primary px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors shadow-sm w-full md:w-auto"
          >
            <Plus className="w-5 h-5" />
            Nova Vaga
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 md:p-8">
        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar vaga por título..."
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-card text-foreground shadow-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
            <div className="bg-card rounded-lg px-6 py-3 shadow-sm border border-border flex flex-col items-center justify-center min-w-[140px]">
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Total</p>
              <p className="text-foreground text-xl font-bold">{jobs.length}</p>
            </div>
            <div className="bg-card rounded-lg px-6 py-3 shadow-sm border border-border flex flex-col items-center justify-center min-w-[140px]">
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Ativas</p>
              <p className="text-foreground text-xl font-bold">
                {jobs.filter((j: Job) => j.status === "ATIVA").length}
              </p>
            </div>
            <div className="bg-card rounded-lg px-6 py-3 shadow-sm border border-border flex flex-col items-center justify-center min-w-[140px]">
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Inscrições</p>
              <p className="text-foreground text-xl font-bold">--</p>
            </div>
          </div>
        </div>

        {/* Jobs List - Mobile (Cards) / Desktop (Table) */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          {filteredJobs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma vaga encontrada.
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden divide-y divide-border">
                {filteredJobs.map((job: Job) => (
                  <div key={job.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0 pr-4">
                        <Link href={`/vagas/${job.id}`} className="text-foreground font-semibold hover:text-primary transition-colors block truncate">
                          {job.title}
                        </Link>
                        <p className="text-muted-foreground text-xs mt-1">
                          {job.department || "Geral"} • {job.location_type}
                        </p>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Nível</span>
                        <span className="text-foreground">{job.level}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Inscrições</span>
                        <Link
                          href={`/candidatos?vaga=${job.id}`}
                          className="text-secondary hover:underline font-medium"
                        >
                          Ver candidatos
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                      <Link
                        href={`/vagas/${job.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors border border-border"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs font-medium">Ver</span>
                      </Link>
                      <Link
                        href={`/vagas/editar/${job.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors border border-border"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="text-xs font-medium">Editar</span>
                      </Link>
                      <button
                        onClick={() => toggleStatusMutation.mutate({ id: job.id, status: job.status })}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-border"
                        title={job.status === "ATIVA" ? "Pausar" : "Ativar"}
                      >
                        {job.status === "ATIVA" ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir esta vaga?")) {
                            deleteMutation.mutate(job.id);
                          }
                        }}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-border"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-foreground text-sm font-semibold">
                        Título da Vaga
                      </th>
                      <th className="px-6 py-4 text-left text-foreground text-sm font-semibold">
                        Nível
                      </th>
                      <th className="px-6 py-4 text-left text-foreground text-sm font-semibold">
                        Localização
                      </th>
                      <th className="px-6 py-4 text-left text-foreground text-sm font-semibold">
                        Inscrições
                      </th>
                      <th className="px-6 py-4 text-left text-foreground text-sm font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-foreground text-sm font-semibold">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredJobs.map((job: Job) => (
                      <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <Link href={`/vagas/${job.id}`} className="text-foreground font-medium hover:text-primary transition-colors">
                              {job.title}
                            </Link>
                            <p className="text-muted-foreground text-sm">
                              Publicada em{" "}
                              {new Date(job.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {job.level}
                        </td>
                        <td className="px-6 py-4 text-foreground">{job.location_type}</td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/candidatos?vaga=${job.id}`}
                            className="text-secondary hover:underline font-medium"
                          >
                            Ver
                          </Link>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(job.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/vagas/${job.id}`}
                              className="p-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                              title="Visualizar Detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/vagas/editar/${job.id}`}
                              className="p-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => toggleStatusMutation.mutate({ id: job.id, status: job.status })}
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title={job.status === "ATIVA" ? "Pausar" : "Ativar"}
                            >
                              {job.status === "ATIVA" ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Tem certeza que deseja excluir esta vaga?")) {
                                  deleteMutation.mutate(job.id);
                                }
                              }}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
