// src/hooks/useMonthlyBalanceSimple.js
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import moment from 'moment'

export function useMonthlyBalanceSimple(month) {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchMonthBalance = async () => {
      const startDate = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD')
      const endDate = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)

      const { data: fixedExpenses } = await supabase
        .from('fixed_expenses')
        .select('amount')
        .eq('user_id', user.id)
        .eq('active', true)

      const { data: cardExpenses } = await supabase
        .from('card_expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('month', startDate)
        .lte('month', endDate)

      const { data: investments } = await supabase
        .from('investments')
        .select('amount')
        .eq('user_id', user.id)
        .gte('purchase_date', startDate)
        .lte('purchase_date', endDate)

      const income = (transactions || []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
      const expenses = (transactions || []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
      const fixed = (fixedExpenses || []).reduce((s, f) => s + Number(f.amount), 0)
      const cards = (cardExpenses || []).reduce((s, c) => s + Number(c.amount), 0)
      const invested = (investments || []).reduce((s, i) => s + Number(i.amount), 0)

      const monthBalance = income - (expenses + fixed + cards + invested)
      setBalance(monthBalance)
      setLoading(false)
    }

    fetchMonthBalance()
  }, [user, month])

  return { balance, loading }
}