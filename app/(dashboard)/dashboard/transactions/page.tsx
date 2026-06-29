// app/(dashboard)/dashboard/transactions/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { TransactionRow } from "@/components/shared/TransactionRow";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Account, Transaction, Pagination } from "@/lib/interface";

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  async function fetchAccounts() {
    const res = await fetch("/api/accounts");
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      setAccounts(data.data);
      setSelectedAccount(data.data[0].id);
    }
  }

  async function fetchTransactions(accountId: string, p: number) {
    setLoading(true);
    const res = await fetch(
      `/api/accounts/${accountId}/transactions?page=${p}&limit=15`
    );
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setTransactions(data.data.transactions);
      setPagination(data.data.pagination);
    }
  }

  useEffect(() => {
    async function loadAccounts() {
      await fetchAccounts();
    }

    loadAccounts();
  }, []);

  useEffect(() => {
    if (!selectedAccount) return;

    const loadTransactions = async () => {
      await Promise.resolve();
      await fetchTransactions(selectedAccount, page);
    };

    loadTransactions();
  }, [selectedAccount, page]);

  if (!session) return null;

  return (
    <PageWrapper
      role={session.user.role as "CUSTOMER" | "ADMIN"}
      userName={session.user.name ?? ""}
    >
      <TopBar title="Transactions" subtitle="Your full transaction history" />

      {/* Account Selector */}
      {accounts.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap py-6 sm:py-8">
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => { setSelectedAccount(acc.id); setPage(1); }}
              className={`
                px-3 py-1.5 rounded-lg border text-sm font-medium
                transition-colors duration-100
                ${selectedAccount === acc.id
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }
              `}
            >
              {acc.accountNumber}
            </button>
          ))}
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 sm:px-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description="Transactions on this account will appear here."
          />
        ) : (
          <>
            {transactions.map((txn) => (
              <TransactionRow
                key={txn.id}
                transaction={txn}
                accountId={selectedAccount}
              />
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between py-4
                              border-t border-gray-100 mt-2">
                <p className="text-xs text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
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
    </PageWrapper>
  );
}