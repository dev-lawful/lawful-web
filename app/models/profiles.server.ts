import { supabase } from "~/db";
import type {
  CustomResponse,
  Organization,
  OrganizationMember,
  Profile,
  TeamMember,
} from "~/_types";
import { getTeamBySlug } from "./teams.server";

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

export const findProfileByUserId = async ({
  userId,
}: {
  userId: string;
}): Promise<CustomResponse<Profile>> => {
  try {
    const { data, error } = await supabase
      .from<Profile>("profiles")
      .select("*")
      .eq("id", userId);
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

export const getProfilesByTeamSlug = async ({
  slug,
  organizationId,
}: {
  slug: string;
  organizationId: Organization["id"];
}): Promise<CustomResponse<Profile>> => {
  try {
    const {
      data: {
        0: { id: teamId },
      },
      error: teamError,
    } = await getTeamBySlug({ slug, organizationId });

    if (teamError) throw new Error(teamError);

    const { data: teamMembersData, error: teamMembersError } = await supabase
      .from<TeamMember>("teamMembers")
      .select("userId")
      .eq("teamId", teamId);

    if (teamError) throw new Error(teamMembersError?.message);

    const teamMembersIds = teamMembersData
      ?.filter((item) => !!item.userId)
      .map(({ userId }) => userId) as Array<string>;

    const { data: profilesData, error: profilesError } = await supabase
      .from<Profile>("profiles")
      .select("*")
      .in("id", teamMembersIds);

    const data = teamMembersData
      ?.map((teamMember) => {
        return profilesData?.find(
          (profile) => profile.id === teamMember.userId
        );
      })
      .filter(Boolean) as Array<Profile>;

    return {
      data: data ?? [],
      error: profilesError?.message ?? null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to get team members.",
    };
  }
};

export const getProfilesByOrganizationId = async ({
  id,
}: {
  id: string;
}): Promise<CustomResponse<Profile>> => {
  try {
    const { data: members, error: membersError } = await supabase
      .from<OrganizationMember>("organizationMembers")
      .select("*")
      .eq("organizationId", id);

    if (membersError) throw new Error(membersError.message);

    const membersIds = members?.map((item) => item.userId);

    const { data, error } = await supabase
      .from<Profile>("profiles")
      .select("*")
      .in("id", membersIds);

    if (error) throw new Error(error.message);

    return {
      data: data ?? [],
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      error:
        "There has been an error trying to get profiles by organization id.",
    };
  }
};

export const getProfilesByTeamId = async ({
  id,
}: {
  id: string;
}): Promise<CustomResponse<Profile>> => {
  try {
    const { data: members, error: membersError } = await supabase
      .from<TeamMember>("teamMembers")
      .select("*")
      .eq("teamId", id);

    if (membersError) throw new Error(membersError.message);

    const membersIds = members?.map((item) => item.userId);

    const { data, error } = await supabase
      .from<Profile>("profiles")
      .select("*")
      .in("id", membersIds);

    if (error) throw new Error(error.message);

    return {
      data: data ?? [],
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to get profiles by team id.",
    };
  }
};

