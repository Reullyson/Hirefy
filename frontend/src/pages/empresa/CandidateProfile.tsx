import { useLocation, useParams } from "wouter";
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
} from "lucide-react";
import { useState } from "react";

export function CandidateProfile() {
  const { id } = useParams();

  const [evaluation, setEvaluation] = useState({
    status: "pending" as "pending" | "approved" | "rejected",
    technicalScore: 0,
    communicationScore: 0,
    culturalFitScore: 0,
    notes: "",
  });

  const candidate = {
    id: id || "1",
    name: "Maria Silva",
    email: "maria.silva@aluno.ifce.edu.br",
    phone: "(88) 98765-4321",
    location: "Cedro, CE",
    job: "Desenvolvedor Frontend React",
    appliedAt: "2026-04-18",
    course: "Análise e Desenvolvimento de Sistemas",
    semester: "5º Semestre",
    expectedGraduation: "2026-12",
    gpa: "8.5",
    skills: [
      "React",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "Git",
      "HTML/CSS",
      "Node.js",
      "RESTful APIs",
    ],
    experience: [
      {
        title: "Desenvolvedor Web - Estágio",
        company: "TechStart Soluções",
        period: "Jan 2025 - Atual",
        description:
          "Desenvolvimento de interfaces web responsivas com React e integração com APIs RESTful.",
      },
      {
        title: "Monitor de Programação Web",
        company: "IFCE Campus Cedro",
        period: "Ago 2024 - Dez 2024",
        description:
          "Auxílio aos alunos em disciplinas de desenvolvimento web e criação de materiais didáticos.",
      },
    ],
    projects: [
      {
        name: "Sistema de Gestão Acadêmica",
        description:
          "Sistema web para gestão de notas e frequências desenvolvido como projeto final.",
        technologies: ["React", "Node.js", "PostgreSQL"],
      },
      {
        name: "E-commerce de Artesanato Local",
        description:
          "Plataforma de vendas online para artesãos locais com integração de pagamento.",
        technologies: ["React", "TypeScript", "Stripe API"],
      },
    ],
    certifications: [
      "React - The Complete Guide (Udemy)",
      "JavaScript ES6+ (Alura)",
      "Git e GitHub Essencial (Digital Innovation One)",
    ],
  };

  const handleSaveEvaluation = () => {
    alert("Avaliação salva com sucesso!");
  };

  const getStatusColor = (status: typeof evaluation.status) => {
    const colors = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      approved: "bg-primary/10 text-primary border-primary/20",
      rejected: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[status];
  };

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
              Análise detalhada e avaliação do candidato
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
              <div className="bg-secondary h-24"></div>
              <div className="px-4 pb-6 md:px-8">
                <div className="flex items-start gap-6 -mt-12">
                  <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center text-secondary text-3xl font-semibold border-4 border-card shadow-lg">
                    {candidate.name.charAt(0)}
                  </div>
                  <div className="flex-1 mt-12">
                    <h2 className="text-foreground text-2xl font-semibold">
                      {candidate.name}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Candidato para {candidate.job}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 text-foreground">
                    <Mail className="w-5 h-5 text-secondary" />
                    <span className="text-sm">{candidate.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <Phone className="w-5 h-5 text-secondary" />
                    <span className="text-sm">{candidate.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <MapPin className="w-5 h-5 text-secondary" />
                    <span className="text-sm">{candidate.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <Calendar className="w-5 h-5 text-secondary" />
                    <span className="text-sm">
                      Inscrito em{" "}
                      {new Date(candidate.appliedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-6 h-6 text-secondary" />
                <h3 className="text-foreground text-lg font-semibold">Educação</h3>
              </div>
              <div>
                <p className="text-foreground font-medium">{candidate.course}</p>
                <p className="text-muted-foreground text-sm mt-1">IFCE Campus Cedro</p>
                <div className="flex flex-wrap gap-6 mt-3 text-sm">
                  <span className="text-foreground">
                    <span className="text-muted-foreground">Semestre:</span>{" "}
                    {candidate.semester}
                  </span>
                  <span className="text-foreground">
                    <span className="text-muted-foreground">Previsão de Conclusão:</span>{" "}
                    {new Date(candidate.expectedGraduation).toLocaleDateString(
                      "pt-BR",
                      { month: "long", year: "numeric" }
                    )}
                  </span>
                  <span className="text-foreground">
                    <span className="text-muted-foreground">CR:</span> {candidate.gpa}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-foreground text-lg font-semibold mb-4">
                Competências
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-secondary/10 text-secondary rounded-lg text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="w-6 h-6 text-secondary" />
                <h3 className="text-foreground text-lg font-semibold">
                  Experiência
                </h3>
              </div>
              <div className="space-y-6">
                {candidate.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h4 className="text-foreground font-semibold">{exp.title}</h4>
                    <p className="text-muted-foreground text-sm mt-1">
                      {exp.company} • {exp.period}
                    </p>
                    <p className="text-foreground text-sm mt-2">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-secondary" />
                <h3 className="text-foreground text-lg font-semibold">Projetos</h3>
              </div>
              <div className="space-y-4">
                {candidate.projects.map((project, index) => (
                  <div key={index} className="border-l-2 border-secondary pl-4">
                    <h4 className="text-foreground font-semibold">
                      {project.name}
                    </h4>
                    <p className="text-foreground text-sm mt-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-3 py-1 bg-muted text-foreground rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-secondary" />
                <h3 className="text-foreground text-lg font-semibold">
                  Certificações
                </h3>
              </div>
              <ul className="space-y-2">
                {candidate.certifications.map((cert, index) => (
                  <li key={index} className="flex items-start gap-2 text-foreground">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></span>
                    <span className="text-sm">{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Panel - Evaluation */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 sticky top-8">
              <h3 className="text-foreground text-lg font-semibold mb-6">
                Painel de Avaliação
              </h3>

              {/* Status */}
              <div className="mb-6">
                <label className="block text-foreground text-sm font-medium mb-2">
                  Status da Candidatura
                </label>
                <select
                  value={evaluation.status}
                  onChange={(e) =>
                    setEvaluation({
                      ...evaluation,
                      status: e.target.value as typeof evaluation.status,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-lg border-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all ${getStatusColor(
                    evaluation.status
                  )}`}
                >
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>

              {/* Scores */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Habilidades Técnicas
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={evaluation.technicalScore}
                    onChange={(e) =>
                      setEvaluation({
                        ...evaluation,
                        technicalScore: Number(e.target.value),
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">0</span>
                    <span className="text-secondary font-semibold">
                      {evaluation.technicalScore}
                    </span>
                    <span className="text-muted-foreground">10</span>
                  </div>
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Comunicação
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={evaluation.communicationScore}
                    onChange={(e) =>
                      setEvaluation({
                        ...evaluation,
                        communicationScore: Number(e.target.value),
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">0</span>
                    <span className="text-secondary font-semibold">
                      {evaluation.communicationScore}
                    </span>
                    <span className="text-muted-foreground">10</span>
                  </div>
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Fit Cultural
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={evaluation.culturalFitScore}
                    onChange={(e) =>
                      setEvaluation({
                        ...evaluation,
                        culturalFitScore: Number(e.target.value),
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">0</span>
                    <span className="text-secondary font-semibold">
                      {evaluation.culturalFitScore}
                    </span>
                    <span className="text-muted-foreground">10</span>
                  </div>
                </div>
              </div>

              {/* Overall Score */}
              <div className="bg-background rounded-lg p-4 mb-6">
                <p className="text-muted-foreground text-sm mb-1">Nota Geral</p>
                <p className="text-foreground text-3xl font-semibold">
                  {(
                    (evaluation.technicalScore +
                      evaluation.communicationScore +
                      evaluation.culturalFitScore) /
                    3
                  ).toFixed(1)}
                  <span className="text-lg text-muted-foreground">/10</span>
                </p>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-foreground text-sm font-medium mb-2">
                  Observações
                </label>
                <textarea
                  value={evaluation.notes}
                  onChange={(e) =>
                    setEvaluation({ ...evaluation, notes: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-background text-foreground"
                  placeholder="Adicione suas observações sobre o candidato..."
                />
              </div>

              {/* Actions */}
              <button
                onClick={handleSaveEvaluation}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity shadow-sm font-medium"
              >
                Salvar Avaliação
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
