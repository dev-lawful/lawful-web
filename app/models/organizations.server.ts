import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type {
  CustomResponse,
  Organization,
  OrganizationMember,
  Team,
  TeamMember,
} from "~/_types";

export const getOrganizationMembershipsByUserId = async (
  userId: string
): Promise<CustomResponse<OrganizationMember>> => {
  try {
    const { data, error } = await supabase
      .from<OrganizationMember>("organizationMembers")
      .select("*")
      .eq("userId", userId);

    return { data: data ?? [], error: error?.message ?? null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch organizations.",
    };
  }
};

export const getOrganizationBySlug = async (
  slug: string
): Promise<CustomResponse<Organization>> => {
  try {
    const { data, error } = await supabase
      .from<Organization>("organizations")
      .select("*")
      .eq("slug", slug)
      .limit(1);

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

export const getOrganizationsByUserId = async ({
  id,
}: {
  id: string;
}): Promise<
  CustomResponse<
    Organization & {
      teams: Array<Team>;
    }
  >
> => {
  try {
    const { data: organizationMembersData, error: organizationMembersError } =
      await supabase
        .from<OrganizationMember>("organizationMembers")
        .select("*")
        .eq("userId", id);

    if (organizationMembersError)
      throw new Error(organizationMembersError.message);

    const { data: teamMembersData, error: teamMembersError } = await supabase
      .from<TeamMember>("teamMembers")
      .select("*")
      .eq("userId", id);

    if (teamMembersError) throw new Error(teamMembersError.message);

    const orgIds = organizationMembersData
      ?.map((item) => item.organizationId)
      .filter(Boolean) as Array<number>;

    const teamIds = teamMembersData
      ?.map((item) => item.teamId)
      .filter(Boolean) as Array<number>;

    const { data, error } = await supabase
      .from("organizations")
      .select("*,teams!inner(*)")
      .in("teams.id", teamIds)
      .in("id", orgIds);

    return {
      data: data ?? [],
      error: error?.message ?? null,
    };
  } catch (err) {
    return {
      data: [],
      error:
        "There has been an error trying to fetch organizations and their teams.",
    };
  }
};
