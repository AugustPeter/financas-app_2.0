// src/pages/Investments.jsx
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useInvestments } from '@/hooks/useInvestments';
import moment from 'moment';

const INVESTMENT_TYPES = [
  { value: 'fixed_income', label: 'Renda Fixa' },
  { value: 'stocks', label: 'Ações' },
  { value: 'real_estate', label: 'Imóveis' },
  { value: 'crypto', label: 'Criptomoedas' },
  { value: 'poupanca', label: 'Poupança' },
  { value: 'others', label: 'Outros' },
];

export default function Investments() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'fixed_income',
    amount: '',
    purchase_date: moment().format('YYYY-MM-DD'),
    broker: '',
    notes: ''
  });
  
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { 
    investments, 
    loading, 
    totalInvestedAllTime,
    totalCurrentValue,
    totalProfitability,
    addInvestment,
    updateInvestment,
    deleteInvestment 
  } = useInvestments();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      name: form.name,
      type: form.type,
      amount: parseFloat(form.amount),
      purchase_date: form.purchase_date,
      broker: form.broker || null,
      notes: form.notes || null,
    };
    
    let result;
    if (editing) {
      result = await updateInvestment(editing.id, data);
    } else {
      result = await addInvestment(data);
    }
    
    if (!result.error) {
      setShowForm(false);
      setEditing(null);
      setForm({
        name: '',
        type: 'fixed_income',
        amount: '',
        purchase_date: moment().format('YYYY-MM-DD'),
        broker: '',
        notes: ''
      });
      queryClient.invalidateQueries({ queryKey: ['investments'] });
    } else {
      alert('Erro ao salvar investimento: ' + result.error.message);
    }
  };

  const openEdit = (investment) => {
    setEditing(investment);
    setForm({
      name: investment.name,
      type: investment.type,
      amount: String(investment.amount),
      purchase_date: investment.purchase_date || moment().format('YYYY-MM-DD'),
      broker: investment.broker || '',
      notes: investment.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
      const result = await deleteInvestment(id);
      if (!result.error) {
        queryClient.invalidateQueries({ queryKey: ['investments'] });
      } else {
        alert('Erro ao excluir investimento: ' + result.error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investimentos</h1>
          <p className="text-sm text-muted-foreground">Gerencie sua carteira de investimentos</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Investimento
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Investido</p>
          <p className="text-2xl font-bold">
            R$ {totalInvestedAllTime.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Valor Atual</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {totalCurrentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            *Calculado com 1% ao mês
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Rentabilidade Total</p>
          <p className={`text-2xl font-bold ${totalProfitability >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalProfitability >= 0 ? '+' : ''}{totalProfitability.toFixed(2)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalProfitability >= 0 ? 'Lucro' : 'Prejuízo'} de R$ {Math.abs(totalCurrentValue - totalInvestedAllTime).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Projeção */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800 rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-blue-300">Projeção para 12 meses</p>
            <p className="text-2xl font-bold text-blue-400">
              R$ {(totalCurrentValue * Math.pow(1.01, 12)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-purple-300">Projeção para 24 meses</p>
            <p className="text-2xl font-bold text-purple-400">
              R$ {(totalCurrentValue * Math.pow(1.01, 24)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Rentabilidade mensal</p>
            <p className="text-lg font-semibold text-green-400">+1% ao mês</p>
          </div>
        </div>
      </div>

      {/* Lista de investimentos */}
      {investments.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum investimento cadastrado</p>
          <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" /> Adicionar primeiro investimento
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          {investments.map((inv) => (
            <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-muted/50 transition-colors">
              
              {/* Lado esquerdo - informações */}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">{inv.name}</p>
                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                    {INVESTMENT_TYPES.find(t => t.value === inv.type)?.label || 'Outros'}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                  {inv.broker && <span>🏦 {inv.broker}</span>}
                  <span>📅 {moment(inv.purchase_date).format('DD/MM/YYYY')}</span>
                </div>
              </div>
              
              {/* Lado direito - valores */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="text-right min-w-[120px]">
                  <p className="text-xs text-muted-foreground">Investido</p>
                  <p className="text-sm font-medium">
                    R$ {Number(inv.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="text-right min-w-[120px]">
                  <p className="text-xs text-muted-foreground">Valor Atual</p>
                  <p className="text-sm font-semibold text-green-600">
                    R$ {Number(inv.current_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="text-right min-w-[100px]">
                  <p className="text-xs text-muted-foreground">Rentabilidade</p>
                  <div className="flex items-center justify-end gap-1">
                    {inv.total_return >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-500" />
                    )}
                    <p className={`text-sm font-semibold ${inv.total_return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {inv.total_return >= 0 ? '+' : ''}{inv.total_return?.toFixed(2)}%
                    </p>
                  </div>
                </div>
                
                {/* Botões */}
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => openEdit(inv)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(inv.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário Modal */}
      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          setShowForm(false);
          setEditing(null);
          setForm({
            name: '',
            type: 'fixed_income',
            amount: '',
            purchase_date: moment().format('YYYY-MM-DD'),
            broker: '',
            notes: ''
          });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar Investimento' : 'Novo Investimento'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Investimento *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Tesouro Selic, PETR4, CDB Banco X"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Valor Investido (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data da Compra</Label>
                <Input
                  type="date"
                  value={form.purchase_date}
                  onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Usado para calcular rentabilidade
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Corretora</Label>
                <Input
                  value={form.broker}
                  onChange={(e) => setForm({ ...form, broker: e.target.value })}
                  placeholder="Ex: XP, Rico, Nubank"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Observações</Label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 min-h-[80px] text-sm"
                placeholder="Notas adicionais sobre o investimento..."
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editing ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}