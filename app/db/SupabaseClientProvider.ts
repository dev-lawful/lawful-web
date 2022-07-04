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
}: {
  supabaseUrl: string;
  supabaseAnonKey: string;
}) => {
  const supabaseClient = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );

  return supabaseClient;
};
