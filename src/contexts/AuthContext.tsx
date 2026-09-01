import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";

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
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(
    pb.authStore.model ? { id: pb.authStore.model.id, email: pb.authStore.model.email } : null
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(pb.authStore.model?.is_admin || false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Make sure we resolve the initial check
    setLoading(false);

    // Subscribe to PocketBase auth state changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (model) {
        setUser({ id: model.id, email: model.email });
        setIsAdmin(!!model.is_admin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    }, true);

    return () => {
      unsubscribe();
    };
  }, []);

  const value: Ctx = {
    user,
    session: pb.authStore.token, // Using token as session check if needed
    isAdmin,
    loading,
    signOut: async () => {
      pb.authStore.clear();
    },
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
