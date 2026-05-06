import { useLocation, useParams } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/services/api";
import { toast } from "sonner";

export function JobForm() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const isEditing = !!id;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    level: "JUNIOR",
    location_type: "REMOTO",
    city: "Cedro",
    state: "CE",
    contract_type: "CLT",
    workload: "40h semanais",
    salary: "",
    status: "ATIVA",
    deadline_date: "",
    description: "",
    requirements_mandatory: "",
    requirements_desirable: "",
    benefits: "",
    education_level: "Ensino Superior",
  });

  // Busca dados se estiver editando
  const { isLoading: isLoadingJob } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await jobService.getById(id);
      return response.data;
    },
    enabled: isEditing,
    onSuccess: (data) => {
      if (data) setFormData(data);
    }
  });

  const mutation = useMutation({
    mutationFn: (data: any) => 
      isEditing ? jobService.update(id!, data) : jobService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(isEditing ? "Vaga atualizada!" : "Vaga publicada!");
      setLocation("/vagas");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Erro ao salvar vaga.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isEditing && isLoadingJob) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-primary px-4 py-4 md:px-8 md:py-6 shadow-sm">
        <button
          onClick={() => setLocation("/vagas")}
          className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <h1 className="text-primary-foreground text-2xl font-semibold">
          {isEditing ? "Editar Vaga" : "Nova Vaga"}
        </h1>
        <p className="text-primary-foreground/90 text-sm mt-1">
          {isEditing
            ? "Atualize as informações da vaga"
            : "Preencha os detalhes da nova vaga"}
        </p>
      </header>

      {/* Form */}
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-sm border border-border p-4 md:p-8">
            {/* Basic Information */}
            <div className="mb-8">
              <h3 className="text-foreground text-lg font-semibold mb-6">
                Informações Básicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Título da Vaga *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="Ex: Desenvolvedor Frontend"
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Nível *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    required
                  >
                    <option value="ESTAGIO">Estágio</option>
                    <option value="JUNIOR">Júnior</option>
                    <option value="PLENO">Pleno</option>
                    <option value="SENIOR">Sênior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Modelo de Trabalho *
                  </label>
                  <select
                    value={formData.location_type}
                    onChange={(e) =>
                      setFormData({ ...formData, location_type: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    required
                  >
                    <option value="REMOTO">Remoto</option>
                    <option value="HIBRIDO">Híbrido</option>
                    <option value="PRESENCIAL">Presencial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Cidade / Estado *
                  </label>
                  <input
                    type="text"
                    value={`${formData.city}, ${formData.state}`}
                    onChange={(e) => {
                      const [city, state] = e.target.value.split(", ");
                      setFormData({ ...formData, city: city || "", state: state || "" });
                    }}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="Ex: Cedro, CE"
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Tipo de Contrato *
                  </label>
                  <select
                    value={formData.contract_type}
                    onChange={(e) =>
                      setFormData({ ...formData, contract_type: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    required
                  >
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ</option>
                    <option value="ESTAGIO">Estágio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Carga Horária
                  </label>
                  <input
                    type="text"
                    value={formData.workload}
                    onChange={(e) =>
                      setFormData({ ...formData, workload: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="Ex: 40h semanais"
                  />
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Status da Vaga *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    required
                  >
                    <option value="ATIVA">Ativa</option>
                    <option value="PAUSADA">Pausada</option>
                    <option value="ENCERRADA">Encerrada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Data Limite *
                  </label>
                  <input
                    type="date"
                    value={formData.deadline_date}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline_date: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-foreground text-lg font-semibold mb-6">
                Descrição e Requisitos
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Descrição da Vaga *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-background text-foreground"
                    placeholder="Descreva as responsabilidades..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Requisitos Obrigatórios *
                  </label>
                  <textarea
                    value={formData.requirements_mandatory}
                    onChange={(e) =>
                      setFormData({ ...formData, requirements_mandatory: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-background text-foreground"
                    placeholder="Liste os requisitos necessários..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Benefícios
                  </label>
                  <textarea
                    value={formData.benefits}
                    onChange={(e) =>
                      setFormData({ ...formData, benefits: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-background text-foreground"
                    placeholder="Liste os benefícios oferecidos..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center justify-end gap-4 pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => setLocation("/vagas")}
                className="px-6 py-3 text-foreground border border-border rounded-lg hover:bg-muted transition-colors w-full md:w-auto text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={mutation.isLoading}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity shadow-sm font-medium w-full md:w-auto text-center flex items-center justify-center gap-2"
              >
                {mutation.isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Publicar Vaga"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
