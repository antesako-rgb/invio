"use client";

import {
  createContext,
} from "react";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import type {
  Profile,
} from "@/features/profile/types/profile.types";


/* ==========================================================================
   Auth Context Value
========================================================================== */

export interface AuthContextValue {
  session:
    Session | null;

  user:
    User | null;

  profile:
    Profile | null;

  loading:
    boolean;

  initialized:
    boolean;

  refresh:
    () => Promise<void>;

  updateProfile:
    (
      changes: Partial<Profile>
    ) => void;

  signOut:
    () => Promise<void>;
}


/* ==========================================================================
   Auth Context
========================================================================== */

export const AuthContext =
  createContext<AuthContextValue | null>(
    null
  );