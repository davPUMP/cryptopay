"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    const payload = {
      businessName: formData.get("businessName"),
      billingCurrency: formData.get("billingCurrency"),
      btcAddress: formData.get("btcAddress"),
      solAddress: formData.get("solAddress"),
      evmAddress: formData.get("evmAddress"),
      feeEnabled: formData.get("feeEnabled") === "on",
      feePercent: Number(formData.get("feePercent") || 0)
    };

    const response = await fetch("/api/merchant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Unable to save profile.");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="businessName">Business name</label>
          <input id="businessName" name="businessName" required />
        </div>
        <div className="space-y-1">
          <label htmlFor="billingCurrency">Billing fiat currency</label>
          <select id="billingCurrency" name="billingCurrency" defaultValue="THB">
            <option value="THB">THB</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="btcAddress">BTC receiving address</label>
          <input id="btcAddress" name="btcAddress" required />
        </div>
        <div className="space-y-1">
          <label htmlFor="solAddress">SOL receiving address</label>
          <input id="solAddress" name="solAddress" required />
        </div>
        <div className="space-y-1">
          <label htmlFor="evmAddress">EVM receiving address</label>
          <input id="evmAddress" name="evmAddress" required />
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Optional fee</h3>
            <p className="text-sm text-slate-600">Add a configurable fee on top of the invoice.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="feeEnabled" /> Enable fee
          </label>
        </div>
        <div className="mt-3 max-w-xs">
          <label htmlFor="feePercent">Fee percent</label>
          <input id="feePercent" name="feePercent" type="number" min="0" step="0.1" defaultValue="0" />
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="bg-brand-600 text-white px-5 py-2 hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
