import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function OverviewChart({ transactions }) {
  const categoryTotals = {};
  transactions
    .filter((t) => t.type === "gasto")
    .forEach((t) => {
      const cat = t.category || "Outros";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    });

  const data = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, total]) => ({ name, total }));

  if (data.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Gastos por Categoria</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(value) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Total"]}
            />
            <Bar dataKey="total" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}