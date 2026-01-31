"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").toLowerCase();
    const password = String(formData.get("password") || "");

    if (mode === "signup") {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Unable to create account.");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-1">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={8} />
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-600 text-white px-4 py-2 hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
      </button>
    </form>
  );
}
