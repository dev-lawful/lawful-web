import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { TaskForm } from "~/components/modules/decode/Forms/TaskForm";
import { supabase } from "~/db";
import { getBoardStatesByBoardId } from "~/models";
import type { BoardState, Task } from "~/_types";

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

  const { error } = await supabase.from<Task>("tasks").insert({
    dueDate,
    description,
    name,
    stateId: parseInt(stateId),
  });

  if (error) throw new Error(error.message);

  const url = new URL(request.url);

  const boardUrl = url.pathname.split("/").slice(0, -2).join("/");

  return redirect(`${url.origin}${boardUrl}`);
};

const NewTaskRoute = () => {
  const { data: states } = useLoaderData<LoaderData>();
  return <TaskForm states={states} />;
};

export default NewTaskRoute;
