// src/pages/Dashboard.jsx
import { useState } from "react";
import moment from "moment";
import { useTransactions } from "@/hooks/useTransactions";
import { useFixedExpenses } from "@/hooks/useFixedExpenses";
import { useCardExpenses } from "@/hooks/useCardExpenses";
import { useInvestments } from "@/hooks/useInvestments";
import { useCumulativeBalance } from "@/hooks/useCumulativeBalance";
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
  
  // 🔥 Saldo acumulado até o mês anterior (verdadeiro "saldo que ficou em conta")
  const { cumulativeBalance: prevMonthBalance, loading: prevBalanceLoading } = useCumulativeBalance(prevMonth);
  // 🔥 Saldo acumulado até o mês atual
  const { cumulativeBalance: currentMonthBalance, loading: currentBalanceLoading } = useCumulativeBalance(currentMonth);

  const isLoading = transLoading || fixedLoading || cardLoading || investLoading || prevBalanceLoading || currentBalanceLoading;

  // Cálculos do mês atual
  const totalIncome = currentTransactions?.filter(t => t.type === "income")?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalExpenses = currentTransactions?.filter(t => t.type === "expense")?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalFixed = totalActiveFixed || 0;
  const totalCard = totalCards || 0;
  const totalInvested = totalInvestedInMonth || 0;

  const totalSpent = totalExpenses + totalFixed + totalCard + totalInvested;
  const currentMonthBalanceChange = totalIncome - totalSpent;

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
          label="Gastos Totais do Mês" 
          value={totalSpent} 
          icon={TrendingDown} 
          variant="expense"
          subtitle={`Variáveis: R$ ${totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} | Fixos: R$ ${totalFixed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} | Cartões: R$ ${totalCard.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} | Investimentos: R$ ${totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        />
        <StatCard 
          label="Saldo Acumulado" 
          value={currentMonthBalance} 
          icon={Wallet} 
          variant={currentMonthBalance >= 0 ? "balance" : "expense"}
          subtitle="Saldo total até o momento"
        />
        <StatCard 
          label="Saldo Mês Anterior" 
          value={prevMonthBalance} 
          icon={History} 
          variant={prevMonthBalance >= 0 ? "balance" : "default"}
          subtitle={`Saldo que ficou em conta até ${moment(prevMonth, "YYYY-MM").format("MMMM/YYYY")}`}
        />
      </div>

      {/* Explicação do Saldo */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-lg">💰</div>
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-300">Como funciona o Saldo Acumulado?</p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              O <strong>Saldo Acumulado</strong> mostra o total que você tem em conta considerando TODAS as transações desde o início.
              O <strong>Saldo Mês Anterior</strong> é o saldo acumulado até o final do mês anterior.
              Isso reflete exatamente o dinheiro que ficou em conta de um mês para o outro.
            </p>
          </div>
        </div>
      </div>

      {/* Resumo Rápido */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
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
            <p className={`text-lg font-bold ${currentMonthBalanceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {currentMonthBalanceChange.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Saldo Anterior</p>
            <p className={`text-lg font-bold ${prevMonthBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {prevMonthBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Saldo Total</p>
            <p className={`text-lg font-bold ${currentMonthBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
              R$ {currentMonthBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Exemplo visual */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
        <p className="text-sm font-medium mb-3">📊 Entenda seus números:</p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Saldo acumulado até {moment(prevMonth, "YYYY-MM").format("MMMM/YYYY")}:</span>
            <span className="font-mono">R$ {prevMonthBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="ml-4">+ Renda deste mês:</span>
            <span className="text-green-600 font-mono">+ R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="ml-4">- Gastos deste mês:</span>
            <span className="text-red-600 font-mono">- R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-medium">
            <span>= Saldo acumulado atual:</span>
            <span className={`font-mono font-bold ${currentMonthBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {currentMonthBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}