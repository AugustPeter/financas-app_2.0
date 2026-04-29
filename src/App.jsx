// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { AuthProvider } from '@/lib/AuthContext'
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';
import FixedExpenses from '@/pages/FixedExpenses';
import Investments from '@/pages/Investments';
import CreditCards from '@/pages/CreditCards';
import Login from '@/pages/Login';
import PageNotFound from './lib/PageNotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transacoes" element={<Transactions />} />
        <Route path="/gastos-fixos" element={<FixedExpenses />} />
        <Route path="/investimentos" element={<Investments />} />
        <Route path="/cartoes" element={<CreditCards />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App