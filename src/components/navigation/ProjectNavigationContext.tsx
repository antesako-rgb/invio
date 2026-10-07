"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
const Context = createContext<{ resolved: { prefix: string; projectId: string } | null; setResolved: (value: { prefix: string; projectId: string } | null) => void } | null>(null);
export function ProjectNavigationProvider({ children }: { children: ReactNode }) {
  const [resolved, setResolved] = useState<{ prefix: string; projectId: string } | null>(null);
  return <Context.Provider value={{ resolved, setResolved }}>{children}</Context.Provider>;
}
export function ProjectNavigationBridge({ projectId }: { projectId: string }) {
  const context = useContext(Context);
  const pathname = usePathname();
  const prefix = pathname.match(/^\/dashboard\/(?:invitations|photo-walls|albums)\/[^/]+/)?.[0];
  const setResolved = context?.setResolved;
  useEffect(() => {
    if (!prefix || !setResolved) return;
    setResolved({ prefix, projectId });
    return () => setResolved(null);
  }, [prefix, projectId, setResolved]);
  return null;
}
export function useProjectNavigation() {
  const pathname = usePathname();
  const context = useContext(Context);
  return resolveProjectNavigation(pathname, context?.resolved ?? null);
}
export function resolveProjectNavigation(pathname: string, resolved: { prefix: string; projectId: string } | null) {
  const projectId = pathname.match(/^\/dashboard\/projects\/([^/]+)(?:\/|$)/)?.[1] ?? (resolved && (pathname === resolved.prefix || pathname.startsWith(`${resolved.prefix}/`)) ? resolved.projectId : undefined);
  const activeId = pathname === `/dashboard/projects/${projectId}/collaborators` || pathname.startsWith(`/dashboard/projects/${projectId}/collaborators/`) ? "collaborators" : "projectOverview";
  return { projectId, activeId };
}
