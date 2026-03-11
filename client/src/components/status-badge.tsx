import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  let className = "bg-muted text-muted-foreground"; // Default Draft
  const lower = status?.toLowerCase() || "";

  if (["paid", "completed", "accepted", "active"].includes(lower)) {
    className = "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400";
  } else if (["sent", "published"].includes(lower)) {
    className = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
  } else if (["overdue", "declined", "inactive", "rejected"].includes(lower)) {
    className = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400";
  } else if (["partially paid", "pending"].includes(lower)) {
    className = "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400";
  }

  return (
    <Badge variant="outline" className={`font-semibold capitalize ${className}`}>
      {status}
    </Badge>
  );
}
