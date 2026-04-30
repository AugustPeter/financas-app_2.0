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
        
        // Buscar TODAS as transações até o final do mês selecionado
        const endDate = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
        
        const { data, error: queryError } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id)
          .lte('date', endDate)

        if (queryError) {
          console.error('Erro ao buscar saldo acumulado:', queryError)
          setError(queryError.message)
          setCumulativeBalance(0)
        } else {
          // Calcular saldo acumulado
          const balance = (data || []).reduce((sum, t) => {
            if (t.type === 'income') {
              return sum + Number(t.amount)
            } else {
              return sum - Number(t.amount)
            }
          }, 0)
          
          setCumulativeBalance(balance)
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
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