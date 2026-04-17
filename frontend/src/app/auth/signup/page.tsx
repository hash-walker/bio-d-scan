"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/modules/auth/store";
import { Scan, Building2, Eye, EyeOff, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--green-light)] bg-[var(--bg-cream)]/30 transition-colors";

export default function GovernmentSignupPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    department: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const { token, user } = await authApi.registerGovernment({
        name: form.name,
        department: form.department,
        email: form.email,
        password: form.password,
      });
      // Store token cookie + user in auth store
      document.cookie = `bioscan_token=${encodeURIComponent(token)};path=/;max-age=${7 * 86400};SameSite=Lax`;
      useAuthStore.setState({ user });
      void login; // suppress unused warning — state set directly above
      router.push("/gov/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-[#1a2f3a]">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/5 translate-y-20 -translate-x-20" />

        <div className="relative">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-12">
            <Scan size={16} />
            Bio D. Scan
          </div>
          <h1 className="font-display font-bold text-4xl text-white leading-tight mb-4">
            Join the national<br />bio-monitoring grid.
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-xs">
            Register your ministry or department to access full regional analytics,
            farmer oversight, and carbon credit distribution tools.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            "Real-time insect capture monitoring",
            "Per-farm carbon credit management",
            "Biodiversity zone health tracking",
            "Organic compliance dashboards",
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3">
              <CheckCircle2 size={14} className="text-[var(--green-light)] shrink-0" />
              <span className="text-white/70 text-xs">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 text-[var(--green-deep)] font-medium text-sm mb-8 lg:hidden">
            <Scan size={16} />
            Bio D. Scan
          </div>

          <div className="inline-flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1 text-xs font-medium text-slate-700 mb-6">
            <Building2 size={12} />
            Government Portal
          </div>

          <h2 className="font-display font-bold text-2xl text-[var(--text-dark)] mb-1">
            Create your account
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            Register your department to access the oversight dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                Full Name
              </label>
              <input
                required
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Dr. Amina Siddiqui"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                Department / Ministry
              </label>
              <input
                required
                value={form.department}
                onChange={set("department")}
                placeholder="e.g. Ministry of Climate Change"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="you@ministry.gov.pk"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 6 characters"
                  className={cn(inputClass, "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-3.5 text-[var(--text-muted)] hover:text-[var(--text-dark)] transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                placeholder="Repeat password"
                className={inputClass}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full rounded-xl py-3 text-sm font-semibold text-white bg-[#1a2f3a] hover:bg-[#243a47] transition-all flex items-center justify-center gap-2",
                isLoading && "opacity-60 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account <ChevronRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Already have an account?{" "}
            <Link
              href="/auth/signin?role=government"
              className="font-semibold text-[var(--green-deep)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
