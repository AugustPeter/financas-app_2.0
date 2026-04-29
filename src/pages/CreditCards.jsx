// src/pages/CreditCards.jsx
import { useState, useEffect } from 'react';
import { Plus, CreditCard, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import CreditCardForm from '@/components/creditCards/CreditCardForm';
import CardExpenseForm from '@/components/cardExpenses/CardExpenseForm';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import moment from 'moment';

export default function CreditCards() {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [allCardsTotals, setAllCardsTotals] = useState({});
  const [loadingTotals, setLoadingTotals] = useState(false);
  
  const currentMonth = moment().format('YYYY-MM');
  const { user } = useAuth();
  const { cards, loading: cardsLoading, addCreditCard, updateCreditCard, deleteCreditCard } = useCreditCards();
  
  // Hook para despesas do cartão selecionado (chamado no topo do componente)
  const { 
    expenses: selectedCardExpenses, 
    loading: expensesLoading, 
    totalExpenses: selectedCardTotal,
    addCardExpense,
    deleteCardExpense 
  } = useCardExpenses(selectedCardId, currentMonth);

  // 🔹 Buscar os totais de TODOS os cartões (sem usar hooks dentro de loops)
  useEffect(() => {
    const fetchAllCardsTotals = async () => {
      if (!user || cards.length === 0) return;
      
      setLoadingTotals(true);
      try {
        const startDate = moment(currentMonth, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
        const endDate = moment(currentMonth, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
        
        const { data, error } = await supabase
          .from('card_expenses')
          .select('card_id, amount')
          .eq('user_id', user.id)
          .gte('month', startDate)
          .lte('month', endDate);
        
        if (error) throw error;
        
        // Agrupar totais por card_id
        const totals = {};
        data?.forEach(expense => {
          const cardId = expense.card_id;
          totals[cardId] = (totals[cardId] || 0) + Number(expense.amount);
        });
        
        setAllCardsTotals(totals);
      } catch (error) {
        console.error('Erro ao buscar totais dos cartões:', error);
      } finally {
        setLoadingTotals(false);
      }
    };
    
    fetchAllCardsTotals();
  }, [user, cards, currentMonth]); // Executa quando usuário, cartões ou mês mudar

  // Selecionar o primeiro cartão automaticamente
  useEffect(() => {
    if (cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  const selectedCard = cards.find(c => c.id === selectedCardId);

  const handleAddCard = async (cardData) => {
    const result = await addCreditCard(cardData);
    if (!result.error) {
      setShowCardForm(false);
      if (result.data) setSelectedCardId(result.data.id);
    } else {
      alert('Erro ao adicionar cartão: ' + (result.error.message || result.error));
    }
  };

  const handleUpdateCard = async (cardData) => {
    const result = await updateCreditCard(editingCard.id, cardData);
    if (!result.error) {
      setShowCardForm(false);
      setEditingCard(null);
    } else {
      alert('Erro ao atualizar cartão: ' + (result.error.message || result.error));
    }
  };

  const handleDeleteCard = async (id) => {
    if (confirm('Tem certeza que deseja excluir este cartão? As despesas vinculadas também serão removidas.')) {
      const result = await deleteCreditCard(id);
      if (!result.error) {
        if (selectedCardId === id) {
          const remainingCards = cards.filter(c => c.id !== id);
          setSelectedCardId(remainingCards[0]?.id || null);
        }
      } else {
        alert('Erro ao excluir cartão: ' + (result.error.message || result.error));
      }
    }
  };

  const handleAddExpense = async (expenseData) => {
    const result = await addCardExpense(expenseData);
    if (!result.error && result.data) {
      setShowExpenseForm(false);
      // Atualizar o total do cartão localmente após adicionar
      setAllCardsTotals(prev => ({
        ...prev,
        [expenseData.card_id]: (prev[expenseData.card_id] || 0) + expenseData.amount
      }));
    } else if (result.error) {
      alert('Erro ao adicionar despesa: ' + (result.error.message || result.error));
    }
  };

  const handleDeleteExpense = async (id, cardId, amount) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      const result = await deleteCardExpense(id);
      if (!result.error) {
        // Atualizar o total do cartão localmente após deletar
        setAllCardsTotals(prev => ({
          ...prev,
          [cardId]: Math.max(0, (prev[cardId] || 0) - amount)
        }));
      }
    }
  };

  if (cardsLoading || loadingTotals) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Cartões de Crédito</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus cartões e faturas</p>
        </div>
        <Button onClick={() => setShowCardForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Cartão
        </Button>
      </div>

      {/* Grid de Cartões */}
      {cards.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
          <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 mb-2">Nenhum cartão cadastrado</p>
          <p className="text-sm text-gray-500 mb-4">Clique em "Novo Cartão" para começar</p>
          <Button onClick={() => setShowCardForm(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Criar primeiro cartão
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => {
            const cardTotal = allCardsTotals[card.id] || 0;
            return (
              <div
                key={card.id}
                className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white cursor-pointer transition-all ${
                  selectedCardId === card.id ? 'ring-2 ring-green-500 shadow-lg' : 'hover:ring-2 hover:ring-gray-600'
                }`}
                onClick={() => setSelectedCardId(card.id)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-sm text-gray-400">CARTÃO DE CRÉDITO</p>
                    <p className="text-xl font-bold">{card.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCard(card);
                        setShowCardForm(true);
                      }}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-400">• • • • • • • • • • {card.last4 || '****'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Fatura atual</p>
                    <p className="text-xl font-bold">
                      R$ {cardTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Limite disponível</p>
                    <p className="text-xl font-bold text-green-400">
                      R$ {(card.limit_amount - cardTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detalhe da Fatura do Cartão Selecionado */}
      {selectedCard && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Fatura - {selectedCard.name}</h2>
              <p className="text-sm text-gray-400">
                Total: R$ {selectedCardTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • 
                Vence dia {selectedCard.due_day || 10}
              </p>
            </div>
            <Button onClick={() => setShowExpenseForm(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Compra
            </Button>
          </div>

          {expensesLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-3 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : selectedCardExpenses.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              Nenhuma compra registrada neste cartão
            </div>
          ) : (
            <div className="space-y-3">
              {selectedCardExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-xs text-gray-400">
                      {moment(expense.month).format('DD/MM')} • {expense.category || 'Sem categoria'}
                      {expense.installments > 1 && ` • ${expense.current_installment}/${expense.installments}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">
                      R$ {expense.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <button
                      onClick={() => handleDeleteExpense(expense.id, expense.card_id, expense.amount)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Formulários */}
      <CreditCardForm
        open={showCardForm}
        onClose={() => {
          setShowCardForm(false);
          setEditingCard(null);
        }}
        onSubmit={editingCard ? handleUpdateCard : handleAddCard}
        editingCard={editingCard}
      />

      <CardExpenseForm
        open={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onSubmit={handleAddExpense}
        currentMonth={currentMonth}
        selectedCardId={selectedCardId}
        cards={cards}
      />
    </div>
  );
}