// app/(admin)/admin/page.tsx

import React from "react";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/lib/services/admin.service";
import { getAllTransactions } from "@/lib/services/admin.service";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import Link from "next/link";
import { GetAllUsersResponse, GetAllTransactionsResponse } from "@/lib/interface";




export default async function AdminPage(): Promise<React.ReactNode> {
  const session: Session | null = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const { users, pagination: userPagination }: GetAllUsersResponse = await getAllUsers(1, 5);
  const { transactions }: GetAllTransactionsResponse = await getAllTransactions(1, 5);

  return (
    <PageWrapper role="ADMIN" userName={session.user.name ?? ""}>
      <TopBar
        title="Admin Overview"
        subtitle="System-wide summary"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={String(userPagination.total)}
          sub="Registered accounts"
          accent
        />
        <StatCard
          label="Recent Transactions"
          value={String(transactions.length)}
          sub="Latest activity"
        />
        <StatCard
          label="System Status"
          value="Operational"
          sub="All services running"
        />
      </div>

      {/* Recent Users */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">Recent Users</h2>
          <Link href="/admin/users"
                className="text-xs text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium
                                 text-gray-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium
                                 text-gray-500 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium
                                 text-gray-500 uppercase tracking-wide">
                    Verified
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium
                                 text-gray-500 uppercase tracking-wide">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}
                      className="border-b border-gray-100 last:border-0
                                 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <Link href={`/admin/users/${user.id}`}
                            className="hover:text-blue-600">
                        {user.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isVerified ? "success" : "warning"}>
                        {user.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Recent Transactions
          </h2>
          <Link href="/admin/transactions"
                className="text-xs text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium
                                 text-gray-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium
                                 text-gray-500 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium
                                 text-gray-500 uppercase tracking-wide">
                    From
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium
                                 text-gray-500 uppercase tracking-wide">
                    To
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium
                                 text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium
                                 text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id}
                      className="border-b border-gray-100 last:border-0
                                 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {txn.type}
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {formatCurrency(txn.amount.toString())}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {txn.fromAccount?.accountNumber ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {txn.toAccount?.accountNumber ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={txn.status === "SUCCESS" ? "success" : "danger"}
                      >
                        {txn.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {formatDate(txn.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
