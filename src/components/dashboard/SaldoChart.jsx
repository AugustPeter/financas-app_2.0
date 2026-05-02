// src/components/dashboard/SaldoChart.jsx
import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

export default function SaldoChart({ currentMonth }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Buscar dados de uma vez só (mais rápido)
  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      setLoading(true);
      
      // Definir meses desde abril até o mês atual
      const startMonth = moment('2026-04-01');
      const endMonth = moment(currentMonth, 'YYYY-MM');
      const months = [];
      
      let current = startMonth.clone();
      while (current <= endMonth) {
        months.push(current.format('YYYY-MM'));
        current.add(1, 'month');
      }
      
      // Buscar TODOS os dados de uma vez (otimizado)
      const startDate = startMonth.startOf('month').format('YYYY-MM-DD');
      const endDate = endMonth.endOf('month').format('YYYY-MM-DD');
      
      // Buscar transações de uma vez
      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('type, amount, date')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);
      
      // Buscar gastos fixos
      const { data: allFixedExpenses } = await supabase
        .from('fixed_expenses')
        .select('amount')
        .eq('user_id', user.id)
        .eq('active', true);
      
      // Buscar despesas de cartão
      const { data: allCardExpenses } = await supabase
        .from('card_expenses')
        .select('amount, month')
        .eq('user_id', user.id)
        .gte('month', startDate)
        .lte('month', endDate);
      
      // Buscar investimentos
      const { data: allInvestments } = await supabase
        .from('investments')
        .select('amount, purchase_date')
        .eq('user_id', user.id)
        .gte('purchase_date', startDate)
        .lte('purchase_date', endDate);
      
      // Processar dados por mês
      const data = months.map(month => {
        const monthStart = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
        const monthEnd = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
        
        // Filtrar transações do mês
        const monthTransactions = (allTransactions || []).filter(t => 
          t.date >= monthStart && t.date <= monthEnd
        );
        
        const totalIncome = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const totalExpenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const totalFixed = (allFixedExpenses || [])
          .reduce((sum, f) => sum + Number(f.amount), 0);
        
        const totalCard = (allCardExpenses || [])
          .filter(c => c.month >= monthStart && c.month <= monthEnd)
          .reduce((sum, c) => sum + Number(c.amount), 0);
        
        const totalInvested = (allInvestments || [])
          .filter(i => i.purchase_date >= monthStart && i.purchase_date <= monthEnd)
          .reduce((sum, i) => sum + Number(i.amount), 0);
        
        const totalSpent = totalExpenses + totalFixed + totalCard + totalInvested;
        const saldo = totalIncome - totalSpent;
        
        return {
          month: moment(month, 'YYYY-MM').format('MMM/YYYY'),
          fullMonth: month,
          saldo: saldo,
          income: totalIncome,
          spent: totalSpent,
          isPositive: saldo >= 0
        };
      });
      
      setChartData(data);
      setLoading(false);
    };
    
    fetchAllData();
  }, [user, currentMonth]);

  // Tooltip customizado - sem fundo branco
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-white mb-2">{data.month}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">📊 Saldo:</span>
              <span className={`font-bold ${data.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                R$ {data.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">💰 Receitas:</span>
              <span className="text-green-500">R$ {data.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">💸 Despesas:</span>
              <span className="text-red-500">R$ {data.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Remove o efeito de hover das barras
  const onBarClick = (data) => {
    // Apenas para debug, sem hover effect
    console.log('Barra clicada:', data);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum dado disponível para o gráfico
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-foreground">Evolução do Saldo</h3>
        <p className="text-xs text-muted-foreground">
          Saldo restante por mês (Receitas - Despesas)
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={320}>
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barSize={50}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(value) => `R$ ${value}`}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={false}  // ← Remove o cursor highlight (fundo branco)
            animationDuration={100}
          />
          <Bar 
            dataKey="saldo" 
            radius={[8, 8, 0, 0]}
            onClick={onBarClick}
            animationDuration={500}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.saldo >= 0 ? '#22c55e' : '#ef4444'}
                style={{ outline: 'none' }}  // Remove outline no hover
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Resumo rápido */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-green-500/10 rounded-lg p-2.5 text-center">
          <p className="text-xs text-muted-foreground">Melhor mês</p>
          <p className="text-sm font-bold text-green-600">
            {chartData.reduce((best, current) => 
              current.saldo > best.saldo ? current : best, chartData[0]
            )?.month || '-'}
          </p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-2.5 text-center">
          <p className="text-xs text-muted-foreground">Pior mês</p>
          <p className="text-sm font-bold text-red-600">
            {chartData.reduce((worst, current) => 
              current.saldo < worst.saldo ? current : worst, chartData[0]
            )?.month || '-'}
          </p>
        </div>
      </div>
    </div>
  );
}