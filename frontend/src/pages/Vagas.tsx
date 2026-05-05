import { Link } from "wouter";
import { Plus, Pencil, Trash2 } from "lucide-react";

const vagas = [
  { id: 1, title: "Desenvolvedor Frontend React", dept: "Tecnologia", modelo: "Remoto", contrato: "Tempo Integral", candidates: 42, status: "Ativa", data: "15/05/2026" },
  { id: 2, title: "Designer UX/UI", dept: "Design", modelo: "Híbrido", contrato: "Tempo Integral", candidates: 18, status: "Ativa", data: "20/05/2026" },
  { id: 3, title: "Analista de Dados", dept: "Tecnologia", modelo: "Presencial", contrato: "Meio Período", candidates: 27, status: "Pausada", data: "10/05/2026" },
  { id: 4, title: "Gerente de Projetos", dept: "Gestão", modelo: "Remoto", contrato: "Tempo Integral", candidates: 15, status: "Ativa", data: "30/05/2026" },
];

export default function Vagas() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-sidebar-primary px-6 py-4 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">Vagas</h1>
          <p className="text-white/70 text-sm mt-0.5">Gerencie as vagas da empresa</p>
        </div>
        <button className="flex items-center gap-2 bg-white text-primary text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">
          <Plus size={15} />
          Nova Vaga
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vaga</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Modelo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contrato</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Candidatos</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data Limite</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vagas.map((vaga) => (
                <tr key={vaga.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-foreground text-sm font-medium">{vaga.title}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{vaga.dept}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-foreground">{vaga.modelo}</td>
                  <td className="px-5 py-3.5 text-sm text-foreground">{vaga.contrato}</td>
                  <td className="px-5 py-3.5 text-sm text-foreground">{vaga.candidates}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      vaga.status === "Ativa"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {vaga.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-foreground">{vaga.data}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link href="/vagas/editar" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                        <Pencil size={14} />
                      </Link>
                      <button className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
