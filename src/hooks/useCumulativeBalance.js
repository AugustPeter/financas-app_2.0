// src/hooks/useCumulativeBalance.js
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import moment from 'moment'

export function useCumulativeBalance(month) {
  const [cumulativeBalance, setCumulativeBalance] = useState(0)
  const [monthlyBalance, setMonthlyBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchBalances = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Buscar TODAS as transações até o final do mês selecionado
        const endDate = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
        
        const { data, error: queryError } = await supabase
          .from('transactions')
          .select('type, amount, date')
          .eq('user_id', user.id)
          .lte('date', endDate)
          .order('date', { ascending: true })

        if (queryError) {
          console.error('Erro ao buscar saldo:', queryError)
          setError(queryError.message)
          setCumulativeBalance(0)
          setMonthlyBalance(0)
        } else {
          // Calcular saldo acumulado total
          const totalBalance = (data || []).reduce((sum, t) => {
            if (t.type === 'income') {
              return sum + Number(t.amount)
            } else {
              return sum - Number(t.amount)
            }
          }, 0)
          
          setCumulativeBalance(totalBalance)
          
          // Calcular apenas o saldo do mês específico (para o card "Saldo do Mês")
          const monthStart = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD')
          const monthEnd = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
          
          const monthTransactions = (data || []).filter(t => 
            t.date >= monthStart && t.date <= monthEnd
          )
          
          const monthBalanceCalc = monthTransactions.reduce((sum, t) => {
            if (t.type === 'income') {
              return sum + Number(t.amount)
            } else {
              return sum - Number(t.amount)
            }
          }, 0)
          
          setMonthlyBalance(monthBalanceCalc)
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
        setError(err.message)
        setCumulativeBalance(0)
        setMonthlyBalance(0)
      } finally {
        setLoading(false)
      }
    }

    fetchBalances()
  }, [user, month])

  return { 
    cumulativeBalance,  // Saldo acumulado até o final do mês
    monthlyBalance,     // Apenas o saldo do mês (receitas - despesas do mês)
    loading, 
    error 
  }
}