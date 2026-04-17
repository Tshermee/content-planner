"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "./supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserContextValue {
  user: SupabaseUser | null;
  displayName: string | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  displayName: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const displayName = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.email
    ?? null;

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "email profile openid",
        redirectTo: window.location.origin + (window.location.pathname.split("/").slice(0, 2).join("/") || ""),
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <UserContext.Provider value={{ user, displayName, loading, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
