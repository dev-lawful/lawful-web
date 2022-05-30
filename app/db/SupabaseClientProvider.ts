import { createContext, useContext } from "react";
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
