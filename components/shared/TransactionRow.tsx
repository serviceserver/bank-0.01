// components/shared/TransactionRow.tsx

import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import { getTransactionDirection } from "@/lib/utils/transactionMeta";

interface TransactionRowProps {
  transaction: {
    id: string;
    type: string;
    status: string;
    amount: string | number;
    description?: string | null;
    createdAt: string | Date;
    fromAccountId?: string | null;
    toAccountId?: string | null;
  };
  accountId: string;
}

const statusLabel: Record<string, string> = {
  SUCCESS:  "Success",
  PENDING:  "Pending",
  FAILED:   "Failed",
  REVERSED: "Reversed",
};

export function TransactionRow({ transaction, accountId }: TransactionRowProps) {
  const direction = getTransactionDirection(transaction as any, accountId);
  const isCredit = direction === "credit";

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-border last:border-0 group hover:bg-secondary transition-colors cursor-default">
      {/* Left: date + description */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {transaction.description ?? transaction.type}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(transaction.createdAt)}</p>
      </div>

      {/* Center: status */}
      <div className="hidden sm:block flex-shrink-0">
        <span className={`
          inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
          ${transaction.status === "SUCCESS"
            ? "bg-success/10 text-success border border-success/30"
            : transaction.status === "PENDING"
            ? "bg-warning/10 text-warning border border-warning/30"
            : transaction.status === "FAILED"
            ? "bg-danger/10 text-danger border border-danger/30"
            : "bg-secondary text-muted-foreground border border-border"
          }
        `}>
          {statusLabel[transaction.status] ?? transaction.status}
        </span>
      </div>

      {/* Right: amount */}
      <div className="flex-shrink-0 text-right">
        <p className={`
          text-sm font-semibold tabular-nums
          text-foreground
        `}>
          {isCredit ? "+" : "-"}{formatCurrency(transaction.amount)}
        </p>
      </div>
    </div>
  );
}
