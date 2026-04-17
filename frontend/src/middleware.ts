import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that do NOT require authentication
const PUBLIC_PATHS = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/onboarding",
];

// Routes only for government users
const GOV_PATHS = ["/gov"];

// Routes only for farmer users
const FARMER_PATHS = ["/dashboard", "/insects", "/credits", "/archive"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("bioscan_token")?.value;

  // Not logged in → send to role selection
  if (!token) {
    const isGov = GOV_PATHS.some((p) => pathname.startsWith(p));
    const role = isGov ? "government" : "farmer";
    return NextResponse.redirect(
      new URL(`/auth/signin?role=${role}`, req.url)
    );
  }

  // Decode the JWT payload (no verification — just routing hint; backend verifies on API calls)
  try {
    const [, payloadB64] = token.split(".");
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    ) as { role?: string; exp?: number };

    // Expired token
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      const res = NextResponse.redirect(new URL("/auth/signin", req.url));
      res.cookies.delete("bioscan_token");
      return res;
    }

    const role = payload.role;

    // Government user trying to access farmer pages → redirect to gov dashboard
    if (role === "government" && FARMER_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/gov/dashboard", req.url));
    }

    // Farmer user trying to access gov pages → redirect to farmer dashboard
    if (role === "farmer" && GOV_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } catch {
    // Malformed token — clear and redirect
    const res = NextResponse.redirect(new URL("/auth/signin", req.url));
    res.cookies.delete("bioscan_token");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
