import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import { TaskForm } from "~/components/modules/decode";
import {
  createTask,
  getBoardStatesByBoardId,
  getProfilesByTeamSlug
} from "~/models";
import type { BoardState, Profile } from "~/_types";

interface LoaderData {
  data: {
    boardStatesData: Array<BoardState>;
    profilesData: Array<Profile>;
  };
}

export const loader: LoaderFunction = async ({ params }) => {
  const { data: boardStatesData, error: boardStatesError } =
    await getBoardStatesByBoardId(parseInt(params.boardId as string));

  if (boardStatesError) throw new Error(boardStatesError);

  const { data: profilesData, error: teamMembersError } =
    await getProfilesByTeamSlug({ teamSlug: params.teamSlug! });

  if (teamMembersError) throw new Error(teamMembersError);

  return json<LoaderData>({
    data: {
      boardStatesData,
      profilesData,
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const dueDate = (formData.get("dueDate") as string) ?? "";
  const name = (formData.get("name") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";
  const stateId = (formData.get("stateId") as string) ?? "";
  const asignee = (formData.get("asignee") as string) ?? "";

  const { error } = await createTask({
    taskData: {
      dueDate,
      description,
      name,
      asignee,
      stateId: parseInt(stateId),
    },
  });

  if (error) throw new Error(error);

  const { pathname, origin } = new URL(request.url);

  const taskBoardPath = pathname.split("/").slice(0, -2).join("/");

  return redirect(`${origin}${taskBoardPath}`);
};

const NewTaskRoute = () => {
  const {
    data: { boardStatesData, profilesData },
  } = useLoaderData<LoaderData>();
  return <TaskForm profiles={profilesData} states={boardStatesData} />;
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
