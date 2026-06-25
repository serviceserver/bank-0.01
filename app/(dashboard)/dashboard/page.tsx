// app/(dashboard)/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { getUserAccounts } from "@/lib/services/account.service";
import { getTransactionHistory } from "@/lib/services/transaction.service";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { StatCard } from "@/components/shared/StatCard";
import { AccountCard } from "@/components/shared/AccountCard";
import { TransactionRow } from "@/components/shared/TransactionRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Account, Transaction } from "@/lib/interface";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const accounts = await getUserAccounts(session.user.id);

    // Pull recent transactions across all accounts
    const recentTxns = accounts.length > 0
        ? await getTransactionHistory(accounts[0].id, session.user.id, {
            limit: 5,
            page: 1,
        })
        : null;

    const totalBalance = accounts.reduce(
        (sum: number, acc: Account) => sum + Number(acc.balance),
        0
    );

    return (
        <PageWrapper role={session.user.role as "CUSTOMER" | "ADMIN"}
            userName={session.user.name ?? session.user.email ?? ""}>

            <TopBar
                title={`Good day, ${session.user.name?.split(" ")[0]} 👋`}
                subtitle="Here's your financial overview"
                action={
                    <Link href="/dashboard/transfer">
                        <Button size="sm">New Transfer</Button>
                    </Link>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard
                    label="Total Balance"
                    value={formatCurrency(totalBalance)}
                    sub="Across all accounts"
                    accent
                />
                <StatCard
                    label="Accounts"
                    value={String(accounts.length)}
                    sub="Active accounts"
                />
                <StatCard
                    label="Recent Transactions"
                    value={String(recentTxns?.pagination.total ?? 0)}
                    sub="In your primary account"
                />
            </div>

            {/* Accounts */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-800">Your Accounts</h2>
                    <Link href="/dashboard/accounts"
                        className="text-xs text-blue-600 hover:underline">
                        View all
                    </Link>
                </div>

                {accounts.length === 0 ? (
                    <EmptyState
                        title="No accounts yet"
                        description="Open your first account to get started."
                        action={
                            <Link href="/dashboard/accounts">
                                <Button size="sm" variant="secondary">Open Account</Button>
                            </Link>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {accounts.map((account: Account) => (
                            <Link key={account.id} href={`/dashboard/accounts/${account.id}`}>
                                <AccountCard
                                    accountNumber={account.accountNumber}
                                    type={account.type}
                                    balance={account.balance.toString()}
                                    status={account.status}
                                />
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Transactions */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-800">
                        Recent Transactions
                    </h2>
                    <Link href="/dashboard/transactions"
                        className="text-xs text-blue-600 hover:underline">
                        View all
                    </Link>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl px-5">
                    {!recentTxns || recentTxns.transactions.length === 0 ? (
                        <EmptyState
                            title="No transactions yet"
                            description="Your transaction history will appear here."
                        />
                    ) : (
                        recentTxns.transactions.map((txn: Transaction) => (
                            <TransactionRow
                                key={txn.id}
                                transaction={txn as Transaction}
                                accountId={accounts[0].id}
                            />
                        ))
                    )}
                </div>
            </div>
        </PageWrapper>
    );
}