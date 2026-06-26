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
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0 group hover:bg-gray-50/60 transition-colors cursor-default">
      {/* Left: date + description */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">
          {transaction.description ?? transaction.type}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{formatDate(transaction.createdAt)}</p>
      </div>

      {/* Center: status */}
      <div className="hidden sm:block flex-shrink-0">
        <span className={`
          inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
          ${transaction.status === "SUCCESS"
            ? "bg-green-50 text-green-700 border border-green-200"
            : transaction.status === "PENDING"
            ? "bg-amber-50 text-amber-700 border border-amber-200"
            : transaction.status === "FAILED"
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-gray-100 text-gray-600 border border-gray-200"
          }
        `}>
          {statusLabel[transaction.status] ?? transaction.status}
        </span>
      </div>

      {/* Right: amount */}
      <div className="flex-shrink-0 text-right">
        <p className={`
          text-sm font-semibold tabular-nums
          ${isCredit ? "text-gray-900" : "text-gray-900"}
        `}>
          {isCredit ? "+" : "-"}{formatCurrency(transaction.amount)}
        </p>
      </div>
    </div>
  );
}
