// app/(admin)/admin/recognized-accounts/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils/formatDate";

interface RecognizedAccount {
  id: string;
  createdAt: string;
  isExternal: boolean;
  account?: {
    id: string;
    accountNumber: string;
    type: string;
    status: string;
    user: {
      fullName: string;
      email: string;
    };
  };
  externalAccountNumber?: string;
  externalAccountHolder?: string;
  externalBankName?: string;
}

export default function RecognizedAccountsPage() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<RecognizedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("Titan Bank");
  const [resolveInfo, setResolveInfo] = useState<{
    accountHolder: string;
    type: string;
    accountId: string;
    accountNumber: string;
  } | null>(null);
  const [resolveError, setResolveError] = useState("");

  async function fetchAccounts() {
    setLoading(true);
    const res = await fetch("/api/admin/recognized-accounts");
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setAccounts(data.data);
    }
  }

  // Defer fetching to avoid calling setState synchronously within effect
  useEffect(() => {
    const t = setTimeout(() => void fetchAccounts(), 0);
    return () => clearTimeout(t);
  }, []);

  async function resolveAccount() {
    if (accountNumber.length < 6) return;
    setResolveInfo(null);
    setResolveError("");
    try {
      const res = await fetch(`/api/accounts/resolve?accountNumber=${accountNumber}`);
      const data = await res.json();
      if (data.success) {
        setResolveInfo({
          accountHolder: data.data.accountHolder,
          type: data.data.type,
          accountId: data.data.accountId,
          accountNumber: data.data.accountNumber,
        });
      } else {
        setResolveError(data.message);
      }
    } catch {
      setResolveError("Failed to verify account.");
    }
  }

  async function handleAdd() {
    setActionLoading("add");
    try {
      let body: any;
      if (resolveInfo) {
        body = { accountId: resolveInfo.accountId };
      } else if (accountNumber && accountHolder) {
        body = {
          accountNumber,
          accountHolder,
          bankName: bankName || undefined,
        };
      } else {
        setError("Please fill in all required fields.");
        return;
      }

      const res = await fetch("/api/admin/recognized-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setAccountNumber("");
        setAccountHolder("");
        setBankName("Titan Bank");
        setResolveInfo(null);
        setShowAdd(false);
        fetchAccounts();
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemove(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/recognized-accounts/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setAccounts(accounts.filter((a) => a.id !== id));
      } else {
        setError(data.message);
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
      <TopBar
        title="Recognized Accounts"
        subtitle="Trusted accounts users can quickly send to"
        action={
          <Button size="sm" onClick={() => setShowAdd(true)}>
            + Add Account
          </Button>
        }
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
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No recognized accounts"
          description="Add accounts that users can quickly identify during transfers."
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden py-6 sm:py-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-160">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Account", "Holder", "Type", "Added", "Actions"].map((h) => (
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
                {accounts.map((acc) => (
                  <tr key={acc.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="text-gray-500 px-4 py-3 font-mono text-xs">
                      {acc.account?.accountNumber || acc.externalAccountNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">
                        {acc.account?.user?.fullName || acc.externalAccountHolder}
                      </p>
                      {acc.isExternal && acc.externalBankName && (
                        <p className="text-xs text-gray-500">{acc.externalBankName}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {acc.account
                        ? acc.account.type.replace("_", " ")
                        : "External"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(acc.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={actionLoading === acc.id}
                        onClick={() => handleRemove(acc.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-md p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Add Recognized Account</h2>

            <div className="flex flex-col gap-3">
              <Input
                label="Account Number"
                placeholder="Enter 6-10 digit account number"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                onBlur={resolveAccount}
              />

              {resolveInfo && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm font-medium text-green-800">{resolveInfo.accountHolder}</p>
                  <p className="text-xs text-green-600">{resolveInfo.type.replace("_", " ")}</p>
                </div>
              )}

              {!resolveInfo && accountNumber.length >= 6 && resolveError && (
                <>
                  <Input
                    label="Account Holder Name"
                    placeholder="Enter account holder name"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                  />
                  <Input
                    label="Bank Name"
                    placeholder="Enter bank name (optional)"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </>
              )}

              {resolveError && (
                <p className="text-xs text-red-600">{resolveError}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowAdd(false);
                  setAccountNumber("");
                  setAccountHolder("");
                  setBankName("Titan Bank");
                  setResolveInfo(null);
                  setResolveError("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={
                  (!resolveInfo && !(accountNumber && accountHolder)) ||
                  actionLoading === "add"
                }
                onClick={handleAdd}
              >
                Add Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}