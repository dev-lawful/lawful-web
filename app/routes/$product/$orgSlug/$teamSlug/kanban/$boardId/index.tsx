import { Box, Button, Heading, Stack } from "@chakra-ui/react";
import type {
  ActionFunction,
  LoaderFunction,
  RouteComponent,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  useCatch,
  useFetcher,
  useLoaderData,
  useMatches,
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
import { supabase, SupabaseClientContext } from "~/db";
import {
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
    url: string;
  };
}
interface ActionData {
  data: Array<Task>;
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const { data: boardStates } = await getBoardStatesByBoardId(
    parseInt(params.boardId as string)
  );

  if (!boardStates)
    return json<LoaderData>({
      data: {
        boardStates: [],
        tasks: [],
        boards: [],
        url: request.url,
      },
    });

  const getBoardStatesIds = (boardStates: Array<BoardState>) =>
    boardStates.map((item) => item.id);

  const boardStatesIds = getBoardStatesIds(boardStates);

  const { data: tasks } = await getTasksByBoardStateId(boardStatesIds);

  const { data: boardData, error } = await supabase
    .from<Board>("boards")
    .select("name")
    .eq("id", parseInt(params.boardId as string));

  if (!boardData) throw new Error(error.message);

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
      url: request.url,
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const updatedStateId = parseInt(formData.get("updatedStateId") as string);
  const taskId = parseInt(formData.get("taskId") as string);

  // TODO: Handle badly formatted request.

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
    data: { boardStates, tasks, boards, url },
  } = useLoaderData<LoaderData>();
  const supabase = useContext(SupabaseClientContext);
  const fetcher = useFetcher();
  const matches = useMatches();

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

  const { pathname: newTaskUrlPathname } = new URL(
    `${matches[matches.length - 1].pathname}/tasks/new`,
    url
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <Stack direction="row" alignItems="center" mb="3">
        <Heading>{board.name}</Heading>
        <Button>
          <Link to={newTaskUrlPathname}>New task 🆕</Link>
        </Button>
      </Stack>
      <BoardContainer>
        {boardStates?.map((boardState) => {
          return (
            <Box as="section" key={boardState.id}>
              <fetcher.Form method="post">
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
    </DndProvider>
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
