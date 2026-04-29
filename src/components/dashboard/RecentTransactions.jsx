import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RecentTransactions({ transactions }) {
  const recent = [...transactions]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 8);

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Últimas Transações</h3>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação este mês</p>
      ) : (
        <div className="space-y-3">
          {recent.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  t.type === "renda" ? "bg-primary/10" : "bg-destructive/10"
                )}>
                  {t.type === "renda" ? (
                    <ArrowDownLeft className="w-4 h-4 text-primary" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.category || "Sem categoria"}</p>
                </div>
              </div>
              <span className={cn(
                "text-sm font-semibold",
                t.type === "renda" ? "text-primary" : "text-destructive"
              )}>
                {t.type === "renda" ? "+" : "-"} R$ {t.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}