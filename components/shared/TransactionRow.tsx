// components/shared/TransactionRow.tsx

import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import { getTransactionDirection } from "@/lib/utils/transactionMeta";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";

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

const statusVariant: Record<string, "success" | "danger" | "warning" | "neutral"> = {
  SUCCESS: "success",
  FAILED:  "danger",
  PENDING: "warning",
  REVERSED:"neutral",
};

const typeLabel: Record<string, string> = {
  ACH_CREDIT:     "ACH Credit",
  ACH_DEBIT:      "ACH Debit",
  WIRE_INCOMING:  "Wire In",
  WIRE_OUTGOING:  "Wire Out",
  CHECK_DEPOSIT:  "Check Deposit",
  ATM_WITHDRAWAL: "ATM Withdrawal",
  TRANSFER:       "Transfer",
};

export function TransactionRow({ transaction, accountId }: TransactionRowProps) {
  const direction = getTransactionDirection(transaction as any, accountId);
  const isCredit = direction === "credit";

  return (
    <div className="flex items-center justify-between py-3.5 border-b
                    border-border last:border-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div
          className={`
            w-9 h-9 rounded-full flex items-center justify-center text-sm
            ${isCredit ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}
          `}
        >
          {isCredit ? <FiArrowDown size={14} /> : <FiArrowUp size={14} />}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {typeLabel[transaction.type] ?? transaction.type}
          </p>
          <p className="text-xs text-muted">
            {transaction.description ?? "—"}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="text-right flex flex-col gap-1 items-end">
        <p
          className={`text-sm font-semibold
            ${isCredit ? "text-success" : "text-danger"}`}
        >
          {isCredit ? "+" : "-"}{formatCurrency(transaction.amount)}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant[transaction.status] ?? "neutral"}>
            {transaction.status}
          </Badge>
          <span className="text-xs text-muted">
            {formatDate(transaction.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}