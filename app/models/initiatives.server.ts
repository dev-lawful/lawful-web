import type { PostgrestResponse } from "@supabase/supabase-js";
import { eq } from "lodash";
import { supabase } from "~/db";
import type { Initiative, CustomResponse } from "~/_types";

export const getInitiatives = async (): Promise<CustomResponse<Initiative>> => {
  try {
    const { data }: PostgrestResponse<Initiative> = await supabase
      .from("initiatives")
      .select("*");

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch initiatives.",
    };
  }
};

export const getInitiativeById = async ({
  id,
}: {
  id: string;
}): Promise<CustomResponse<Initiative>> => {
  try {
    const { data }: PostgrestResponse<Initiative> = await supabase
      .from("initiatives")
      .select("*")
      .eq("id", id);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch this initiative.",
    };
  }
};

export const createInitiative = async (
  initiativeData: Omit<Initiative, "id">
): Promise<CustomResponse<Initiative>> => {
  try {
    const { data }: PostgrestResponse<Initiative> = await supabase
      .from("initiatives")
      .insert({ ...initiativeData });

    return {
      data: data ?? [],
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to create this initiative.",
    };
  }
};

export const updateInitiative = async ({
  initiativeData: { created_at, ...initiative },
  initiativeId,
}: {
  initiativeData: Partial<Initiative>;
  initiativeId: string;
}): Promise<CustomResponse<Initiative>> => {
  try {
    const { data }: PostgrestResponse<Initiative> = await supabase
      .from("initiatives")
      .update({ ...initiative, teamId: 1 })
      .eq("id", initiativeId);

    return {
      data: data ?? [],
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to create this initiative.",
    };
  }
};
