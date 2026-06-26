// app/(admin)/admin/accounts/[accountId]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import { Pagination } from "@/lib/interface";

interface AdminAccount {
  id: string;
  accountNumber: string;
  routingNumber: string;
  type: string;
  status: string;
  balance: number;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  description?: string | null;
  createdAt: string;
}

export default function AdminAccountDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const accountId = params.accountId as string;

  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;

    let isActive = true;

    void loadAccount();
    void loadTransactions();

    async function loadAccount() {
      try {
        const res = await fetch(`/api/admin/accounts/${accountId}`);
        const data = await res.json();

        if (!isActive) return;

        if (data.success) {
          setAccount(data.data);
        } else {
          setError(data.message ?? "Failed to load account.");
        }
      } catch {
        if (!isActive) return;
        setError("Network error.");
      }
    }

    async function loadTransactions() {
      try {
        const res = await fetch(
          `/api/admin/accounts/${accountId}/transactions?page=${page}&limit=20`
        );
        const data = await res.json();

        if (!isActive) return;

        setLoading(false);
        if (data.success) {
          setTransactions(data.data.transactions);
          setPagination(data.data.pagination);
        }
      } catch {
        if (!isActive) return;
        setLoading(false);
      }
    }

    return () => {
      isActive = false;
    };
  }, [accountId, page]);

  const refreshTransactions = useCallback(() => {
    setPage(1);
  }, []);

  async function handleAccountStatus(status: string) {
    if (!account) return;
    setActionLoading("status");
    try {
      const res = await fetch(`/api/admin/accounts/${accountId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setAccount({ ...account, status: data.data.status });
      } else {
        setError(data.message ?? "Failed to update account status.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCredit() {
    if (!account) return;
    const amount = prompt("Enter credit amount:");
    if (!amount || isNaN(Number(amount))) return;
    const description = prompt("Description (optional):") ?? undefined;
    setActionLoading("credit");
    try {
      const res = await fetch(`/api/admin/accounts/${accountId}/credit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), description }),
      });
      const data = await res.json();
      if (data.success) {
        setAccount({ ...account, balance: data.data.balanceAfter });
        refreshTransactions();
      } else {
        setError(data.message ?? "Failed to credit account.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDebit() {
    if (!account) return;
    const amount = prompt("Enter debit amount:");
    if (!amount || isNaN(Number(amount))) return;
    const description = prompt("Description (optional):") ?? undefined;
    setActionLoading("debit");
    try {
      const res = await fetch(`/api/admin/accounts/${accountId}/debit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), description }),
      });
      const data = await res.json();
      if (data.success) {
        setAccount({ ...account, balance: data.data.balanceAfter });
        refreshTransactions();
      } else {
        setError(data.message ?? "Failed to debit account.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  if (!session) return null;

  return (
    <PageWrapper role="ADMIN" userName={session.user.name ?? ""}>
      <button
        onClick={() => router.push("/admin/users")}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
      >
        ← Back
      </button>

      <TopBar
        title={account?.accountNumber
          ? `Account ${account.accountNumber}`
          : "Account Details"
        }
        subtitle={account?.user.fullName ?? ""}
      />

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!account ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Account Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Account Information
              </h3>
              <Badge
                variant={
                  account.status === "ACTIVE"
                    ? "success"
                    : account.status === "FROZEN"
                    ? "danger"
                    : "neutral"
                }
              >
                {account.status}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                  Account Number
                </p>
                <p className="text-slate-700 font-medium font-mono">
                  {account.accountNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                  Type
                </p>
                <p className="text-slate-700 font-medium">
                  {account.type.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                  Balance
                </p>
                <p className="text-slate-700 font-medium">
                  {formatCurrency(account.balance)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                  Created
                </p>
                <p className="text-slate-700 font-medium">
                  {formatDate(account.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                  Owner
                </p>
                <p className="text-slate-700 font-medium">{account.user.fullName}</p>
                <p className="text-xs text-gray-500">{account.user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                size="sm"
                variant="secondary"
                disabled={actionLoading === "status"}
                onClick={() =>
                  handleAccountStatus(
                    account.status === "ACTIVE" ? "FROZEN" : "ACTIVE"
                  )
                }
              >
                {account.status === "ACTIVE" ? "Freeze" : "Unfreeze"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={actionLoading === "credit"}
                onClick={handleCredit}
              >
                Credit
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={actionLoading === "debit"}
                onClick={handleDebit}
              >
                Debit
              </Button>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Transactions
              </h3>
            </div>
            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : transactions.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                description="No transactions found for this account."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-160">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {["Date", "Description", "Status", "Amount"].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3 text-xs font-medium
                                       text-gray-500 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn) => (
                        <tr
                          key={txn.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(txn.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-700 truncate max-w-xs">
                              {txn.description ?? txn.type}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                txn.status === "SUCCESS"
                                  ? "success"
                                  : txn.status === "PENDING"
                                  ? "warning"
                                  : "danger"
                              }
                            >
                              {txn.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">
                            {account &&
                            (txn.fromAccountId === account.id
                              ? "-"
                              : "+")}{" "}
                            {formatCurrency(txn.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
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
          </div>
        </>
      )}
    </PageWrapper>
  );
}