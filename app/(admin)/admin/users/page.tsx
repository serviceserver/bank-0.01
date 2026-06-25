// app/(admin)/admin/users/page.tsx

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
import { Pagination } from "@/lib/interface";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  ssn?: string | null;
  createdAt: string;
  isVerified: boolean;
  role: "ADMIN" | "USER" | string;
  accounts: {
    id: string;
    accountNumber: string;
    type: string;
    status: string;
    balance: number;
  }[];
}

import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function fetchUsers(p: number) {
    setLoading(true);
    const res = await fetch(`/api/admin/users?page=${p}&limit=20`);
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(page), 0);
    return () => clearTimeout(t);
  }, [page]);

  if (!session) return null;

  return (
    <PageWrapper role="ADMIN" userName={session.user.name ?? ""}>
      <TopBar
        title="Users"
        subtitle="All registered users in the system"
      />

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Registered users will appear here."
        />
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Name", "Email", "Phone", "Role", "Verified", "Accounts", "Joined"].map(
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
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      className="border-b border-gray-100 last:border-0
                                 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">
                          {user.fullName}
                        </p>
                        {user.ssn && (
                          <p className="text-xs text-gray-400">
                            SSN: ***-**-{user.ssn.slice(-4)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {user.phone}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === "ADMIN" ? "info" : "neutral"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isVerified ? "success" : "warning"}>
                          {user.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex flex-col gap-1">
                          {user.accounts.map((acc) => (
                            <div key={acc.id} className="flex items-center gap-2">
                              <span className="font-mono text-xs text-gray-500">
                                {acc.accountNumber}
                              </span>
                              <Badge variant="neutral" className="text-[10px]">
                                {acc.type}
                              </Badge>
                            </div>
                          ))}
                          {user.accounts.length === 0 && (
                            <span className="text-xs text-gray-400">No accounts</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {formatDate(user.createdAt)}
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
