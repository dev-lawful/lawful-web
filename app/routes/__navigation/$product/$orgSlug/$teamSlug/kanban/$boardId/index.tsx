import {
  ArrowBackIcon,
  ChevronDownIcon,
  DeleteIcon,
  EditIcon,
  PlusSquareIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Heading,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
} from "@chakra-ui/react";
import type {
  ActionFunction,
  LoaderFunction,
  RouteComponent,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Link as RemixLink,
  useCatch,
  useFetcher,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import type {
  SupabaseClient,
  SupabaseRealtimePayload,
} from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Board as BoardContainer,
  StateTray,
  TaskCard,
} from "~/components/modules/decode";
import { useSupabaseClient } from "~/db";
import {
  deleteBoard,
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

  switch (request.method) {
    case "PATCH": {
      const _updatedStateId = formData.get("updatedStateId");
      const _taskId = formData.get("taskId");

      // Somehow this action is ran twice and the second time values are { _updatedStateId: null, _taskId: null }
      if (_updatedStateId == null || _taskId == null) {
        return json<ActionData>({
          data: [],
        });
      }

      if (typeof _updatedStateId !== "string" || typeof _taskId !== "string") {
        throw new Response("patch form not submitted correcty", {
          status: 400,
        });
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
    }

    case "DELETE": {
      const _boardId = formData.get("boardId") ?? "";

      if (_boardId == null) {
        return json<ActionData>({
          data: [],
        });
      }

      if (typeof _boardId !== "string") {
        throw new Response("Delete form not submitted correcty", {
          status: 400,
        });
      }

      const boardId = parseInt(_boardId);

      const { error } = await deleteBoard({
        boardId,
      });

      if (error) {
        throw new Error(error);
      }

      const { pathname, origin } = new URL(request.url);

      const boardsListPath = pathname.split("/").slice(0, -1).join("/");

      return redirect(`${origin}${boardsListPath}`);
    }

    default: {
      throw new Error(`Method ${request.method} is currently not supported`);
    }
  }
};

const BoardRoute: RouteComponent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    data: { boardStates, tasks, boards },
  } = useLoaderData<LoaderData>();
  const { supabase } = useSupabaseClient();
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
      { method: "patch" }
    );
  };

  const { boardId } = useParams();

  useEffect(() => {
    if (!supabase) return;

    const subscription = getTasksTableSubscription({
      callback: () => {
        fetcher.submit(null, { method: "patch" });
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
        <HStack alignItems="start" justifyContent="space-between" mb="3">
          <Heading>{board.name}</Heading>
          <Menu isOpen={isMenuOpen}>
            {({ isOpen }) => (
              <>
                <MenuButton
                  isActive={isOpen}
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  onClick={() => setIsMenuOpen((ps) => !ps)}
                >
                  {isOpen ? "Close" : "Actions"}
                </MenuButton>
                <MenuList>
                  <Link as={RemixLink} to="./tasks/new">
                    <MenuItem icon={<PlusSquareIcon />}>New task</MenuItem>
                  </Link>
                  <Link as={RemixLink} to="./edit">
                    <MenuItem icon={<EditIcon />}>Edit board</MenuItem>
                  </Link>
                  <Link as={RemixLink} to="..">
                    <MenuItem icon={<ArrowBackIcon />}>
                      Back to boards list
                    </MenuItem>
                  </Link>
                  <fetcher.Form method="delete">
                    <input type="hidden" name="boardId" value={boardId} />

                    <MenuItem
                      type="submit"
                      color={"red.500"}
                      icon={<DeleteIcon />}
                    >
                      Delete board
                    </MenuItem>
                  </fetcher.Form>
                </MenuList>
              </>
            )}
          </Menu>
        </HStack>
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
