import { Briefcase, Search, GraduationCap, LayoutDashboard, User, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { JobList } from "./components/JobList";

export function Dashboard() {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Olá, Estudante!</h1>
        <p className="text-gray-600">Encontre sua próxima oportunidade de estágio ou emprego.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* ... (cards unchanged) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Search className="text-blue-600 w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Explorar Vagas</h3>
          <p className="text-gray-500 text-sm mb-4">Veja todas as vagas disponíveis no IFCE e parceiros.</p>
          <Link href="/vagas" className="text-blue-600 font-medium text-sm hover:underline">Ver vagas →</Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Briefcase className="text-green-600 w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Minhas Candidaturas</h3>
          <p className="text-gray-500 text-sm mb-4">Acompanhe o status das vagas que você se candidatou.</p>
          <Link href="/minhas-vagas" className="text-green-600 font-medium text-sm hover:underline">Ver status →</Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <GraduationCap className="text-purple-600 w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Meu Perfil</h3>
          <p className="text-gray-500 text-sm mb-4">Mantenha seu currículo e certificados atualizados.</p>
          <Link href="/perfil" className="text-purple-600 font-medium text-sm hover:underline">Editar perfil →</Link>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Vagas Recentes</h2>
          <Link href="/vagas" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium">
            Ver todas as vagas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <JobList />
      </section>
    </div>
  );
}
