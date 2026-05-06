import { Link, useLocation } from "wouter";
import { LayoutDashboard, Search, Briefcase, User, LogOut } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("hirefy_access_token");
    localStorage.removeItem("hirefy_refresh_token");
    window.location.href = "/login";
  };

  const navItems = [
    { href: "/", label: "Início", icon: LayoutDashboard },
    { href: "/vagas", label: "Vagas", icon: Search },
    { href: "/minhas-vagas", label: "Minhas Vagas", icon: Briefcase },
    { href: "/perfil", label: "Perfil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-green-600">Hirefy</h1>
            <div className="hidden md:flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === item.href
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 px-4 py-2 flex justify-around items-center z-10">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-2 rounded-md ${
              location === item.href ? "text-green-600" : "text-gray-400"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
