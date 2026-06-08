import Link from "next/link";
import { LayoutDashboard, Users, Briefcase, Heart, UserCircle, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AppSidebar() {
  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Directory", href: "/directorio/estudiantes", icon: Users },
    { label: "Jobs", href: "/posiciones", icon: Briefcase },
    { label: "Donations", href: "/donaciones", icon: Heart },
    { label: "Profile", href: "/cv", icon: UserCircle },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-border flex flex-col z-20">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">EXALUMNOS UCR</h1>
        <p className="text-sm text-muted-foreground mt-1">Impacto y Legado</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 space-y-2 border-t border-border mt-auto">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-slate-100">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-slate-100 mb-4">
          <HelpCircle className="mr-2 h-4 w-4" />
          Help
        </Button>
        <Button className="w-full bg-[#005eb8] hover:bg-[#004a94] text-white">
          Start a Project
        </Button>
      </div>
    </aside>
  );
}
