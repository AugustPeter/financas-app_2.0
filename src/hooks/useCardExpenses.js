// src/hooks/useCardExpenses.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import moment from 'moment'

export function useCardExpenses(cardId = null, month = null) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const { user } = useAuth()

  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('card_expenses')
        .select(`
          *,
          credit_cards (
            id,
            name,
            bank,
            due_day,
            limit_amount
          )
        `)
        .eq('user_id', user.id)

      // Só filtrar por card_id se for um UUID válido
      if (cardId && cardId !== 'undefined' && cardId !== 'null') {
        query = query.eq('card_id', cardId)
      }

      // Filtrar por mês se fornecido
      if (month && month !== 'undefined' && month !== 'null') {
        const startDate = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD')
        const endDate = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
        query = query.gte('month', startDate).lte('month', endDate)
      }

      const { data, error: queryError } = await query.order('created_at', { ascending: false })

      if (queryError) {
        console.error('Erro ao buscar despesas:', queryError)
        setError(queryError.message)
        setExpenses([])
        setTotalExpenses(0)
      } else {
        setExpenses(data || [])
        const total = (data || []).reduce((sum, e) => sum + Number(e.amount), 0)
        setTotalExpenses(total)
      }
    } catch (err) {
      console.error('Erro inesperado:', err)
      setError(err.message)
      setExpenses([])
      setTotalExpenses(0)
    } finally {
      setLoading(false)
    }
  }, [user, cardId, month])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const addCardExpense = async (expenseData) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      const newExpense = {
        description: expenseData.description,
        amount: Number(expenseData.amount),
        card_id: expenseData.card_id,
        category: expenseData.category || null,
        month: expenseData.month ? moment(expenseData.month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD') : moment().startOf('month').format('YYYY-MM-DD'),
        installments: expenseData.installments || 1,
        current_installment: 1,
        paid: false,
        notes: expenseData.notes || null,
        user_id: user.id
      }
      
      const { data, error } = await supabase
        .from('card_expenses')
        .insert([newExpense])
        .select(`
          *,
          credit_cards (
            id,
            name,
            bank
          )
        `)

      if (error) {
        console.error('Erro ao adicionar despesa:', error)
        return { data: null, error }
      }

      if (data && data[0]) {
        setExpenses(prev => [data[0], ...prev])
        setTotalExpenses(prev => prev + Number(data[0].amount))
      }
      
      return { data: data?.[0] || null, error: null }
    } catch (err) {
      console.error('Erro inesperado ao adicionar:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteCardExpense = async (id) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      // Encontrar o valor da despesa antes de deletar
      const expenseToDelete = expenses.find(e => e.id === id)
      
      const { error } = await supabase
        .from('card_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao deletar despesa:', error)
        return { error }
      }

      setExpenses(prev => prev.filter(e => e.id !== id))
      if (expenseToDelete) {
        setTotalExpenses(prev => prev - Number(expenseToDelete.amount))
      }
      return { error: null }
    } catch (err) {
      console.error('Erro inesperado ao deletar:', err)
      return { error: err.message }
    }
  }

  return { 
    expenses, 
    loading, 
    error,
    totalExpenses,
    addCardExpense,
    deleteCardExpense,
    refetch: fetchExpenses
  }
}