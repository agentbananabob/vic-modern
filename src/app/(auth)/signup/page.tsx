"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { signUpSchema } from "@/lib/validations";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = signUpSchema.safeParse(data);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ""])));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) { setErrors({ _form: json.error }); return; }
      router.push("/login?registered=1");
    } catch {
      setErrors({ _form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">Join the community</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {errors._form && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{errors._form}</div>
          )}
          <form onSubmit={submit} className="space-y-3">
            {(["name", "username", "email", "password"] as const).map(key => (
              <div key={key}>
                <input
                  name={key}
                  type={key === "password" ? "password" : key === "email" ? "email" : "text"}
                  placeholder={{ name: "Full name (optional)", username: "Username", email: "Email", password: "Password (min 8 chars)" }[key]}
                  required={key !== "name"}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors[key] ? "border-red-400" : "border-gray-300"}`}
                />
                {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
              </div>
            ))}
            <button type="submit" disabled={loading} className="w-full py-2.5 mt-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
