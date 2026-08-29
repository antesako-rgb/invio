"use client";

import type {
  ReactNode,
} from "react";

import AuthProvider
  from "@/features/auth/context/AuthProvider";

import {
  TooltipProvider,
} from "@/components/ui/tooltip/tooltip";


interface ProvidersProps {
  children:
    ReactNode;
}


export default function Providers({
  children,
}: ProvidersProps) {
  return (
    <TooltipProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </TooltipProvider>
  );
}