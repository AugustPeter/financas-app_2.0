import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { Plus, ArrowDownLeft, ArrowUpRight, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MonthSelector from "@/components/shared/MonthSelector";
import TransactionForm from "@/components/transactions/TransactionForm";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

export default function Transactions() {
  const [currentMonth, setCurrentMonth] = useState(moment().format("YYYY-MM"));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Função para buscar transações
  const fetchTransactions = async () => {
    if (!user) return [];
    
    const startDate = moment(currentMonth, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
    const endDate = moment(currentMonth, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  // Query para buscar transações
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", currentMonth, user?.id],
    queryFn: fetchTransactions,
    enabled: !!user,
  });

  // Mutation para criar transação
  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const transactionData = {
        ...data,
        user_id: user.id,
        amount: Number(data.amount),
        date: data.date || moment().format('YYYY-MM-DD'),
        month: moment(currentMonth, 'YYYY-MM').startOf('month').format('YYYY-MM-DD'),
      };
      
      const { data: result, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select();
      
      if (error) throw error;
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setShowForm(false);
    },
  });

  // Mutation para atualizar transação
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const updateData = {
        ...data,
        amount: Number(data.amount),
      };
      
      const { data: result, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      
      if (error) throw error;
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setShowForm(false);
      setEditing(null);
    },
  });

  // Mutation para deletar transação
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const handleSubmit = (data) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const income = transactions.filter((t) => t.type === "income");
  const expenses = transactions.filter((t) => t.type === "expense");

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-inter text-foreground">Transações</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas rendas e gastos</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} />
          <Button 
            onClick={() => { 
              setEditing(null); 
              setShowForm(true); 
            }} 
            className="rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" /> Nova
          </Button>
        </div>
      </div>

      {/* Resumo rápido */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-600">Total de Receitas</p>
          <p className="text-2xl font-bold text-green-700">
            R$ {income.reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">Total de Despesas</p>
          <p className="text-2xl font-bold text-red-700">
            R$ {expenses.reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <p className="text-muted-foreground">Nenhuma transação neste mês</p>
          <Button 
            onClick={() => setShowForm(true)} 
            variant="outline" 
            className="mt-4 rounded-xl"
          >
            Adicionar primeira transação
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  t.type === "income" ? "bg-green-100" : "bg-red-100"
                )}>
                  {t.type === "income" ? 
                    <ArrowDownLeft className="w-5 h-5 text-green-600" /> : 
                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.category || 'Sem categoria'}
                    {t.date && ` • ${moment(t.date).format("DD/MM")}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-sm font-bold", 
                  t.type === "income" ? "text-green-600" : "text-red-600"
                )}>
                  {t.type === "income" ? "+" : "-"} R$ {Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => { 
                    setEditing(t); 
                    setShowForm(true); 
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive" 
                  onClick={() => deleteMutation.mutate(t.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <div className="w-3.5 h-3.5 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TransactionForm
          open={showForm}
          onClose={() => { 
            setShowForm(false); 
            setEditing(null); 
          }}
          onSubmit={handleSubmit}
          currentMonth={currentMonth}
          editingTransaction={editing}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}