import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { base44 } from "@/api/base44Client";
import moment from "moment";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CardInvoice({ card, currentMonth, expenses, onClose }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", date: "", category: "", installments: "1", current_installment: "1" });
  const queryClient = useQueryClient();

  const createExpense = useMutation({
    // mutationFn: (data) => base44.entities.CardExpense.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cardExpenses"] }); setShowForm(false); setForm({ description: "", amount: "", date: "", category: "", installments: "1", current_installment: "1" }); },
  });

  const deleteExpense = useMutation({
    // mutationFn: (id) => base44.entities.CardExpense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cardExpenses"] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createExpense.mutate({
      ...form,
      amount: parseFloat(form.amount),
      installments: parseInt(form.installments) || 1,
      current_installment: parseInt(form.current_installment) || 1,
      card_id: card.id,
      month: currentMonth,
    });
  };

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-inter">Fatura - {card.name}</h3>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-destructive">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            {card.due_day && <span> • Vence dia {card.due_day}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowForm(true)} size="sm" className="rounded-xl gap-1">
            <Plus className="w-3.5 h-3.5" /> Compra
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">Nenhuma compra nesta fatura</div>
      ) : (
        <div className="divide-y divide-border">
          {expenses.sort((a, b) => new Date(b.date || b.created_date) - new Date(a.date || a.created_date)).map((exp) => (
            <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-foreground">{exp.description}</p>
                <p className="text-xs text-muted-foreground">
                  {exp.date ? moment(exp.date).format("DD/MM") : ""}
                  {exp.category ? ` • ${exp.category}` : ""}
                  {exp.installments > 1 ? ` • ${exp.current_installment}/${exp.installments}x` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-destructive">R$ {exp.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteExpense.mutate(exp.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={() => setShowForm(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-inter">Nova Compra - {card.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Restaurante" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Alimentação" />
              </div>
              <div className="space-y-2">
                <Label>Parcelas</Label>
                <Input type="number" min="1" value={form.installments} onChange={(e) => setForm({ ...form, installments: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Parcela Atual</Label>
                <Input type="number" min="1" value={form.current_installment} onChange={(e) => setForm({ ...form, current_installment: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit">Adicionar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}