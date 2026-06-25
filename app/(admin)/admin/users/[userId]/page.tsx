// app/(admin)/admin/users/[userId]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";
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
    createdAt: string;
  }[];
}

export default function AdminUserDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchUser() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${userId}`);
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setUser(data.data);
    } else {
      setError(data.message ?? "Failed to load user.");
    }
  }

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  async function handleVerify() {
    if (!user) return;
    setActionLoading("verify");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, isVerified: true });
      } else {
        setError(data.message ?? "Failed to verify user.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAccountStatus(accountId: string, status: string) {
    setActionLoading(accountId);
    try {
      const res = await fetch(`/api/admin/accounts/${accountId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success && user) {
        setUser({
          ...user,
          accounts: user.accounts.map((acc) =>
            acc.id === accountId ? { ...acc, status: data.data.status } : acc
          ),
        });
      } else {
        setError(data.message ?? "Failed to update account status.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCredit(accountId: string) {
    const amount = prompt("Enter credit amount:");
    if (!amount || isNaN(Number(amount))) return;
    const description = prompt("Description (optional):") ?? undefined;
    setActionLoading(accountId);
    try {
      const res = await fetch(`/api/admin/accounts/${accountId}/credit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), description }),
      });
      const data = await res.json();
      if (data.success && user) {
        setUser({
          ...user,
          accounts: user.accounts.map((acc) =>
            acc.id === accountId ? { ...acc, balance: data.data.balanceAfter } : acc
          ),
        });
      } else {
        setError(data.message ?? "Failed to credit account.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDebit(accountId: string) {
    const amount = prompt("Enter debit amount:");
    if (!amount || isNaN(Number(amount))) return;
    const description = prompt("Description (optional):") ?? undefined;
    setActionLoading(accountId);
    try {
      const res = await fetch(`/api/admin/accounts/${accountId}/debit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), description }),
      });
      const data = await res.json();
      if (data.success && user) {
        setUser({
          ...user,
          accounts: user.accounts.map((acc) =>
            acc.id === accountId ? { ...acc, balance: data.data.balanceAfter } : acc
          ),
        });
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
        className="mb-4 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to Users
      </button>

      <TopBar
        title={user?.fullName ?? "User Details"}
        subtitle={user?.email ?? ""}
      />

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : !user ? (
        <EmptyState title="User not found" description="This user may have been removed." />
      ) : (
        <>
          {/* User Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                User Information
              </h3>
              {user.isVerified ? (
                <Badge variant="success">Verified</Badge>
              ) : (
                <Badge variant="warning">Unverified</Badge>
              )}
              <Badge variant={user.role === "ADMIN" ? "info" : "neutral"}>
                {user.role}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Full Name</p>
                <p className="text-slate-700 font-medium">{user.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Email</p>
                <p className="text-slate-700 font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Phone</p>
                <p className="text-slate-700 font-medium">{user.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">SSN</p>
                <p className="text-slate-700 font-medium">
                  {user.ssn ? `***-**-${user.ssn.slice(-4)}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Joined</p>
                <p className="text-slate-700 font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
            {!user.isVerified && (
              <div className="mt-4">
                <Button
                  size="sm"
                  onClick={handleVerify}
                  disabled={actionLoading === "verify"}
                >
                  {actionLoading === "verify" ? "Verifying..." : "Verify User"}
                </Button>
              </div>
            )}
          </div>

          {/* Accounts */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Accounts
              </h3>
            </div>
            {user.accounts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                No accounts found for this user.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Account", "Type", "Status", "Balance", "Actions"].map((h) => (
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
                    {user.accounts.map((acc) => (
                      <tr
                        key={acc.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-gray-500">
                            {acc.accountNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{acc.type}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              acc.status === "ACTIVE"
                                ? "success"
                                : acc.status === "FROZEN"
                                ? "danger"
                                : "neutral"
                            }
                          >
                            {acc.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {formatCurrency(acc.balance)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {acc.status === "ACTIVE" ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={actionLoading === acc.id}
                                onClick={() => handleAccountStatus(acc.id, "FROZEN")}
                              >
                                Freeze
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={actionLoading === acc.id}
                                onClick={() => handleAccountStatus(acc.id, "ACTIVE")}
                              >
                                Unfreeze
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={actionLoading === acc.id}
                              onClick={() => handleCredit(acc.id)}
                            >
                              Credit
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={actionLoading === acc.id}
                              onClick={() => handleDebit(acc.id)}
                            >
                              Debit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </PageWrapper>
  );
}
