import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: "emerald" | "red" | "blue" | "amber";
}

const colorMap = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "bg-emerald-100 text-emerald-600" },
  red: { bg: "bg-red-50", text: "text-red-700", icon: "bg-red-100 text-red-600" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "bg-blue-100 text-blue-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", icon: "bg-amber-100 text-amber-600" },
};

export function SummaryCard({ label, value, icon: Icon, color }: SummaryCardProps) {
  const c = colorMap[color];
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={cn("mt-1 text-2xl font-bold", c.text)}>{value}</p>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", c.icon)}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
