"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "",
    ssn: "", dob: "", address: "", city: "", state: "", zip: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.message);
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">NexBank</h1>
          <p className="text-sm text-gray-500 mt-1">Create your account</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6 flex flex-col gap-4">
          <Input
            label="Full Name"
            placeholder="Jane Smith"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="2125551234"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            hint="Min 8 characters, one uppercase, one number"
          />
          <Input
            label="SSN (optional)"
            placeholder="123456789"
            value={form.ssn}
            onChange={(e) => update("ssn", e.target.value)}
            hint="9-digit Social Security Number"
          />
          <Input
            label="Date of Birth"
            type="date"
            placeholder="YYYY-MM-DD"
            value={form.dob}
            onChange={(e) => update("dob", e.target.value)}
          />
          <Input
            label="Address"
            placeholder="123 Main St"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              placeholder="New York"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
            <Input
              label="State"
              placeholder="NY"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
            />
          </div>
          <Input
            label="ZIP Code"
            placeholder="10001"
            value={form.zip}
            onChange={(e) => update("zip", e.target.value)}
          />

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200
                          rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button loading={loading} onClick={handleSubmit} className="w-full mt-1">
            Create account
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}