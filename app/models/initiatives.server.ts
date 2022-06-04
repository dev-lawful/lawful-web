import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type { Initiative } from "~/_types";

interface CustomResponse<T> {
  data: Array<T>;
  error: string | null;
}

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

export const getInitiativeById = async (
  id: string
): Promise<CustomResponse<Initiative>> => {
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
      .insert(initiativeData);
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
