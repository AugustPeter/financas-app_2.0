// src/pages/Investments.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import moment from 'moment';

export default function Investments() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'others',
    amount: '',
    current_value: '',
    purchase_date: '',
    broker: '',
    notes: ''
  });
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 🔹 Função para buscar investimentos do Supabase
  const fetchInvestments = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  };

  // 🔹 Query para carregar investimentos
  const { data: investments = [], isLoading } = useQuery({
    queryKey: ['investments', user?.id],
    queryFn: fetchInvestments, // ← AQUI ESTAVA FALTANDO!
    enabled: !!user,
  });

  // 🔹 Mutation para criar investimento
  const createMutation = useMutation({
    mutationFn: async (newInvestment) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('investments')
        .insert([{
          ...newInvestment,
          user_id: user.id,
          amount: Number(newInvestment.amount),
          current_value: newInvestment.current_value ? Number(newInvestment.current_value) : Number(newInvestment.amount),
          purchase_date: newInvestment.purchase_date || moment().format('YYYY-MM-DD'),
        }])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      setShowForm(false);
    },
  });

  // 🔹 Mutation para atualizar investimento
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('investments')
        .update({
          ...updates,
          amount: Number(updates.amount),
          current_value: updates.current_value ? Number(updates.current_value) : undefined,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      setShowForm(false);
      setEditing(null);
    },
  });

  // 🔹 Mutation para deletar investimento
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      name: form.name,
      type: form.type,
      amount: parseFloat(form.amount),
      current_value: form.current_value ? parseFloat(form.current_value) : null,
      purchase_date: form.purchase_date,
      broker: form.broker || null,
      notes: form.notes || null,
    };
    
    if (editing) {
      updateMutation.mutate({ id: editing.id, updates: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEdit = (investment) => {
    setEditing(investment);
    setForm({
      name: investment.name,
      type: investment.type,
      amount: String(investment.amount),
      current_value: investment.current_value ? String(investment.current_value) : '',
      purchase_date: investment.purchase_date || '',
      broker: investment.broker || '',
      notes: investment.notes || '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({
      name: '',
      type: 'others',
      amount: '',
      current_value: '',
      purchase_date: '',
      broker: '',
      notes: ''
    });
  };

  // Calcular totais
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + Number(inv.current_value || inv.amount), 0);
  const totalProfitability = totalInvested > 0 
    ? ((totalCurrentValue - totalInvested) / totalInvested * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-inter text-foreground">Investimentos</h1>
          <p className="text-sm text-muted-foreground">Gerencie sua carteira de investimentos</p>
        </div>
        
        <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Novo Investimento
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Investido</p>
          <p className="text-2xl font-bold">R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Valor Atual</p>
          <p className="text-2xl font-bold">R$ {totalCurrentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Rentabilidade</p>
          <p className={`text-2xl font-bold ${totalProfitability >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalProfitability >= 0 ? '+' : ''}{totalProfitability.toFixed(2)}%
          </p>
        </div>
      </div>

      {investments.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum investimento cadastrado</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          {investments.map((inv) => (
            <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium">{inv.name}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{inv.type}</span>
                  {inv.broker && <span>• {inv.broker}</span>}
                  {inv.purchase_date && <span>• {moment(inv.purchase_date).format('DD/MM/YYYY')}</span>}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm">Investido: R$ {Number(inv.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className={`text-sm font-semibold ${Number(inv.current_value || inv.amount) >= Number(inv.amount) ? 'text-green-600' : 'text-red-600'}`}>
                    Atual: R$ {Number(inv.current_value || inv.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <Button variant="ghost" size="icon" onClick={() => openEdit(inv)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(inv.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário de Investimento */}
      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Novo'} Investimento</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Investimento *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Tesouro Direto, Ações Petrobras"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2"
                >
                  <option value="fixed_income">Renda Fixa</option>
                  <option value="stocks">Ações</option>
                  <option value="real_estate">Imóveis</option>
                  <option value="crypto">Criptomoedas</option>
                  <option value="poupanca">Poupança</option>
                  <option value="others">Outros</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Data da Compra</Label>
                <Input
                  type="date"
                  value={form.purchase_date}
                  onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
              
              <div className="space-y-2">
                <Label>Valor Atual (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.current_value}
                  onChange={(e) => setForm({ ...form, current_value: e.target.value })}
                  placeholder="0,00"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Corretora</Label>
              <Input
                value={form.broker}
                onChange={(e) => setForm({ ...form, broker: e.target.value })}
                placeholder="Ex: XP, Rico, Nubank"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Observações</Label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 min-h-[80px]"
                placeholder="Notas adicionais..."
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeForm}>
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