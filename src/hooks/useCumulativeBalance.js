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
        
        // Buscar até o FINAL do mês selecionado
        const endDate = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
        
        console.log(`Buscando saldo acumulado até: ${endDate}`)
        
        const { data, error: queryError } = await supabase
          .from('transactions')
          .select('type, amount, date, description')
          .eq('user_id', user.id)
          .lte('date', endDate)
          .order('date', { ascending: true })

        if (queryError) {
          console.error('Erro ao buscar saldo:', queryError)
          setError(queryError.message)
          setCumulativeBalance(0)
        } else {
          console.log(`Encontradas ${data?.length || 0} transações até ${endDate}`)
          
          // Calcular saldo acumulado
          let balance = 0
          data?.forEach(t => {
            if (t.type === 'income') {
              balance += Number(t.amount)
            } else {
              balance -= Number(t.amount)
            }
          })
          
          console.log(`Saldo acumulado calculado para ${month}: R$ ${balance}`)
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