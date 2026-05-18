import { useLocation, useParams, Link } from "wouter";
import { ArrowLeft, MapPin, Briefcase, Calendar, Users, FileText, Loader2, CheckCircle2, User, Mail, ExternalLink, Clock, XCircle, AlertCircle, Building2, Globe } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobService, userService, applicationService, api } from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function JobDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await userService.getMe();
      return response.data;
    }
  });

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await jobService.getById(id);
      return response.data;
    },
    enabled: !!id
  });

  const isRecruiter = user?.user_type === "RECRUTADOR";
  const isStudent = user?.user_type === "ALUNO";
  const isProfileIncomplete = isStudent && (!user?.skills || !user?.experiences || user?.experiences.length === 0);

  // Busca candidatos (Apenas para Recrutadores)
  const { data: candidates, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ["job-candidates", id],
    queryFn: async () => {
      const response = await applicationService.list(id!);
      return response.data;
    },
    enabled: !!id && isRecruiter
  });

  const applyMutation = useMutation({
    mutationFn: () => applicationService.create({ job: id }),
    onSuccess: () => {
      toast.success("Candidatura enviada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["job", id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Erro ao enviar candidatura.");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string | number, status: string }) => 
      applicationService.updateStatus(appId, status),
    onSuccess: () => {
      toast.success("Status atualizado!");
      queryClient.invalidateQueries({ queryKey: ["job-candidates", id] });
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar status.");
    }
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "APROVADO": return "Aprovado";
      case "REPROVADO": return "Reprovado";
      case "EM_ANALISE": return "Em Análise";
      default: return "Pendente";
    }
  };

  const getApplicationStatusAlert = (status: string) => {
    const configs: Record<string, any> = {
      PENDENTE: {
        color: "bg-yellow-50 border-yellow-200 text-yellow-800",
        icon: <Clock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />,
        title: "Candidatura Recebida",
        message: "Sua candidatura está aguardando análise inicial da empresa."
      },
      EM_ANALISE: {
        color: "bg-blue-50 border-blue-200 text-blue-800",
        icon: <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
        title: "Em Análise",
        message: "Seu perfil está sendo avaliado pela equipe de recrutamento neste momento."
      },
      APROVADO: {
        color: "bg-green-50 border-green-200 text-green-800",
        icon: <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />,
        title: "Parabéns! Você foi aprovado",
        message: "Seu perfil foi selecionado para esta vaga. A empresa entrará em contato em breve para os próximos passos."
      },
      REPROVADO: {
        color: "bg-red-50 border-red-200 text-red-800",
        icon: <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
        title: "Processo Encerrado",
        message: "Infelizmente a empresa optou por seguir com outros candidatos cujas qualificações estão mais alinhadas aos requisitos no momento."
      }
    };

    const config = configs[status] || configs.PENDENTE;

    return (
      <div className={`${config.color} border p-4 rounded-lg flex items-start gap-3 mb-6`}>
        {config.icon}
        <div>
          <h4 className="font-bold text-sm">{config.title}</h4>
          <p className="text-xs mt-1 opacity-90">
            {config.message} 
            <Link href="/minhas-vagas" className="underline ml-1 font-semibold">Ver todas minhas vagas</Link>.
          </p>
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APROVADO": return "bg-green-100 text-green-700";
      case "REPROVADO": return "bg-red-100 text-red-700";
      case "EM_ANALISE": return "bg-blue-100 text-blue-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Vaga não encontrada.</p>
        <Link href="/vagas" className="text-primary hover:underline mt-4 block">Voltar para listagem</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary px-4 py-4 md:px-8 md:py-6 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => setLocation("/vagas")}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-primary-foreground text-2xl font-semibold">Detalhes da Vaga</h1>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Success Alert for Students with Status */}
            {isStudent && job.user_has_applied && getApplicationStatusAlert(job.user_application_status)}

            {/* Job Summary Card */}
            <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm border border-border">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div>
                  <h2 className="text-foreground text-2xl font-bold mb-2">{job.title}</h2>
                  <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                    <Dialog>
                      <DialogTrigger asChild>
                        <span className="flex items-center gap-1.5 hover:text-primary cursor-pointer hover:underline transition-colors font-medium">
                          <Briefcase className="w-4 h-4 shrink-0" /> {job.company_name}
                        </span>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-card border-border">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            Sobre a Empresa
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center py-6 gap-4 text-center">
                          <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center overflow-hidden border border-border">
                            {job.company_logo ? (
                              <img 
                                src={job.company_logo} 
                                alt={job.company_name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-12 h-12 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-foreground">{job.company_name}</h3>
                            {job.company_site_url && (
                              <a 
                                href={job.company_site_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm flex items-center justify-center gap-1 mt-1 font-medium"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                Visitar website oficial
                                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                              </a>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground px-4 leading-relaxed italic">
                            Esta empresa publica vagas de estágio e emprego através da plataforma Hirefy em parceria com o IFCE.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0" /> {job.city}, {job.state} ({job.location_type})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 shrink-0" /> Publicada em {format(new Date(job.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-semibold w-fit">
                  {job.contract_type}
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-foreground font-semibold flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" /> Descrição da Vaga
                </h3>
                <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
                
                <h3 className="text-foreground font-semibold flex items-center gap-2 mt-8 mb-4">
                  <FileText className="w-5 h-5 text-primary" /> Requisitos Obrigatórios
                </h3>
                <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {job.requirements_mandatory}
                </div>
              </div>
            </div>

            {/* Candidates List (Only for Recruiter) */}
            {isRecruiter && (
              <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                <div className="px-4 py-4 md:px-6 md:py-4 border-b border-border bg-muted/30">
                  <h3 className="text-foreground font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary shrink-0" /> Candidatos Inscritos
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {isLoadingCandidates ? (
                    <div className="p-12 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                    </div>
                  ) : !candidates || candidates.length === 0 ? (
                    <p className="p-8 text-center text-muted-foreground text-sm">Nenhuma candidatura registrada até o momento.</p>
                  ) : (
                    candidates.map((app: any) => (
                      <div key={app.id} className="p-4 md:p-6 hover:bg-muted/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <Link href={`/candidatos/${app.student}`} className="flex items-start gap-4 cursor-pointer group/candidate">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0 group-hover/candidate:bg-primary/20 transition-colors">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground group-hover/candidate:text-primary transition-colors">{app.student_name}</h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Inscrito em {format(new Date(app.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                              <p className="text-[10px] text-primary font-bold mt-1 opacity-0 group-hover/candidate:opacity-100 transition-opacity">VER PERFIL COMPLETO</p>
                            </div>
                          </Link>

                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                              {getStatusLabel(app.status)}
                            </span>
                            
                            <select
                              value={app.status}
                              onChange={(e) => updateStatusMutation.mutate({ appId: app.id, status: e.target.value })}
                              disabled={updateStatusMutation.isLoading}
                              className="text-xs border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                            >
                              <option value="PENDENTE">Mudar Status</option>
                              <option value="EM_ANALISE">Em Análise</option>
                              <option value="APROVADO">Aprovar</option>
                              <option value="REPROVADO">Reprovar</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <h3 className="text-foreground font-semibold mb-4">Resumo da Vaga</h3>
              <div className="space-y-4">
                {isRecruiter && (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground text-sm">Aplicações</span>
                    <span className="text-foreground font-bold text-lg">{candidates?.length || 0}</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <span className="text-primary font-bold text-sm uppercase">{job.status}</span>
                </div>
              </div>

              {isRecruiter && (
                <Link
                  href={`/vagas/editar/${job.id}`}
                  className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  Editar Vaga
                </Link>
              )}

              {isStudent && (
                <div className="space-y-4">
                  <button
                    onClick={() => applyMutation.mutate()}
                    disabled={applyMutation.isLoading || job.user_has_applied || isProfileIncomplete}
                    className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70 disabled:bg-muted disabled:text-muted-foreground"
                  >
                    {applyMutation.isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : job.user_has_applied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Status: {getStatusLabel(job.user_application_status)}
                      </>
                    ) : isProfileIncomplete ? (
                      "Perfil Incompleto"
                    ) : (
                      "Aplicar para esta Vaga"
                    )}
                  </button>

                  {isProfileIncomplete && !job.user_has_applied && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-[11px] text-red-700 leading-tight">
                        <strong>Ação Necessária:</strong> Adicione suas <strong>competências</strong> e pelo menos uma <strong>experiência</strong> no seu perfil para poder se candidatar.
                        <Link href="/perfil" className="block mt-1 font-bold underline">Completar Perfil →</Link>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
