// src/hooks/useCreditCards.js
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'

export function useCreditCards() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchCards = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error: queryError } = await supabase
          .from('credit_cards')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .order('name', { ascending: true })

        if (queryError) {
          console.error('Erro ao buscar cartões:', queryError)
          setError(queryError.message)
          setCards([])
        } else {
          setCards(data || [])
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
        setError(err.message)
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [user])

  const addCreditCard = async (cardData) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      const newCard = {
        name: cardData.name,
        bank: cardData.bank || null,
        limit_amount: Number(cardData.limit_amount),
        closing_day: cardData.closing_day ? parseInt(cardData.closing_day) : null,
        due_day: cardData.due_day ? parseInt(cardData.due_day) : null,
        cashback_rate: cardData.cashback_rate ? Number(cardData.cashback_rate) : 0,
        active: true,
        user_id: user.id
      }
      
      const { data, error } = await supabase
        .from('credit_cards')
        .insert([newCard])
        .select()

      if (error) {
        console.error('Erro ao adicionar cartão:', error)
        return { data: null, error }
      }

      if (data && data[0]) {
        setCards(prev => [...prev, data[0]])
      }
      
      return { data: data?.[0] || null, error: null }
    } catch (err) {
      console.error('Erro inesperado ao adicionar:', err)
      return { data: null, error: err.message }
    }
  }

  const updateCreditCard = async (id, updates) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      if (updates.limit_amount) {
        updates.limit_amount = Number(updates.limit_amount)
      }
      if (updates.cashback_rate) {
        updates.cashback_rate = Number(updates.cashback_rate)
      }
      
      const { data, error } = await supabase
        .from('credit_cards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Erro ao atualizar cartão:', error)
        return { data: null, error }
      }

      if (data && data[0]) {
        setCards(prev => prev.map(c => c.id === id ? data[0] : c))
      }
      
      return { data: data?.[0] || null, error: null }
    } catch (err) {
      console.error('Erro inesperado ao atualizar:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteCreditCard = async (id) => {
    if (!user) return { error: 'Usuário não autenticado' }
    
    try {
      const { error } = await supabase
        .from('credit_cards')
        .update({ active: false })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao deletar cartão:', error)
        return { error }
      }

      setCards(prev => prev.filter(c => c.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Erro inesperado ao deletar:', err)
      return { error: err.message }
    }
  }

  return { 
    cards, 
    loading, 
    error,
    addCreditCard, 
    updateCreditCard, 
    deleteCreditCard
  }
}