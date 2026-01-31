"use client";

import { useState } from "react";

interface InvoiceStatusProps {
  id: string;
  initialStatus: string;
  initialPaid: boolean;
}

export default function InvoiceStatus({ id, initialStatus, initialPaid }: InvoiceStatusProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(initialPaid ? "Payment received" : "Awaiting payment");

  async function refreshStatus() {
    setLoading(true);
    const response = await fetch(`/api/invoices/${id}/status`);
    const data = await response.json();
    setStatus(data.status);
    setMessage(data.message);
    setLoading(false);
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">Status</h3>
        <p className="text-base font-semibold text-slate-900">{status}</p>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
      <button
        type="button"
        onClick={refreshStatus}
        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
      >
        {loading ? "Checking..." : "Refresh status"}
      </button>
    </div>
  );
}
