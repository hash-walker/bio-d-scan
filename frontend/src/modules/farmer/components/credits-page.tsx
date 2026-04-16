"use client";

import { useState, useEffect } from "react";
import { useFarmerStore } from "@/modules/farmer/store";
import { MARKETPLACE_ITEMS } from "@/lib/mock-data";
import { creditsApi, type MarketplaceItem as ApiMarketplaceItem } from "@/lib/api";
import { Card, CardContent, CardActionHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { ListRow, IconCircle } from "@/components/ui/list-row";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Star,
  Sprout,
  Flower2,
  Cpu,
  Droplets,
  Recycle,
  Shield,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketplaceItem } from "@/modules/shared/types";

function apiMarketToFrontend(item: ApiMarketplaceItem): MarketplaceItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    creditCost: item.credit_cost,
    category: item.category as MarketplaceItem["category"],
    iconName: item.icon_name,
  };
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sprout, Flower2, Cpu, Droplets, Recycle, Shield,
};

function MarketplaceCard({
  item,
  userCredits,
  onRedeem,
}: {
  item: MarketplaceItem;
  userCredits: number;
  onRedeem: (item: MarketplaceItem) => void;
}) {
  const Icon = ICON_MAP[item.iconName] ?? Sprout;
  const canAfford = userCredits >= item.creditCost;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-sm",
        canAfford ? "border-[var(--border-subtle)]" : "border-[var(--border-subtle)] opacity-60"
      )}
    >
      <div className="w-full aspect-video rounded-xl bg-blue-50/60 flex items-center justify-center">
        <Icon size={36} className="text-[var(--green-mid)]" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-[var(--text-dark)] text-sm mb-1">{item.name}</h3>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.description}</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Star size={14} className="text-[var(--amber-mid)]" fill="currentColor" />
          <span className="font-bold text-sm text-[var(--text-dark)]">{item.creditCost}</span>
          <span className="text-xs text-[var(--text-muted)]">Credits</span>
        </div>
        <Button
          size="sm"
          variant={canAfford ? "secondary" : "outline"}
          onClick={() => canAfford && onRedeem(item)}
          disabled={!canAfford}
          className="text-xs uppercase tracking-wide"
        >
          Redeem
        </Button>
      </div>
    </div>
  );
}

export function CreditsPage() {
  const { carbonCredits, transactions, redeemCredits } = useFarmerStore();
  const [redeemed, setRedeemed] = useState<string | null>(null);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(MARKETPLACE_ITEMS);

  useEffect(() => {
    creditsApi.marketplace()
      .then((items) => setMarketplaceItems(items.map(apiMarketToFrontend)))
      .catch(() => { /* keep mock fallback */ });
  }, []);

  const handleRedeem = (item: MarketplaceItem) => {
    redeemCredits(item.id, item.creditCost, `Redeemed: ${item.name}`);
    setRedeemed(item.id);
    setTimeout(() => setRedeemed(null), 3000);
  };

  const totalEarned = transactions
    .filter((t) => t.type === "earned" || t.type === "released")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRedeemed = transactions
    .filter((t) => t.type === "redeemed")
    .reduce((sum, t) => sum + t.amount, 0);

  const utilizationPct = Math.round((totalRedeemed / (totalEarned || 1)) * 100);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Carbon Credits"
        subtitle="Earn by scanning, redeem for farm inputs and equipment."
      />

      {/* Balance card */}
      <Card variant="dark" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-12 translate-x-12" />
        <CardContent className="relative">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-2">
                Current Earth Balance
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-5xl text-white">
                  {carbonCredits.toLocaleString()}
                </span>
                <span className="text-white/60 text-sm">TCO2e</span>
              </div>
              <p className="text-white/50 text-xs mt-2 max-w-xs">
                Your regenerative practices have sequestered enough carbon to offset{" "}
                {Math.floor(carbonCredits / 1.07)} flights from Karachi to Islamabad.
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-right">
                <p className="text-white/50 text-xs">TOTAL EARNED</p>
                <p className="text-white font-bold text-xl">{totalEarned.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-xs">TOTAL REDEEMED</p>
                <p className="text-[var(--amber-light)] font-bold text-xl">
                  {totalRedeemed.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex justify-between text-xs text-white/50 mb-1.5">
              <span>Credit utilization</span>
              <span>{utilizationPct}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--amber-light)] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, utilizationPct)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="This Month" value="+340" icon={TrendingUp} color="text-[var(--green-deep)]" size="sm" />
        <StatCard label="Biodiversity Index" value="9.2" icon={Star} color="text-[var(--amber-mid)]" size="sm" />
        <StatCard label="Sync Progress" value="84%" icon={CheckCircle2} color="text-blue-600" size="sm">
          <ProgressBar value={84} className="mt-2" />
        </StatCard>
      </div>

      {/* Marketplace */}
      <div>
        <h2 className="font-display font-bold text-xl text-[var(--green-deep)] mb-4">
          Exchange Marketplace
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketplaceItems.map((item) => (
            <MarketplaceCard
              key={item.id}
              item={item}
              userCredits={carbonCredits}
              onRedeem={handleRedeem}
            />
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <Card>
        <CardActionHeader title="Transaction History" />
        <CardContent>
          <div className="space-y-1">
            {transactions.slice(0, 8).map((tx) => {
              const isRedeemed = tx.type === "redeemed";
              const isReleased = tx.type === "released";
              return (
                <ListRow
                  key={tx.id}
                  leading={
                    <IconCircle
                      className={cn(
                        isRedeemed
                          ? "bg-amber-100 text-amber-600"
                          : isReleased
                          ? "bg-blue-100 text-blue-600"
                          : "bg-[var(--green-pale)] text-[var(--green-deep)]"
                      )}
                    >
                      {isRedeemed ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                    </IconCircle>
                  }
                  title={tx.description}
                  subtitle={
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(tx.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  }
                  trailing={
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        isRedeemed ? "text-[var(--amber-mid)]" : "text-[var(--green-deep)]"
                      )}
                    >
                      {isRedeemed ? "-" : "+"}
                      {tx.amount}
                    </span>
                  }
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Toast show={!!redeemed} message="Item redeemed successfully!" icon={CheckCircle2} />
    </div>
  );
}
