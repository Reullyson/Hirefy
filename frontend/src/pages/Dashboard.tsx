import { Briefcase, Users, CheckCircle, Clock } from "lucide-react";

const stats = [
  { label: "Vagas Ativas", value: "12", icon: Briefcase, color: "text-primary" },
  { label: "Total de Candidatos", value: "248", icon: Users, color: "text-blue-500" },
  { label: "Contratações", value: "5", icon: CheckCircle, color: "text-green-500" },
  { label: "Em Avaliação", value: "34", icon: Clock, color: "text-yellow-500" },
];

const recentJobs = [
  { title: "Desenvolvedor Frontend React", dept: "Tecnologia", candidates: 42, status: "Ativa" },
  { title: "Designer UX/UI", dept: "Design", candidates: 18, status: "Ativa" },
  { title: "Analista de Dados", dept: "Tecnologia", candidates: 27, status: "Pausada" },
  { title: "Gerente de Projetos", dept: "Gestão", candidates: 15, status: "Ativa" },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-sidebar-primary px-6 py-4 flex-shrink-0">
        <h1 className="text-white text-xl font-bold">Dashboard</h1>
        <p className="text-white/70 text-sm mt-0.5">Visão geral do recrutamento</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card rounded-xl border border-card-border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-muted-foreground text-sm">{label}</p>
                <Icon size={18} className={color} />
              </div>
              <p className="text-foreground text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-card-border shadow-sm">
          <div className="px-5 py-4 border-b border-card-border">
            <h2 className="text-foreground font-semibold text-sm">Vagas Recentes</h2>
          </div>
          <div className="divide-y divide-border">
            {recentJobs.map((job) => (
              <div key={job.title} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm font-medium">{job.title}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{job.dept}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-xs">{job.candidates} candidatos</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    job.status === "Ativa"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
