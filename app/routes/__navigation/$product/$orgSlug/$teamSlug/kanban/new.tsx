import { ArrowLeftIcon } from "@chakra-ui/icons";
import { Button, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link as RemixLink, useCatch } from "@remix-run/react";
import { BoardForm } from "~/components/modules/decode/Forms/BoardForm";
import { createBoard } from "~/models";

export const action: ActionFunction = async ({ request, context, params }) => {
  const formData = await request.formData();

  const name = formData.get("name");

  if (typeof name !== "string") {
    throw new Response("Form not submitted correctly", {
      status: 400,
    });
  }

  const { error } = await createBoard({
    boardData: {
      name,
      teamId: 1, // TODO: Un-hardcode this teamId to get the user's current team id
    },
  });

  if (error) throw new Error(error);

  const { pathname, origin } = new URL(request.url);

  const taskBoardPath = pathname.split("/").slice(0, -1).join("/");

  return redirect(`${origin}${taskBoardPath}`);
};

const NewBoardRoute = () => {
  return (
    <VStack justify="start" alignItems="start" p="5">
      <Heading as="h1">New board</Heading>
      <BoardForm defaultValues={{ teamId: 1, name: "" }} />
      <Link as={RemixLink} to="..">
        <Button>
          <HStack>
            <ArrowLeftIcon /> <Text>Back to boards list</Text>
          </HStack>
        </Button>
      </Link>
    </VStack>
  );
};

export default NewBoardRoute;

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
