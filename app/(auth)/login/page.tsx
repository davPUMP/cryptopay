import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-slate-600">Login to manage your crypto invoices.</p>
        </div>
        <AuthForm mode="login" />
        <p className="text-center text-sm text-slate-600">
          New here?{" "}
          <Link href="/signup" className="text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
