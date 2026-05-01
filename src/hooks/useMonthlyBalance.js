// src/hooks/useMonthlyBalance.js
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import moment from 'moment'

export function useMonthlyBalance(month) {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchMonthlyBalance = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const startDate = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD')
        const endDate = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
        
        // 1. Buscar transações do mês
        const { data: transactions, error: transError } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate)

        if (transError) throw transError

        // 2. Buscar gastos fixos ATIVOS do mês
        const { data: fixedExpenses, error: fixedError } = await supabase
          .from('fixed_expenses')
          .select('amount')
          .eq('user_id', user.id)
          .eq('active', true)

        if (fixedError) throw fixedError

        // 3. Buscar despesas de cartão do mês
        const { data: cardExpenses, error: cardError } = await supabase
          .from('card_expenses')
          .select('amount')
          .eq('user_id', user.id)
          .gte('month', startDate)
          .lte('month', endDate)

        if (cardError) throw cardError

        // 4. Buscar investimentos do mês
        const { data: investments, error: invError } = await supabase
          .from('investments')
          .select('amount')
          .eq('user_id', user.id)
          .gte('purchase_date', startDate)
          .lte('purchase_date', endDate)

        if (invError) throw invError

        // Calcular saldo do mês
        const totalIncome = (transactions || [])
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const totalExpenses = (transactions || [])
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const totalFixed = (fixedExpenses || [])
          .reduce((sum, f) => sum + Number(f.amount), 0)

        const totalCard = (cardExpenses || [])
          .reduce((sum, c) => sum + Number(c.amount), 0)

        const totalInvested = (investments || [])
          .reduce((sum, i) => sum + Number(i.amount), 0)

        const totalSpent = totalExpenses + totalFixed + totalCard + totalInvested
        const monthlyBalance = totalIncome - totalSpent

        console.log(`=== Saldo do mês ${month} ===`)
        console.log(`Receitas: R$ ${totalIncome}`)
        console.log(`Despesas variáveis: R$ ${totalExpenses}`)
        console.log(`Gastos fixos: R$ ${totalFixed}`)
        console.log(`Cartões: R$ ${totalCard}`)
        console.log(`Investimentos: R$ ${totalInvested}`)
        console.log(`Total gasto: R$ ${totalSpent}`)
        console.log(`Saldo líquido: R$ ${monthlyBalance}`)
        
        setBalance(monthlyBalance)
      } catch (err) {
        console.error('Erro inesperado:', err)
        setError(err.message)
        setBalance(0)
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyBalance()
  }, [user, month])

  return { balance, loading, error }
}