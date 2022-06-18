import { Button, Heading, Stack, Text } from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useCatch,
  useLoaderData,
  useMatches,
  useParams,
} from "@remix-run/react";

import { supabase } from "~/db";
import { deleteTask } from "~/models";
import type { BoardState, Task } from "~/_types";

interface LoaderData {
  data: {
    taskData: Array<Task>;
    boardStateData: Array<Pick<BoardState, "description">>;
  };
}

export const loader: LoaderFunction = async ({
  request,
  params: { taskId },
}) => {
  const { data: taskData, error: taskError } = await supabase
    .from<Task>("tasks")
    .select("*")
    .eq("id", taskId);

  if (taskError) throw new Error(taskError.message);

  if (!taskData.length) {
    throw new Response(`No task found with id: ${taskId}`, {
      status: 404,
    });
  }

  const { data: boardStateData, error: boardStateError } = await supabase
    .from<BoardState>("boardStates")
    .select("description")
    .eq("id", taskData[0].stateId);

  if (boardStateError) throw new Error(boardStateError.message);

  if (!boardStateData.length) {
    throw new Response(`No boardState found with id: ${taskData[0].stateId}`, {
      status: 404,
    });
  }

  return json<LoaderData>({
    data: {
      taskData,
      boardStateData,
    },
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  await deleteTask(params.taskId!);

  const { pathname, origin } = new URL(request.url);

  const taskBoardPath = pathname.split("/").slice(0, -2).join("/");

  return redirect(`${origin}${taskBoardPath}`);
};

const TaskRoute = () => {
  const {
    data: {
      taskData: { 0: task },
      boardStateData: { 0: boardState },
    },
  } = useLoaderData<LoaderData>();

  const matches = useMatches();
  const params = useParams();

  const {
    [matches.length - 2]: { pathname: boardRoutePathname },
  } = matches;

  return (
    <>
      <Link to={`${boardRoutePathname}/${params.boardId}`}>
        {/* // TODO: Review what to render with Chakra UI links (rendering anchors inside anchors causes console errors) */}
        <Button>Go back to board</Button>
      </Link>
      <Stack as="article">
        <Heading as="h1" size={"2xl"}>
          {task.name}
        </Heading>
        <Heading as="h2" size={"xl"}>
          Description
        </Heading>
        <Text>{task.description}</Text>
        <Heading as="h2" size={"xl"}>
          State
        </Heading>
        <Text>{boardState.description}</Text>
        <Heading as="h2" size={"xl"}>
          Asignee
        </Heading>
        <Text>
          {task.asignee === null
            ? "No one's assigned to this task"
            : "Asignee placeholder"}
        </Text>
        <Heading as="h3" size={"lg"}>
          Due date
        </Heading>
        <Text>{new Date(task.dueDate!).toLocaleString()}</Text>
        <Heading as="h3" size={"lg"}>
          Created at
        </Heading>
        <Text>{new Date(task.created_at!).toLocaleString()}</Text>
        <Form method="delete">
          <input type="hidden" value={task.id} />
          <Button type="submit" colorScheme="red">
            Delete task ❌
          </Button>
        </Form>
      </Stack>
    </>
  );
};

export default TaskRoute;

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
