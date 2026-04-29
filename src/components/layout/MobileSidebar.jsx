// src/components/layout/MobileSidebar.jsx
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  TrendingUp, 
  CreditCard,
  X,
  Moon,
  Sun,
  LogOut
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { path: "/", label: "Painel", icon: LayoutDashboard },
  { path: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { path: "/gastos-fixos", label: "Gastos Fixos", icon: Wallet },
  { path: "/investimentos", label: "Investimentos", icon: TrendingUp },
  { path: "/cartoes", label: "Cartões", icon: CreditCard },
];

export default function MobileSidebar({ open, onClose }) {
  const { isDark, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-50 h-full w-64 bg-sidebar-background text-sidebar-foreground lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">$</span>
            </div>
            <span className="font-bold text-lg">Finanças</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Dark Mode Toggle - Mobile */}
        <div className="px-4 py-2 border-t border-sidebar-border">
          <button
            onClick={() => {
              toggleTheme();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
          >
            {isDark ? (
              <>
                <Sun className="w-5 h-5" />
                <span className="font-medium">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span className="font-medium">Modo Escuro</span>
              </>
            )}
          </button>
        </div>

        {/* Botão Sair - Mobile */}
        <div className="px-4 py-2 border-t border-sidebar-border">
          <button
            onClick={() => {
              handleLogout();
              onClose();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <div className="text-xs text-sidebar-foreground/60 text-center">
            Finanças Pessoais
          </div>
        </div>
      </aside>
    </>
  );
}