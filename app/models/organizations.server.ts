import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type {
  Organization,
  OrganizationMember,
  CustomResponse,
} from "~/_types";

export const getOrganizationsByUserId = async (
  userId: string
): Promise<CustomResponse<Organization>> => {
  try {
    const { data, error } = await supabase
      .from<Organization>("organizations")
      .select("*")
      .eq("ownerId", userId);

    return { data: data ?? [], error: error?.message ?? null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch organizations.",
    };
  }
};

export const createOrganization = async (
  organizationData: Omit<Organization, "id" | "createdAt">
): Promise<CustomResponse<Organization>> => {
  try {
    const { data, error }: PostgrestResponse<Organization> = await supabase
      .from("organizations")
      .insert(organizationData);
    return {
      data: data ?? [],
      error: error?.message ?? null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to create this organization.",
    };
  }
};

export const addUserToOrganization = async (
  organizationMemberData: Omit<OrganizationMember, "id">
): Promise<CustomResponse<Organization>> => {
  try {
    const { data, error }: PostgrestResponse<OrganizationMember> =
      await supabase.from("organizationMembers").insert(organizationMemberData);
    return {
      data: data ?? [],
      error: error?.message ?? null,
    };
  } catch (err) {
    return {
      data: [],
      error:
        "There has been an error trying to add the user to one organization.",
    };
  }
};
