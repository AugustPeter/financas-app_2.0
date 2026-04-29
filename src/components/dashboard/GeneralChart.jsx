// src/components/dashboard/SimpleChart.jsx (versão alternativa mais simples)
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/lib/ThemeContext';

export default function SimpleChart({ income, expenses, investments, balance }) {
  const { isDark } = useTheme();

  const data = [
    { name: 'Renda', valor: income, cor: '#22c55e' },
    { name: 'Despesas', valor: expenses, cor: '#ef4444' },
    { name: 'Invest.', valor: investments, cor: '#8b5cf6' },
    { name: 'Saldo', valor: balance, cor: balance >= 0 ? '#22c55e' : '#ef4444' },
  ];

  const textColor = isDark ? '#e5e7eb' : '#1f2937';

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-center">Resumo do Mês</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
          <XAxis type="number" tick={{ fill: textColor }} />
          <YAxis type="category" dataKey="name" tick={{ fill: textColor }} width={80} />
          <Tooltip 
            formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: '8px' }}
          />
          <Bar dataKey="valor" radius={[0, 8, 8, 0]}>
            {data.map((entry, idx) => (
              <Bar key={idx} dataKey="valor" fill={entry.cor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}