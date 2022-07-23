import { supabase } from "~/db";
import type { CustomResponse, Profile } from "~/_types";

export const createProfile = async (
  profileData: Omit<Profile, "createdAt">
): Promise<CustomResponse<Profile>> => {
  try {
    const { data, error } = await supabase
      .from<Profile>("profiles")
      .insert(profileData);
    return {
      data: data ?? [],
      error: error?.message ?? null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to create this profile.",
    };
  }
};

export const findProfileByEmail = async (
  email: string
): Promise<CustomResponse<Profile>> => {
  try {
    const { data, error } = await supabase
      .from<Profile>("profiles")
      .select("*")
      .eq("email", email);
    return {
      data: data ?? [],
      error: error?.message ?? null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to get this profile.",
    };
  }
};
