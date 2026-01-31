import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="max-w-3xl text-center space-y-6">
        <span className="inline-flex items-center rounded-full bg-brand-50 px-4 py-1 text-sm font-semibold text-brand-700">
          CryptoPay Simple
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Accept crypto payments in minutes.
        </h1>
        <p className="text-lg text-slate-600">
          Create invoices in fiat, generate customer-ready payment QR codes, and track confirmations across Bitcoin, Solana, Ethereum, Base, and stablecoins.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-white shadow hover:bg-brand-700"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3 text-slate-700 shadow-sm hover:bg-slate-100"
          >
            Login
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 text-left pt-10">
          {[
            {
              title: "Non-custodial",
              description: "Customers pay directly to your wallet. We never touch funds."
            },
            {
              title: "Fast invoicing",
              description: "Convert fiat to crypto instantly with trusted rate feeds."
            },
            {
              title: "Realtime status",
              description: "Monitor confirmations with manual refresh and cron polling."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-2">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
