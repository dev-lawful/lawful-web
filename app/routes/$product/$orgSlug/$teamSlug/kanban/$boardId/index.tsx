import { Box, Button } from "@chakra-ui/react";
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
import { Board, StateTray, TaskCard } from "~/components/modules/decode";
import { SupabaseClientContext } from "~/db";
import {
  getBoardStatesByBoardId,
  getTasksByBoardStateId,
  updateTaskState,
} from "~/models";
import type { BoardState, Task } from "~/_types";

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
  };
}
interface ActionData {
  data: Array<Task>;
}

export const loader: LoaderFunction = async ({ params }) => {
  const { data: boardStates } = await getBoardStatesByBoardId(
    parseInt(params.boardId as string)
  );

  if (!boardStates)
    return json<LoaderData>({
      data: {
        boardStates: [],
        tasks: [],
      },
    });

  const getBoardStatesIds = (boardStates: Array<BoardState>) =>
    boardStates.map((item) => item.id);

  const boardStatesIds = getBoardStatesIds(boardStates);

  const { data: tasks } = await getTasksByBoardStateId(boardStatesIds);

  return json<LoaderData>({
    data: {
      boardStates,
      tasks,
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
    data: { boardStates, tasks },
  } = useLoaderData<LoaderData>();
  const supabase = useContext(SupabaseClientContext);
  const fetcher = useFetcher();
  const matches = useMatches();

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
    <DndProvider backend={HTML5Backend}>
      <Button>
        <Link to={`${matches[matches.length - 1].pathname}/tasks/new`}>
          New task 🆕
        </Link>
      </Button>
      <Board>
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
      </Board>
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
