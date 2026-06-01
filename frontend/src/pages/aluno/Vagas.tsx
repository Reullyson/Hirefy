import { useQuery } from "@tanstack/react-query";
import { jobService, scraperService } from "@/services/api";
import { Loader2, ExternalLink, MapPin, Building2, Sparkles } from "lucide-react";

interface VagaDisplay {
  id: string;
  titulo: string;
  empresa: string;
  nivel: string;
  tipo_vaga: string;
  link?: string;
  origem: "plataforma" | "scraper";
  fonte?: string;
  tags: string[];
}

function normalizeJob(job: any): VagaDisplay {
  const nivelMap: Record<string, string> = {
    ESTAGIO: "Estágio", JUNIOR: "Júnior", PLENO: "Pleno", SENIOR: "Sênior",
  };
  const tipoMap: Record<string, string> = {
    REMOTO: "Remoto", PRESENCIAL: "Presencial", HIBRIDO: "Híbrido",
  };
  return {
    id: `job-${job.id}`,
    titulo: job.title,
    empresa: job.company_name,
    nivel: nivelMap[job.level] ?? job.level,
    tipo_vaga: tipoMap[job.location_type] ?? job.location_type,
    link: job.gupy_link || undefined,
    origem: "plataforma",
    tags: [job.city, job.state, job.contract_type].filter(Boolean),
  };
}

function normalizeScraped(item: any): VagaDisplay {
  return {
    id: `scraped-${item.titulo}-${item.empresa}`,
    titulo: item.titulo,
    empresa: item.empresa,
    nivel: item.nivel,
    tipo_vaga: item.tipo_vaga,
    link: item.link,
    origem: "scraper",
    fonte: item.fonte,
    tags: item.descricao?.slice(0, 6) ?? [],
  };
}

export function Vagas() {
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await jobService.list();
      return res.data as any[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: scraperData, isLoading: scraperLoading } = useQuery({
    queryKey: ["scraper-vagas"],
    queryFn: async () => {
      const res = await scraperService.listVagas();
      return (res.data as { total: number; vagas: any[] }).vagas;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // Vagas do backend
  const internas: VagaDisplay[] = (jobsData ?? [])
    .filter((j: any) => j.status === "ATIVA")
    .map(normalizeJob);

  // Vagas do scraper
  const externas: VagaDisplay[] = (scraperData ?? []).map(normalizeScraped);

  // Se backend está carregando, mostra loading
  if (jobsLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        <p className="text-gray-500 font-medium">Buscando vagas...</p>
      </div>
    );
  }

  const totalInternas = internas.length;
  const totalExternas = externas.length;
  const total = totalInternas + totalExternas;

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vagas de TI</h1>
        <p className="text-gray-500 text-sm mt-1">
          {total} vaga{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
          {totalInternas > 0 && ` — ${totalInternas} da plataforma`}
          {totalExternas > 0 && `, ${totalExternas} externas`}
        </p>
      </header>

      {internas.length > 0 && (
        <div className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {internas.map((vaga) => (
              <div
                key={vaga.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900 truncate">{vaga.titulo}</h2>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{vaga.empresa}</span>
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full ml-3">
                    <Sparkles className="w-3 h-3" />
                    Plataforma
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {vaga.tipo_vaga && vaga.tipo_vaga !== "Não informado" && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                      <MapPin className="w-3 h-3" />
                      {vaga.tipo_vaga}
                    </span>
                  )}
                  {vaga.nivel && vaga.nivel !== "Não informado" && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                      {vaga.nivel}
                    </span>
                  )}
                </div>

                {vaga.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {vaga.tags.map((tag, j) => (
                      <span key={j} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <span className="mt-auto inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg px-4 py-2 cursor-default">
                  Candidatura em breve
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        {externas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {externas.map((vaga) => (
              <div
                key={vaga.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900 truncate">{vaga.titulo}</h2>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{vaga.empresa}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full ml-3">
                    {vaga.fonte}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {vaga.tipo_vaga && vaga.tipo_vaga !== "Não informado" && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                      <MapPin className="w-3 h-3" />
                      {vaga.tipo_vaga}
                    </span>
                  )}
                  {vaga.nivel && vaga.nivel !== "Não informado" && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                      {vaga.nivel}
                    </span>
                  )}
                </div>

                {vaga.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {vaga.tags.map((tag, j) => (
                      <span key={j} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <a
                  href={vaga.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors rounded-lg px-4 py-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Candidatura externa
                </a>
              </div>
            ))}
          </div>
        ) : scraperLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 bg-gray-50 rounded-xl">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
            <p className="text-gray-500 font-medium">Buscando vagas de parceiros...</p>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">Nenhuma vaga encontrada no momento</p>
          </div>
        )}
      </div>
    </div>
  );
}
