import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/api";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Github, 
  Linkedin, 
  Globe, 
  Briefcase, 
  Plus, 
  Trash2, 
  Save, 
  Loader2,
  Trophy,
  Award
} from "lucide-react";

export function StudentProfilePage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({
    nome: "",
    full_name: "",
    enrollment: "",
    city: "",
    semester: 1,
    skills: "",
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
    experiences: [],
    courses: [],
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await userService.getMe();
      return response.data;
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || "",
        full_name: user.full_name || user.nome || "",
        enrollment: user.enrollment || "",
        city: user.city || "",
        semester: user.semester || 1,
        skills: user.skills || "",
        github_url: user.github_url || "",
        linkedin_url: user.linkedin_url || "",
        portfolio_url: user.portfolio_url || "",
        experiences: user.experiences || [],
        courses: user.courses || [],
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (data: any) => userService.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Erro ao atualizar perfil.");
    }
  });

  const handleAddExperience = () => {
    setFormData({
      ...formData,
      experiences: [
        ...formData.experiences,
        {
          title: "",
          institution: "",
          description: "",
          start_date: new Date().toISOString().split('T')[0],
          is_current: false,
        }
      ]
    });
  };

  const handleRemoveExperience = (index: number) => {
    const newExperiences = [...formData.experiences];
    newExperiences.splice(index, 1);
    setFormData({ ...formData, experiences: newExperiences });
  };

  const handleExperienceChange = (index: number, field: string, value: any) => {
    const newExperiences = [...formData.experiences];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    setFormData({ ...formData, experiences: newExperiences });
  };

  const handleAddCourse = () => {
    setFormData({
      ...formData,
      courses: [
        ...formData.courses,
        {
          name: "",
          issuer: "",
          workload: 0,
          completion_date: new Date().toISOString().split('T')[0],
          certificate_url: "",
        }
      ]
    });
  };

  const handleRemoveCourse = (index: number) => {
    const newCourses = [...formData.courses];
    newCourses.splice(index, 1);
    setFormData({ ...formData, courses: newCourses });
  };

  const handleCourseChange = (index: number, field: string, value: any) => {
    const newCourses = [...formData.courses];
    newCourses[index] = { ...newCourses[index], [field]: value };
    setFormData({ ...formData, courses: newCourses });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="bg-primary/5 border-b border-border px-4 py-8 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-foreground text-3xl font-bold tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            Meu Perfil
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Mantenha suas informações atualizadas para se destacar nas vagas.
          </p>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações Básicas */}
            <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="text-foreground text-lg font-semibold">Dados Acadêmicos e Básicos</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Matrícula *</label>
                  <input
                    type="text"
                    value={formData.enrollment}
                    onChange={(e) => setFormData({ ...formData, enrollment: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Cidade *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Semestre Atual *</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Competências (Skills) */}
            <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="text-foreground text-lg font-semibold">Competências (Skills)</h3>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-semibold text-foreground">Habilidades e Tecnologias (separadas por vírgula)</label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Ex: React, Node.js, Python, TypeScript, Figma..."
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground italic">
                  * Este campo é obrigatório para se candidatar às vagas.
                </p>
              </div>
            </section>

            {/* Links Sociais */}
            <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="text-foreground text-lg font-semibold">Links Profissionais</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Github className="w-4 h-4" /> GitHub
                  </label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Portfólio
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    placeholder="https://seusite.com"
                  />
                </div>
              </div>
            </section>

            {/* Experiências Profissionais */}
            <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <h3 className="text-foreground text-lg font-semibold">Experiências Profissionais</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="flex items-center gap-2 text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all text-sm font-bold border border-primary/20"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>

              {formData.experiences.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground text-sm">Nenhuma experiência adicionada.</p>
                  <p className="text-xs text-muted-foreground mt-1">* Você precisa de pelo menos uma experiência para se candidatar.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.experiences.map((exp: any, index: number) => (
                    <div key={index} className="p-4 border border-border rounded-xl bg-muted/30 space-y-4 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(index)}
                        className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Cargo / Título</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Instituição / Empresa</label>
                          <input
                            type="text"
                            value={exp.institution}
                            onChange={(e) => handleExperienceChange(index, 'institution', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Data de Início</label>
                          <input
                            type="date"
                            value={exp.start_date}
                            onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground flex items-center justify-between">
                            Data de Término
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={exp.is_current}
                                onChange={(e) => handleExperienceChange(index, 'is_current', e.target.checked)}
                                className="w-3 h-3"
                              />
                              <span className="text-[10px]">Atual</span>
                            </div>
                          </label>
                          <input
                            type="date"
                            value={exp.end_date || ""}
                            onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                            disabled={exp.is_current}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Descrição das Atividades</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background min-h-[80px]"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Cursos e Certificações */}
            <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="text-foreground text-lg font-semibold">Cursos e Certificações</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="flex items-center gap-2 text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all text-sm font-bold border border-primary/20"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>

              {formData.courses.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground text-sm">Nenhum curso adicionado.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.courses.map((course: any, index: number) => (
                    <div key={index} className="p-4 border border-border rounded-xl bg-muted/30 space-y-4 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(index)}
                        className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Nome do Curso</label>
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Instituição Emissora</label>
                          <input
                            type="text"
                            value={course.issuer}
                            onChange={(e) => handleCourseChange(index, 'issuer', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Carga Horária (horas)</label>
                          <input
                            type="number"
                            value={course.workload}
                            onChange={(e) => handleCourseChange(index, 'workload', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Data de Conclusão</label>
                          <input
                            type="date"
                            value={course.completion_date}
                            onChange={(e) => handleCourseChange(index, 'completion_date', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                            required
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Link do Certificado (opcional)</label>
                          <input
                            type="url"
                            value={course.certificate_url || ""}
                            onChange={(e) => handleCourseChange(index, 'certificate_url', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Ações Finais */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Salvar Perfil Profissional
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
