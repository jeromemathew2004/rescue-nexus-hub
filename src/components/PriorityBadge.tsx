import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-priority-low text-white" },
  medium: { label: "Medium", className: "bg-priority-medium text-white" },
  high: { label: "High", className: "bg-priority-high text-white" },
  critical: { label: "Critical", className: "bg-priority-critical text-white" },
};

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  const config = priorityConfig[priority] || { label: priority, className: "" };
  
  return (
    <Badge className={cn("gap-1", config.className, className)}>
      <AlertCircle className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
