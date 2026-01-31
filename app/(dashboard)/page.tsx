import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "@/components/OnboardingForm";

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  PAID: "Paid",
  EXPIRED: "Expired",
  UNDERPAID: "Underpaid",
  OVERPAID: "Overpaid"
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true }
  });

  const profile = user?.profile ?? null;

  if (!profile) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Set up your merchant profile</h1>
          <p className="text-sm text-slate-600">Add your business details and receiving addresses.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <OnboardingForm />
        </div>
      </section>
    );
  }

  const invoices = await prisma.invoice.findMany({
    where: { merchantId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-600">
            Billing currency: {profile.billingCurrency} · Fee {profile.feeEnabled ? `${profile.feePercent}%` : "Off"}
          </p>
        </div>
        <Link
          href="/dashboard/new-payment"
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-white shadow hover:bg-brand-700"
        >
          New Payment
        </Link>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Recent invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Receipt</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Crypto</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                    No invoices yet. Create your first payment request.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-slate-100">
                    <td className="px-6 py-3">
                      <Link href={`/dashboard/invoices/${invoice.id}`} className="text-brand-600 hover:text-brand-700">
                        {invoice.receiptNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      {invoice.fiatAmount.toFixed(2)} {invoice.fiatCurrency}
                    </td>
                    <td className="px-6 py-3">{invoice.cryptoAsset}</td>
                    <td className="px-6 py-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        {statusLabels[invoice.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {invoice.createdAt.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
