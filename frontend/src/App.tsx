import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2, AlertCircle } from "lucide-react";
import { userService } from "@/services/api";
import { useEffect } from "react";

// Telas de Empresa
import { Dashboard as CompanyDashboard } from "@/pages/empresa/Dashboard";
import { JobManagement } from "@/pages/empresa/JobManagement";
import { JobForm } from "@/pages/empresa/JobForm";
import { JobDetails } from "@/pages/empresa/JobDetails";
import { CandidateManagement } from "@/pages/empresa/CandidateManagement";
import { CandidateProfile } from "@/pages/empresa/CandidateProfile";
import { CompanySettings } from "@/pages/empresa/CompanySettings";
import { Layout as CompanyLayout } from "@/pages/empresa/Layout";

// Telas de Aluno
import { Dashboard as StudentDashboard } from "@/pages/aluno/Dashboard";
import { Vagas as StudentVagas } from "@/pages/aluno/Vagas";
import { Layout as StudentLayout } from "@/pages/aluno/Layout";
import { MinhasVagas as StudentMinhasVagasPage } from "@/pages/aluno/MinhasVagas";
import { StudentProfilePage } from "@/pages/aluno/StudentProfilePage";

// Telas de Admin
import AdminPanel from "@/pages/admin/AdminPanel";

// Telas de Autenticação
import LoginPage from "@/pages/auth/LoginPage";
import AdminLoginPage from "@/pages/auth/AdminLoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Componente de Redirecionamento simples
const Redirect = ({ to }: { to: string }) => {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  return null;
};

function AppContent() {
  const [location] = useLocation();
  const token = localStorage.getItem("hirefy_access_token");

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await userService.getMe();
      return response.data;
    },
    enabled: !!token,
  });

  // 1. Rotas Públicas (sempre acessíveis se não tiver token)
  if (!token) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/admin/login" component={AdminLoginPage} />
        <Route path="/cadastro" component={RegisterPage} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  // 2. Estado de Carregamento
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        <p className="text-gray-500 font-medium">Carregando perfil...</p>
      </div>
    );
  }

  // 3. Erro de Autenticação
  if (isError) {
    localStorage.removeItem("hirefy_access_token");
    return <Redirect to="/login" />;
  }

  // 4. Se logado, redireciona de login/cadastro para home
  if (location === "/login" || location === "/cadastro") {
    return <Redirect to="/" />;
  }

  // 5. Roteamento baseado em Cargo
  if (user?.user_type === "RECRUTADOR") {
    return (
      <CompanyLayout>
        <Switch>
          <Route path="/" component={CompanyDashboard} />
          <Route path="/vagas" component={JobManagement} />
          <Route path="/vagas/nova" component={JobForm} />
          <Route path="/vagas/editar/:id" component={JobForm} />
          <Route path="/vagas/:id" component={JobDetails} />
          <Route path="/candidatos" component={CandidateManagement} />
          <Route path="/candidatos/:id" component={CandidateProfile} />
          <Route path="/configuracoes" component={CompanySettings} />
          <Route component={NotFound} />
        </Switch>
      </CompanyLayout>
    );
  }

  if (user?.user_type === "ALUNO") {
    return (
      <StudentLayout>
        <Switch>
          <Route path="/" component={StudentDashboard} />
          <Route path="/vagas" component={StudentVagas} />
          <Route path="/vagas/:id" component={JobDetails} />
          <Route path="/minhas-vagas" component={StudentMinhasVagasPage} />
          <Route path="/perfil" component={StudentProfilePage} />
          <Route component={NotFound} />
        </Switch>
      </StudentLayout>
    );
  }

  // ROTEAMENTO DE ADMIN
  if (user?.user_type === "ADMIN") {
    return <AdminPanel />;
  }

  // Fallback para tipos desconhecidos
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Tipo de usuário não reconhecido</h2>
        <p className="text-gray-600 mb-6">Tipo: {user?.user_type || 'Nenhum'}</p>
        <button 
          onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
          className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition-colors"
        >
          Sair e tentar novamente
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <AppContent />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
