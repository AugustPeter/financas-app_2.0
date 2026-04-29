import React, { useState, useEffect } from 'react'; 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFixedExpenses } from "@/hooks/useFixedExpenses";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

export default function FixedExpenses() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ description: "", amount: "", category: "", due_day: "" });
  
  const { user } = useAuth();
  const { 
    expenses, 
    loading, 
    addFixedExpense, 
    updateFixedExpense, 
    deleteFixedExpense,
    toggleActive,
    totalActiveFixed 
  } = useFixedExpenses();

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ description: "", amount: "", category: "", due_day: "" });
  };

  // =======================
  // 💾 CREATE / UPDATE
  // =======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name: form.description,  // Use 'name' em vez de 'description' para o banco
      amount: parseFloat(form.amount),
      category: form.category || null,
      due_day: form.due_day ? parseInt(form.due_day) : null,
      active: true,
    };

    if (editing) {
      await updateFixedExpense(editing.id, data);
    } else {
      await addFixedExpense(data);
    }

    closeForm();
  };

  // =======================
  // 🗑️ DELETE
  // =======================
  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir este gasto fixo?")) {
      await deleteFixedExpense(id);
    }
  };

  // =======================
  // 🔁 TOGGLE ACTIVE
  // =======================
  const handleToggleActive = async (id, currentActive) => {
    await toggleActive(id, currentActive);
  };

  const openEdit = (exp) => {
    setEditing(exp);
    setForm({
      description: exp.name,  // Mapear 'name' do banco para 'description' do form
      amount: String(exp.amount),
      category: exp.category || "",
      due_day: exp.due_day || "",
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-inter text-foreground">
            Gastos Fixos
          </h1>
          <p className="text-sm text-muted-foreground">
            Total mensal:{" "}
            <span className="font-semibold text-destructive">
              R$ {totalActiveFixed.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setForm({ description: "", amount: "", category: "", due_day: "" });
            setShowForm(true);
          }}
          className="rounded-xl gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Gasto Fixo
        </Button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <Pin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Nenhum gasto fixo cadastrado
          </p>
          <Button 
            onClick={() => setShowForm(true)} 
            variant="outline" 
            className="mt-4"
          >
            Adicionar primeiro gasto fixo
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <Switch
                  checked={exp.active !== false}
                  onCheckedChange={(v) => handleToggleActive(exp.id, exp.active)}
                />

                <div className={exp.active === false ? "opacity-50" : ""}>
                  <p className="text-sm font-medium text-foreground">
                    {exp.name}
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {exp.category && <span>{exp.category}</span>}
                    {exp.due_day && (
                      <span>• Vence dia {exp.due_day}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-destructive">
                  R$ {exp.amount?.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(exp)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDelete(exp.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar" : "Novo"} Gasto Fixo
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Ex: Aluguel, Internet, Academia"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                placeholder="0,00"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  placeholder="Ex: Moradia, Transporte"
                />
              </div>

              <div className="space-y-2">
                <Label>Dia de Vencimento</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={form.due_day}
                  onChange={(e) =>
                    setForm({ ...form, due_day: e.target.value })
                  }
                  placeholder="Dia do mês"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {editing ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}