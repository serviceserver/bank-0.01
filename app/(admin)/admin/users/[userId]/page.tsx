// app/(admin)/admin/users/[userId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import { AdminUser, Account } from "@/lib/types";


export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { data: session } = useSession();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modal, setModal] = useState<
    | { type: "credit" | "debit"; accountId: string; accountNumber: string }
    | { type: "freeze" | "unfreeze"; accountId: string; accountNumber: string }
    | null
  >(null);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function fetchUser() {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`);
    const data = await res.json();
    if (data.success) setUser(data.data);
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        const data = await res.json();
        if (!mounted) return;
        if (data.success) setUser(data.data);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  function openModal(type: typeof modal) {
    setAmount("");
    setDescription("");
    setActionError("");
    setSuccessMsg("");
    setModal(type);
  }

  function closeModal() {
    setModal(null);
    setActionError("");
  }

  async function handleCreditDebit() {
    if (!modal || (modal.type !== "credit" && modal.type !== "debit")) return;
    setActionLoading(true);
    setActionError("");

    const res = await fetch(
      `/api/admin/accounts/${modal.accountId}/${modal.type}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), description }),
      }
    );
    const data = await res.json();
    setActionLoading(false);

    if (!data.success) {
      setActionError(data.message);
      return;
    }

    setSuccessMsg(
      `${modal.type === "credit" ? "Credited" : "Debited"} ${formatCurrency(amount)} successfully.`
    );
    closeModal();
    fetchUser();
  }

  async function handleFreezeToggle() {
    if (!modal || (modal.type !== "freeze" && modal.type !== "unfreeze")) return;
    setActionLoading(true);
    setActionError("");

    const status = modal.type === "freeze" ? "FROZEN" : "ACTIVE";

    const res = await fetch(`/api/admin/accounts/${modal.accountId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setActionLoading(false);

    if (!data.success) {
      setActionError(data.message);
      return;
    }

    setSuccessMsg(
      `Account ${modal.type === "freeze" ? "frozen" : "unfrozen"} successfully.`
    );
    closeModal();
    fetchUser();
  }

  async function handleVerify() {
    setActionLoading(true);
    setActionError("");

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
    });
    const data = await res.json();
    setActionLoading(false);

    if (!data.success) {
      setActionError(data.message);
      return;
    }

    setSuccessMsg("User verified successfully.");
    fetchUser();
  }

  if (!session) return null;

  return (
    <PageWrapper role="ADMIN" userName={session.user.name ?? ""}>
      <TopBar
        title="User Detail"
        subtitle="Manage this user's accounts and status"
      />

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : !user ? (
        <p className="text-sm text-gray-500">User not found.</p>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Success Banner */}
          {successMsg && (
            <div className="px-4 py-3 bg-green-50 border border-green-200
                            rounded-lg text-sm text-green-700 font-medium
                            flex items-center justify-between">
              <span>✓ {successMsg}</span>
              <button
                onClick={() => setSuccessMsg("")}
                className="text-green-500 hover:text-green-700 text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* User Info Card */}
          <Card>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-slate-900">
                  {user.fullName}
                </h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-sm text-gray-500">{user.phone}</p>
{user.ssn && (
                   <p className="text-sm text-gray-400 font-mono">
                     SSN: {user.ssn}
                   </p>
                 )}
                <p className="text-xs text-gray-400 mt-1">
                  Joined {formatDate(user.createdAt)}
                </p>
              </div>

              <div className="flex flex-col gap-2 items-end">
                <Badge variant={user.isVerified ? "success" : "warning"}>
                  {user.isVerified ? "KYC Verified" : "Unverified"}
                </Badge>
                <Badge variant={user.role === "ADMIN" ? "info" : "neutral"}>
                  {user.role}
                </Badge>
                {!user.isVerified && (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={actionLoading}
                    onClick={handleVerify}
                  >
                    Verify User
                  </Button>
                )}
              </div>
            </div>

            {actionError && !modal && (
              <p className="text-xs text-red-600 mt-3">{actionError}</p>
            )}
          </Card>

          {/* Accounts */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Accounts ({user.accounts.length})
            </h3>

            <div className="flex flex-col gap-4">
              {user.accounts.map((account: Account) => (
                <Card key={account.id} padding="sm">
                  <div className="flex flex-col gap-4">

                    {/* Account Header */}
                    <div className="flex items-center justify-between
                                    flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {account.type.replace("_", " ")}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          {account.accountNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
                    </div>

                    {/* Balance */}
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                      <p className="text-xs text-gray-500 mb-0.5">Balance</p>
                      <p className="text-xl font-bold text-slate-900">
                        {formatCurrency(account.balance.toString())}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          openModal({
                            type: "credit",
                            accountId: account.id,
                            accountNumber: account.accountNumber,
                          })
                        }
                      >
                        + Credit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          openModal({
                            type: "debit",
                            accountId: account.id,
                            accountNumber: account.accountNumber,
                          })
                        }
                      >
                        − Debit
                      </Button>
                      {account.status === "ACTIVE" ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            openModal({
                              type: "freeze",
                              accountId: account.id,
                              accountNumber: account.accountNumber,
                            })
                          }
                        >
                          Freeze Account
                        </Button>
                      ) : account.status === "FROZEN" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            openModal({
                              type: "unfreeze",
                              accountId: account.id,
                              accountNumber: account.accountNumber,
                            })
                          }
                        >
                          Unfreeze Account
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Credit / Debit Modal ── */}
      {modal && (modal.type === "credit" || modal.type === "debit") && (
        <Modal
          title={modal.type === "credit" ? "Manual Credit" : "Manual Debit"}
          onClose={closeModal}
        >
          <p className="text-xs text-gray-500 mb-4">
            Account: <span className="font-mono">{modal.accountNumber}</span>
          </p>
          <div className="flex flex-col gap-3">
            <Input
              label="Amount ($)"
              type="number"
              placeholder="0.00"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              label="Description (optional)"
              placeholder="Reason for this action"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {actionError && (
              <p className="text-xs text-red-600 bg-red-50 border
                            border-red-200 rounded-lg px-3 py-2">
                {actionError}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="secondary" className="flex-1" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                variant={modal.type === "debit" ? "danger" : "primary"}
                loading={actionLoading}
                disabled={!amount}
                onClick={handleCreditDebit}
              >
                {modal.type === "credit" ? "Credit Account" : "Debit Account"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Freeze / Unfreeze Confirm Modal ── */}
      {modal && (modal.type === "freeze" || modal.type === "unfreeze") && (
        <Modal
          title={modal.type === "freeze" ? "Freeze Account" : "Unfreeze Account"}
          onClose={closeModal}
        >
          <p className="text-sm text-gray-600 mb-4">
            {modal.type === "freeze"
              ? `Are you sure you want to freeze account ${modal.accountNumber}? The user will not be able to send or receive money.`
              : `Are you sure you want to unfreeze account ${modal.accountNumber}? The user will regain full access.`
            }
          </p>
          {actionError && (
            <p className="text-xs text-red-600 bg-red-50 border
                          border-red-200 rounded-lg px-3 py-2 mb-3">
              {actionError}
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              variant={modal.type === "freeze" ? "danger" : "primary"}
              loading={actionLoading}
              onClick={handleFreezeToggle}
            >
              {modal.type === "freeze" ? "Yes, Freeze" : "Yes, Unfreeze"}
            </Button>
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
}

// ── Reusable Modal Shell ──────────────────────────────────────────

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center
                    justify-center z-50 px-4">
      <div className="bg-white rounded-xl border border-gray-200
                      shadow-lg w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}