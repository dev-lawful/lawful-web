import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { TaskForm } from "~/components/modules/decode/Forms/TaskForm";
import { supabase } from "~/db";
import { getBoardStatesByBoardId } from "~/models";
import type { BoardState, Task } from "~/_types";

interface LoaderData {
  data: {
    boardStatesData: Array<BoardState>;
    taskData: Array<Task>;
  };
}

export const loader: LoaderFunction = async ({ params }) => {
  const { data: boardStatesData, error: boardStatesError } =
    await getBoardStatesByBoardId(parseInt(params.boardId as string));

  if (boardStatesError) throw new Error(boardStatesError);

  const { data: taskData, error: taskError } = await supabase
    .from<Task>("tasks")
    .select("name, description, dueDate, asignee, stateId, id")
    .eq("id", params.taskId);

  if (taskError) throw new Error(taskError.message);

  return json<LoaderData>({
    data: {
      boardStatesData,
      taskData,
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const dueDate = (formData.get("dueDate") as string) ?? "";
  const id = (formData.get("id") as string) ?? "";
  const name = (formData.get("name") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";
  const stateId = (formData.get("stateId") as string) ?? "";

  const { error } = await supabase
    .from<Task>("tasks")
    .update({
      dueDate,
      description,
      name,
      stateId: parseInt(stateId),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  const url = new URL(request.url);

  const boardUrl = url.pathname.split("/").slice(0, -3).join("/");

  return redirect(`${url.origin}${boardUrl}`);
};

const EditTaskRoute = () => {
  const {
    data: {
      boardStatesData: states,
      taskData: { 0: task },
    },
  } = useLoaderData<LoaderData>();

  const { created_at, ...taskData } = task;

  return <TaskForm states={states} defaultValues={taskData} />;
};

export default EditTaskRoute;
