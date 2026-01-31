import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-slate-600">Set up your merchant profile in minutes.</p>
        </div>
        <AuthForm mode="signup" />
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 hover:text-brand-700">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
