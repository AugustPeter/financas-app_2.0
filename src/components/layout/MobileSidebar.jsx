// src/components/layout/MobileSidebar.jsx
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  TrendingUp, 
  CreditCard,
  X,
  LogOut
} from "lucide-react";
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
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay escuro */}
      <div 
        className="fixed inset-0 bg-black/70 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar - CORES SÓLIDAS, sem transparência */}
      <aside className="fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white shadow-xl lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">$</span>
            </div>
            <span className="font-bold text-lg text-white">Finanças</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-4 space-y-1 bg-gray-900">
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
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Botão Sair */}
        <div className="px-4 py-2 border-t border-gray-700 bg-gray-900">
          <button
            onClick={() => {
              handleLogout();
              onClose();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-gray-300 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900 mt-auto">
          <div className="text-xs text-gray-500 text-center">
            Finanças Pessoais
          </div>
        </div>
      </aside>
    </>
  );
}