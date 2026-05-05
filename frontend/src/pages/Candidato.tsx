import { Mail, Phone, MapPin } from "lucide-react";

const candidatos = [
  { id: 1, name: "Ana Silva", vaga: "Desenvolvedor Frontend React", email: "ana.silva@email.com", phone: "(88) 99123-4567", local: "Iguatu-CE", status: "Em Avaliação" },
  { id: 2, name: "Carlos Mendes", vaga: "Designer UX/UI", email: "carlos.m@email.com", phone: "(88) 98765-4321", local: "Fortaleza-CE", status: "Aprovado" },
  { id: 3, name: "Beatriz Santos", vaga: "Analista de Dados", email: "beatriz.s@email.com", phone: "(88) 91234-5678", local: "Crato-CE", status: "Em Avaliação" },
  { id: 4, name: "João Oliveira", vaga: "Gerente de Projetos", email: "joao.o@email.com", phone: "(88) 94567-8901", local: "Juazeiro-CE", status: "Reprovado" },
  { id: 5, name: "Maria Costa", vaga: "Desenvolvedor Frontend React", email: "maria.c@email.com", phone: "(88) 92345-6789", local: "Cedro-CE", status: "Aprovado" },
];

const statusColors: Record<string, string> = {
  "Em Avaliação": "bg-yellow-100 text-yellow-700",
  "Aprovado": "bg-green-100 text-green-700",
  "Reprovado": "bg-red-100 text-red-700",
};

export default function Candidato() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-sidebar-primary px-6 py-4 flex-shrink-0">
        <h1 className="text-white text-xl font-bold">Candidatos</h1>
        <p className="text-white/70 text-sm mt-0.5">Gerencie os candidatos às vagas</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid gap-3">
          {candidatos.map((c) => (
            <div key={c.id} className="bg-card rounded-xl border border-card-border shadow-sm p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-sm">{c.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-foreground font-semibold text-sm">{c.name}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">{c.vaga}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Mail size={12} />{c.email}</span>
                <span className="flex items-center gap-1"><Phone size={12} />{c.phone}</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{c.local}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
