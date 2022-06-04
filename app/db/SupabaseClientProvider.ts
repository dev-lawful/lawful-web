import { createContext } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export const SupabaseClientContext = createContext<SupabaseClient | undefined>(
  undefined
);

SupabaseClientContext.displayName = "SupabaseClientContext";

export const SupabaseClientProvider = SupabaseClientContext.Provider;
