import type { User } from "@supabase/supabase-js";

export interface CustomResponse<T> {
  data: Array<T>;
  error: string | null;
}

export interface UserSession {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
  expiresAt: number;
}
