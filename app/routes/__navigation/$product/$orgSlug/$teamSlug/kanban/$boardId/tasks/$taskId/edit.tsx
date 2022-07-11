import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import { TaskForm } from "~/components/modules/decode/Forms/TaskForm";
import { supabase } from "~/db";
import { getBoardStatesByBoardId, getTaskById, updateTask } from "~/models";
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

  const { data: taskData, error: taskError } = await getTaskById(
    params.taskId!
  );

  if (taskError) throw new Error(taskError);

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

  const { error } = await updateTask({
    taskData: {
      dueDate,
      description,
      name,
      stateId: parseInt(stateId),
    },
    taskId: id,
  });

  if (error) throw new Error(error);

  const { pathname, origin } = new URL(request.url);

  const taskBoardPath = pathname.split("/").slice(0, -3).join("/");

  return redirect(`${origin}${taskBoardPath}`);
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

export const ErrorBoundary = ({ error }: { error: Error }) => {
  return (
    <div>
      <p>{error.message}</p>
    </div>
  );
};

export const CatchBoundary = () => {
  const error = useCatch();
  return (
    <div>
      <p>{error.status}</p>
      <p>{error.data}</p>
    </div>
  );
};
