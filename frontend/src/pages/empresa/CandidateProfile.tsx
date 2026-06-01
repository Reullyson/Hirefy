import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/api";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Award,
  FileText,
  Loader2,
  Github,
  Linkedin,
  Globe,
  Trophy
} from "lucide-react";
import { useState } from "react";

export function CandidateProfile() {
  const { id } = useParams();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await userService.getUserById(id);
      return response.data;
    },
    enabled: !!id
  });

  const [evaluation, setEvaluation] = useState({
    status: "pending" as "pending" | "approved" | "rejected",
    technicalScore: 0,
    communicationScore: 0,
    culturalFitScore: 0,
    notes: "",
  });

  const handleSaveEvaluation = () => {
    alert("Avaliação salva localmente (Mock). Para alterar o status real, utilize a página da vaga.");
  };

  const getStatusColor = (status: typeof evaluation.status) => {
    const colors = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      approved: "bg-primary/10 text-primary border-primary/20",
      rejected: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[status];
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Candidato não encontrado.</p>
        <button onClick={() => window.history.back()} className="text-primary hover:underline mt-4 block mx-auto">Voltar</button>
      </div>
    );
  }

  const name = user.full_name || user.nome || "Candidato";
  const skillsList = user.skills ? user.skills.split(",").map((s: string) => s.trim()) : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-primary px-4 py-4 md:px-8 md:py-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors cursor-pointer"
            title="Voltar"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-primary-foreground text-2xl font-semibold">Perfil do Candidato</h1>
            <p className="text-primary-foreground/90 text-sm mt-1">
              Visualização completa do currículo do aluno
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Candidate Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="bg-primary/5 h-24"></div>
              <div className="px-4 pb-6 md:px-8">
                <div className="flex items-start gap-6 -mt-12">
                  <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-3xl font-bold border-4 border-card shadow-lg">
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 mt-12">
                    <h2 className="text-foreground text-2xl font-bold">
                      {name}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Aluno(a) de Graduação
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 text-foreground">
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-sm">{user.city || "Cidade não informada"}</span>
                  </div>
                  {user.github_url && (
                    <a href={user.github_url} target="_blank" className="flex items-center gap-3 text-primary hover:underline">
                      <Github className="w-5 h-5" />
                      <span className="text-sm">GitHub Profile</span>
                    </a>
                  )}
                  {user.linkedin_url && (
                    <a href={user.linkedin_url} target="_blank" className="flex items-center gap-3 text-primary hover:underline">
                      <Linkedin className="w-5 h-5" />
                      <span className="text-sm">LinkedIn Profile</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-6 h-6 text-primary" />
                <h3 className="text-foreground text-lg font-semibold">Dados Acadêmicos</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-xs font-bold uppercase">Matrícula</p>
                  <p className="text-foreground font-medium">{user.enrollment || "Não informada"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-bold uppercase">Semestre</p>
                  <p className="text-foreground font-medium">{user.semester ? `${user.semester}º Semestre` : "Não informado"}</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-primary" />
                <h3 className="text-foreground text-lg font-semibold">Competências</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skillsList.length > 0 ? (
                  skillsList.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Nenhuma competência informada.</p>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="w-6 h-6 text-primary" />
                <h3 className="text-foreground text-lg font-semibold">Experiência Profissional</h3>
              </div>
              <div className="space-y-6">
                {user.experiences && user.experiences.length > 0 ? (
                  user.experiences.map((exp: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <h4 className="text-foreground font-semibold">{exp.title}</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        {exp.institution} • {new Date(exp.start_date).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })} - {exp.is_current ? "Atual" : exp.end_date ? new Date(exp.end_date).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "N/I"}
                      </p>
                      <p className="text-foreground text-sm mt-2 whitespace-pre-line">
                        {exp.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">Nenhuma experiência profissional registrada.</p>
                )}
              </div>
            </div>

            {/* Courses / Certifications */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-primary" />
                <h3 className="text-foreground text-lg font-semibold">Cursos e Certificações</h3>
              </div>
              <div className="space-y-4">
                {user.courses && user.courses.length > 0 ? (
                  user.courses.map((course: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-foreground font-semibold">{course.name}</h4>
                        <p className="text-muted-foreground text-sm">{course.issuer} • {course.workload}h</p>
                        {course.certificate_url && (
                          <a href={course.certificate_url} target="_blank" className="text-primary text-xs hover:underline flex items-center gap-1 mt-1">
                            <Globe className="w-3 h-3" /> Ver certificado
                          </a>
                        )}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {new Date(course.completion_date).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">Nenhum curso ou certificação registrado.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Evaluation (Mockup for now) */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 sticky top-8">
              <h3 className="text-foreground text-lg font-semibold mb-6">
                Anotações de Recrutamento
              </h3>
              
              <div className="p-4 bg-muted rounded-lg mb-6 text-sm text-muted-foreground leading-relaxed italic">
                Utilize este espaço para suas anotações pessoais sobre o candidato durante o processo de seleção.
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-foreground text-sm font-medium mb-2">
                  Observações Internas
                </label>
                <textarea
                  value={evaluation.notes}
                  onChange={(e) =>
                    setEvaluation({ ...evaluation, notes: e.target.value })
                  }
                  rows={8}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-background text-foreground text-sm"
                  placeholder="Ex: Bom conhecimento em React, se saiu bem na entrevista técnica..."
                />
              </div>

              {/* Actions */}
              <button
                onClick={handleSaveEvaluation}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity shadow-sm font-medium"
              >
                Salvar Anotações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
