// app/(dashboard)/dashboard/accounts/page.tsx

"use client";

import { useEffect, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { AccountCard } from "@/components/shared/AccountCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Account } from "@/lib/types";

const ACCOUNT_TYPES = ["SAVINGS", "CHECKING", "MONEY_MARKET", "CD"] as const;

export default function AccountsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("SAVINGS");
  const [error, setError] = useState("");

  async function fetchAccounts() {
    const res = await fetch("/api/accounts");
    const data = await res.json();
    if (data.success) setAccounts(data.data);
    setLoading(false);
  }

  async function handleCreate() {
    setCreating(true);
    setError("");
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: selectedType }),
    });
    const data = await res.json();
    setCreating(false);
    if (!data.success) {
      setError(data.message);
      return;
    }
    setShowModal(false);
    fetchAccounts();
  }

  useEffect(() => {
    const loadAccounts = async () => {
      await fetchAccounts();
    };

    loadAccounts();
  }, []);

  if (!session) return null;

  return (
    <PageWrapper
      role={session.user.role as "CUSTOMER" | "ADMIN"}
      userName={session.user.name ?? ""}
    >
      <TopBar
        title="Accounts"
        subtitle="Manage your bank accounts"
        action={
          <Button size="sm" onClick={() => setShowModal(true)}>
            + Open Account
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          description="Open your first account to get started."
          action={
            <Button size="sm" onClick={() => setShowModal(true)}>
              Open Account
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-6 sm:py-8">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              accountNumber={account.accountNumber}
              type={account.type}
              balance={account.balance}
              status={account.status}
              onClick={() => router.push(`/dashboard/accounts/${account.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center
                        justify-center z-50 px-4 py-6">
          <div className="bg-surface rounded-xl border border-border
                          shadow-lg w-full max-w-md p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold text-foreground">
              Open New Account
            </h2>

            <div className="flex flex-col gap-2">
              {ACCOUNT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`
                    px-4 py-3 rounded-lg border text-sm font-medium text-left
                    transition-colors duration-100
                    ${selectedType === type
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:bg-secondary"
                    }
                  `}
                >
{type === "SAVINGS" && "Savings Account"}
                           {type === "CHECKING" && "Checking Account"}
                           {type === "MONEY_MARKET" && "Money Market"}
                           {type === "CD" && "CD"}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-xs text-danger bg-danger/5 border
                            border-danger/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => { setShowModal(false); setError(""); }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                loading={creating}
                onClick={handleCreate}
              >
                Open Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}