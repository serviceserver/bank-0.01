// app/(admin)/admin/settings/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [registrationEnabled, setRegistrationEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;

    async function fetchStatus() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/settings/registration");
        const data = await res.json();
        if (data.success) {
          setRegistrationEnabled(data.data.enabled);
        } else {
          setError(data.message ?? "Failed to load registration status.");
        }
      } catch {
        setError("Network error.");
      } finally {
        setLoading(false);
      }
    }

    void fetchStatus();
  }, [session]);

  async function handleToggle() {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !registrationEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrationEnabled(data.data.enabled);
      } else {
        setError(data.message ?? "Failed to update registration status.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setActionLoading(false);
    }
  }

  if (!session) return null;

  return (
    <PageWrapper role="ADMIN" userName={session.user.name ?? ""}>
      <TopBar
        title="System Settings"
        subtitle="Configure platform-wide settings"
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
      ) : (
        <div className="max-w-2xl">
          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Registration
              </h3>
              <Badge variant={registrationEnabled ? "success" : "danger"}>
                {registrationEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Control whether new users can register for accounts.
            </p>
            <Button
              variant={registrationEnabled ? "secondary" : "primary"}
              onClick={handleToggle}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Updating..."
                : registrationEnabled
                ? "Disable Registration"
                : "Enable Registration"
              }
            </Button>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
              User Login Control
            </h3>
            <p className="text-sm text-muted-foreground">
              Block/unblock individual user logins from the user details page.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Navigate to Users → Select a user → Use "Block Login" or "Unblock Login" buttons.
            </p>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}