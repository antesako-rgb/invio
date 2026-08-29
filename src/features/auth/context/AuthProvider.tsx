"use client";

import type {
  ReactNode,
} from "react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import AppLoader
  from "@/components/layout/AppLoader/AppLoader";

import {
  supabase,
} from "@/lib/supabase/client";

import {
  getProfile,
} from "@/features/profile/repositories/getProfile";

import type {
  Profile,
} from "@/features/profile/types/profile.types";

import {
  logout,
} from "../repositories/logout";

import {
  AuthContext,
} from "./AuthContext";


/* ==========================================================================
   Types
========================================================================== */

interface AuthProviderProps {
  children:
    ReactNode;
}


/* ==========================================================================
   Auth Provider
========================================================================== */

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    session,
    setSession,
  ] =
    useState<Session | null>(
      null
    );

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );

  const [
    profile,
    setProfile,
  ] =
    useState<Profile | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    initialized,
    setInitialized,
  ] =
    useState(false);


  /* ==========================================================================
     Profile
  ========================================================================== */

  const loadProfile =
    useCallback(
      async (
        currentUser:
          User | null
      ) => {
        if (!currentUser) {
          setProfile(null);

          return;
        }

        try {
          const currentProfile =
            await getProfile(
              currentUser.id
            );

          setProfile(
            currentProfile
          );
        } catch (error) {
          console.error(
            "Failed to load profile:",
            error
          );

          setProfile(null);
        }
      },
      []
    );


  /* ==========================================================================
     Refresh
  ========================================================================== */

  const refresh =
    useCallback(
      async () => {
        setLoading(true);

        try {
          const {
            data: {
              session:
                currentSession,
            },
          } =
            await supabase.auth.getSession();

          const currentUser =
            currentSession?.user ??
            null;

          setSession(
            currentSession
          );

          setUser(
            currentUser
          );

          await loadProfile(
            currentUser
          );
        } catch (error) {
          console.error(
            "Failed to refresh auth:",
            error
          );

          setSession(null);
          setUser(null);
          setProfile(null);
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      },
      [
        loadProfile,
      ]
    );


  /* ==========================================================================
     Initial Auth
  ========================================================================== */

  useEffect(() => {
    void refresh();
  }, [
    refresh,
  ]);


  /* ==========================================================================
     Auth State
  ========================================================================== */

  useEffect(() => {
    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          event,
          currentSession
        ) => {
          if (
            event ===
            "INITIAL_SESSION"
          ) {
            return;
          }

          const currentUser =
            currentSession?.user ??
            null;

          setSession(
            currentSession
          );

          setUser(
            currentUser
          );

          void loadProfile(
            currentUser
          );
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, [
    loadProfile,
  ]);


  /* ==========================================================================
     Sign Out
  ========================================================================== */

  const signOut =
    useCallback(
      async () => {
        setLoading(true);

        try {
          await logout();

          setSession(null);
          setUser(null);
          setProfile(null);
        } finally {
          setLoading(false);
        }
      },
      []
    );


  /* ==========================================================================
     Update Profile
  ========================================================================== */

  const updateProfile =
    useCallback(
      (
        changes:
          Partial<Profile>
      ) => {
        setProfile(
          (previous) =>
            previous
              ? {
                  ...previous,
                  ...changes,
                }
              : previous
        );
      },
      []
    );


  /* ==========================================================================
     Initial Loading
  ========================================================================== */

  if (!initialized) {
    return (
      <AppLoader />
    );
  }


  /* ==========================================================================
     Provider
  ========================================================================== */

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        initialized,
        refresh,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}