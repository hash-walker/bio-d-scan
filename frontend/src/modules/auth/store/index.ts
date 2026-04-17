import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, type AuthUser } from "@/lib/api";

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// ─── Store types ──────────────────────────────────────────────────────────────

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  /** `portalRole` must match the account role or login is rejected (no cookie / session). */
  login: (email: string, password: string, portalRole: "farmer" | "government") => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password, portalRole) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await authApi.login(email, password);
          if (user.role !== portalRole) {
            const msg =
              portalRole === "government"
                ? "This account is registered as a farmer. Sign in from the farmer portal."
                : "This account is for government users. Sign in from the government portal.";
            set({ error: msg, isLoading: false });
            throw new Error(msg);
          }
          setCookie("bioscan_token", token);
          set({ user, isLoading: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Login failed";
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        deleteCookie("bioscan_token");
        set({ user: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "bioscan-auth",
      // Only persist the user object, not loading/error state
      partialize: (state) => ({ user: state.user }),
    }
  )
);
