import Link from "next/link";
import { ArrowRight, Leaf, Building2, Scan } from "lucide-react";

export default function RoleSelector() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 bg-[var(--green-pale)]/50 border border-[var(--green-pale)] rounded-full px-4 py-1.5 text-sm text-[var(--green-deep)] font-medium mb-5 sm:mb-6">
          <Scan size={14} />
          The Living Ledger
        </div>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-[var(--green-deep)] mb-4 leading-tight">
          Bio D. Scan
        </h1>
        <p className="text-[var(--text-muted)] text-lg max-w-md">
          Where high-end digital precision meets the soulful, lived field
          journal. Choose your portal to begin.
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Farmer */}
        <Link href="/auth/signin?role=farmer" className="group">
          <div className="bg-white rounded-3xl p-8 border border-[var(--border-subtle)] shadow-sm hover:shadow-md hover:border-[var(--green-light)] transition-all duration-200 h-full flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-[var(--green-pale)]/60 flex items-center justify-center mb-5">
              <Leaf size={28} className="text-[var(--green-deep)]" />
            </div>
            <h2 className="font-display font-bold text-2xl text-[var(--green-deep)] mb-2">
              Farmer Portal
            </h2>
            <p className="text-[var(--text-muted)] text-sm flex-1 mb-6">
              Live insect scanning, capture logs, carbon credit tracking, and
              the marketplace to redeem your rewards.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--green-deep)] group-hover:gap-3 transition-all">
              Sign in as Farmer <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Government */}
        <Link href="/auth/signin?role=government" className="group">
          <div className="bg-[var(--green-deep)] rounded-3xl p-8 border border-[var(--green-deep)] shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
              <Building2 size={28} className="text-white" />
            </div>
            <h2 className="font-display font-bold text-2xl text-white mb-2">
              Government Portal
            </h2>
            <p className="text-white/70 text-sm flex-1 mb-6">
              Regional analytics, all-farmer oversight, biodiversity health
              monitoring, and carbon credit distribution.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-white group-hover:gap-3 transition-all">
              Sign in as Government <ArrowRight size={16} />
            </div>
          </div>
        </Link>
      </div>

      {/* Footer note */}
      <p className="mt-12 text-xs text-[var(--text-light)]">
        Bio D. Scan v2.4 · Designed for Field Researchers &amp; Naturalists alike.
      </p>
    </main>
  );
}
