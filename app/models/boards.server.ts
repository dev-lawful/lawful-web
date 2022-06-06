import { supabase } from "~/db";
import type { BoardState, CustomResponse } from "~/_types";

export const getBoardStatesByBoardId = async (
  boardId: number
): Promise<CustomResponse<BoardState>> => {
  try {
    const { data } = await supabase
      .from<BoardState>("boardStates")
      .select("*")
      .eq("boardId", boardId);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error:
        "There has been an error trying to fetch board states by board id.",
    };
  }
};
