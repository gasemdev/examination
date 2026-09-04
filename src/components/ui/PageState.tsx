"use client";

import type { ReactNode } from "react";

export function PageLoadingState({ children }: { children: ReactNode }) {
  return <div className="app-shell grid min-h-screen place-items-center p-6 text-sm text-[var(--muted)]">{children}</div>;
}

export function PageErrorState({ children }: { children: ReactNode }) {
  return <main className="app-shell p-6"><div className="app-panel mx-auto max-w-4xl p-12 text-center text-[var(--danger)]">{children}</div></main>;
}
