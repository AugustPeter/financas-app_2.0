import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

export default function MonthSelector({ currentMonth, onChange }) {
  const date = moment(currentMonth, "YYYY-MM");

  const prev = () => onChange(date.clone().subtract(1, "month").format("YYYY-MM"));
  const next = () => onChange(date.clone().add(1, "month").format("YYYY-MM"));

  const monthLabel = date.format("MMMM [de] YYYY").replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={prev} className="h-9 w-9 rounded-xl">
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm font-semibold text-foreground min-w-[160px] text-center">
        {monthLabel}
      </span>
      <Button variant="outline" size="icon" onClick={next} className="h-9 w-9 rounded-xl">
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}