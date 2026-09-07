"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/auth/useAuth";
import { PageLoadingState } from "@/components/ui/PageState";

function getLoginPath(pathname: string) {
  const locale = pathname.match(/^\/(th|en)(?=\/|$)/)?.[1];
  return locale ? `/${locale}/login` : "/login";
}

export function PortalGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (initialized && !user) {
      const loginPath = getLoginPath(pathname);
      const target = pathname === "/"
        ? loginPath
        : `${loginPath}?next=${encodeURIComponent(pathname)}`;
      window.location.replace(target);
    }
  }, [initialized, pathname, user]);

  if (!initialized || !user) {
    return <PageLoadingState>กำลังตรวจสอบเซสชัน...</PageLoadingState>;
  }

  return children;
}
