import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pxctfvtvdzmcrmssxkkj.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4Y3RmdnR2ZHptY3Jtc3N4a2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk2MjczMjYsImV4cCI6MTk2NTIwMzMyNn0.42sk46cq8u4yvDqpfe3AioOq9pM1sU_thncq7ip2MI0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
