// app/(dashboard)/dashboard/transfer/page.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { Account } from "@/lib/interface";
import { LuCheck, LuCopy } from "react-icons/lu";

type Step = "form" | "confirm" | "success";

export default function TransferPage() {
  const { data: session } = useSession();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  const [form, setForm] = useState({
    fromAccountId: "",
    toAccountNumber: "",
    amount: "",
    description: "",
  });

  const [resolved, setResolved] = useState<{
    accountHolder: string;
    accountNumber: string;
    isRecognized?: boolean;
    recognizedBy?: string | null;
    isExternal?: boolean;
    bankName?: string;
  } | null>(null);

  const [searchResults, setSearchResults] = useState<{
    id: string;
    accountNumber: string;
    type: string;
    accountHolder: string;
    bankName?: string;
  }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ reference: string; createdAt: string } | null>(null);

  const BANK_NAME = "Titan Bank";

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === "toAccountNumber") {
      if (value.length !== 10) {
        setResolved(null);
        setResolveError("");
      }
      // Debounced search for recognized accounts (3+ digits)
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      if (value.length >= 3) {
        searchTimeout.current = setTimeout(() => {
          void searchRecognized(value);
        }, 500);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }
  }

  async function searchRecognized(query: string) {
    if (query.length < 3) return;

    try {
      const res = await fetch(`/api/accounts/search-recognized?q=${query}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setSearchResults(data.data);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }

  function selectRecognized(accountNumber: string) {
    setForm((prev) => ({ ...prev, toAccountNumber: accountNumber }));
    setSearchResults([]);
    setShowDropdown(false);
  }

  async function fetchAccounts() {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();

      if (data.success) {
        const activeAccounts = data.data.filter((a: Account) => a.status === "ACTIVE");
        setAccounts(activeAccounts);

        if (activeAccounts.length > 0 && !form.fromAccountId) {
          setForm((prev) => ({ ...prev, fromAccountId: activeAccounts[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      setError("Failed to load your accounts. Please refresh the page.");
    } finally {
      setAccountsLoading(false);
    }
  }

// Auto-resolve account when 10 digits are entered
   useEffect(() => {
    if (form.toAccountNumber.length !== 10) return;

    let cancelled = false;

    const resolve = async () => {
      setResolving(true);
      setResolveError("");

      try {
        const res = await fetch(
          `/api/accounts/resolve?accountNumber=${form.toAccountNumber}`
        );
        const data = await res.json();

        if (!cancelled) {
          if (data.success) {
            setResolved(data.data);
            setSearchResults([]);
            setShowDropdown(false);
          } else {
            setResolveError(data.message || "Account number not found");
          }
        }
      } catch {
        if (!cancelled) {
          setResolveError("Unable to verify account. Please try again.");
        }
      } finally {
        if (!cancelled) setResolving(false);
      }
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [form.toAccountNumber]);

  // Fetch accounts on mount
  useEffect(() => {
    const loadAccounts = async () => {
      await fetchAccounts();
    };

    void loadAccounts();
  }, []);

  const fromAccount = accounts.find((a) => a.id === form.fromAccountId);
  const amountNum = Number(form.amount);

  const isValidTransfer =
    !!resolved &&
    !!fromAccount &&
    amountNum > 0 &&
    amountNum <= fromAccount.balance;

  async function handleTransfer() {
    if (!isValidTransfer) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/accounts/${form.fromAccountId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toAccountNumber: form.toAccountNumber,
          amount: amountNum,
          description: form.description.trim(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Transfer failed");
        return;
      }

      setReceipt(data.data);
      setStep("success");
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    const defaultFromId = accounts[0]?.id ?? "";

    setForm({
      fromAccountId: defaultFromId,
      toAccountNumber: "",
      amount: "",
      description: "",
    });

    setResolved(null);
    setResolveError("");
    setError("");
    setReceipt(null);
    setSearchResults([]);
    setShowDropdown(false);
    setStep("form");
  }

  if (!session) return null;

  const maskedTo = resolved?.accountNumber
    ? `*** *** *** ${resolved.accountNumber.slice(-4)}`
    : null;

  return (
    <PageWrapper
      role={session.user.role as "CUSTOMER" | "ADMIN"}
      userName={session.user.name ?? ""}
    >
      <TopBar title="Transfer" subtitle="Send money to another account" />

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl mx-auto">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {(["form", "confirm", "success"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  s === step
                    ? "w-8 bg-[#002a5c]"
                    : i < (["form", "confirm", "success"] as Step[]).indexOf(step)
                    ? "w-2.5 bg-[#002a5c]"
                    : "w-2.5 bg-muted"
                }`}
              />
              {i < 2 && <div className="w-4 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 1: Form */}
        {step === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-foreground mb-6">Send money</h2>

                {error && (
                  <div className="mb-5 p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-5">
                  {/* From Account */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">From account</label>
                    <select
                      value={form.fromAccountId}
                      onChange={(e) => update("fromAccountId", e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-surface text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={accountsLoading}
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.type.replace("_", " ")} ••••{acc.accountNumber.slice(-4)} —{" "}
                          {formatCurrency(acc.balance)}
                        </option>
                      ))}
</select>
                  </div>

                  {/* To Account */}
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-sm font-medium text-foreground">To account</label>
                    <Input
                      placeholder="Enter 10-digit account number"
                      maxLength={10}
                      value={form.toAccountNumber}
                      onChange={(e) =>
                        update("toAccountNumber", e.target.value.replace(/\D/g, ""))
                      }
                      className="text-sm"
                      onFocus={() => {
                        if (searchResults.length > 0) setShowDropdown(true);
                      }}
                    />

                    {showDropdown && searchResults.length > 0 && !resolved && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {searchResults.map((acc) => (
                          <button
                            key={acc.id}
                            type="button"
                            className="w-full px-3 py-2.5 text-left hover:bg-muted/30 transition-colors first:rounded-t-lg last:rounded-b-lg"
                            onClick={() => selectRecognized(acc.accountNumber)}
                          >
                            <div className="flex flex-col">
                              <p className="text-sm font-medium text-foreground">
                                {acc.accountHolder}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ....{acc.accountNumber.slice(-4)} • {acc.type.replace("_", " ")}
                                {acc.bankName && acc.bankName !== "Titan Bank" && ` • ${acc.bankName}`}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {resolving && <p className="text-xs text-muted-foreground mt-1">Verifying account...</p>}

                    {resolved && (
                      <div className="flex items-center gap-2 mt-1 p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <LuCheck size={12} className="text-green-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-green-800 truncate">
                            {resolved.accountHolder}
                            {resolved.isRecognized && (
                              <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                                Recognized
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-green-600">{resolved.bankName || BANK_NAME}</p>
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
                    <label className="text-sm font-medium text-foreground">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        value={form.amount}
                        onChange={(e) => update("amount", e.target.value)}
                        className="pl-7 text-sm"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">
                      Description <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <Input
                      placeholder="e.g. Rent, dinner split"
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <Button
                    className="w-full mt-2"
                    disabled={!isValidTransfer || resolving}
                    onClick={() => setStep("confirm")}
                  >
                    Continue to Review
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <Card className="p-5 sticky top-20 bg-surface">
                <h3 className="text-sm font-semibold text-foreground mb-4">Transfer Summary</h3>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">From</span>
                    <span className="font-medium text-right truncate">
                      {fromAccount ? `••••${fromAccount.accountNumber.slice(-4)}` : "—"}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-medium text-right truncate">
                      {resolved ? maskedTo : "—"}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">
                      {form.amount ? formatCurrency(form.amount) : "$0.00"}
                    </span>
                  </div>
                  {form.description && (
                    <>
                      <div className="h-px bg-border" />
                      <div>
                        <span className="text-muted-foreground text-xs">Note</span>
                        <p className="text-foreground mt-0.5">{form.description}</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === "confirm" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-foreground mb-6">Review transfer</h2>

                {error && (
                  <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <ConfirmRow label="From" value={fromAccount ? `Account ••••${fromAccount.accountNumber.slice(-4)}` : "—"} />
                  <ConfirmRow 
                    label="To" 
                    value={resolved ? `${resolved.accountHolder}\n${maskedTo}\n${resolved.bankName || BANK_NAME}` : "—"} 
                  />
                  <ConfirmRow label="Amount" value={formatCurrency(form.amount)} highlight />

                  {form.description && <ConfirmRow label="Description" value={form.description} />}

                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      By confirming, you authorize this transfer. Funds will typically be available within minutes.
                    </p>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button variant="secondary" className="flex-1" onClick={() => setStep("form")}>
                      Back
                    </Button>
                    <Button className="flex-1" loading={loading} onClick={handleTransfer}>
                      Confirm & Send
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-5 bg-muted/20 border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Need help?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Transfers between Titan Bank accounts are instant. For external transfers, processing times may vary.
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="max-w-lg mx-auto">
            <Card className="p-8 sm:p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-5">
                <LuCheck size={24} className="text-green-600" />
              </div>

              <h2 className="text-xl font-semibold text-foreground mb-2">Transfer successful</h2>
              <p className="text-sm text-muted-foreground mb-8">
                {formatCurrency(form.amount)} sent to {resolved?.accountHolder ?? "recipient"}
              </p>

              {receipt && (
                <div className="bg-muted/20 rounded-xl border border-border p-4 mb-6 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Reference
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(receipt.reference)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <LuCopy size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-mono text-foreground break-all">{receipt.reference}</p>
                  {receipt.createdAt && (
                    <p className="text-xs text-muted-foreground mt-2">
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
                <Button variant="secondary" className="flex-1" onClick={reset}>
                  New Transfer
                </Button>
                <Button className="flex-1" onClick={() => (window.location.href = "/dashboard")}>
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
    <div className="flex justify-between items-start gap-4 py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-sm font-medium text-right ${highlight ? "text-primary text-base" : "text-foreground"}`}
      >
        {value.split("\n").map((line, i) => (
          <span
            key={i}
            className={i === 0 ? "" : "block text-xs text-muted-foreground mt-0.5"}
          >
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}