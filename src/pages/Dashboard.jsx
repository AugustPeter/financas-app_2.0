// src/pages/Dashboard.jsx
import { useState } from "react";
import moment from "moment";
import { useTransactions } from "@/hooks/useTransactions";
import { useFixedExpenses } from "@/hooks/useFixedExpenses";
import { useCardExpenses } from "@/hooks/useCardExpenses";
import { useInvestments } from "@/hooks/useInvestments";
import { useCumulativeBalance } from "@/hooks/useCumulativeBalance";
import { useMonthlyBalance } from "@/hooks/useMonthlyBalance";
import { TrendingUp, TrendingDown, Wallet, History } from "lucide-react";
import MonthSelector from "@/components/shared/MonthSelector";
import StatCard from "@/components/shared/StatCard";

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(moment().format("YYYY-MM"));
  const prevMonth = moment(currentMonth, "YYYY-MM").subtract(1, "month").format("YYYY-MM");

  const { transactions: currentTransactions, loading: transLoading } = useTransactions(currentMonth);
  const { totalActiveFixed, loading: fixedLoading } = useFixedExpenses();
  const { totalExpenses: totalCards, loading: cardLoading } = useCardExpenses(null, currentMonth);
  const { totalInvestedInMonth, loading: investLoading } = useInvestments(currentMonth);
  
  // 🔥 Saldo APENAS do mês anterior (o que ficou em conta naquele mês)
  const { balance: prevMonthBalance, loading: prevBalanceLoading } = useMonthlyBalance(prevMonth);
  
  // 🔥 Saldo acumulado total até o mês atual
  const { cumulativeBalance: currentTotalBalance, loading: currentBalanceLoading } = useCumulativeBalance(currentMonth);

  const isLoading = transLoading || fixedLoading || cardLoading || investLoading || prevBalanceLoading || currentBalanceLoading;

  // Cálculos do mês atual
  const totalIncome = currentTransactions?.filter(t => t.type === "income")?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalExpenses = currentTransactions?.filter(t => t.type === "expense")?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalFixed = totalActiveFixed || 0;
  const totalCard = totalCards || 0;
  const totalInvested = totalInvestedInMonth || 0;

  const totalSpent = totalExpenses + totalFixed + totalCard + totalInvested;
  const currentMonthBalance = totalIncome - totalSpent;

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
          label="Saldo Mês Anterior" 
          value={prevMonthBalance} 
          icon={History} 
          variant={prevMonthBalance >= 0 ? "balance" : "default"}
          subtitle={`Resultado líquido de ${moment(prevMonth, "YYYY-MM").format("MMMM/YYYY")}`}
        />
      </div>

      {/* Resumo Rápido */}
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
            <p className="text-xs text-muted-foreground">Saldo Anterior</p>
            <p className={`text-lg font-bold ${prevMonthBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {prevMonthBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}