"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/auth/useAuth";

function getLoginPath(pathname: string) {
  const locale = pathname.match(/^\/(th|en)(?=\/|$)/)?.[1];
  return locale ? `/${locale}/login` : "/login";
}

export function UserMenu() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  async function handleLogout() {
    if (loggingOut || loading) return;
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      const loginPath = getLoginPath(pathname);
      router.replace(loginPath);
      router.refresh();
      window.history.replaceState(null, "", loginPath);
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-xs font-semibold text-white">{user.name}</p>
        <p className="text-[10px] text-[var(--muted)]">{user.email}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut || loading}
        className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-white transition hover:border-[var(--primary-bright)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
      </button>
    </div>
  );
}
