// src/hooks/useInvestments.js
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import moment from 'moment'
import { calculateCurrentValue, calculateTotalReturn, calculateAverageMonthlyReturn } from '@/utils/investmentCalculator'

// Taxa padrão de 1% ao mês
const DEFAULT_MONTHLY_RATE = 1;

export function useInvestments(month = null) {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchInvestments = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let query = supabase
          .from('investments')
          .select('*')
          .eq('user_id', user.id)
          .order('purchase_date', { ascending: false })

        if (month) {
          const startDate = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD')
          const endDate = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
          query = query
            .gte('purchase_date', startDate)
            .lte('purchase_date', endDate)
        }

        const { data, error: queryError } = await query

        if (queryError) {
          console.error('Erro ao buscar investimentos:', queryError)
          setError(queryError.message)
          setInvestments([])
        } else {
          // 🔥 Calcular valor atual para TODOS os investimentos baseado na data
          const investmentsWithCurrentValue = (data || []).map(inv => {
            const purchaseDate = inv.purchase_date;
            const investedAmount = Number(inv.amount);
            
            // 🔥 Calcular valor atual com 1% ao mês
            const currentValue = calculateCurrentValue(
              investedAmount,
              purchaseDate,
              new Date(),
              DEFAULT_MONTHLY_RATE
            );
            
            const totalReturn = calculateTotalReturn(investedAmount, currentValue);
            const monthlyReturn = calculateAverageMonthlyReturn(
              investedAmount, 
              currentValue, 
              purchaseDate, 
              new Date()
            );
            
            return {
              ...inv,
              current_value: currentValue,
              total_return: totalReturn,
              monthly_return: monthlyReturn,
              calculated_at: new Date().toISOString()
            };
          });
          
          setInvestments(investmentsWithCurrentValue)
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
        setError(err.message)
        setInvestments([])
      } finally {
        setLoading(false)
      }
    }

    fetchInvestments()
  }, [user, month])

  // Total investido (todos os tempos)
  const totalInvestedAllTime = investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
  
  // 🔥 Valor atual total (calculado automaticamente)
  const totalCurrentValue = investments.reduce((sum, inv) => sum + Number(inv.current_value), 0)
  
  // 🔥 Rentabilidade total
  const totalProfitability = totalInvestedAllTime > 0 
    ? ((totalCurrentValue - totalInvestedAllTime) / totalInvestedAllTime * 100) 
    : 0

  // Total investido no mês (para filtro)
  const totalInvestedInMonth = investments
    .filter(inv => {
      if (!month) return true;
      const invMonth = moment(inv.purchase_date).format('YYYY-MM');
      return invMonth === month;
    })
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const addInvestment = async (investmentData) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      const purchaseDate = investmentData.purchase_date || moment().format('YYYY-MM-DD');
      const investedAmount = Number(investmentData.amount);
      
      // Calcular valor atual com base na data de hoje
      const currentValue = calculateCurrentValue(
        investedAmount,
        purchaseDate,
        new Date(),
        DEFAULT_MONTHLY_RATE
      );
      
      const newInvestment = {
        name: investmentData.name,
        type: investmentData.type,
        amount: investedAmount,
        current_value: currentValue,
        purchase_date: purchaseDate,
        broker: investmentData.broker || null,
        notes: investmentData.notes || null,
        user_id: user.id,
      }
      
      const { data, error } = await supabase
        .from('investments')
        .insert([newInvestment])
        .select()

      if (error) {
        console.error('Erro ao adicionar investimento:', error)
        return { data: null, error }
      }

      if (data && data[0]) {
        setInvestments(prev => [data[0], ...prev])
      }
      
      return { data: data?.[0] || null, error: null }
    } catch (err) {
      console.error('Erro inesperado ao adicionar:', err)
      return { data: null, error: err.message }
    }
  }

  const updateInvestment = async (id, updates) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      if (updates.amount) {
        updates.amount = Number(updates.amount);
      }
      
      const { data, error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Erro ao atualizar investimento:', error)
        return { data: null, error }
      }

      if (data && data[0]) {
        // Recalcular valor atual após atualização
        const updated = data[0];
        const newCurrentValue = calculateCurrentValue(
          Number(updated.amount),
          updated.purchase_date,
          new Date(),
          DEFAULT_MONTHLY_RATE
        );
        
        const finalData = { ...updated, current_value: newCurrentValue };
        
        setInvestments(prev => prev.map(i => i.id === id ? finalData : i))
        return { data: finalData, error: null }
      }
      
      return { data: null, error: null }
    } catch (err) {
      console.error('Erro inesperado ao atualizar:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteInvestment = async (id) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao deletar investimento:', error)
        return { error }
      }

      setInvestments(prev => prev.filter(i => i.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Erro inesperado ao deletar:', err)
      return { error: err.message }
    }
  }

  return { 
    investments,
    totalInvestedInMonth,
    totalInvestedAllTime,
    totalCurrentValue,
    totalProfitability,
    loading,
    error,
    addInvestment,
    updateInvestment,
    deleteInvestment
  }
}