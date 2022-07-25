import { useFetcher } from "@remix-run/react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { createContext, useContext, useMemo, useState } from "react";
import { useInterval } from "~/utils";
import type { UserSession } from "~/_types";

interface SupabaseContextType {
  supabase: SupabaseClient;
  user?: User;
}

export const SupabaseClientContext = createContext<
  SupabaseContextType | undefined
>(undefined);

SupabaseClientContext.displayName = "SupabaseClientContext";

export const SupabaseClientProvider = SupabaseClientContext.Provider;

export const useSupabaseClient = () => {
  const context = useContext(SupabaseClientContext);
  if (context === undefined) {
    throw new Error(
      "useSupabaseClient must be used within a SupabaseClientProvider"
    );
  }
  return context;
};

export const useCreateSupabaseClient = ({
  supabaseUrl,
  supabaseAnonKey,
  userSession,
}: {
  supabaseUrl: string;
  supabaseAnonKey: string;
  userSession?: UserSession;
}) => {
  const { accessToken, expiresIn, expiresAt, user } = userSession || {};
  const [currentExpiresAt, setCurrentExpiresAt] = useState<number>();
  const [currentUser, setCurrentUser] = useState<User>();

  const refresh = useFetcher();

  const supabaseClient = useMemo(() => {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    });

    if (accessToken) {
      client.auth.setAuth(accessToken);
    }

    return client;
  }, [supabaseUrl, supabaseAnonKey, accessToken]);

  useInterval(() => {
    if (expiresIn)
      refresh.submit(null, {
        method: "post",
        action: "/refreshSession",
      });
  }, expiresIn);

  if (expiresAt !== currentExpiresAt) {
    setCurrentExpiresAt(expiresAt);
    setCurrentUser(user);
  }

  const memoizedValues = useMemo(() => {
    return { supabase: supabaseClient, user: currentUser };
  }, [currentUser, supabaseClient]);

  return memoizedValues;
};
