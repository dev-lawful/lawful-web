import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { TaskForm } from "~/components/modules/decode";
import { CustomCatchBoundary, CustomErrorBoundary } from "~/components/ui";
import {
  createTask,
  getBoardStatesByBoardId,
  getOrganizationBySlug,
  getProfilesByTeamSlug,
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

  const {
    data: {
      0: { id: organizationId },
    },
    error: organizationError,
  } = await getOrganizationBySlug(params.orgSlug!);

  if (organizationError) throw new Error(organizationError);

  const { data: profilesData, error: profilesError } =
    await getProfilesByTeamSlug({
      slug: params.teamSlug!,
      organizationId,
    });

  if (profilesError) throw new Error(profilesError);

  return json<LoaderData>({
    data: {
      boardStatesData,
      profilesData,
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const dueDate =
    new Date(formData.get("dueDate") as string)
      .toISOString()
      .toLocaleString() ?? "";
  const name = (formData.get("name") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";
  const stateId = (formData.get("stateId") as string) ?? "";
  const asignee = (formData.get("asignee") as string) ?? "";

  const { error } = await createTask({
    taskData: {
      dueDate: new Date(dueDate).toJSON(),
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

export const ErrorBoundary = CustomErrorBoundary;

export const CatchBoundary = CustomCatchBoundary;
