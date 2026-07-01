// app/(dashboard)/dashboard/settings/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CustomerSettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    if (!session) return;

    async function checkPin() {
      try {
        const res = await fetch("/api/users/transfer-pin");
        const data = await res.json();
        if (data.success) {
          setHasPin(data.data.hasPin);
        }
      } catch {
        // Ignore errors - will show option to set PIN
      }
    }

    void checkPin();
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (pin !== confirmPin) {
      setError("PINs do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users/transfer-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Transfer PIN updated successfully.");
        setHasPin(true);
        setPin("");
        setConfirmPin("");
      } else {
        setError(data.message || "Failed to update PIN.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!session) return null;

  return (
    <PageWrapper role="CUSTOMER" userName={session.user.name ?? ""}>
      <TopBar title="Settings" subtitle="Manage your account preferences" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Transfer PIN
          </h3>

          {hasPin ? (
            <p className="text-sm text-muted-foreground mb-4">
              You have a transfer PIN set. Update it below.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">
              Set a 4-6 digit PIN to authorize transfers for added security.
            </p>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">New PIN</label>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4,6}"
                maxLength={6}
                placeholder="Enter 4-6 digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                className="text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Confirm PIN</label>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4,6}"
                maxLength={6}
                placeholder="Confirm PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                className="text-sm"
              />
            </div>

            <Button type="submit" disabled={loading || pin.length < 4}>
              {loading ? "Saving..." : "Save PIN"}
            </Button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}