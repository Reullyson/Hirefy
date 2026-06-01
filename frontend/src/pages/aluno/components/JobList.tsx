import { useQuery } from "@tanstack/react-query";
import { jobService } from "@/services/api";
import { Loader2, MapPin, Building2, Calendar, Briefcase, ChevronRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function JobList() {
  const { data: jobs, isLoading, isError } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await jobService.list();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        Ocorreu um erro ao carregar as vagas.
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma vaga disponível no momento.
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Prazo não informado";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Prazo não informado";
      return `Expira em ${format(date, "dd 'de' MMM", { locale: ptBR })}`;
    } catch (e) {
      return "Prazo não informado";
    }
  };

  return (
    <div className="space-y-4">
      {jobs.map((job: any) => (
        <Link key={job.id} href={`/vagas/${job.id}`}>
          <div className="bg-card p-5 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-all cursor-pointer group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {job.level}
                    </span>
                    {job.user_has_applied && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Candidatado
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {job.company_name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {job.location_type} • {job.city}, {job.state}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {job.contract_type}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(job.deadline_date)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                Ver detalhes
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
