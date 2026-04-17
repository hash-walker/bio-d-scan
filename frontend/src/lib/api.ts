/**
 * Lightweight API client for the Bio D. Scan backend.
 * All functions throw on non-2xx responses.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)bioscan_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Farmer {
  id: string;
  name: string;
  farm_name: string;
  phone: string | null;
  location: string;
  lat: number;
  lng: number;
  field_area_ha: number;
  farming_method: "organic" | "transitioning" | "commercial";
  water_source: "rainFed" | "irrigated" | "mixed";
  primary_crops: string | null;
  carbon_credits: number;
  joined_at: string;
  weather: { temp: number; humidity: number; condition: string };
}

export interface Capture {
  id: string;
  trackingId: number;
  farmerId: string | null;
  label: string;
  kind: string;
  confidence: number;
  timestamp: string;
  bboxXyxy: number[];
  imageS3Uri: string | null;
  imagePath: string | null;
  lat: number | null;
  lng: number | null;
  trajectory: string | null;
}

export interface Transaction {
  id: string;
  farmerId: string;
  amount: number;
  type: "earned" | "redeemed" | "released";
  description: string;
  createdAt: string;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  credit_cost: number;
  category: string;
  icon_name: string;
}

export interface GovOverview {
  totalFarmers: number;
  organicFarmers: number;
  organicPercent: number;
  totalAreaHa: number;
  totalCreditsIssued: number;
  totalCaptures: number;
  capturesByKind: Record<string, number>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: "farmer" | "government";
  name: string;
  department: string | null;
  farmerId: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterFarmerPayload {
  email: string;
  password: string;
  name: string;
  farm_name: string;
  phone?: string;
  location: string;
  lat?: number;
  lng?: number;
  field_area_ha: number;
  farming_method: "organic" | "transitioning" | "commercial";
  water_source: "rainFed" | "irrigated" | "mixed";
  primary_crops?: string;
}

export interface RegisterGovernmentPayload {
  email: string;
  password: string;
  name: string;
  department: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  registerFarmer: (data: RegisterFarmerPayload) =>
    request<AuthResponse>("/auth/register/farmer", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  registerGovernment: (data: RegisterGovernmentPayload) =>
    request<AuthResponse>("/auth/register/government", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => request<AuthUser>("/auth/me"),
};

// ─── Farmers ─────────────────────────────────────────────────────────────────

export interface CreateFarmerPayload {
  name: string;
  farm_name: string;
  phone?: string;
  location: string;
  lat?: number;
  lng?: number;
  field_area_ha: number;
  farming_method: "organic" | "transitioning" | "commercial";
  water_source: "rainFed" | "irrigated" | "mixed";
  primary_crops?: string;
}

export const farmersApi = {
  list: () => request<Farmer[]>("/farmers"),
  get: (id: string) => request<Farmer>(`/farmers/${id}`),
  create: (data: CreateFarmerPayload) =>
    request<Farmer>("/farmers", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Farmer>) =>
    request<Farmer>(`/farmers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// ─── Captures ─────────────────────────────────────────────────────────────────

export const capturesApi = {
  list: (params?: { farmerId?: string; kind?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.farmerId) qs.set("farmerId", params.farmerId);
    if (params?.kind) qs.set("kind", params.kind);
    if (params?.limit) qs.set("limit", String(params.limit));
    return request<Capture[]>(`/captures?${qs}`);
  },
  stats: () => request<Record<string, number>>("/captures/stats"),
};

// ─── Credits ──────────────────────────────────────────────────────────────────

export const creditsApi = {
  balance: (farmerId: string) =>
    request<{ balance: number }>(`/credits/${farmerId}/balance`),
  transactions: (farmerId: string) =>
    request<Transaction[]>(`/credits/${farmerId}/transactions`),
  redeem: (farmerId: string, itemId: string, quantity = 1) =>
    request<{ newBalance: number }>(`/credits/${farmerId}/redeem`, {
      method: "POST",
      body: JSON.stringify({ itemId, quantity }),
    }),
  release: (farmerId: string, amount: number, description?: string) =>
    request<{ newBalance: number }>("/credits/release", {
      method: "POST",
      body: JSON.stringify({ farmerId, amount, description }),
    }),
  marketplace: () => request<MarketplaceItem[]>("/credits/marketplace"),
};

// ─── Government ───────────────────────────────────────────────────────────────

export const govApi = {
  overview: () => request<GovOverview>("/gov/overview"),
  farmerDetails: (farmerId: string) =>
    request<{ farmer: Farmer; transactions: Transaction[]; captures: Capture[] }>(
      `/gov/farmers/${farmerId}`
    ),
};
