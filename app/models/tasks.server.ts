import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type { CustomResponse, Profile, Task } from "~/_types";

export const getTasksByBoardStateId = async (
  boardStatesIds: Array<number>
): Promise<CustomResponse<Task>> => {
  try {
    const { data }: PostgrestResponse<Task> = await supabase
      .from<Task>("tasks")
      .select("*")
      .in("stateId", boardStatesIds);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch tasks by board id.",
    };
  }
};

export const updateTaskState = async ({
  updatedStateId,
  taskId,
}: {
  updatedStateId: number;
  taskId: number;
}): Promise<CustomResponse<Task>> => {
  try {
    const { data }: PostgrestResponse<Task> = await supabase
      .from<Task>("tasks")
      .update({ stateId: updatedStateId })
      .eq("id", taskId);

    return { data: data ?? [], error: null };
  } catch (error) {
    return {
      data: [],
      error: "There has been an error trying to update this task's state.",
    };
  }
};

export const updateTask = async ({
  taskData,
  taskId,
}: {
  taskData: Omit<Task, "created_at" | "id">;
  taskId: string;
}): Promise<CustomResponse<Task>> => {
  try {
    const { data } = await supabase
      .from<Task>("tasks")
      .update({
        ...taskData,
      })
      .eq("id", taskId);
    return { data: data ?? [], error: null };
  } catch (error) {
    return {
      data: [],
      error: "There has been an error trying to update this task.",
    };
  }
};

export const createTask = async ({
  taskData,
}: {
  taskData: Omit<Task, "created_at" | "id">;
}): Promise<CustomResponse<Task>> => {
  try {
    const { data } = await supabase.from<Task>("tasks").insert({
      ...taskData,
    });

    return { data: data ?? [], error: null };
  } catch (error) {
    return {
      data: [],
      error: "There has been an error trying to update this task.",
    };
  }
};

export const getTaskById = async (
  taskId: string
): Promise<
  CustomResponse<
    Task & {
      asignee: Profile;
    }
  >
> => {
  try {
    const { data } = await supabase
      .from<
        Task & {
          asignee: Profile;
        }
      >("tasks")
      .select(
        `
        *,
        asignee (
          *
        )
      `
      )
      .eq("id", taskId);

    return { data: data ?? [], error: null };
  } catch (error) {
    return {
      data: [],
      error: "There has been an error trying to fetch this task.",
    };
  }
};

export const deleteTask = async (
  taskId: string
): Promise<CustomResponse<Task>> => {
  try {
    const { data } = await supabase
      .from<Task>("tasks")
      .delete()
      .eq("id", taskId);

    return { data: data ?? [], error: null };
  } catch (error) {
    return {
      data: [],
      error: "There has been an error trying to delete this task.",
    };
  }
};
