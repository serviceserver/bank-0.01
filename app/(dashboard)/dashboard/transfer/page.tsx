// app/(dashboard)/dashboard/transfer/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { Account } from "@/lib/interface";

type Step = "form" | "confirm" | "success";

export default function TransferPage() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState({
    fromAccountId: "",
    toAccountNumber: "",
    amount: "",
    description: "",
  });
  const [resolved, setResolved] = useState<{ accountHolder: string } | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ reference: string } | null>(null);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "toAccountNumber" && value.length !== 10) {
      setResolved(null);
      setResolveError("");
    }
  }

  async function fetchAccounts() {
    const res = await fetch("/api/accounts");
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      setAccounts(data.data.filter((a: Account) => a.status === "ACTIVE"));
      setForm((prev) => ({ ...prev, fromAccountId: data.data[0].id }));
    }
  }

  // Auto-resolve account number when 10 digits entered
  useEffect(() => {
    if (form.toAccountNumber.length !== 10) {
      return;
    }
    async function resolve() {
      setResolving(true);
      setResolveError("");
      const res = await fetch(
        `/api/accounts/resolve?accountNumber=${form.toAccountNumber}`
      );
      const data = await res.json();
      setResolving(false);
      if (data.success) {
        setResolved(data.data);
      } else {
        setResolveError(data.message);
      }
    }
    resolve();
  }, [form.toAccountNumber]);

  useEffect(() => { 
    async function loadAccounts() {
      await fetchAccounts();
    }
    loadAccounts();
  }, []);

  async function handleTransfer() {
    setLoading(true);
    setError("");
    const res = await fetch(
      `/api/accounts/${form.fromAccountId}/transfer`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toAccountNumber: form.toAccountNumber,
          amount: Number(form.amount),
          description: form.description,
        }),
      }
    );
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.message);
      return;
    }
    setReceipt(data.data);
    setStep("success");
  }

  function reset() {
    setForm({ fromAccountId: accounts[0]?.id ?? "", toAccountNumber: "",
              amount: "", description: "" });
    setResolved(null);
    setReceipt(null);
    setError("");
    setStep("form");
  }

  if (!session) return null;

  const fromAccount = accounts.find((a) => a.id === form.fromAccountId);

  return (
    <PageWrapper
      role={session.user.role as "CUSTOMER" | "ADMIN"}
      userName={session.user.name ?? ""}
    >
      <TopBar title="Transfer" subtitle="Send money to another account" />

      <div className="max-w-md">
        {/* ── Step 1: Form ── */}
        {step === "form" && (
          <Card>
            <div className="flex flex-col gap-4">

              {/* From Account */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  From Account
                </label>
                <select
                aria-label="Select an account to transfer from"
                  value={form.fromAccountId}
                  onChange={(e) => update("fromAccountId", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border
                             border-gray-200 bg-white text-slate-900
                             outline-none focus:ring-2 focus:ring-blue-600
                             focus:border-transparent"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountNumber} - {formatCurrency(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>

              {/* To Account */}
              <div>
                <Input
                  label="Recipient Account Number"
                  placeholder="10-digit account number"
                  maxLength={10}
                  value={form.toAccountNumber}
                  onChange={(e) => update("toAccountNumber", e.target.value)}
                />
                {resolving && (
                  <p className="text-xs text-gray-400 mt-1">Resolving...</p>
                )}
                {resolved && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    ✓ {resolved.accountHolder}
                  </p>
                )}
                {resolveError && (
                  <p className="text-xs text-red-600 mt-1">{resolveError}</p>
                )}
              </div>

              <Input
                label="Amount ($)"
                type="number"
                placeholder="0.00"
                min="1"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
              />

              <Input
                label="Description (optional)"
                placeholder="e.g. Rent payment"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />

              <Button
                className="w-full mt-1"
                disabled={!resolved || !form.amount}
                onClick={() => setStep("confirm")}
              >
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* ── Step 2: Confirm ── */}
        {step === "confirm" && (
          <Card>
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-slate-900">
                Confirm Transfer
              </h2>

              <div className="flex flex-col gap-3 bg-gray-50 rounded-lg p-4
                              text-sm divide-y divide-gray-200">
                <Row label="From" value={fromAccount?.accountNumber ?? ""} />
                <Row label="To" value={form.toAccountNumber} />
                <Row label="Recipient" value={resolved?.accountHolder ?? ""} />
                <Row
                  label="Amount"
                  value={formatCurrency(form.amount)}
                  highlight
                />
                {form.description && (
                  <Row label="Description" value={form.description} />
                )}
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border
                              border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setStep("form")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  loading={loading}
                  onClick={handleTransfer}
                >
                  Confirm & Send
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ── Step 3: Success ── */}
        {step === "success" && (
          <Card>
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-50 flex
                              items-center justify-center text-2xl">
                ✓
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Transfer Successful
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(form.amount)} sent to{" "}
                  {resolved?.accountHolder}
                </p>
              </div>

              {receipt && (
                <p className="text-xs text-gray-400 font-mono">
                  Ref: {receipt.reference}
                </p>
              )}

              <div className="flex gap-2 w-full pt-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={reset}
                >
                  New Transfer
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => window.location.href = "/dashboard"}
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}

// Small inline helper for confirm screen rows
function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center pt-3 first:pt-0">
      <span className="text-gray-500">{label}</span>
      <span
        className={`font-medium ${highlight ? "text-blue-600 text-base" : "text-slate-800"}`}
      >
        {value}
      </span>
    </div>
  );
}