import { supabase } from "~/db";
import type { Board, BoardState, CustomResponse } from "~/_types";

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

export const createBoard = async ({
  boardData,
}: {
  boardData: Partial<Board>;
}): Promise<CustomResponse<Board>> => {
  try {
    const { data, error } = await supabase
      .from<Board>("boards")
      .insert({ ...boardData });

    if (!data) throw new Error(error.message);

    const {
      0: { id: boardId },
    } = data;

    const states = [
      {
        description: "To do",
        boardId,
      },
      {
        description: "In progress",
        boardId,
      },
      {
        description: "Done",
        boardId,
      },
    ];

    // TODO: Include board states creation in board creation page
    await supabase.from<BoardState>("boardStates").insert(states);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to create this board",
    };
  }
};

export const getBoardsByTeamId = async (
  teamId: number
): Promise<CustomResponse<Board>> => {
  try {
    const { data } = await supabase
      .from<Board>("boards")
      .select("*")
      .eq("teamId", teamId);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch boards by team id.",
    };
  }
};

export const getBoardStatesByStateId = async (
  stateId: number
): Promise<CustomResponse<BoardState>> => {
  try {
    const { data } = await supabase
      .from<BoardState>("boardStates")
      .select("description")
      .eq("id", stateId);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch boards by team id.",
    };
  }
};

export const getBoardById = async (
  boardId: number
): Promise<CustomResponse<Board>> => {
  try {
    const { data } = await supabase
      .from<Board>("boards")
      .select("*")
      .eq("id", boardId);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch this board by id.",
    };
  }
};
