import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function EditarVaga() {
  const [form, setForm] = useState({
    titulo: "Desenvolvedor Frontend React",
    departamento: "Tecnologia",
    modeloTrabalho: "Remoto",
    sede: "Iguatu-CE",
    tipoContrato: "Tempo Integral",
    faixaSalarial: "R$ 5.000 - R$ 8.000",
    statusVaga: "Ativa",
    limiteAplicacoes: "100",
    dataLimite: "2026-05-15",
    descricao: "",
    requisitos: "",
    beneficios: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-sidebar-primary px-6 py-4 flex-shrink-0">
        <Link href="/vagas" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-2 transition-colors cursor-pointer">
          <ArrowLeft size={14} />
          Voltar
        </Link>
        <h1 className="text-white text-xl font-bold leading-tight">Editar Vaga</h1>
        <p className="text-white/70 text-sm mt-0.5">Atualize as informações da vaga</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl">
          <div className="bg-card rounded-xl border border-card-border shadow-sm p-6 mb-5">
            <h2 className="text-foreground font-semibold text-base mb-5">Informações Básicas</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Título da Vaga <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Departamento <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.departamento}
                    onChange={(e) => handleChange("departamento", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Modelo de Trabalho <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={form.modeloTrabalho}
                    onChange={(e) => handleChange("modeloTrabalho", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all appearance-none"
                  >
                    <option>Remoto</option>
                    <option>Presencial</option>
                    <option>Híbrido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Sede da Empresa (Opcional)
                  </label>
                  <input
                    type="text"
                    value={form.sede}
                    onChange={(e) => handleChange("sede", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Tipo de Contrato <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={form.tipoContrato}
                    onChange={(e) => handleChange("tipoContrato", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all appearance-none"
                  >
                    <option>Tempo Integral</option>
                    <option>Meio Período</option>
                    <option>Freelance</option>
                    <option>Estágio</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Faixa Salarial
                  </label>
                  <input
                    type="text"
                    value={form.faixaSalarial}
                    onChange={(e) => handleChange("faixaSalarial", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Status da Vaga <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={form.statusVaga}
                    onChange={(e) => handleChange("statusVaga", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all appearance-none"
                  >
                    <option>Ativa</option>
                    <option>Pausada</option>
                    <option>Encerrada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Limite de Aplicações
                  </label>
                  <input
                    type="number"
                    value={form.limiteAplicacoes}
                    onChange={(e) => handleChange("limiteAplicacoes", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Data Limite para Aplicação <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.dataLimite}
                    onChange={(e) => handleChange("dataLimite", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-card-border shadow-sm p-6 mb-5">
            <h2 className="text-foreground font-semibold text-base mb-5">Descrição</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Descrição da Vaga <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  rows={5}
                  placeholder="Descreva as responsabilidades e atividades da vaga..."
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Requisitos
                </label>
                <textarea
                  value={form.requisitos}
                  onChange={(e) => handleChange("requisitos", e.target.value)}
                  rows={4}
                  placeholder="Liste os requisitos e qualificações necessárias..."
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Benefícios
                </label>
                <textarea
                  value={form.beneficios}
                  onChange={(e) => handleChange("beneficios", e.target.value)}
                  rows={3}
                  placeholder="Descreva os benefícios oferecidos..."
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pb-6">
            <Link href="/vagas" className="px-5 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
              Cancelar
            </Link>
            <button className="px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
