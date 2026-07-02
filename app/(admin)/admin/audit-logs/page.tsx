// app/(admin)/admin/audit-logs/page.tsx

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
import { AuditLog, Pagination } from "@/lib/interface";

const actionVariant: Record<
  string,
  "success" | "danger" | "warning" | "info" | "neutral"
> = {
  MANUAL_CREDIT:    "success",
  MANUAL_DEBIT:     "danger",
  ACCOUNT_FROZEN:   "danger",
  ACCOUNT_UNFROZEN: "success",
  USER_VERIFIED:    "info",
};

const actionLabel: Record<string, string> = {
  MANUAL_CREDIT:    "Manual Credit",
  MANUAL_DEBIT:     "Manual Debit",
  ACCOUNT_FROZEN:   "Account Frozen",
  ACCOUNT_UNFROZEN: "Account Unfrozen",
  USER_VERIFIED:    "User Verified",
};

export default function AuditLogsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function fetchLogs(p: number) {
    setLoading(true);
    const res = await fetch(`/api/admin/audit-logs?page=${p}&limit=20`);
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setLogs(data.data.logs);
      setPagination(data.data.pagination);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchLogs(page), 0);
    return () => clearTimeout(t);
  }, [page]);

  if (!session) return null;

  return (
    <PageWrapper role="ADMIN" userName={session.user.name ?? ""}>
      <TopBar
        title="Audit Logs"
        subtitle="Full history of all admin actions"
      />

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          title="No audit logs yet"
          description="Admin actions will appear here."
        />
      ) : (
        <>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    {["Action", "Entity", "Performed By", "Date", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-medium
                                 text-muted-foreground uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr
                        className="border-b border-border last:border-0
                               hover:bg-secondary transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Badge
                            variant={actionVariant[log.action] ?? "neutral"}
                          >
                            {actionLabel[log.action] ?? log.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">
                            {log.entity}
                          </span>
                          {log.entityId && (
                            <span className="text-muted-foreground font-mono text-xs ml-1.5">
                              {log.entityId.slice(0, 8)}…
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-foreground font-medium">
                            {log.actor?.fullName ?? "System"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {log.actor?.email ?? "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {log.metadata && (
                            <button
                              onClick={() =>
                                setExpanded(
                                  expanded === log.id ? null : log.id
                                )
                              }
                              className="text-xs text-primary hover:underline
                                     font-medium"
                            >
                              {expanded === log.id ? "Hide" : "Details"}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expandable metadata row */}
                      {expanded === log.id && log.metadata && (
                        <tr
                          className="bg-secondary border-b border-border"
                        >
                          <td colSpan={5} className="px-4 py-3">
                            <pre
                              className="text-xs text-muted-foreground bg-surface
                                     border border-border rounded-lg
                                     p-3 overflow-x-auto"
                            >
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
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
