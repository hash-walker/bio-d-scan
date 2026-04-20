"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/modules/auth/store";
import { Scan, Leaf, Building2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function SignInPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const role = (params.get("role") ?? "farmer") as "farmer" | "government";

  const { login, user, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace(user.role === "farmer" ? "/dashboard" : "/gov/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password, role);
      // redirect handled by useEffect above
    } catch {
      // error shown via store.error
    }
  };

  const isFarmer = role === "farmer";

  const inputClass =
    "w-full border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--green-light)] bg-[var(--bg-cream)]/30 transition-colors";

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left panel — branding ── */}
      <div
        className={cn(
          "hidden lg:flex flex-col justify-between p-12 relative overflow-hidden",
          isFarmer ? "bg-[var(--green-deep)]" : "bg-[#1a2f3a]"
        )}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/5 translate-y-20 -translate-x-20" />

        <div className="relative">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-12">
            <Scan size={16} />
            Bio D. Scan
          </div>
          <h1 className="font-display font-bold text-4xl text-white leading-tight mb-4">
            {isFarmer ? "Your field,\nyour ledger." : "Monitor every\nacre, precisely."}
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-xs">
            {isFarmer
              ? "Real-time insect scanning, carbon credit tracking, and the marketplace — all in one place."
              : "Full oversight of farmer data, biodiversity health, and carbon credit distribution across regions."}
          </p>
        </div>

        <div className="relative space-y-3">
          {isFarmer ? (
            <>
              <Stat label="Active farms" value="1,240+" />
              <Stat label="Captures today" value="8,300+" />
              <Stat label="Credits issued" value="₁₂.4K TCO2e" />
            </>
          ) : (
            <>
              <Stat label="Registered farmers" value="1,240+" />
              <Stat label="Organic farms" value="68%" />
              <Stat label="Bio-zones monitored" value="12" />
            </>
          )}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo on mobile */}
          <div className="flex items-center gap-2 text-[var(--green-deep)] font-medium text-sm mb-8 lg:hidden">
            <Scan size={16} />
            Bio D. Scan
          </div>

          {/* Role badge */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-6",
              isFarmer
                ? "bg-[var(--green-pale)]/60 text-[var(--green-deep)]"
                : "bg-slate-100 text-slate-700"
            )}
          >
            {isFarmer ? <Leaf size={12} /> : <Building2 size={12} />}
            {isFarmer ? "Farmer Portal" : "Government Portal"}
          </div>

          <h2 className="font-display font-bold text-2xl text-[var(--text-dark)] mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            Sign in to your account to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                "w-full rounded-xl py-3 text-sm font-semibold text-white transition-all",
                isFarmer ? "bg-[var(--green-deep)] hover:bg-[var(--green-mid)]" : "bg-[#1a2f3a] hover:bg-[#243a47]",
                isLoading && "opacity-60 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Don&apos;t have an account?{" "}
            <Link
              href={isFarmer ? "/onboarding" : `/auth/signup?role=government`}
              className="font-semibold text-[var(--green-deep)] hover:underline"
            >
              {isFarmer ? "Register your farm" : "Register"}
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              href={`/auth/signin?role=${isFarmer ? "government" : "farmer"}`}
              className="text-xs text-[var(--text-light)] hover:text-[var(--text-muted)] transition-colors"
            >
              Switch to {isFarmer ? "Government" : "Farmer"} portal →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[var(--bg-cream)]" />}>
      <SignInPageContent />
    </Suspense>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
      <span className="text-white/60 text-xs">{label}</span>
      <span className="text-white font-semibold text-sm">{value}</span>
    </div>
  );
}
