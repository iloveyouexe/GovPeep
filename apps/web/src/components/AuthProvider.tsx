import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { PublicConfig, User } from "@govpeep/contracts";
import { AuthContext } from "../lib/auth";
import { api } from "../lib/api";
import { brand } from "@govpeep/contracts";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refreshing = useRef(false);
  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      const settings = await api<PublicConfig>("/api/config");
      setConfig(settings);
      const session = settings.sessionAvailable
        ? await api<{ user: User } | null>("/api/auth/get-session")
        : null;
      setUser(session?.user || null);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : `Could not connect to ${brand.name}.`,
      );
    } finally {
      refreshing.current = false;
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const focus = () => {
      void refresh();
    };
    window.addEventListener("focus", focus);
    return () => window.removeEventListener("focus", focus);
  }, [refresh]);
  return (
    <AuthContext.Provider value={{ user, config, loading, error, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
