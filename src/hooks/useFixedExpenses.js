// src/hooks/useFixedExpenses.js
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'

export function useFixedExpenses() {  // ← Certifique-se que está com 'export function'
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchExpenses = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error: queryError } = await supabase
          .from('fixed_expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('due_day', { ascending: true })

        if (queryError) {
          console.error('Erro ao buscar gastos fixos:', queryError)
          setError(queryError.message)
          setExpenses([])
        } else {
          setExpenses(data || [])
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
        setError(err.message)
        setExpenses([])
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [user])

  // Função para adicionar gasto fixo
  const addFixedExpense = async (expenseData) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      const newExpense = {
        name: expenseData.name,
        amount: Number(expenseData.amount),
        category: expenseData.category || null,
        due_day: expenseData.due_day ? parseInt(expenseData.due_day) : null,
        active: expenseData.active !== undefined ? expenseData.active : true,
        user_id: user.id
      }
      
      const { data, error } = await supabase
        .from('fixed_expenses')
        .insert([newExpense])
        .select()

      if (error) {
        console.error('Erro ao adicionar gasto fixo:', error)
        return { data: null, error }
      }

      if (data && data[0]) {
        setExpenses(prev => [...prev, data[0]])
      }
      
      return { data: data?.[0] || null, error: null }
    } catch (err) {
      console.error('Erro inesperado ao adicionar:', err)
      return { data: null, error: err.message }
    }
  }

  // Função para atualizar gasto fixo
  const updateFixedExpense = async (id, updates) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      if (updates.amount) {
        updates.amount = Number(updates.amount)
      }
      
      const { data, error } = await supabase
        .from('fixed_expenses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Erro ao atualizar gasto fixo:', error)
        return { data: null, error }
      }

      if (data && data[0]) {
        setExpenses(prev => prev.map(e => e.id === id ? data[0] : e))
      }
      
      return { data: data?.[0] || null, error: null }
    } catch (err) {
      console.error('Erro inesperado ao atualizar:', err)
      return { data: null, error: err.message }
    }
  }

  // Função para deletar gasto fixo
  const deleteFixedExpense = async (id) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      const { error } = await supabase
        .from('fixed_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao deletar gasto fixo:', error)
        return { error }
      }

      setExpenses(prev => prev.filter(e => e.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Erro inesperado ao deletar:', err)
      return { error: err.message }
    }
  }

  // Função para alternar status ativo/inativo
  const toggleActive = async (id, currentActive) => {
    return updateFixedExpense(id, { active: !currentActive })
  }

  // Calcular total de gastos fixos ativos
  const totalActiveFixed = expenses
    .filter(e => e.active !== false)
    .reduce((sum, e) => sum + Number(e.amount), 0)

  // Calcular total de gastos fixos inativos
  const totalInactiveFixed = expenses
    .filter(e => e.active === false)
    .reduce((sum, e) => sum + Number(e.amount), 0)

  return { 
    expenses, 
    loading,
    error,
    totalActiveFixed,
    totalInactiveFixed,
    addFixedExpense, 
    updateFixedExpense, 
    deleteFixedExpense,
    toggleActive
  }
}