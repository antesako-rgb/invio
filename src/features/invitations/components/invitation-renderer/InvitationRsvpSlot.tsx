"use client";
import { createContext, useContext, type ReactNode } from "react";
const RsvpContext = createContext<ReactNode>(undefined);
export function InvitationRsvpSlot({ children, content }: { children: ReactNode; content: ReactNode }) {
  return <RsvpContext.Provider value={content}>{children}</RsvpContext.Provider>;
}
export function useInvitationRsvpSlot() { return useContext(RsvpContext); }
