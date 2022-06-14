import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type { Team } from "~/_types";

interface CustomResponse<T> {
  data: Array<T>;
  error: string | null;
}

export const getTeamBySlug = async (
  slug: string
): Promise<CustomResponse<Team>> => {
  try {
    const { data }: PostgrestResponse<Team> = await supabase
      .from("teams")
      .select("*")
      .eq("slug", slug);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch this team.",
    };
  }
};
