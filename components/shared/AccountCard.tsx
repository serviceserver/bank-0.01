// components/shared/AccountCard.tsx

import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface AccountCardProps {
  accountNumber: string;
  type: string;
  balance: string | number;
  status: string;
  onClick?: () => void;
}

const statusVariant: Record<string, "success" | "danger" | "neutral"> = {
  ACTIVE: "success",
  FROZEN: "danger",
  CLOSED: "neutral",
};

const typeLabel: Record<string, string> = {
  CHECKING:     "Checking Account",
  SAVINGS:      "Savings Account",
  MONEY_MARKET: "Money Market",
  CD:           "CD",
};

export function AccountCard({
  accountNumber,
  type,
  balance,
  status,
  onClick,
}: AccountCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white border border-gray-200 rounded-xl p-5
        flex flex-col gap-3 shadow-sm
        ${onClick ? "cursor-pointer hover:border-slate-400 transition-colors duration-150" : ""}
      `}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {typeLabel[type] ?? type}
        </p>
        <Badge variant={statusVariant[status] ?? "neutral"}>
          {status}
        </Badge>
      </div>

      <p className="text-2xl font-bold text-slate-900">
        {formatCurrency(balance)}
      </p>

      <p className="text-sm text-gray-400 font-mono tracking-widest">
        {accountNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")}
      </p>
    </div>
  );
}