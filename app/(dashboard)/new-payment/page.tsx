import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewPaymentForm from "@/components/NewPaymentForm";

export default async function NewPaymentPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true }
  });

  if (!user?.profile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Complete onboarding first</h1>
        <p className="text-sm text-slate-600">
          Please add your business details and wallet addresses before creating payments.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New Payment</h1>
        <p className="text-sm text-slate-600">Create a fiat invoice and generate a crypto QR code.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
        <NewPaymentForm billingCurrency={user.profile.billingCurrency} />
      </div>
    </section>
  );
}
