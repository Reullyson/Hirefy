import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  FaEye,
  FaEyeSlash,
  FaMapMarkerAlt,
  FaUserEdit,
  FaChartLine,
  FaHandshake,
  FaPaperPlane,
} from "react-icons/fa";
import Alert from "./components/Alert";
import LoadingOverlay from "./components/LoadingOverlay";
import { authService, userService } from "@/services/api";
import { toast } from "sonner";

const LoginPage = () => {
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: "error" | "success" | "info";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectByUserType = (userType?: string) => {
    const normalized = (userType || "").toUpperCase();

    if (normalized === "ADMIN") {
      setLocation("/admin");
      return;
    }

    if (normalized === "RECRUTADOR") {
      setLocation("/empresa");
      return;
    }

    setLocation("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setAlert({ message: "Por favor, preencha e-mail e senha", type: "error" });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await authService.login({ email, password });
      const { access, refresh } = response.data;

      localStorage.setItem("hirefy_access_token", access);
      localStorage.setItem("hirefy_refresh_token", refresh);

      const meResponse = await userService.getMe();
      const user = meResponse.data;

      localStorage.setItem("hirefy_user_type", user?.user_type || "");
      localStorage.setItem("hirefy_user_name", user?.nome || "");
      localStorage.setItem("hirefy_user_email", user?.email || "");

      if (!rememberMe) {
        sessionStorage.setItem("hirefy_session_login", "true");
      }

      toast.success("Bem-vindo ao Hirefy!");
      redirectByUserType(user?.user_type);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        "Erro ao realizar login. Verifique suas credenciais.";
      setAlert({ message: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: FaMapMarkerAlt,
      title: "Oportunidades Locais e Externas",
      description:
        "Vagas nativas e integração com Gupy para mais possibilidades.",
    },
    {
      icon: FaUserEdit,
      title: "Gestão de Perfil",
      description:
        "Destaque suas competências, experiências e conquistas acadêmicas.",
    },
    {
      icon: FaChartLine,
      title: "Processo Simplificado",
      description:
        "Acompanhe todas as etapas da sua candidatura em um só lugar.",
    },
    {
      icon: FaHandshake,
      title: "Conexão com Empresas",
      description:
        "Empresas parceiras do IFCE buscando talentos como você.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LoadingOverlay visible={loading} message="Entrando..." />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
          flex: 1,
          width: "100%",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #059669 0%, #0F172A 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
            }}
          >
            <FaPaperPlane /> Hirefy
          </div>
          <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
            Conectando talentos a oportunidades
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="hidden md:block">
            <h2 style={{ fontSize: "2rem", color: "#0F172A", marginBottom: "1rem" }}>
              Bem-vindo ao Hirefy
            </h2>
            <p
              style={{
                color: "#475569",
                lineHeight: 1.6,
                marginBottom: "2rem",
              }}
            >
              A plataforma oficial de vagas e candidaturas do IFCE Campus Cedro.
              Conectamos estudantes de Sistemas de Informação às melhores
              oportunidades do mercado.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
              }}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    background: "#F8FAFC",
                    padding: "1rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#05966910",
                      borderRadius: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <feature.icon style={{ fontSize: "1.25rem", color: "#059669" }} />
                  </div>
                  <h4 style={{ fontSize: "1rem", color: "#0F172A", marginBottom: "0.5rem" }}>
                    {feature.title}
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "#F8FAFC",
              padding: "2rem",
              borderRadius: "1rem",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ fontSize: "1.5rem", color: "#0F172A", marginBottom: "0.5rem" }}>
              Entrar na sua conta
            </h3>
            <div
              style={{
                color: "#64748b",
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
              }}
            >
              Acesse sua conta para continuar
            </div>

            {alert && (
              <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert(null)}
              />
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#0F172A",
                    marginBottom: "0.375rem",
                  }}
                >
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@ifce.edu.br"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    background: "#F8FAFC",
                    color: "#0F172A",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#0F172A",
                    marginBottom: "0.375rem",
                  }}
                >
                  Senha
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      paddingRight: "2.5rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      background: "#F8FAFC",
                      color: "#0F172A",
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      color: "#64748b",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  margin: "1rem 0 1.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    color: "#475569",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: "#059669" }}
                  />
                  Lembrar-me
                </label>

                <Link
                  href="/esqueceu-senha"
                  style={{
                    color: "#059669",
                    textDecoration: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "#059669",
                  color: "#F8FAFC",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginBottom: "1rem",
                }}
              >
                Entrar
              </button>
            </form>

            <div
              style={{
                textAlign: "center",
                fontSize: "0.875rem",
                color: "#64748b",
              }}
            >
              Ainda não tem uma conta?{" "}
              <Link
                href="/cadastro"
                style={{
                  color: "#059669",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Cadastre-se
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          color: "#94a3b8",
          fontSize: "0.75rem",
          borderTop: "1px solid #e2e8f0",
          marginTop: "3rem",
        }}
      >
        © 2024 Hirefy - IFCE Campus Cedro. Todos os direitos reservados.
      </div>
    </div>
  );
};

export default LoginPage;