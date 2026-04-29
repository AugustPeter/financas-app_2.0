// src/components/layout/AppLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated && location.pathname !== '/login') {
      console.log('Usuário não autenticado, redirecionando para login');
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate, location.pathname]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderizar o layout
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">$</span>
            </div>
            <span className="font-bold text-foreground">Finanças</span>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}