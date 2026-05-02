// src/pages/Dashboard.jsx
import { useState } from "react";
import { lazy, Suspense } from 'react';
import moment from "moment";
import { useTransactions } from "@/hooks/useTransactions";
import { useFixedExpenses } from "@/hooks/useFixedExpenses";
import { useCardExpenses } from "@/hooks/useCardExpenses";
import { useInvestments } from "@/hooks/useInvestments";
import { TrendingUp, TrendingDown, Wallet, BarChart3, LayoutDashboard } from "lucide-react";
import MonthSelector from "@/components/shared/MonthSelector";
import StatCard from "@/components/shared/StatCard";
import SaldoChart from "@/components/dashboard/SaldoChart";

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(moment().format("YYYY-MM"));
  const [activeTab, setActiveTab] = useState("resumo"); // "resumo" ou "grafico"
  const prevMonth = moment(currentMonth, "YYYY-MM").subtract(1, "month").format("YYYY-MM");

  // Dados do mês atual
  const { transactions: currentTransactions, loading: transLoading } = useTransactions(currentMonth);
  const { totalActiveFixed, loading: fixedLoading } = useFixedExpenses();
  const { totalExpenses: totalCards, loading: cardLoading } = useCardExpenses(null, currentMonth);
  const { totalInvestedInMonth, loading: investLoading } = useInvestments(currentMonth);
  
  // Dados do mês anterior
  const { transactions: prevTransactions, loading: prevTransLoading } = useTransactions(prevMonth);
  const { totalActiveFixed: prevTotalFixed, loading: prevFixedLoading } = useFixedExpenses();
  const { totalExpenses: prevTotalCards, loading: prevCardLoading } = useCardExpenses(null, prevMonth);
  const { totalInvestedInMonth: prevTotalInvested, loading: prevInvestLoading } = useInvestments(prevMonth);

  const isLoading = transLoading || fixedLoading || cardLoading || investLoading || 
                    prevTransLoading || prevFixedLoading || prevCardLoading || prevInvestLoading;

  // Cálculos do mês atual
  const totalIncome = currentTransactions?.filter(t => t.type === "income")?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalExpenses = currentTransactions?.filter(t => t.type === "expense")?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalFixed = totalActiveFixed || 0;
  const totalCard = totalCards || 0;
  const totalInvested = totalInvestedInMonth || 0;
  const totalSpent = totalExpenses + totalFixed + totalCard + totalInvested;
  const currentMonthBalance = totalIncome - totalSpent;

  // Cálculos do mês anterior
  const prevIncome = prevTransactions?.filter(t => t.type === "income")?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const prevExpenses = prevTransactions?.filter(t => t.type === "expense")?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const prevFixed = prevTotalFixed || 0;
  const prevCard = prevTotalCards || 0;
  const prevInvested = prevTotalInvested || 0;
  const prevTotalSpent = prevExpenses + prevFixed + prevCard + prevInvested;
  const prevMonthBalance = prevIncome - prevTotalSpent;

  const totalBalance = currentMonthBalance + prevMonthBalance;
  const SaldoChart = lazy(() => import('@/components/dashboard/SaldoChart'));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral das suas finanças
          </p>
        </div>
        <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} />
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Renda do Mês" 
          value={totalIncome} 
          icon={TrendingUp} 
          variant="income"
        />
        <StatCard 
          label="Gastos do Mês" 
          value={totalSpent} 
          icon={TrendingDown} 
          variant="expense"
          subtitle={`Variáveis: R$ ${totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} | Fixos: R$ ${totalFixed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} | Cartões: R$ ${totalCard.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} | Investimentos: R$ ${totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        />
        <StatCard 
          label="Saldo do Mês" 
          value={currentMonthBalance} 
          icon={Wallet} 
          variant={currentMonthBalance >= 0 ? "balance" : "expense"}
        />
        <StatCard 
          label="Saldo Total" 
          value={totalBalance} 
          icon={TrendingUp} 
          variant={totalBalance >= 0 ? "balance" : "expense"}
          subtitle={`Saldo do Mês + Saldo Anterior`}
        />
      </div>

      {/* 🔥 Guias */}
      <div className="border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("resumo")}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
              activeTab === "resumo" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Resumo do Mês
            </div>
          </button>
          <button
            onClick={() => setActiveTab("grafico")}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
              activeTab === "grafico" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Evolução do Saldo
            </div>
          </button>
        </div>
      </div>

      {/* Conteúdo das Guias */}
      {activeTab === "resumo" ? (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Renda do Mês</p>
              <p className="text-lg font-bold text-green-600">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gastos do Mês</p>
              <p className="text-lg font-bold text-red-600">
                R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo do Mês</p>
              <p className={`text-lg font-bold ${currentMonthBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currentMonthBalance >= 0 ? '+' : ''}R$ {currentMonthBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo Total</p>
              <p className={`text-lg font-bold ${totalBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (R$ {currentMonthBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} + R$ {prevMonthBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-4">
          <Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin" /></div>}>
  <SaldoChart currentMonth={currentMonth} />
</Suspense>
        </div>
      )}
    </div>
  );
}