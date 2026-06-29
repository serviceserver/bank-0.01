// app/(admin)/admin/transactions/[transactionId]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";

interface TransactionDetail {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description?: string | null;
  reference: string;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  fromAccount?: { accountNumber: string; user: { fullName: string } } | null;
  toAccount?: { accountNumber: string; user: { fullName: string } } | null;
  balanceBefore: number;
  balanceAfter: number;
}

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: any;
  createdAt: string;
  actor: { fullName: string; email: string };
}

const typeLabel: Record<string, string> = {
  ACH_CREDIT: "ACH Credit",
  ACH_DEBIT: "ACH Debit",
  WIRE_INCOMING: "Wire In",
  WIRE_OUTGOING: "Wire Out",
  CHECK_DEPOSIT: "Check Deposit",
  ATM_WITHDRAWAL: "ATM Withdrawal",
  TRANSFER: "Transfer",
};

const statusVariant: Record<string, "success" | "danger" | "warning" | "neutral"> = {
  SUCCESS: "success",
  FAILED: "danger",
  PENDING: "warning",
  REVERSED: "neutral",
};

export default function AdminTransactionDetailPage() {
  const { data: session } = useSession();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ amount: "", description: "", status: "", createdAt: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const pathParts = window.location.pathname.split("/");
      const transactionId = pathParts[pathParts.length - 1];

      const [txnRes, logsRes] = await Promise.all([
        fetch(`/api/admin/transactions/${transactionId}`),
        fetch(`/api/admin/audit-logs?entity=Transaction&entityId=${transactionId}`),
      ]);

      const txnData = await txnRes.json();
      const logsData = await logsRes.json();

      if (txnData.success) {
        setTransaction(txnData.data);
        setForm({
          amount: String(txnData.data.amount),
          description: txnData.data.description ?? "",
          status: txnData.data.status,
          createdAt: txnData.data.createdAt ? new Date(txnData.data.createdAt).toISOString().slice(0, 16) : "",
        });
      }
      if (logsData.success) setAuditLogs(logsData.data.logs);
      setLoading(false);
    }

    fetchData();
  }, []);

  async function handleSave() {
    if (!transaction) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(form.amount),
          description: form.description.trim() || undefined,
          status: form.status,
          createdAt: form.createdAt || undefined,
        }),
      });

    const data = await res.json();
    setSaving(false);

    if (data.success) {
      setTransaction(data.data);
      setEditing(false);
    } else {
      setError(data.message || "Failed to update transaction");
    }
  }

  if (!session) return null;

  if (loading) {
    return (
      <PageWrapper role="ADMIN" userName={session.user.name ?? ""}>
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    );
  }

  if (!transaction) {
    return (
      <PageWrapper role="ADMIN" userName={session.user.name ?? ""}>
        <TopBar title="Transaction Not Found" />
        <EmptyState title="Transaction not found" description="The requested transaction does not exist." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper role="ADMIN" userName={session.user.name ?? ""}>
      <button
        onClick={() => (window.location.href = "/admin/transactions")}
        className="mb-4 text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        ← Back to Transactions
      </button>

      <TopBar
        title={`Transaction ${transaction.reference}`}
        subtitle={typeLabel[transaction.type] ?? transaction.type}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Transaction Details */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Transaction Details
              </h3>
              <Badge variant={statusVariant[transaction.status] ?? "neutral"}>
                {transaction.status}
              </Badge>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-danger/5 text-danger text-sm">
                {error}
              </div>
            )}

{!editing ? (
               <div className="space-y-4">
                 <DetailRow label="Amount" value={formatCurrency(transaction.amount)} />
                 <DetailRow label="Description" value={transaction.description ?? "—"} />
                 <DetailRow label="Created" value={formatDate(transaction.createdAt)} />
                 <DetailRow label="Date & Time" value={new Date(transaction.createdAt).toLocaleString()} />
                 <DetailRow label="Reference" value={transaction.reference} />
                 {transaction.fromAccount && (
                   <DetailRow label="From" value={`${transaction.fromAccount.accountNumber} (${transaction.fromAccount.user.fullName})`} />
                 )}
                 {transaction.toAccount && (
                   <DetailRow label="To" value={`${transaction.toAccount.accountNumber} (${transaction.toAccount.user.fullName})`} />
                 )}
                 <Button size="sm" onClick={() => setEditing(true)}>
                   Edit Transaction
                 </Button>
               </div>
             ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Amount</label>
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="pl-7"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional description"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1 h-9 rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
                  >
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="REVERSED">Reversed</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={form.createdAt}
                    onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" loading={saving} onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit Log Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Audit History</h3>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No modifications recorded.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border-b border-border pb-2 last:border-0">
                    <p className="text-xs font-medium text-foreground">{log.action.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">{log.actor.fullName}</p>
                    {log.metadata && (
                      <pre className="text-xs text-muted-foreground mt-1 bg-background p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
    </div>
  );
}