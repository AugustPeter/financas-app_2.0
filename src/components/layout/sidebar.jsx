import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  TrendingUp, 
  CreditCard,
  ChevronLeft,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { path: "/", label: "Painel", icon: LayoutDashboard },
  { path: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { path: "/gastos-fixos", label: "Gastos Fixos", icon: Wallet },
  { path: "/investimentos", label: "Investimentos", icon: TrendingUp },
  { path: "/cartoes", label: "Cartões", icon: CreditCard },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className={`
      hidden lg:flex lg:flex-col
      bg-sidebar-background text-sidebar-foreground
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-64'}
      min-h-screen sticky top-0
    `}>
      <div className={`
        flex items-center h-16 px-4 border-b border-sidebar-border
        ${isCollapsed ? 'justify-center' : 'justify-between'}
      `}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">$</span>
            </div>
            <span className="font-bold text-lg">Finanças</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">$</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                ${isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : ""}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Botão Sair */}
      <div className="px-3 mb-4">
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg
            hover:bg-red-500/10 hover:text-red-500
            transition-all w-full
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        {!isCollapsed ? (
          <div className="text-xs text-sidebar-foreground/60 text-center">
            Finanças Pessoais
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto bg-sidebar-accent rounded-lg flex items-center justify-center">
            <span className="text-xs">💰</span>
          </div>
        )}
      </div>
    </aside>
  );
}