import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type { CustomResponse, TeamMember, Team } from "~/_types";

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

export const createTeam = async (
  teamData: Omit<Team, "id" | "createdAt">
): Promise<CustomResponse<Team>> => {
  try {
    const { data, error }: PostgrestResponse<Team> = await supabase
      .from("teams")
      .insert(teamData);
    return {
      data: data ?? [],
      error: error?.message ?? null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to create this Team.",
    };
  }
};
//TODO: Check if user belong to teams' organization before adding them to the team
export const addUserToTeam = async (
  teamMemberData: Omit<TeamMember, "id">
): Promise<CustomResponse<TeamMember>> => {
  try {
    const { data, error }: PostgrestResponse<TeamMember> = await supabase
      .from("teamMembers")
      .insert(teamMemberData);
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
