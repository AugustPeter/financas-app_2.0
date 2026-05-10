// src/hooks/useCumulativeBalance.js
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import moment from 'moment'

export function useCumulativeBalance(month) {
  const [cumulativeBalance, setCumulativeBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchCumulativeBalance = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const endDate = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
        
        const { data: transactions, error: transError } = await supabase
          .from('transactions')
          .select('type, amount, date')
          .eq('user_id', user.id)
          .lte('date', endDate)

        if (transError) throw transError

        const { data: fixedExpenses, error: fixedError } = await supabase
          .from('fixed_expenses')
          .select('amount')
          .eq('user_id', user.id)
          .eq('active', true)

        if (fixedError) throw fixedError

        const { data: cardExpenses, error: cardError } = await supabase
          .from('card_expenses')
          .select('amount, month')
          .eq('user_id', user.id)
          .lte('month', endDate)

        if (cardError) throw cardError

        const { data: investments, error: invError } = await supabase
          .from('investments')
          .select('amount, purchase_date')
          .eq('user_id', user.id)
          .lte('purchase_date', endDate)

        if (invError) throw invError

        const totalIncome = (transactions || [])
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const totalExpenses = (transactions || [])
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const firstTransactionDate = (transactions || []).reduce((min, t) => 
          t.date < min ? t.date : min, endDate
        )
        
        const startMonth = moment(firstTransactionDate).startOf('month')
        const endMonth = moment(endDate).endOf('month')
        const numberOfMonths = endMonth.diff(startMonth, 'months') + 1
        
        const monthlyFixedTotal = (fixedExpenses || []).reduce((sum, f) => sum + Number(f.amount), 0)
        const totalFixed = monthlyFixedTotal * numberOfMonths

        const totalCard = (cardExpenses || [])
          .reduce((sum, c) => sum + Number(c.amount), 0)

        const totalInvested = (investments || [])
          .reduce((sum, i) => sum + Number(i.amount), 0)

        const totalSpent = totalExpenses + totalFixed + totalCard + totalInvested
        const balance = totalIncome - totalSpent
        
        setCumulativeBalance(balance)
      } catch (err) {
        console.error('Erro ao buscar saldo acumulado:', err)
        setError(err.message)
        setCumulativeBalance(0)
      } finally {
        setLoading(false)
      }
    }

    fetchCumulativeBalance()
  }, [user, month])

  return { cumulativeBalance, loading, error }
}