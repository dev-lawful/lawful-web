import { Heading, Link, Stack, Text } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useMatches, useParams } from "@remix-run/react";
import { Link as RemixLink } from "react-router-dom";
import { supabase } from "~/db";
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
    [matches.length - 2]: { pathname: boardRouteBasePath },
  } = matches;

  return (
    <>
      <RemixLink to={`${boardRouteBasePath}/${params.boardId}`}>
        {/* // TODO: Review what to render with Chakra UI links (rendering anchors inside anchors causes console errors) */}
        <Link as="p">Go back to board</Link>
      </RemixLink>
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
      </Stack>
    </>
  );
};

export default TaskRoute;
