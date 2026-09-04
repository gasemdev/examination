"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import * as authService from "@/services/auth";
import type { AuthContextValue, AuthUser } from "@/auth/types";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authService.fetchMe();
      setUser(response.user);
      return response.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchMe);
  }, [fetchMe]);

  const value = useMemo(
    () => ({ user, loading, initialized, setUser, fetchMe, logout }),
    [user, loading, initialized, fetchMe, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
