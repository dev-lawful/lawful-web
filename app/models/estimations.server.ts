import { supabase } from "~/db";
import type { CustomResponse, Estimation, Profile, Task } from "~/_types";

type EstimationWithProfiles = Estimation & {
  profiles: Array<Profile>;
};

export const getEstimationsByTaskId = async ({
  taskId,
  teamMembersIds,
}: {
  taskId: string;
  teamMembersIds: Array<string>;
}): Promise<CustomResponse<EstimationWithProfiles>> => {
  try {
    const { data } = await supabase
      .from<
        Estimation & {
          profiles: Array<Profile>;
        }
      >("estimations")
      .select("*, profiles (*)")
      .in("userId", teamMembersIds)
      .eq("taskId", taskId);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch estimations by task id.",
    };
  }
};

export const updateTaskEffort = async ({
  calculatedEffort,
  taskId,
}: {
  calculatedEffort: number;
  taskId: string;
}): Promise<CustomResponse<Task>> => {
  try {
    const { data } = await supabase
      .from<Task>("tasks")
      .update({
        effort: calculatedEffort,
      })
      .eq("id", Number(taskId));

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to update task effort.",
    };
  }
};

export const upsertEstimationByUserId = async ({
  userId,
  data: { effort, taskId, justification },
}: {
  userId: string;
  data: {
    effort: number;
    taskId: string;
    justification: string;
  };
}): Promise<CustomResponse<Estimation>> => {
  try {
    const { data } = await supabase
      .from<Estimation>("estimations")
      .upsert({
        effort,
        justification,
        taskId: Number(taskId! as string),
        userId: userId,
      })
      .eq("userId", userId)
      .select("*");

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to upsert the estimation.",
    };
  }
};
