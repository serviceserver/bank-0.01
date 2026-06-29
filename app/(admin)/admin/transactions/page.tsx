// app/(admin)/admin/transactions/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { Pagination } from "@/lib/interface";

interface AdminTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description?: string | null;
  fromAccount?: { accountNumber: string; user: { fullName: string } } | null;
  toAccount?: { accountNumber: string; user: { fullName: string } } | null;
}

const typeLabel: Record<string, string> = {
  ACH_CREDIT:     "ACH Credit",
  ACH_DEBIT:      "ACH Debit",
  WIRE_INCOMING:  "Wire In",
  WIRE_OUTGOING:  "Wire Out",
  CHECK_DEPOSIT:  "Check Deposit",
  ATM_WITHDRAWAL: "ATM Withdrawal",
  TRANSFER:       "Transfer",
};

const statusVariant: Record<string, "success" | "danger" | "warning" | "neutral"> = {
  SUCCESS:  "success",
  FAILED:   "danger",
  PENDING:  "warning",
  REVERSED: "neutral",
};

const TransactionTypeOptions = [
  { value: "", label: "All Types" },
  { value: "ACH_CREDIT", label: "ACH Credit" },
  { value: "ACH_DEBIT", label: "ACH Debit" },
  { value: "WIRE_INCOMING", label: "Wire In" },
  { value: "WIRE_OUTGOING", label: "Wire Out" },
  { value: "CHECK_DEPOSIT", label: "Check Deposit" },
  { value: "ATM_WITHDRAWAL", label: "ATM Withdrawal" },
  { value: "TRANSFER", label: "Transfer" },
];

const TransactionStatusOptions = [
  { value: "", label: "All Statuses" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
  { value: "PENDING", label: "Pending" },
  { value: "REVERSED", label: "Reversed" },
];

export default function AdminTransactionsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function fetchTransactions(p: number) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(p),
      limit: "20",
      ...(typeFilter && { type: typeFilter }),
      ...(statusFilter && { status: statusFilter }),
    });

    const res = await fetch(`/api/admin/transactions?${params}`);
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setTransactions(data.data.transactions);
      setPagination(data.data.pagination);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchTransactions(page), 0);
    return () => clearTimeout(t);
  }, [page, typeFilter, statusFilter]);

  if (!session) return null;

  const showFrom = (tx: AdminTransaction) =>
    tx.type === "ACH_DEBIT" ||
    tx.type === "WIRE_OUTGOING" ||
    tx.type === "ATM_WITHDRAWAL" ||
    tx.type === "TRANSFER";

  const showTo = (tx: AdminTransaction) =>
    tx.type === "ACH_CREDIT" ||
    tx.type === "WIRE_INCOMING" ||
    tx.type === "CHECK_DEPOSIT" ||
    tx.type === "TRANSFER";

  return (
    <PageWrapper role="ADMIN" userName={session.user.name ?? ""}>
      <TopBar
        title="Transactions"
        subtitle="All system-wide transactions"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 py-6 sm:py-8">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm
                     text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {TransactionTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm
                     text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {TransactionStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Adjust filters to see more results."
        />
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Type", "From", "To", "Amount", "Status", "Date"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-medium
                                     text-gray-500 uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-gray-100 last:border-0
                                 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">
                          {typeLabel[tx.type] ?? tx.type}
                        </p>
                        {tx.description && (
                          <p className="text-xs text-gray-400 truncate max-w-45">
                            {tx.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {showFrom(tx) && tx.fromAccount ? (
                          <>
                            <span className="font-mono text-xs text-gray-500">
                              {tx.fromAccount.accountNumber}
                            </span>
                            <span className="text-gray-400 text-xs ml-1.5">
                              ({tx.fromAccount.user.fullName})
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {showTo(tx) && tx.toAccount ? (
                          <>
                            <span className="font-mono text-xs text-gray-500">
                              {tx.toAccount.accountNumber}
                            </span>
                            <span className="text-gray-400 text-xs ml-1.5">
                              ({tx.toAccount.user.fullName})
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-700">
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[tx.status] ?? "neutral"}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">
                Page {pagination.page} of {pagination.totalPages} -{" "}
                {pagination.total} total entries
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}
