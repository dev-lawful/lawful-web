import { ArrowLeftIcon, PlusSquareIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import type {
  ActionFunction,
  LoaderFunction,
  RouteComponent,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link as RemixLink,
  useCatch,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import type {
  SupabaseClient,
  SupabaseRealtimePayload,
} from "@supabase/supabase-js";
import { useContext, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Board as BoardContainer,
  StateTray,
  TaskCard,
} from "~/components/modules/decode";
import { SupabaseClientContext } from "~/db";
import {
  getBoardById,
  getBoardStatesByBoardId,
  getTasksByBoardStateId,
  updateTaskState,
} from "~/models";
import type { Board, BoardState, Task } from "~/_types";

const getTasksTableSubscription = ({
  callback,
  client,
}: {
  client: SupabaseClient;
  callback: (payload: SupabaseRealtimePayload<unknown>) => void;
}) => {
  return client.from("tasks").on("*", callback).subscribe();
};

interface LoaderData {
  data: {
    boardStates: Array<BoardState> | null;
    tasks: Array<Task> | null;
    boards: Array<Pick<Board, "name">>;
  };
}
interface ActionData {
  data: Array<Task>;
}

export const loader: LoaderFunction = async ({ params: { boardId } }) => {
  const { data: boardStates } = await getBoardStatesByBoardId(
    parseInt(boardId as string)
  );

  if (!boardStates)
    return json<LoaderData>({
      data: {
        boardStates: [],
        tasks: [],
        boards: [],
      },
    });

  const getBoardStatesIds = (boardStates: Array<BoardState>) =>
    boardStates.map((item) => item.id);

  const boardStatesIds = getBoardStatesIds(boardStates);

  const { data: tasks } = await getTasksByBoardStateId(boardStatesIds);

  const parsedBoardId = parseInt(boardId as string);

  if (typeof parsedBoardId !== "number") {
    throw new Error("Board's id should be an integer number");
  }

  const { data: boardData, error: boardError } = await getBoardById(
    parsedBoardId
  );

  if (boardError) throw new Error(boardError);

  const {
    0: { name },
  } = boardData;

  const boards: LoaderData["data"]["boards"] = [
    {
      name,
    },
  ];

  return json<LoaderData>({
    data: {
      boardStates,
      tasks,
      boards,
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const _updatedStateId = formData.get("updatedStateId");
  const _taskId = formData.get("taskId");

  // Somehow this action is ran twice and the second time values are { _updatedStateId: null, _taskId: null }
  if (_updatedStateId == null || _taskId == null) {
    return json<ActionData>({
      data: [],
    });
  }

  if (typeof _updatedStateId !== "string" || typeof _taskId !== "string") {
    throw new Response("Form not submitted correcty", { status: 400 });
  }

  const updatedStateId = parseInt(_updatedStateId);
  const taskId = parseInt(_taskId);

  const { data, error } = await updateTaskState({
    updatedStateId,
    taskId,
  });

  if (error) {
    throw new Error(error);
  }

  return json<ActionData>({
    data,
  });
};

const BoardRoute: RouteComponent = () => {
  const {
    data: { boardStates, tasks, boards },
  } = useLoaderData<LoaderData>();
  const supabase = useContext(SupabaseClientContext);
  const fetcher = useFetcher();

  const { 0: board } = boards;

  const onDropHandler = ({
    taskId,
    updatedStateId,
  }: {
    taskId: string;
    updatedStateId: string;
  }) => {
    fetcher.submit(
      {
        taskId,
        updatedStateId,
      },
      { method: "post" }
    );
  };

  useEffect(() => {
    if (!supabase) return;

    const subscription = getTasksTableSubscription({
      callback: () => {
        fetcher.submit(null, { method: "post" });
      },
      client: supabase,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetcher, supabase]);

  return (
    <Stack direction="column" spacing="2">
      <DndProvider backend={HTML5Backend}>
        <Stack direction="row" alignItems="start" mb="3">
          <Heading>{board.name}</Heading>
          <Link as={RemixLink} to="./tasks/new">
            <Button>
              <HStack>
                <PlusSquareIcon />
                <Text>New task</Text>
              </HStack>
            </Button>
          </Link>
        </Stack>
        <BoardContainer>
          {boardStates?.map((boardState) => {
            return (
              <Box as="section" key={boardState.id}>
                <fetcher.Form method="patch">
                  <StateTray
                    boardState={boardState}
                    title={boardState.description ?? `State #${boardState.id}`}
                    onDropHandler={onDropHandler}
                  >
                    {tasks
                      ?.filter((task) => task.stateId === boardState.id)
                      .map((task) => {
                        return <TaskCard key={task.id} task={task} />;
                      })}
                  </StateTray>
                </fetcher.Form>
              </Box>
            );
          })}
        </BoardContainer>
        <Link as={RemixLink} to="..">
          <Button>
            <HStack>
              <ArrowLeftIcon /> <Text>Back to boards list</Text>
            </HStack>
          </Button>
        </Link>
      </DndProvider>
    </Stack>
  );
};

export default BoardRoute;

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
