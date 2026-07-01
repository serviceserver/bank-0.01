// app/(admin)/admin/users/[userId]/page.tsx

"use client";

import React, { startTransition, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  ssn?: string | null;
  dob?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  createdAt: string;
  isVerified: boolean;
  isLoginBlocked?: boolean;
  role: "ADMIN" | "USER" | string;
  hasTransferPin?: boolean;
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

  const [editing, setEditing] = useState(false);
  const [infoForm, setInfoForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [infoErrors, setInfoErrors] = useState<Record<string, string>>({});
  const [infoSaving, setInfoSaving] = useState(false);

  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [showPinReset, setShowPinReset] = useState(false);
  const [pinForm, setPinForm] = useState({
    newPin: "",
    confirmPin: "",
  });
  const [pinErrors, setPinErrors] = useState<Record<string, string>>({});
  const [pinSaving, setPinSaving] = useState(false);

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<"credit" | "debit" | null>(null);
  const [transactionModalAccountId, setTransactionModalAccountId] = useState<string | null>(null);
  const [transactionForm, setTransactionForm] = useState({
    amount: "",
    description: "",
    externalAccountNumber: "",
    externalAccountHolder: "",
    externalBankName: "Titan Bank",
  });
  const [transactionErrors, setTransactionErrors] = useState<Record<string, string>>({});
  const [transactionSubmitting, setTransactionSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let isActive = true;

    const loadUser = async () => {
      startTransition(() => {
        setLoading(true);
        setError(null);
      });

      try {
        const res = await fetch(`/api/admin/users/${userId}`, { cache: "no-store" });
        const data = await res.json();

        if (!isActive) return;

        startTransition(() => {
          setLoading(false);
          if (data.success) {
            setUser(data.data);
            setInfoForm({
              fullName: data.data.fullName ?? "",
              email: data.data.email ?? "",
              phone: data.data.phone ?? "",
              dob: data.data.dob ?? "",
              address: data.data.address ?? "",
              city: data.data.city ?? "",
              state: data.data.state ?? "",
              zip: data.data.zip ?? "",
            });
          } else {
            setError(data.message ?? "Failed to load user.");
          }
        });
      } catch {
        if (!isActive) return;

        startTransition(() => {
          setLoading(false);
          setError("Network error.");
        });
      }
    };

    void loadUser();

    return () => {
      isActive = false;
    };
  }, [userId]);

  function handleInfoChange(field: string, value: string) {
    setInfoForm((prev) => ({ ...prev, [field]: value }));
    setInfoErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handlePasswordChange(field: string, value: string) {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleTransactionChange(field: string, value: string) {
    setTransactionForm((prev) => ({ ...prev, [field]: value }));
    setTransactionErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handlePinChange(field: string, value: string) {
    setPinForm((prev) => ({ ...prev, [field]: value }));
    setPinErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleResetTransferPin() {
    if (!user) return;
    setPinSaving(true);
    setPinErrors({});
    try {
      const res = await fetch(`/api/admin/users/${userId}/transfer-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pinForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowPinReset(false);
        setPinForm({ newPin: "", confirmPin: "" });
        setUser({ ...user, hasTransferPin: true });
      } else {
        setPinErrors({ general: data.message ?? "Failed to reset transfer PIN." });
      }
    } catch {
      setError("Network error.");
    } finally {
      setPinSaving(false);
    }
  }

  async function handleStartEdit() {
    if (!user) return;
    setInfoForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      dob: user.dob ?? "",
      address: user.address ?? "",
      city: user.city ?? "",
      state: user.state ?? "",
      zip: user.zip ?? "",
    });
    setInfoErrors({});
    setEditing(true);
  }

  function handleCancelEdit() {
    setEditing(false);
    setInfoErrors({});
  }

  async function handleSaveInfo() {
    if (!user) return;
    setInfoSaving(true);
    setInfoErrors({});
    try {
      const res = await fetch(`/api/admin/users/${userId}/info`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(infoForm),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        setEditing(false);
      } else {
        if (data.message) {
          setInfoErrors({ general: data.message });
        } else {
          setError("Failed to update user info.");
        }
      }
    } catch {
      setError("Network error.");
    } finally {
      setInfoSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!user) return;
    setPasswordSaving(true);
    setPasswordErrors({});
    try {
      const res = await fetch(`/api/admin/users/${userId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowPasswordReset(false);
        setPasswordForm({ newPassword: "", confirmPassword: "" });
      } else {
        setPasswordErrors({ general: data.message ?? "Failed to reset password." });
      }
    } catch {
      setError("Network error.");
    } finally {
      setPasswordSaving(false);
    }
  }

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

  async function handleBlockLogin() {
    if (!user) return;
    setActionLoading("block");
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "block" }),
      });
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, isLoginBlocked: true });
      } else {
        setError(data.message ?? "Failed to block user login.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnblockLogin() {
    if (!user) return;
    setActionLoading("unblock");
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unblock" }),
      });
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, isLoginBlocked: false });
      } else {
        setError(data.message ?? "Failed to unblock user login.");
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

  function openTransactionModal(type: "credit" | "debit", accountId: string) {
    setTransactionModalType(type);
    setTransactionModalAccountId(accountId);
    setTransactionForm({
      amount: "",
      description: "",
      externalAccountNumber: "",
      externalAccountHolder: "",
      externalBankName: "Titan Bank",
    });
    setTransactionErrors({});
    setShowTransactionModal(true);
  }

  function closeTransactionModal() {
    setShowTransactionModal(false);
    setTransactionModalType(null);
    setTransactionModalAccountId(null);
    setTransactionForm({
      amount: "",
      description: "",
      externalAccountNumber: "",
      externalAccountHolder: "",
      externalBankName: "Titan Bank",
    });
    setTransactionErrors({});
  }

  async function handleTransactionSubmit() {
    if (!transactionModalAccountId) return;

    setTransactionSubmitting(true);
    setTransactionErrors({});

    const amount = Number(transactionForm.amount);
    if (!amount || amount <= 0) {
      setTransactionErrors({ amount: "Valid amount is required." });
      setTransactionSubmitting(false);
      return;
    }

    try {
      const endpoint = `/api/admin/accounts/${transactionModalAccountId}/${transactionModalType}`;
      const body: Record<string, unknown> = {
        amount,
        description: transactionForm.description.trim(),
      };

      if (transactionModalType === "credit") {
        body.externalAccountNumber = transactionForm.externalAccountNumber || undefined;
        body.externalAccountHolder = transactionForm.externalAccountHolder || undefined;
        body.externalBankName = transactionForm.externalBankName || undefined;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success && user) {
        setUser({
          ...user,
          accounts: user.accounts.map((acc) =>
            acc.id === transactionModalAccountId ? { ...acc, balance: data.data.balanceAfter } : acc
          ),
        });
        closeTransactionModal();
      } else {
        setTransactionErrors({ general: data.message ?? `Failed to ${transactionModalType} account.` });
      }
    } catch {
      setTransactionErrors({ general: "Network error." });
    } finally {
      setTransactionSubmitting(false);
    }
  }

  async function handleCredit(accountId: string) {
    openTransactionModal("credit", accountId);
  }

  async function handleDebit(accountId: string) {
    openTransactionModal("debit", accountId);
  }

  if (!session) return null;

  return (
    <PageWrapper role="ADMIN" userName={session.user.name ?? ""}>
      <button
        onClick={() => router.push("/admin/users")}
        className="mb-4 text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        ← Back
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
          <div className="bg-surface border border-border rounded-xl p-5 py-6 sm:py-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
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
              {!editing && (
                <Button size="sm" variant="secondary" onClick={handleStartEdit}>
                  Edit Info
                </Button>
              )}
            </div>

            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <Input
                  label="Full Name"
                  value={infoForm.fullName}
                  onChange={(e) => handleInfoChange("fullName", e.target.value)}
                  error={infoErrors.fullName}
                />
                <Input
                  label="Email"
                  type="email"
                  value={infoForm.email}
                  onChange={(e) => handleInfoChange("email", e.target.value)}
                  error={infoErrors.email}
                />
                <Input
                  label="Phone"
                  value={infoForm.phone}
                  onChange={(e) => handleInfoChange("phone", e.target.value)}
                  error={infoErrors.phone}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={infoForm.dob}
                  onChange={(e) => handleInfoChange("dob", e.target.value)}
                  error={infoErrors.dob}
                />
                <Input
                  label="Address"
                  value={infoForm.address}
                  onChange={(e) => handleInfoChange("address", e.target.value)}
                  error={infoErrors.address}
                />
                <Input
                  label="City"
                  value={infoForm.city}
                  onChange={(e) => handleInfoChange("city", e.target.value)}
                  error={infoErrors.city}
                />
                <Input
                  label="State"
                  value={infoForm.state}
                  onChange={(e) => handleInfoChange("state", e.target.value.toUpperCase())}
                  error={infoErrors.state}
                  maxLength={2}
                />
                <Input
                  label="ZIP"
                  value={infoForm.zip}
                  onChange={(e) => handleInfoChange("zip", e.target.value)}
                  error={infoErrors.zip}
                />
                <div className="lg:col-span-3 flex flex-wrap gap-2 mt-2">
                  <Button size="sm" onClick={handleSaveInfo} disabled={infoSaving}>
                    {infoSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleCancelEdit} disabled={infoSaving}>
                    Cancel
                  </Button>
                </div>
                {infoErrors.general && (
                  <div className="lg:col-span-3 mt-1 text-xs text-red-600">
                    {infoErrors.general}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Full Name</p>
                  <p className="text-slate-700 font-medium">{user.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Email</p>
                  <p className="text-slate-700 font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-slate-700 font-medium">{user.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">SSN</p>
                  <p className="text-slate-700 font-medium">
                    {user.ssn ? `***-**-${user.ssn.slice(-4)}` : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Date of Birth</p>
                  <p className="text-slate-700 font-medium">{user.dob ?? "--"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Address</p>
                  <p className="text-slate-700 font-medium">{user.address ?? "--"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">City</p>
                  <p className="text-slate-700 font-medium">{user.city ?? "--"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">State</p>
                  <p className="text-slate-700 font-medium">{user.state ?? "--"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">ZIP</p>
                  <p className="text-slate-700 font-medium">{user.zip ?? "--"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Joined</p>
                  <p className="text-slate-700 font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            )}

            {!user.isVerified && !editing && (
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

            {!editing && user.role !== "ADMIN" && (
              <div className="mt-4">
                {user.isLoginBlocked ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleUnblockLogin}
                    disabled={actionLoading === "unblock"}
                  >
                    {actionLoading === "unblock" ? "Unblocking..." : "Unblock Login"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleBlockLogin}
                    disabled={actionLoading === "block"}
                  >
                    {actionLoading === "block" ? "Blocking..." : "Block Login"}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Password Reset */}
          <div className="bg-surface border border-border rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Password
              </h3>
              {!showPasswordReset && (
                <Button size="sm" variant="secondary" onClick={() => setShowPasswordReset(true)}>
                  Reset Password
                </Button>
              )}
            </div>

            {showPasswordReset ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  error={passwordErrors.newPassword}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  error={passwordErrors.confirmPassword}
                />
                <div className="sm:col-span-2 flex flex-wrap gap-2 mt-2">
                  <Button size="sm" onClick={handleResetPassword} disabled={passwordSaving}>
                    {passwordSaving ? "Resetting..." : "Confirm Reset"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setShowPasswordReset(false)} disabled={passwordSaving}>
                    Cancel
                  </Button>
                </div>
                {passwordErrors.general && (
                  <div className="sm:col-span-2 mt-1 text-xs text-red-600">
                    {passwordErrors.general}
                  </div>
                )}
              </div>
            ) : (
               <p className="text-sm text-muted-foreground">
                 Password change requires the Reset Password action.
               </p>
             )}
           </div>

           {/* Transfer PIN */}
           <div className="bg-surface border border-border rounded-xl p-5 mb-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                 Transfer PIN
               </h3>
               {!showPinReset && (
                 <Button size="sm" variant="secondary" onClick={() => setShowPinReset(true)}>
                   {user?.hasTransferPin ? "Reset Transfer PIN" : "Set Transfer PIN"}
                 </Button>
               )}
             </div>

             {showPinReset ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                 <Input
                   label="New PIN"
                   type="password"
                   inputMode="numeric"
                   pattern="[0-9]{4,6}"
                   maxLength={6}
                   placeholder="Enter 4-6 digit PIN"
                   value={pinForm.newPin}
                   onChange={(e) => handlePinChange("newPin", e.target.value.replace(/\D/g, "").slice(0, 6))}
                   error={pinErrors.newPin}
                 />
                 <Input
                   label="Confirm PIN"
                   type="password"
                   inputMode="numeric"
                   pattern="[0-9]{4,6}"
                   maxLength={6}
                   placeholder="Confirm PIN"
                   value={pinForm.confirmPin}
                   onChange={(e) => handlePinChange("confirmPin", e.target.value.replace(/\D/g, "").slice(0, 6))}
                   error={pinErrors.confirmPin}
                 />
                 <div className="sm:col-span-2 flex flex-wrap gap-2 mt-2">
                   <Button size="sm" onClick={handleResetTransferPin} disabled={pinSaving}>
                     {pinSaving ? "Saving..." : "Confirm Reset"}
                   </Button>
                   <Button size="sm" variant="secondary" onClick={() => setShowPinReset(false)} disabled={pinSaving}>
                     Cancel
                   </Button>
                 </div>
                 {pinErrors.general && (
                   <div className="sm:col-span-2 mt-1 text-xs text-red-600">
                     {pinErrors.general}
                   </div>
                 )}
               </div>
             ) : (
               <p className="text-sm text-muted-foreground">
                 {user?.hasTransferPin
                   ? "Transfer PIN is set. Use Reset to change it."
                   : "No transfer PIN set. Use Set to create one."}
               </p>
             )}
           </div>

           {/* Accounts */}
           <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Accounts
              </h3>
            </div>
            {user.accounts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                No accounts found for this user.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-160">
                  <thead>
                    <tr className="bg-muted/10 border-b border-border">
                      {["Account", "Type", "Status", "Balance", "Actions"].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-medium
                                     text-muted-foreground uppercase tracking-wide"
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
                        className="border-b border-border last:border-0 hover:bg-muted/10"
                      >
                        <td className="px-4 py-3">
                          <span
                            className="font-mono text-xs text-accent hover:underline cursor-pointer"
                            onClick={() =>
                              router.push(
                                `/admin/accounts/${acc.id}`
                              )
                            }
                          >
                            {acc.accountNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{acc.type}</td>
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
                        <td className="px-4 py-3 font-medium text-foreground">
                          {formatCurrency(acc.balance)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                              className="whitespace-nowrap"
                            >
                              Credit
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={actionLoading === acc.id}
                              onClick={() => handleDebit(acc.id)}
                              className="whitespace-nowrap"
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

          {/* Transaction Modal */}
          {showTransactionModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-md p-6 flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {transactionModalType === "credit" ? "Credit Account" : "Debit Account"}
                </h2>

                <div className="flex flex-col gap-3 text-sm">
                  <Input
                    label="Amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={transactionForm.amount}
                    onChange={(e) => handleTransactionChange("amount", e.target.value)}
                    error={transactionErrors.amount}
                  />
                  <Input
                    label="Description (optional)"
                    placeholder="e.g. Deposit, adjustment"
                    value={transactionForm.description}
                    onChange={(e) => handleTransactionChange("description", e.target.value)}
                  />

                  {transactionModalType === "credit" && (
                    <>
                      <Input
                        label="Source Account Number (optional)"
                        placeholder="External account number"
                        value={transactionForm.externalAccountNumber}
                        onChange={(e) => handleTransactionChange("externalAccountNumber", e.target.value.replace(/\D/g, ""))}
                      />
                      <Input
                        label="Source Account Holder (optional)"
                        placeholder="External account holder name"
                        value={transactionForm.externalAccountHolder}
                        onChange={(e) => handleTransactionChange("externalAccountHolder", e.target.value)}
                      />
                      <Input
                        label="Source Bank Name"
                        value={transactionForm.externalBankName}
                        onChange={(e) => handleTransactionChange("externalBankName", e.target.value)}
                      />
                    </>
                  )}

                  {transactionErrors.general && (
                    <p className="text-xs text-red-600">{transactionErrors.general}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={closeTransactionModal}
                    disabled={transactionSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleTransactionSubmit}
                    disabled={transactionSubmitting}
                  >
                    {transactionSubmitting ? "Processing..." : transactionModalType === "credit" ? "Credit" : "Debit"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}