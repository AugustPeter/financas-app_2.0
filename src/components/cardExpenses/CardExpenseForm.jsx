// src/components/cardExpenses/CardExpenseForm.jsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CATEGORIES = ["Alimentação", "Transporte", "Shopping", "Lazer", "Saúde", "Educação", "Viagem", "Outros"];

export default function CardExpenseForm({ open, onClose, onSubmit, currentMonth, selectedCardId, cards = [] }) {
  const [form, setForm] = useState({
    description: "",
    amount: "",
    card_id: selectedCardId || (cards[0]?.id || ""),
    category: "",
    installments: "1",
    notes: ""
  });

  useEffect(() => {
    if (open && selectedCardId) {
      setForm(prev => ({ ...prev, card_id: selectedCardId }));
    }
  }, [open, selectedCardId]);

  useEffect(() => {
    if (!open) {
      setForm({
        description: "",
        amount: "",
        card_id: selectedCardId || (cards[0]?.id || ""),
        category: "",
        installments: "1",
        notes: ""
      });
    }
  }, [open, selectedCardId, cards]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const expenseData = {
      description: form.description,
      amount: parseFloat(form.amount),
      card_id: form.card_id,
      category: form.category,
      installments: parseInt(form.installments),
      notes: form.notes,
      month: currentMonth
    };
    
    onSubmit(expenseData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Compra no Cartão</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Supermercado, Restaurante"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Cartão</Label>
              <Select 
                value={form.card_id} 
                onValueChange={(v) => setForm({ ...form, card_id: v })}
                disabled={cards.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cartão" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select 
                value={form.category} 
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Parcelas</Label>
              <Select 
                value={form.installments} 
                onValueChange={(v) => setForm({ ...form, installments: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,8,10,12].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num}x {num > 1 ? 'vezes' : 'vez'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}