import { supabase } from "~/db";
import type { Board, BoardState, CustomResponse, Task } from "~/_types";

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

export const updateBoard = async ({
  boardData,
  boardId,
}: {
  boardData: Pick<Board, "name">;
  boardId: string;
}): Promise<CustomResponse<Board>> => {
  try {
    const { data } = await supabase
      .from<Board>("boards")
      .update({
        ...boardData,
      })
      .eq("id", boardId);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to update this board.",
    };
  }
};

export const deleteBoard = async ({
  boardId,
}: {
  boardId: number;
}): Promise<CustomResponse<Board>> => {
  try {
    // Task depende de boardState
    const { data: boardStates } = await supabase
      .from<BoardState>("boardStates")
      .select("id")
      .eq("boardId", boardId);

    const boardStatesIds = boardStates!.map((item) => item.id);

    await supabase.from<Task>("tasks").delete().in("stateId", boardStatesIds);

    await supabase
      .from<BoardState>("boardStates")
      .delete()
      .eq("boardId", boardId);

    const { data } = await supabase
      .from<Board>("boards")
      .delete()
      .eq("id", boardId);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to delete this board.",
    };
  }
};
