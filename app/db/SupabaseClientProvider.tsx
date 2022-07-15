import { createContext, useContext, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export const SupabaseClientContext = createContext<SupabaseClient | undefined>(
  undefined
);

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
  refreshToken,
}: {
  supabaseUrl: string;
  supabaseAnonKey: string;
  refreshToken?: string;
}) => {
  const supabaseClient = useMemo(() => {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    if (refreshToken) {
      client.auth.setSession(refreshToken);
    }

    return client;
  }, [supabaseUrl, supabaseAnonKey, refreshToken]);

  return supabaseClient;
};
