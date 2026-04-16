import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ArrowRight } from "lucide-react";

const REPORTS = [
  {
    id: "r-001",
    title: "Q3 2024 Regional Biodiversity Report",
    description: "Summary of insect captures, organic farming adoption, and carbon credit distribution across all registered farms.",
    date: "Oct 01, 2024",
    status: "published" as const,
    size: "2.4 MB",
  },
  {
    id: "r-002",
    title: "Sector 7 Dry Spell Impact Assessment",
    description: "Analysis of decreased moisture levels and recommended irrigation funding allocation for Zone A-12.",
    date: "Sep 15, 2024",
    status: "published" as const,
    size: "1.1 MB",
  },
  {
    id: "r-003",
    title: "Q4 2024 Organic Transition Progress",
    description: "Tracking the percentage of transitioning farms and projected organic adoption by end of year.",
    date: "Pending",
    status: "draft" as const,
    size: "—",
  },
  {
    id: "r-004",
    title: "Annual Carbon Credits Ledger 2024",
    description: "Full ledger of all credits earned, released, and redeemed across the farmer network for the fiscal year.",
    date: "Dec 31, 2024",
    status: "draft" as const,
    size: "—",
  },
];

export default function ReportsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--green-deep)]">
          Reports
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Regional research reports and credit ledger exports.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {REPORTS.map((report) => (
              <div
                key={report.id}
                className="flex items-start gap-4 p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-cream)]/30 hover:bg-[var(--bg-cream)]/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--green-pale)]/50 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-[var(--green-deep)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-[var(--text-dark)] text-sm">{report.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed max-w-lg">
                        {report.description}
                      </p>
                    </div>
                    <Badge variant={report.status === "published" ? "green" : "gray"} className="capitalize shrink-0">
                      {report.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    <span>{report.date}</span>
                    {report.size !== "—" && <span>{report.size}</span>}
                    {report.status === "published" && (
                      <button className="flex items-center gap-1 text-[var(--green-deep)] font-medium hover:underline">
                        <Download size={11} /> Export PDF
                      </button>
                    )}
                  </div>
                </div>
                <ArrowRight size={15} className="text-[var(--text-light)] shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
