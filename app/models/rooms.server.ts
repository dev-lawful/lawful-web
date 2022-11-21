import { supabase } from "~/db";
import type { CustomResponse, TeamRoom } from "~/_types";

export const getRoomsByTeam = async ({
  teamId,
}: {
  teamId: number;
}): Promise<CustomResponse<TeamRoom>> => {
  try {
    const { data, error } = await supabase
      .from<TeamRoom>("teamRooms")
      .select("*")
      .eq("teamId", teamId);

    return { data: data ?? [], error: error?.message ?? null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch this teamRooms.",
    };
  }
};

export const createRoomForTeam = async ({
  teamId,
  roomId,
}: {
  teamId: number;
  roomId: string;
}): Promise<CustomResponse<TeamRoom>> => {
  const { data, error } = await supabase
    .from<TeamRoom>("teamRooms")
    .insert({ teamId, roomId });

  return { data: data ?? [], error: error?.message ?? null };
};
