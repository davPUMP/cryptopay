"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const cryptoOptions = [
  { value: "BTC", label: "BTC" },
  { value: "SOL", label: "SOL" },
  { value: "ETH", label: "ETH (Ethereum)" },
  { value: "ETH_BASE", label: "ETH (Base)" },
  { value: "USDC", label: "USDC (Ethereum)" },
  { value: "USDT", label: "USDT (Ethereum)" },
  { value: "USDC_BASE", label: "USDC (Base)" },
  { value: "USDT_BASE", label: "USDT (Base)" }
];

export default function NewPaymentForm({ billingCurrency }: { billingCurrency: string }) {
  const router = useRouter();
  const [cryptoAmount, setCryptoAmount] = useState<string>("");
  const [loadingRate, setLoadingRate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchRate(asset: string, amountFiat: number) {
    setLoadingRate(true);
    setError(null);
    const response = await fetch(`/api/rates?asset=${asset}&fiat=${billingCurrency}&amount=${amountFiat}`);
    if (!response.ok) {
      setError("Unable to fetch rate.");
      setLoadingRate(false);
      return;
    }
    const data = await response.json();
    setCryptoAmount(data.amount);
    setLoadingRate(false);
  }

  useEffect(() => {
    setCryptoAmount("");
  }, [billingCurrency]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      receiptNumber: formData.get("receiptNumber"),
      fiatAmount: Number(formData.get("fiatAmount")),
      cryptoAsset: formData.get("cryptoAsset")
    };

    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Unable to create invoice.");
      return;
    }

    const data = await response.json();
    router.push(`/dashboard/invoices/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="receiptNumber">Receipt number</label>
        <input id="receiptNumber" name="receiptNumber" required />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="fiatAmount">Amount ({billingCurrency})</label>
          <input
            id="fiatAmount"
            name="fiatAmount"
            type="number"
            min="0"
            step="0.01"
            required
            onBlur={(event) => {
              const value = Number(event.target.value);
              const asset = (document.getElementById("cryptoAsset") as HTMLSelectElement)?.value;
              if (asset && value > 0) {
                fetchRate(asset, value);
              }
            }}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="cryptoAsset">Customer crypto choice</label>
          <select
            id="cryptoAsset"
            name="cryptoAsset"
            onChange={(event) => {
              const value = Number((document.getElementById("fiatAmount") as HTMLInputElement)?.value);
              if (value > 0) {
                fetchRate(event.target.value, value);
              }
            }}
          >
            {cryptoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-700">Live conversion</h3>
        <p className="text-sm text-slate-600">
          {loadingRate ? "Fetching rate..." : cryptoAmount ? `${cryptoAmount} (estimated)` : "Enter amount to fetch rate."}
        </p>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <button type="submit" className="bg-brand-600 text-white px-5 py-2 hover:bg-brand-700">
        Create payment
      </button>
    </form>
  );
}
