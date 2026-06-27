// app/(dashboard)/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/lib/services/admin.service";
import { getAllTransactions } from "@/lib/services/admin.service";
import { getUserAccounts } from "@/lib/services/account.service";
import { getTransactionHistory } from "@/lib/services/transaction.service";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { AccountCard } from "@/components/shared/AccountCard";
import { TransactionRow } from "@/components/shared/TransactionRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import Link from "next/link";
import { LuArrowUpDown, LuSend, LuPlus, LuBanknote } from "react-icons/lu";
import { Account, Transaction } from "@/lib/interface";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const isAdmin = session.user.role === "ADMIN";

    let accounts: Account[] = [];
    let recentTxns: { transactions: Transaction[]; pagination: { total: number; page: number; totalPages: number } } | null = null;
    let totalBalance = 0;

    if (!isAdmin) {
        accounts = await getUserAccounts(session.user.id);
        totalBalance = accounts.reduce(
            (sum: number, acc: Account) => sum + Number(acc.balance),
            0
        );

        recentTxns = accounts.length > 0
            ? await getTransactionHistory(accounts[0].id, session.user.id, {
                limit: 5,
                page: 1,
            })
            : null;
    }

    // Admin stats
    let adminUsers: Awaited<ReturnType<typeof getAllUsers>> | null = null;
    let adminTxns: Awaited<ReturnType<typeof getAllTransactions>> | null = null;
    if (isAdmin) {
        adminUsers = await getAllUsers(1, 5);
        adminTxns = await getAllTransactions(1, 5);
    }

    return (
        <PageWrapper role={session.user.role as "CUSTOMER" | "ADMIN"}
            userName={session.user.name ?? session.user.email ?? ""}>

            <DashboardHeader name={session.user.name} />

            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">

                {/* ── Quick Actions (Customer only) ────────────────────── */}
                {!isAdmin && (
                    <div className="mb-8">
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
                            <Link href="/dashboard/accounts" className="inline-flex flex-shrink-0">
                                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all whitespace-nowrap">
                                    <LuPlus size={15} /> New Account
                                </span>
                            </Link>
                            <Link href="/dashboard/transfer" className="inline-flex flex-shrink-0">
                                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all whitespace-nowrap">
                                    <LuSend size={15} /> Pay &amp; Transfer
                                </span>
                            </Link>
                            <Link href="/dashboard/transactions" className="inline-flex flex-shrink-0">
                                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all whitespace-nowrap">
                                    <LuArrowUpDown size={15} /> Activity
                                </span>
                            </Link>
                            <Link href="/dashboard/accounts" className="inline-flex flex-shrink-0">
                                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all whitespace-nowrap">
                                    <LuBanknote size={15} /> My Accounts
                                </span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* ── Total Balance (Customer) ─────────────────────────── */}
                {!isAdmin && (
                    <div className="mb-8">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                            Total Balance
                        </p>
                        <p className="text-4xl sm:text-[44px] font-bold tracking-tight text-gray-900">
                            {formatCurrency(totalBalance)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Across {accounts.length} account{accounts.length === 1 ? "" : "s"}
                        </p>
                    </div>
                )}

                {/* ── Account Cards (Customer) ─────────────────────────── */}
                {!isAdmin && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-900">Your Accounts</h2>
                            <Link href="/dashboard/accounts"
                                className="text-xs font-semibold text-[#002a5c] hover:underline">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                                {accounts.map((account) => (
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
                )}

                {/* ── Admin Stats ─────────────────────────────────────── */}
                {isAdmin && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-gray-900">Admin Overview</h2>
                            <Link href="/admin/users" className="text-xs font-semibold text-[#002a5c] hover:underline">
                                Manage Users
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <p className="text-xs text-gray-500 mb-1">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{adminUsers?.pagination.total ?? 0}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <p className="text-xs text-gray-500 mb-1">Recent Transactions</p>
                                <p className="text-2xl font-bold text-gray-900">{adminTxns?.pagination.total ?? 0}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <p className="text-xs text-gray-500 mb-1">Status</p>
                                <p className="text-lg font-semibold text-green-600 mt-1">All systems operational</p>
                            </div>
                        </div>

                        {/* Admin recent users */}
                        <div className="mt-8">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Users</h3>
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/80">
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminUsers?.users.slice(0, 5).map((user) => (
                                            <tr key={user.id} className="border-b border-gray-50 last:border-0">
                                                <td className="px-4 py-3 font-medium text-gray-900">{user.fullName}</td>
                                                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                                                <td className="px-4 py-3 text-gray-500">{user.role}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`
                                                        inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
                                                        ${user.isVerified
                                                            ? "bg-green-50 text-green-700 border border-green-200"
                                                            : "bg-amber-50 text-amber-700 border border-amber-200"}
                                                    `}>
                                                        {user.isVerified ? "Verified" : "Pending"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Recent Transactions (Customer) ───────────────────── */}
                {!isAdmin && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-900">Recent Transactions</h2>
                            <Link href="/dashboard/transactions"
                                className="text-xs font-semibold text-[#002a5c] hover:underline">
                                View all
                            </Link>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl">
                            {!recentTxns || recentTxns.transactions.length === 0 ? (
                                <EmptyState
                                    title="No transactions yet"
                                    description="Your transaction history will appear here."
                                />
                            ) : (
                                <div>
                                    {recentTxns.transactions.map((txn) => (
                                        <TransactionRow
                                            key={txn.id}
                                            transaction={txn}
                                            accountId={accounts[0].id}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Admin Recent Transactions ───────────────────────── */}
                {isAdmin && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
                            <Link href="/admin/transactions" className="text-xs font-semibold text-[#002a5c] hover:underline">
                                View all
                            </Link>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl">
                            {adminTxns?.transactions.length === 0 ? (
                                <EmptyState title="No transactions" description="No transactions found." />
                            ) : (
                                adminTxns?.transactions.slice(0, 5).map((txn) => (
                                    <div key={txn.id} className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{txn.description ?? txn.type}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {txn.fromAccount?.accountNumber ?? "—"} → {txn.toAccount?.accountNumber ?? "—"}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className={`text-sm font-semibold ${typeof txn.amount === "number" && txn.amount >= 0 ? "text-gray-900" : "text-gray-900"}`}>
                                                {typeof txn.amount === "number" ? formatCurrency(txn.amount) : formatCurrency(Number(txn.amount))}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">{txn.status}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ── Footer disclaimer ───────────────────────────────── */}
                <footer className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200">
                    <p className="text-[11px] text-gray-400 leading-relaxed max-w-4xl">
                        Titan Bank is a Division of Titan Financial. Deposit products are offered by Titan Bank, Member FDIC.
                        Equal Housing Lender. All rights reserved. Titan Bank and the Titan Bank logo are registered trademarks of Titan Financial Corporation.
                    </p>
                </footer>
            </div>
        </PageWrapper>
    );
}
