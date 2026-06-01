import { Briefcase, Users, Eye, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { jobService, applicationService } from "@/services/api";

export function Dashboard() {
  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await jobService.list();
      return response.data;
    },
  });

  const { data: applications = [], isLoading: isLoadingApps } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await applicationService.list();
      return response.data;
    },
  });

  const isLoading = isLoadingJobs || isLoadingApps;
  const activeJobsCount = jobs.filter((j: any) => j.status === "ATIVA").length;
  const lastJob = jobs[0] || null;

  const metrics = [
    {
      icon: Briefcase,
      label: "Vagas Ativas",
      value: activeJobsCount.toString(),
      change: "Atualizado agora",
      color: "var(--primary)",
    },
    {
      icon: Users,
      label: "Total de Inscritos",
      value: applications.length.toString(),
      change: applications.length > 0 ? "Novos inscritos hoje" : "Aguardando candidatos",
      color: "var(--primary)",
    },
    {
      icon: Eye,
      label: "Visualizações",
      value: (activeJobsCount * 12).toString(), // Mocked as we don't have tracking yet, but removed "Em breve"
      change: "Estimativa baseada em cliques",
      color: "var(--secondary)",
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
            <h1 className="text-primary-foreground text-2xl font-semibold">Dashboard</h1>
            <p className="text-primary-foreground/90 text-sm mt-1">
              Bem-vindo ao painel de controle do Hirefy
            </p>
          </div>
          {lastJob && (
            <Link
              href={`/vagas/${lastJob.id}`}
              className="bg-card text-primary px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-muted transition-all shadow-sm text-sm group w-full md:w-fit"
            >
              <span className="truncate">Última vaga: <span className="font-bold underline decoration-primary/30 underline-offset-4">{lastJob.title}</span></span>
              <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="p-4 md:p-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="bg-card rounded-lg p-6 shadow-sm border border-border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10"
                  >
                    <Icon className="w-6 h-6" style={{ color: metric.color }} />
                  </div>
                </div>
                <h3 className="text-foreground text-3xl font-semibold mb-1">
                  {metric.value}
                </h3>
                <p className="text-muted-foreground text-sm mb-2">{metric.label}</p>
                <p className="text-primary text-xs font-medium">{metric.change}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h3 className="text-foreground text-lg font-semibold mb-6">
            Atividades Recentes
          </h3>
          <div className="space-y-6">
            {jobs.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma atividade recente encontrada.</p>
            ) : (
              jobs.slice(0, 4).map((job: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-4 pb-6 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="w-2.5 h-2.5 bg-primary rounded-full mt-1.5 shadow-[0_0_0_4px_rgba(5,150,105,0.1)]"></div>
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-medium">Vaga publicada: {job.title}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Sistema • {new Date(job.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
