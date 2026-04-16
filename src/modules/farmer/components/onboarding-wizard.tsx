"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Droplets,
  Tractor,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Leaf,
  Waves,
} from "lucide-react";

const STEPS = ["Identity", "Land Stewardship", "Ecosystem", "Review"] as const;

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  farmName: z.string().min(2, "Farm name is required"),
  phone: z.string().min(10, "Valid phone number required"),
});

const step2Schema = z.object({
  location: z.string().min(3, "Location or coordinates required"),
  fieldArea: z
    .string()
    .min(1, "Field area is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Field area must be a positive number",
    }),
  farmingMethod: z.enum(["organic", "transitioning", "commercial"]),
  waterSource: z.enum(["rainFed", "irrigated", "mixed"]),
});

const step3Schema = z.object({
  primaryCrops: z.string().min(2, "Please list your primary crops"),
  usesPesticides: z.boolean(),
  hasSoilTests: z.boolean(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data>>({});
  const [farmingMethod, setFarmingMethod] = useState<"organic" | "transitioning" | "commercial">("organic");
  const [waterSource, setWaterSource] = useState<"rainFed" | "irrigated" | "mixed">("rainFed");
  const [sliderValue, setSliderValue] = useState(20);

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form2 = useForm<any>({ resolver: zodResolver(step2Schema) });
  const form3 = useForm<Step3Data>({ resolver: zodResolver(step3Schema) });

  const progress = ((step + 1) / STEPS.length) * 100;

  const onStep1 = (data: Step1Data) => {
    setFormData((p) => ({ ...p, ...data }));
    setStep(1);
  };

  const onStep2 = (data: Step2Data) => {
    setFormData((p) => ({ ...p, ...data, farmingMethod, waterSource }));
    setStep(2);
  };

  const onStep3 = (data: Step3Data) => {
    setFormData((p) => ({ ...p, ...data }));
    setStep(3);
  };

  const handleComplete = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      {/* Decorative notes */}
      <div className="hidden lg:block absolute left-8 top-1/3 space-y-4">
        <div className="bg-blue-100/80 rounded-2xl p-4 max-w-[140px] shadow-sm">
          <p className="text-[10px] font-semibold text-blue-700 mb-1">NOTE 01</p>
          <p className="text-xs text-blue-600">Soil microbial health correlates to 84% yield stability.</p>
        </div>
        <div className="bg-amber-100/80 rounded-2xl p-4 max-w-[140px] shadow-sm">
          <p className="text-[10px] font-semibold text-amber-700 mb-1">NOTE 02</p>
          <p className="text-xs text-amber-600">Precision scanning reduces water waste by nearly 40%.</p>
        </div>
      </div>

      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-[var(--border-subtle)] overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-bold text-xl text-[var(--green-deep)]">
                  {STEPS[step]}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  STEP {String(step + 1).padStart(2, "0")} OF {String(STEPS.length).padStart(2, "0")}
                </p>
              </div>
              <div className="text-right">
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i <= step
                          ? "bg-[var(--amber-deep)] w-8"
                          : "bg-[var(--border-subtle)] w-4"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-[var(--border-subtle)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--amber-deep)] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="px-8 py-6">
            {/* ── Step 0: Identity ── */}
            {step === 0 && (
              <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4">
                <div className="bg-blue-50 rounded-2xl px-5 py-4 mb-2">
                  <p className="text-sm font-semibold text-[var(--green-deep)] mb-1">
                    Welcome to Bio D. Scan
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    This helps us calibrate our sensors and assign carbon credits
                    specific to your farm.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                    Full Name
                  </label>
                  <input
                    {...form1.register("name")}
                    placeholder="e.g. Ahmed Khan"
                    className="w-full border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--green-light)] bg-[var(--bg-cream)]/30"
                  />
                  {form1.formState.errors.name && (
                    <p className="text-xs text-red-500 mt-1">{form1.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                    Farm Name
                  </label>
                  <input
                    {...form1.register("farmName")}
                    placeholder="e.g. Green Valley Orchards"
                    className="w-full border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--green-light)] bg-[var(--bg-cream)]/30"
                  />
                  {form1.formState.errors.farmName && (
                    <p className="text-xs text-red-500 mt-1">{form1.formState.errors.farmName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                    Phone Number
                  </label>
                  <input
                    {...form1.register("phone")}
                    placeholder="+92 300 0000000"
                    className="w-full border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--green-light)] bg-[var(--bg-cream)]/30"
                  />
                  {form1.formState.errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{form1.formState.errors.phone.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full mt-2" size="lg">
                  Continue <ChevronRight size={16} />
                </Button>
              </form>
            )}

            {/* ── Step 1: Land Stewardship ── */}
            {step === 1 && (
              <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-5">
                <div className="bg-blue-50 rounded-2xl px-5 py-4">
                  <p className="text-sm font-semibold text-[var(--green-deep)] mb-1">
                    Tell us about your soil?
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    This helps us calibrate our sensors for your specific terrain
                    and local ecosystem diversity.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                    Farm Name or Coordinates
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3.5 text-[var(--text-muted)]" />
                    <input
                      {...form2.register("location")}
                      placeholder="e.g. Green Valley Orchards"
                      className="w-full border border-[var(--border-subtle)] rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--green-light)] bg-[var(--bg-cream)]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                    Field Area (hectares)
                  </label>
                  <input
                    {...form2.register("fieldArea")}
                    type="number"
                    placeholder="e.g. 24.5"
                    className="w-full border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--green-light)] bg-[var(--bg-cream)]/30"
                  />
                </div>

                {/* Farming method slider */}
                <div className="bg-[var(--bg-cream)]/60 rounded-2xl p-4">
                  <div className="flex justify-between text-xs font-medium mb-3">
                    <span className="text-[var(--green-deep)]">100% Organic</span>
                    <span className="text-[var(--amber-mid)]">Commercial</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sliderValue}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setSliderValue(v);
                      setFarmingMethod(v < 33 ? "organic" : v < 66 ? "transitioning" : "commercial");
                    }}
                    className="w-full accent-[var(--green-deep)]"
                  />
                  <p className="text-center text-xs text-[var(--text-muted)] mt-1.5 uppercase tracking-wide">
                    Slide to match your current farming methodology
                  </p>
                  <p className="text-center text-sm font-semibold text-[var(--green-deep)] mt-1 capitalize">
                    {farmingMethod}
                  </p>
                </div>

                {/* Water source */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                    Water Source
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["rainFed", "irrigated", "mixed"] as const).map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setWaterSource(src)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all",
                          waterSource === src
                            ? "bg-[var(--green-pale)]/60 border-[var(--green-deep)] text-[var(--green-deep)]"
                            : "bg-white border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--green-light)]"
                        )}
                      >
                        {src === "rainFed" ? <Droplets size={16} /> : src === "irrigated" ? <Waves size={16} /> : <Tractor size={16} />}
                        {src === "rainFed" ? "Rain Fed" : src === "irrigated" ? "Irrigated" : "Mixed"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(0)} size="lg" className="flex-1">
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button type="submit" size="lg" className="flex-1">
                    Continue <ChevronRight size={16} />
                  </Button>
                </div>
              </form>
            )}

            {/* ── Step 2: Ecosystem ── */}
            {step === 2 && (
              <form onSubmit={form3.handleSubmit(onStep3)} className="space-y-4">
                <div className="bg-blue-50 rounded-2xl px-5 py-4 mb-2">
                  <p className="text-sm font-semibold text-[var(--green-deep)] mb-1">
                    Your ecosystem footprint
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Help us understand how your farm interacts with local
                    biodiversity for better scanning calibration.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                    Primary Crops
                  </label>
                  <input
                    {...form3.register("primaryCrops")}
                    placeholder="e.g. Wheat, Rice, Sunflower"
                    className="w-full border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--green-light)] bg-[var(--bg-cream)]/30"
                  />
                </div>
                <div className="space-y-3">
                  {[
                    { field: "usesPesticides" as const, label: "Uses synthetic pesticides", sub: "Affects insect capture scoring" },
                    { field: "hasSoilTests" as const, label: "Has recent soil test data", sub: "Helps calibrate carbon calculations" },
                  ].map(({ field, label, sub }) => (
                    <label key={field} className="flex items-start gap-3 p-4 bg-[var(--bg-cream)]/40 rounded-xl cursor-pointer hover:bg-[var(--green-pale)]/20 transition-colors">
                      <input
                        type="checkbox"
                        {...form3.register(field)}
                        className="mt-0.5 accent-[var(--green-deep)] w-4 h-4"
                      />
                      <div>
                        <p className="text-sm font-medium text-[var(--text-dark)]">{label}</p>
                        <p className="text-xs text-[var(--text-muted)]">{sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} size="lg" className="flex-1">
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button type="submit" size="lg" className="flex-1">
                    Review <ChevronRight size={16} />
                  </Button>
                </div>
              </form>
            )}

            {/* ── Step 3: Review ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 p-4 bg-[var(--green-pale)]/30 rounded-2xl">
                  <CheckCircle2 size={22} className="text-[var(--green-deep)] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--green-deep)]">
                      Everything looks good!
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Review your details before completing registration.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Name", value: formData.name || "—" },
                    { label: "Farm", value: formData.farmName || "—" },
                    { label: "Location", value: formData.location || "—" },
                    { label: "Field Area", value: formData.fieldArea ? `${formData.fieldArea} ha` : "—" },
                    { label: "Method", value: farmingMethod },
                    { label: "Water", value: waterSource },
                    { label: "Crops", value: formData.primaryCrops || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2 border-b border-[var(--border-subtle)] text-sm">
                      <span className="text-[var(--text-muted)]">{label}</span>
                      <span className="font-medium text-[var(--text-dark)] capitalize">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} size="lg" className="flex-1">
                    <ChevronLeft size={16} /> Edit
                  </Button>
                  <Button onClick={handleComplete} size="lg" className="flex-1">
                    Complete Registration <Leaf size={15} />
                  </Button>
                </div>
                <p className="text-center text-xs text-[var(--text-muted)]">
                  By joining, you agree to our Field Stewardship Code
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Active stewards ticker */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--green-light)] animate-pulse" />
          <span className="text-xs text-[var(--text-muted)]">
            342 active stewards in your region
          </span>
        </div>
      </div>
    </div>
  );
}
