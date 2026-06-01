import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  Building2,
  Menu,
  LogOut
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService, companyService } from "@/services/api";
import { NotificationBell } from "./components/NotificationBell";

export function Layout({ children }: { children: React.ReactNode }) {
  const [locationPath] = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("hirefy_access_token");
    localStorage.removeItem("hirefy_refresh_token");
    window.location.href = "/login";
  };

  // Busca perfil do usuário para o sidebar
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await userService.getMe();
      return response.data;
    }
  });

  // Busca dados da empresa para a logo
  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const response = await companyService.getOwnCompany();
      return response.data[0] || null;
    }
  });

  const menuItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/vagas", label: "Vagas", icon: Briefcase },
    { path: "/candidatos", label: "Candidatos", icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return locationPath === "/";
    }
    return locationPath.startsWith(path);
  };

  const SidebarContent = () => (
    <>
      {/* Logo/Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center overflow-hidden">
            {company?.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-6 h-6 text-sidebar-primary-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sidebar-foreground font-semibold text-lg truncate">
              {company?.name || "Hirefy"}
            </h1>
            <p className="text-sidebar-foreground/70 text-xs truncate">
              {company?.site_url ? new URL(company.site_url).hostname : "IFCE Campus Cedro"}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / Profile & Settings */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link
          href="/configuracoes"
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group cursor-pointer ${
            isActive("/configuracoes")
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          }`}
        >
          <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center text-sidebar-primary-foreground text-sm font-medium shrink-0">
            {user?.nome?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.nome || "Carregando..."}</p>
            <p className="text-xs truncate opacity-70">Configurações</p>
          </div>
          <Settings className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-red-500/10 hover:text-red-500 transition-colors group cursor-pointer"
        >
          <LogOut className="w-5 h-5 opacity-70 group-hover:opacity-100" />
          <span className="text-sm font-medium">Sair da conta</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-sidebar border-b border-sidebar-border shrink-0">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border flex flex-col pt-10">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {company?.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
            )}
          </div>
          <h1 className="text-sidebar-foreground font-semibold truncate">
            {company?.name || "Hirefy"}
          </h1>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-sidebar hidden md:flex flex-col shrink-0 border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 bg-white border-b border-border shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Painel do Recrutador
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-8 w-[1px] bg-border mx-1" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground leading-none">{user?.nome}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">Recrutador</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
