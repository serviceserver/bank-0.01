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
import { LuArrowLeft, LuCheck, LuCopy } from "react-icons/lu";

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
  const [resolved, setResolved] = useState<{ accountHolder: string; accountNumber: string } | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ reference: string; createdAt: string } | null>(null);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "toAccountNumber") {
      if (value.length !== 10) {
        setResolved(null);
        setResolveError("");
      }
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
      try {
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
      } catch {
        setResolving(false);
        setResolveError("Unable to verify account.");
      }
    }
    resolve();
  }, [form.toAccountNumber]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function handleTransfer() {
    setLoading(true);
    setError("");
    try {
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
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
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
  const maskedTo = resolved?.accountNumber
    ? `•••• •••• •••• ${resolved.accountNumber.slice(-4)}`
    : null;

  return (
    <PageWrapper
      role={session.user.role as "CUSTOMER" | "ADMIN"}
      userName={session.user.name ?? ""}
    >
      <TopBar title="Transfer" subtitle="Send money to another account" />

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl mx-auto">

        {/* ── Step indicator ────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-8">
          {(["form", "confirm", "success"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`
                h-2.5 rounded-full transition-all
                ${s === step
                  ? "w-8 bg-[#002a5c]"
                  : i < (["form", "confirm", "success"] as Step[]).indexOf(step)
                  ? "w-2.5 bg-[#002a5c]"
                  : "w-2.5 bg-gray-200"}
              `} />
              {i < 2 && <div className="w-4 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Form ── */}
        {step === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main form */}
            <div className="lg:col-span-2">
              <Card className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Send money
                </h2>

                {error && (
                  <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-5">
                  {/* From Account */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      From account
                    </label>
                    <select
                      aria-label="Select account to transfer from"
                      value={form.fromAccountId}
                      onChange={(e) => update("fromAccountId", e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#002a5c] focus:border-transparent appearance-none cursor-pointer"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.type.replace("_", " ")} ••{acc.accountNumber.slice(-4)} — {formatCurrency(acc.balance)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* To Account */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      To account
                    </label>
                    <Input
                      label=""
                      placeholder="Enter 10-digit account number"
                      maxLength={10}
                      value={form.toAccountNumber}
                      onChange={(e) => update("toAccountNumber", e.target.value.replace(/\D/g, ""))}
                      className="text-sm"
                    />
                    {resolving && (
                      <p className="text-xs text-gray-400 mt-1">Verifying account…</p>
                    )}
                    {resolved && (
                      <div className="flex items-center gap-2 mt-1 p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <LuCheck size={12} className="text-green-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-green-800 truncate">{resolved.accountHolder}</p>
                          {maskedTo && <p className="text-xs text-green-600 font-mono">{maskedTo}</p>}
                        </div>
                      </div>
                    )}
                    {resolveError && (
                      <p className="text-xs text-red-600 mt-1">{resolveError}</p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <Input
                        label=""
                        type="number"
                        placeholder="0.00"
                        min="1"
                        step="0.01"
                        value={form.amount}
                        onChange={(e) => update("amount", e.target.value)}
                        className="pl-7 text-sm"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Description <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <Input
                      label=""
                      placeholder="e.g. Rent, dinner split"
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <Button
                    className="w-full mt-1"
                    disabled={!resolved || !form.amount || Number(form.amount) <= 0}
                    onClick={() => setStep("confirm")}
                  >
                    Continue to Review
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar summary */}
            <div className="lg:col-span-1">
              <Card className="p-5 sticky top-20">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Transfer Summary
                </h3>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">From</span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">
                      {fromAccount ? `•••${fromAccount.accountNumber.slice(-4)}` : "—"}
                    </span>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex justify-between">
                    <span className="text-gray-500">To</span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">
                      {resolved ? maskedTo ?? "—" : "—"}
                    </span>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-semibold text-gray-900">
                      {form.amount ? formatCurrency(form.amount) : "$0.00"}
                    </span>
                  </div>
                  {form.description && (
                    <>
                      <div className="h-px bg-gray-100" />
                      <div>
                        <span className="text-gray-500 text-xs">Note</span>
                        <p className="text-gray-900 mt-0.5">{form.description}</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── Step 2: Confirm ── */}
        {step === "confirm" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Review transfer
                </h2>

                {error && (
                  <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <ConfirmRow label="From" value={fromAccount ? `Account ••${fromAccount.accountNumber.slice(-4)}` : "—"} />
                  <ConfirmRow label="To" value={resolved ? `${resolved.accountHolder} (${maskedTo})` : "—"} />
                  <ConfirmRow label="Amount" value={formatCurrency(form.amount)} highlight />
                  {form.description && (
                    <ConfirmRow label="Description" value={form.description} />
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      By confirming, you authorize this transfer. Funds will typically be available within minutes.
                    </p>
                  </div>

                  <div className="flex gap-3 mt-2">
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
            </div>

            <div className="lg:col-span-1">
              <Card className="p-5 bg-gray-50/60 border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Need help?
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Transfers between NexBank accounts are instant. For external transfers, processing times may vary.
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* ── Step 3: Success ── */}
        {step === "success" && (
          <div className="max-w-lg mx-auto">
            <Card className="p-8 sm:p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-5">
                <LuCheck size={24} className="text-green-600" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Transfer successful
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                {formatCurrency(form.amount)} sent to {resolved?.accountHolder ?? "recipient"}
              </p>

              {receipt && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Reference
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(receipt.reference)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Copy reference"
                    >
                      <LuCopy size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {receipt.reference}
                  </p>
                  {receipt.createdAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(receipt.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
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
                  Back to Dashboard
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

// Confirm screen row helper
function ConfirmRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-start gap-4 py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right ${highlight ? "text-[#002a5c] text-base" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}
