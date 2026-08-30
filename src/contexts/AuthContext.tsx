import { createContext, useContext, ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────
// BACKEND REMOVED: this used to wrap Supabase Auth (onAuthStateChange +
// user_roles lookup for admin status). All backend calls were stripped as
// part of the full backend removal. This context now always reports a
// signed-out, non-admin user so every page that reads `useAuth()` keeps
// compiling and rendering its "signed out" / empty state correctly.
//
// To wire up a new backend: replace the static `value` below with real
// session state, and implement `signOut` for real.
// ─────────────────────────────────────────────────────────────────────────

type AuthUser = { id: string; email?: string | null } | null;

type Ctx = {
  user: AuthUser;
  session: unknown | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({
  user: null,
  session: null,
  isAdmin: false,
  loading: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const value: Ctx = {
    user: null,
    session: null,
    isAdmin: false,
    loading: false,
    signOut: async () => {
      // No-op: no backend session to clear.
    },
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
