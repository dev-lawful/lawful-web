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
    console.log({ initiativeData });
    const { data }: PostgrestResponse<Initiative> = await supabase
      .from("initiatives")
      .insert({ ...initiativeData });

    console.log({ data });

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
  initiativeData,
}: {
  initiativeData: Partial<Initiative>;
}): Promise<CustomResponse<Initiative>> => {
  try {
    const { id, created_at, teamId, ...initiative } = initiativeData;
    const { data }: PostgrestResponse<Initiative> = await supabase
      .from("initiatives")
      .update({ ...initiative })
      .eq("id", id);

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
