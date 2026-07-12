import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../services/auth";
import { login as apiLogin, register as apiRegister } from "../services/auth";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: "",

      login: async (username, password) => {
        set({ loading: true, error: "" });
        try {
          const { user, token } = await apiLogin(username, password);
          set({ user, token, loading: false });
        } catch (e: any) {
          set({ error: e.message || "Login failed", loading: false });
          throw e;
        }
      },

      register: async (username, password, name, phone) => {
        set({ loading: true, error: "" });
        try {
          await apiRegister(username, password, name, phone);
          set({ loading: false });
        } catch (e: any) {
          set({ error: e.message || "Registration failed", loading: false });
          throw e;
        }
      },

      logout: () => set({ user: null, token: null }),
    }),
    { name: "grocery-auth" }
  )
);
