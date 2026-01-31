import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/SessionProvider";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
              CryptoPay Simple
            </Link>
            <nav className="flex items-center gap-4 text-sm text-slate-600">
              <Link href="/dashboard" className="hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/dashboard/new-payment" className="hover:text-slate-900">
                New Payment
              </Link>
              <Link href="/api/auth/signout" className="hover:text-slate-900">
                Sign out
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </SessionProvider>
  );
}
