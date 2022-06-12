import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import { TaskForm } from "~/components/modules/decode";
import { createTask, getBoardStatesByBoardId } from "~/models";
import type { BoardState } from "~/_types";

interface LoaderData {
  data: Array<BoardState>;
}

export const loader: LoaderFunction = async ({ params }) => {
  const { data, error } = await getBoardStatesByBoardId(
    parseInt(params.boardId as string)
  );

  if (error) throw new Error(error);

  return json<LoaderData>({
    data,
  });
};

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData();

  const dueDate = (formData.get("dueDate") as string) ?? "";
  const name = (formData.get("name") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";
  const stateId = (formData.get("stateId") as string) ?? "";

  const { error } = await createTask({
    taskData: {
      dueDate,
      description,
      name,
      stateId: parseInt(stateId),
    },
  });

  if (error) throw new Error(error);

  const { pathname, origin } = new URL(request.url);

  const taskBoardPath = pathname.split("/").slice(0, -2).join("/");

  return redirect(`${origin}${taskBoardPath}`);
};

const NewTaskRoute = () => {
  const { data: states } = useLoaderData<LoaderData>();
  return <TaskForm states={states} />;
};

export default NewTaskRoute;

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
