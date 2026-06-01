import { useQuery } from "@tanstack/react-query";
import { applicationService } from "@/services/api";
import { Loader2, Briefcase, Building2, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function MinhasVagas() {
  const { data: applications, isLoading, isError } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const response = await applicationService.list();
      return response.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APROVADO":
        return "bg-green-100 text-green-700 border-green-200";
      case "REPROVADO":
        return "bg-red-100 text-red-700 border-red-200";
      case "EM_ANALISE":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APROVADO":
        return <CheckCircle2 className="w-4 h-4" />;
      case "REPROVADO":
        return <XCircle className="w-4 h-4" />;
      case "EM_ANALISE":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "APROVADO":
        return "Aprovado";
      case "REPROVADO":
        return "Reprovado";
      case "EM_ANALISE":
        return "Em Análise";
      default:
        return "Pendente";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Minhas Candidaturas</h1>
        <p className="text-muted-foreground">Acompanhe o progresso de suas aplicações em tempo real.</p>
      </header>

      {isError ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
          Erro ao carregar candidaturas. Por favor, tente novamente mais tarde.
        </div>
      ) : !applications || applications.length === 0 ? (
        <div className="bg-muted/30 border border-dashed border-border p-12 rounded-xl text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma candidatura ainda</h3>
          <p className="text-muted-foreground mb-6">Você ainda não se candidatou a nenhuma vaga.</p>
          <a href="/vagas" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Explorar Vagas
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app: any) => (
            <div key={app.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-1">{app.job_title}</h3>
                  <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      {app.company_name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Candidatado em {format(new Date(app.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider w-fit ${getStatusColor(app.status)}`}>
                  {getStatusIcon(app.status)}
                  {getStatusLabel(app.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
