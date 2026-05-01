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
        
        const { data, error: queryError } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate)

        if (queryError) {
          console.error('Erro ao buscar saldo do mês:', queryError)
          setError(queryError.message)
          setBalance(0)
        } else {
          const monthlyBalance = (data || []).reduce((sum, t) => {
            if (t.type === 'income') {
              return sum + Number(t.amount)
            } else {
              return sum - Number(t.amount)
            }
          }, 0)
          
          console.log(`Saldo apenas do mês ${month}: R$ ${monthlyBalance}`)
          setBalance(monthlyBalance)
        }
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