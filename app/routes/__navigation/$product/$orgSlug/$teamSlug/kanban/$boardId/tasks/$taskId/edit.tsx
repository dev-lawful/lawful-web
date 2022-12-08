import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { TaskForm } from "~/components/modules/decode/Forms/TaskForm";
import { CustomCatchBoundary, CustomErrorBoundary } from "~/components/ui";
import {
  getBoardStatesByBoardId,
  getOrganizationBySlug,
  getProfilesByTeamSlug,
  getTaskById,
  updateTask,
} from "~/models";
import type { BoardState, Profile, Task } from "~/_types";

interface LoaderData {
  data: {
    boardStatesData: Array<BoardState>;
    taskData: Array<
      Task & {
        asignee: Profile;
      }
    >;
    profilesData: Array<Profile>;
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

  const {
    data: {
      0: { id: organizationId },
    },
    error: orgError,
  } = await getOrganizationBySlug(params.orgSlug!);

  if (orgError) throw new Error(orgError);

  const { data: profilesData, error: teamMembersError } =
    await getProfilesByTeamSlug({ slug: params.teamSlug!, organizationId });

  if (teamMembersError) throw new Error(teamMembersError);

  return json<LoaderData>({
    data: {
      boardStatesData,
      taskData,
      profilesData,
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const dueDate = (formData.get("dueDate") as string) ?? "";
  const id = (formData.get("id") as string) ?? "";
  const name = (formData.get("name") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";
  const asignee = (formData.get("asignee") as string) ?? "";
  const stateId = (formData.get("stateId") as string) ?? "";

  const { error } = await updateTask({
    taskData: {
      dueDate: new Date(dueDate).toJSON(),
      description,
      name,
      asignee,
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
      profilesData: profiles,
    },
  } = useLoaderData<LoaderData>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { created_at = "", ...taskData } = {
    ...task,
    asignee: task.asignee?.id,
  };

  return (
    <TaskForm states={states} defaultValues={taskData} profiles={profiles} />
  );
};

export default EditTaskRoute;

export const ErrorBoundary = CustomErrorBoundary;

export const CatchBoundary = CustomCatchBoundary;
