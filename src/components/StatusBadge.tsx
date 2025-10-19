import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning text-warning-foreground" },
  approved: { label: "Approved", className: "bg-success text-success-foreground" },
  in_progress: { label: "In Progress", className: "bg-secondary text-secondary-foreground" },
  completed: { label: "Completed", className: "bg-success text-success-foreground" },
  rejected: { label: "Rejected", className: "bg-destructive text-destructive-foreground" },
  active: { label: "Active", className: "bg-success text-success-foreground" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground" },
  accepted: { label: "Accepted", className: "bg-success text-success-foreground" },
  assigned: { label: "Assigned", className: "bg-secondary text-secondary-foreground" },
  cancelled: { label: "Cancelled", className: "bg-destructive text-destructive-foreground" },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status] || { label: status, className: "" };
  
  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};
