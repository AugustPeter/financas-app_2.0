// src/components/shared/StatCard.jsx
export default function StatCard({ label, value, icon: Icon, variant = "default", subtitle, isPercentage = false }) {
  const getVariantStyles = () => {
    switch (variant) {
      case "income":
        return "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800";
      case "expense":
        return "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800";
      case "balance":
        return value >= 0 
          ? "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800"
          : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-800";
      default:
        return "bg-card border-border";
    }
  };

  const getValueStyles = () => {
    if (variant === "income") return "text-green-700 dark:text-green-400";
    if (variant === "expense") return "text-red-700 dark:text-red-400";
    if (variant === "balance") {
      if (value > 0) return "text-blue-700 dark:text-blue-400";
      if (value < 0) return "text-red-700 dark:text-red-400";
      return "text-gray-700 dark:text-gray-400";
    }
    return "text-foreground";
  };

  const formattedValue = isPercentage 
    ? `${value.toFixed(1)}%`
    : `R$ ${typeof value === 'number' ? value.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : '0,00'}`;

  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${getVariantStyles()}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon className={`w-5 h-5 ${variant === "income" ? 'text-green-600 dark:text-green-500' : variant === "expense" ? 'text-red-600 dark:text-red-500' : 'text-muted-foreground'}`} />}
      </div>
      <p className={`text-2xl font-bold ${getValueStyles()}`}>
        {formattedValue}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
      )}
    </div>
  );
}