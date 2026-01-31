import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildPaymentUri, generateQrData } from "@/lib/qr";
import { formatCryptoAmount } from "@/lib/format";
import InvoiceStatus from "@/components/InvoiceStatus";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      merchant: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  if (!invoice) {
    notFound();
  }

  const paymentUri = buildPaymentUri({
    asset: invoice.cryptoAsset,
    network: invoice.network,
    address: invoice.addressToPay,
    amount: formatCryptoAmount(invoice.cryptoAsset, invoice.expectedCryptoAmount),
    amountRaw: invoice.expectedCryptoAmountRaw,
    receipt: invoice.receiptNumber,
    merchantName: invoice.merchant.businessName,
    invoiceId: invoice.id
  });
  const qrData = await generateQrData(paymentUri);
  const latestPayment = invoice.payments[0];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Invoice {invoice.receiptNumber}</h1>
        <p className="text-sm text-slate-600">Expires {invoice.expiresAt.toLocaleString()}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <img src={qrData} alt="Payment QR" className="h-40 w-40 rounded-lg border border-slate-200 bg-white" />
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Amount (fiat)</p>
                <p className="text-xl font-semibold">
                  {invoice.fiatAmount.toFixed(2)} {invoice.fiatCurrency}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Amount (crypto)</p>
                <p className="text-lg font-semibold">
                  {formatCryptoAmount(invoice.cryptoAsset, invoice.expectedCryptoAmount)} {invoice.cryptoAsset}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Network</p>
                <p className="text-base font-medium">{invoice.network}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Receiving address</p>
              <p className="break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {invoice.addressToPay}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Payment URI</p>
              <p className="break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                {paymentUri}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <InvoiceStatus
            id={invoice.id}
            initialStatus={invoice.status}
            initialPaid={Boolean(latestPayment?.confirmed)}
          />
          {latestPayment && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-700">Last payment</h3>
              <div className="mt-2 text-sm text-slate-600 space-y-1">
                <p>Tx hash: {latestPayment.txHash}</p>
                <p>Amount received: {latestPayment.amountReceived} ({latestPayment.amountReceivedRaw})</p>
                <p>Confirmed: {latestPayment.confirmed ? "Yes" : "No"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
