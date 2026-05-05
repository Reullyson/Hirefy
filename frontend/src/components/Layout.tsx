import { Link, useLocation } from "wouter";
import { LayoutDashboard, Briefcase, Users, Settings } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Vagas", icon: Briefcase, href: "/vagas" },
  { label: "Candidato", icon: Users, href: "/candidato" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-52 flex-shrink-0 bg-sidebar flex flex-col border-r border-sidebar-border">
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">HF</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">HireFly</p>
              <p className="text-sidebar-foreground text-[10px] leading-tight mt-0.5">IFCE Campus Cedro</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {navItems.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                isActive(href)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">E</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground text-xs font-medium truncate">Empresa Demo</p>
              <p className="text-sidebar-foreground/60 text-[10px] truncate">Configurações</p>
            </div>
            <button className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
              <Settings size={13} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
