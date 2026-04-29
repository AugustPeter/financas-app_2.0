// src/components/creditCards/CreditCardForm.jsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CreditCardForm({ open, onClose, onSubmit, editingCard }) {
  const [form, setForm] = useState({
    name: "",
    bank: "",
    limit_amount: "",
    closing_day: "",
    due_day: "",
    cashback_rate: ""
  });

  useEffect(() => {
    if (open && editingCard) {
      setForm({
        name: editingCard.name || "",
        bank: editingCard.bank || "",
        limit_amount: String(editingCard.limit_amount) || "",
        closing_day: editingCard.closing_day || "",
        due_day: editingCard.due_day || "",
        cashback_rate: editingCard.cashback_rate ? String(editingCard.cashback_rate) : ""
      });
    } else if (open && !editingCard) {
      setForm({
        name: "",
        bank: "",
        limit_amount: "",
        closing_day: "",
        due_day: "",
        cashback_rate: ""
      });
    }
  }, [open, editingCard]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const cardData = {
      name: form.name,
      bank: form.bank,
      limit_amount: parseFloat(form.limit_amount),
      closing_day: form.closing_day ? parseInt(form.closing_day) : null,
      due_day: form.due_day ? parseInt(form.due_day) : null,
      cashback_rate: form.cashback_rate ? parseFloat(form.cashback_rate) : 0,
    };
    
    onSubmit(cardData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingCard ? "Editar" : "Novo"} Cartão de Crédito
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Cartão *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Nubank, Itaú, XP"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Banco</Label>
            <Input
              value={form.bank}
              onChange={(e) => setForm({ ...form, bank: e.target.value })}
              placeholder="Ex: Nubank, Itaú, Bradesco"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Limite (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.limit_amount}
                onChange={(e) => setForm({ ...form, limit_amount: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Cashback (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.cashback_rate}
                onChange={(e) => setForm({ ...form, cashback_rate: e.target.value })}
                placeholder="0,00"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dia de Fechamento</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={form.closing_day}
                onChange={(e) => setForm({ ...form, closing_day: e.target.value })}
                placeholder="Ex: 10"
              />
              <p className="text-xs text-muted-foreground">Dia do mês que a fatura fecha</p>
            </div>
            
            <div className="space-y-2">
              <Label>Dia de Vencimento</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={form.due_day}
                onChange={(e) => setForm({ ...form, due_day: e.target.value })}
                placeholder="Ex: 25"
              />
              <p className="text-xs text-muted-foreground">Dia do mês para pagar a fatura</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingCard ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}