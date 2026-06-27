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

const typeLabel: Record<string, string> = {
  CHECKING:     "Checking",
  SAVINGS:      "Savings",
  MONEY_MARKET: "Money Market",
  CD:           "CD",
};

const statusConfig: Record<string, { label: string; class: "success" | "danger" | "neutral" | "warning" }> = {
  ACTIVE:    { label: "Active",   class: "success" },
  FROZEN:    { label: "Frozen",   class: "danger" },
  CLOSED:    { label: "Closed",   class: "neutral" },
  DORMANT:   { label: "Dormant",  class: "warning" },
};

export function AccountCard({
  accountNumber,
  type,
  balance,
  status,
  onClick,
}: AccountCardProps) {
  const displayType = typeLabel[type] ?? type;
  const statusInfo = statusConfig[status] ?? { label: status, class: "neutral" as const };
  const rawBalance = typeof balance === "string" ? Number(balance) : balance;
  const formattedBalance = formatCurrency(rawBalance);
  const masked = `.... .... .... ${accountNumber.slice(-4)}`;

  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-xl cursor-pointer
        ${onClick ? "hover:shadow-md transition-shadow duration-200" : ""}
      `}
    >
      {/* Card body */}
      <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 p-5 sm:p-6 text-foreground min-h-[170px] flex flex-col justify-between border border-border">
        {/* Decorative corner shape */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/[0.04]" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-primary/[0.03]" />

        {/* Top row */}
        <div className="relative flex items-start justify-between">
          <p className="text-xs text-muted-foreground font-medium">{displayType} Account</p>
          <Badge variant={statusInfo.class} className="bg-secondary border-border text-foreground text-[11px] px-2 py-0.5">
            {statusInfo.label}
          </Badge>
        </div>

        {/* Balance */}
        <div className="relative mt-6">
          <p className="text-[11px] text-muted-foreground mb-1">Available Balance</p>
          <p className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground">
            {formattedBalance}
          </p>
        </div>

        {/* Bottom row */}
        <div className="relative flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground font-mono tracking-widest">{masked}</p>
          {/* Small chip icon */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-5 rounded bg-gradient-to-br from-primary/60 to-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
