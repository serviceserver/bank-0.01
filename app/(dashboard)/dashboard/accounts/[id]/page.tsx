// app/(dashboard)/dashboard/accounts/[id]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect, notFound } from "next/navigation";
import { getAccountById } from "@/lib/services/account.service";
import { getTransactionHistory } from "@/lib/services/transaction.service";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { AccountCard } from "@/components/shared/AccountCard";
import { TransactionRow } from "@/components/shared/TransactionRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import Link from "next/link";
import { Account, Transaction } from "@/lib/interface";

interface AccountDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.id) redirect("/login");

  let account: Account;
  try {
    account = await getAccountById(id, session.user.id);
  } catch (e: any) {
    if (e.message === "Unauthorized.") redirect("/dashboard");
    notFound();
  }

  let recentTxns: { transactions: Transaction[]; pagination: { total: number; page: number; totalPages: number } };
  try {
    recentTxns = await getTransactionHistory(account.id, session.user.id, {
      limit: 10,
      page: 1,
    });
  } catch {
    recentTxns = { transactions: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }

  return (
    <PageWrapper role={session.user.role as "CUSTOMER" | "ADMIN"} userName={session.user.name ?? ""}>
      <TopBar
        title="Account Details"
        subtitle={account.accountNumber}
        action={
          <Link href="/dashboard/accounts">
            <span className="text-xs text-primary hover:underline">← Back to accounts</span>
          </Link>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">

        {/* Account header section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <AccountCard
              accountNumber={account.accountNumber}
              type={account.type}
              balance={account.balance.toString()}
              status={account.status}
            />
          </div>

          <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Account Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                <p className="font-mono text-foreground tracking-widest">
                  {account.accountNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Type</p>
                <p className="text-foreground font-medium">{account.type.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-success/10 text-success border-success/30">
                  {account.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="text-foreground font-medium">
                  {new Date(account.createdAt!).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Transactions</h2>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            {recentTxns.transactions.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                description="Transactions for this account will appear here."
              />
            ) : (
              recentTxns.transactions.map((txn: Transaction) => (
                <TransactionRow
                  key={txn.id}
                  transaction={txn as Transaction}
                  accountId={account.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
