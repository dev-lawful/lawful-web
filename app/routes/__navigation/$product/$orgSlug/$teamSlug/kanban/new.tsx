import { Heading, VStack } from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import { BoardForm } from "~/components/modules/decode";
import { CustomErrorBoundary, CustomCatchBoundary } from "~/components/ui";
import { createBoard, getTeamBySlug } from "~/models";

interface LoaderData {
  data: {
    teamId: number;
  };
}

export const loader: LoaderFunction = async ({ params }) => {
  const {
    data: {
      0: { id: teamId },
    },
    error: teamError,
  } = await getTeamBySlug(params.teamSlug!);

  if (teamError) throw new Error(teamError);

  return json<LoaderData>({ data: { teamId } });
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();

  const name = formData.get("name");

  if (typeof name !== "string") {
    throw new Response("Form not submitted correctly", {
      status: 400,
    });
  }

  const {
    data: {
      0: { id: teamId },
    },
    error: teamError,
  } = await getTeamBySlug(params.teamSlug!);

  if (teamError) throw new Error(teamError);

  const { error } = await createBoard({
    boardData: {
      name,
      teamId,
    },
  });

  if (error) throw new Error(error);

  const { pathname, origin } = new URL(request.url);

  const taskBoardPath = pathname.split("/").slice(0, -1).join("/");

  return redirect(`${origin}${taskBoardPath}`);
};

const NewBoardRoute = () => {
  const {
    data: { teamId },
  } = useLoaderData<LoaderData>();

  return (
    <VStack justify="start" alignItems="start" p="5">
      <Heading as="h1">New board</Heading>
      <BoardForm defaultValues={{ teamId, name: "" }} />
    </VStack>
  );
};

export default NewBoardRoute;

export const ErrorBoundary = CustomErrorBoundary;

export const CatchBoundary = CustomCatchBoundary;
