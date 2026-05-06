import { useLocation, useParams, Link } from "wouter";
import { ArrowLeft, MapPin, Briefcase, Calendar, Users, FileText, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { jobService } from "@/services/api";

export function JobDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await jobService.getById(id);
      return response.data;
    },
    enabled: !!id
  });

  // Mock de candidatos para manter a UI (em breve virá da API)
  const candidates: any[] = [];

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
            {/* Job Summary Card */}
            <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm border border-border">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div>
                  <h2 className="text-foreground text-2xl font-bold mb-2">{job.title}</h2>
                  <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 shrink-0" /> {job.company_name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0" /> {job.city}, {job.state} ({job.location_type})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 shrink-0" /> Publicada em {new Date(job.created_at).toLocaleDateString('pt-BR')}
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

            {/* Candidates List */}
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="px-4 py-4 md:px-6 md:py-4 border-b border-border bg-muted/30">
                <h3 className="text-foreground font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary shrink-0" /> Candidatos Inscritos
                </h3>
              </div>
              <div className="divide-y divide-border">
                {candidates.length === 0 ? (
                  <p className="p-8 text-center text-muted-foreground text-sm">Nenhuma candidatura registrada até o momento.</p>
                ) : (
                  candidates.map((candidate) => (
                    <div key={candidate.id} className="p-4 md:p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* ... renderização de candidato ... */}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <h3 className="text-foreground font-semibold mb-4">Resumo da Vaga</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-sm">Aplicações</span>
                  <span className="text-foreground font-bold text-lg">--</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <span className="text-primary font-bold text-sm">{job.status}</span>
                </div>
              </div>
              <Link
                href={`/vagas/editar/${job.id}`}
                className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                Editar Vaga
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
