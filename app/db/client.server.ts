import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = process.env.SUPABASE_URL ?? "";
const supabaseServiceRole: string = process.env.SUPABASE_SERVICE_ROLE ?? "";

export const supabase = createClient(supabaseUrl, supabaseServiceRole);
