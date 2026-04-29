// src/hooks/useInvestments.js
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import moment from 'moment'

export function useInvestments(month) {
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

        // Se tiver mês, filtrar investimentos feitos naquele mês
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
          setInvestments(data || [])
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

  // Total investido no mês
  const totalInvestedInMonth = investments.reduce((sum, inv) => sum + Number(inv.amount), 0)

  // Total atual de todos investimentos
  const totalCurrentValue = investments.reduce((sum, inv) => sum + Number(inv.current_value || inv.amount), 0)
  
  // Total investido em todos os tempos
  const totalInvestedAllTime = investments.reduce((sum, inv) => sum + Number(inv.amount), 0)

  // Rentabilidade total
  const totalProfitability = totalInvestedAllTime > 0 
    ? ((totalCurrentValue - totalInvestedAllTime) / totalInvestedAllTime * 100) 
    : 0

  // Função para adicionar investimento
  const addInvestment = async (investmentData) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      const newInvestment = {
        ...investmentData,
        user_id: user.id,
        amount: Number(investmentData.amount),
        current_value: investmentData.current_value ? Number(investmentData.current_value) : Number(investmentData.amount),
        purchase_date: investmentData.purchase_date || moment().format('YYYY-MM-DD'),
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

  // Função para atualizar investimento
  const updateInvestment = async (id, updates) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      if (updates.amount) {
        updates.amount = Number(updates.amount)
      }
      if (updates.current_value) {
        updates.current_value = Number(updates.current_value)
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
        setInvestments(prev => prev.map(i => i.id === id ? data[0] : i))
      }
      
      return { data: data?.[0] || null, error: null }
    } catch (err) {
      console.error('Erro inesperado ao atualizar:', err)
      return { data: null, error: err.message }
    }
  }

  // Função para deletar investimento
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
    monthlyInvestments: investments, // Investimentos do mês
    totalInvestedInMonth,
    totalCurrentValue,
    totalInvestedAllTime,
    totalProfitability,
    loading,
    error,
    addInvestment,
    updateInvestment,
    deleteInvestment
  }
}