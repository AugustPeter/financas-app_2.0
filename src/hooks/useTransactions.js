import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import moment from 'moment'

export function useTransactions(month) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let query = supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        if (month) {
          // Corrigir o cálculo das datas
          const startDate = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD')
          const endDate = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
          
          query = query
            .gte('month', startDate)
            .lte('month', endDate)
        }

        const { data, error: queryError } = await query

        if (queryError) {
          console.error('Erro ao buscar transações:', queryError)
          setError(queryError.message)
          setTransactions([])
        } else {
          setTransactions(data || [])
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
        setError(err.message)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [user, month])

  const addTransaction = async (transaction) => {
  if (!user) return { error: 'Usuário não autenticado' };
  
  try {
    // Garantir que todos os campos estão no formato correto
    const transactionData = {
      description: transaction.description,
      amount: Number(transaction.amount), // FORÇA SER NÚMERO
      type: transaction.type,
      category: transaction.category || null,
      date: transaction.date,
      month: transaction.month || moment().startOf('month').format('YYYY-MM-DD'),
      user_id: user.id,
    };
    
    // Remove campos undefined
    Object.keys(transactionData).forEach(key => {
      if (transactionData[key] === undefined) {
        delete transactionData[key];
      }
    });
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select();
    
    if (error) {
      console.error('Erro detalhado:', error);
      return { data: null, error };
    }
    
    return { data: data?.[0] || null, error: null };
  } catch (err) {
    console.error('Erro ao adicionar:', err);
    return { data: null, error: err.message };
  }
};

  const updateTransaction = async (id, updates) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      // Se amount for atualizado, garantir que seja número
      if (updates.amount) {
        updates.amount = Number(updates.amount)
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Segurança: garantir que pertence ao usuário
        .select()

      if (error) {
        console.error('Erro ao atualizar transação:', error)
        return { data: null, error }
      }

      if (data && data[0]) {
        setTransactions(prev => prev.map(t => t.id === id ? data[0] : t))
      }
      
      return { data: data?.[0] || null, error: null }
    } catch (err) {
      console.error('Erro inesperado ao atualizar:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteTransaction = async (id) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Segurança: garantir que pertence ao usuário

      if (error) {
        console.error('Erro ao deletar transação:', error)
        return { error }
      }

      setTransactions(prev => prev.filter(t => t.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Erro inesperado ao deletar:', err)
      return { error: err.message }
    }
  }

  // Função utilitária para calcular totais
  const getTotals = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const balance = income - expenses
    
    return { income, expenses, balance }
  }

  return { 
    transactions, 
    loading, 
    error,
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    getTotals
  }
}