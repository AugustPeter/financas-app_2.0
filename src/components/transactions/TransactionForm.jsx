import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import moment from "moment";

const CATEGORIES = {
  income: ["Salário", "Freelance", "Investimentos", "Presentes", "Reembolso", "Outros"],
  expense: ["Alimentação", "Transporte", "Moradia", "Saúde", "Lazer", "Educação", "Compras", "Outros"]
};

export default function TransactionForm({ open, onClose, onSubmit, currentMonth, editingTransaction, isLoading = false }) {
  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "expense",
    category: "",
    date: moment().format("YYYY-MM-DD"),
  });

  const [errors, setErrors] = useState({});

  // Resetar formulário quando abrir ou editar
  useEffect(() => {
    if (open) {
      if (editingTransaction) {
        setForm({
          description: editingTransaction.description || "",
          amount: editingTransaction.amount?.toString() || "",
          type: editingTransaction.type || "expense",
          category: editingTransaction.category || "",
          date: editingTransaction.date || moment().format("YYYY-MM-DD"),
        });
      } else {
        setForm({
          description: "",
          amount: "",
          type: "expense",
          category: "",
          date: moment().format("YYYY-MM-DD"),
        });
      }
      setErrors({});
    }
  }, [open, editingTransaction]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }
    
    if (!form.amount || parseFloat(form.amount) <= 0) {
      newErrors.amount = "Valor deve ser maior que zero";
    }
    
    if (!form.category) {
      newErrors.category = "Selecione uma categoria";
    }
    
    if (!form.date) {
      newErrors.date = "Data é obrigatória";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Formatar dados para o Supabase
    const formattedData = {
      description: form.description.trim(),
      amount: parseFloat(form.amount.replace(',', '.')), // Converte para número
      type: form.type,
      category: form.category,
      date: moment(form.date).format("YYYY-MM-DD"),
      month: moment(currentMonth, "YYYY-MM").startOf('month').format("YYYY-MM-DD"),
    };
    
    console.log("Enviando dados:", formattedData); // Debug
    onSubmit(formattedData);
  };

  const availableCategories = CATEGORIES[form.type] || CATEGORIES.expense;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-inter">
            {editingTransaction ? "Editar" : "Nova"} Transação
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Supermercado, Salário, etc."
              disabled={isLoading}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Valor e Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0,00"
                disabled={isLoading}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={form.type} 
                onValueChange={(v) => {
                  setForm({ ...form, type: v, category: "" });
                }}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">💰 Renda / Receita</SelectItem>
                  <SelectItem value="expense">💸 Gasto / Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categoria e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={form.category} 
                onValueChange={(v) => setForm({ ...form, category: v })}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                disabled={isLoading}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {editingTransaction ? "Salvando..." : "Adicionando..."}
                </>
              ) : (
                editingTransaction ? "Salvar" : "Adicionar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}