import { ArrowBackIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Link,
  List,
  ListItem,
  SimpleGrid,
  Stack,
  StackDivider,
  Text,
  useColorModeValue,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link as RemixLink,
  useCatch,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { deleteTask, getBoardStatesByStateId, getTaskById } from "~/models";
import type { BoardState, Profile, Task } from "~/_types";

interface LoaderData {
  data: {
    taskData: Array<
      Task & {
        asignee: Profile;
      }
    >;
    boardStateData: Array<Pick<BoardState, "description">>;
  };
}

export const loader: LoaderFunction = async ({ params: { taskId } }) => {
  if (typeof taskId !== "string") {
    throw new Response("Invalid taskId", {
      status: 400,
    });
  }

  const { data: taskData, error: taskError } = await getTaskById(taskId);

  if (taskError) throw new Error(taskError);

  if (!taskData.length) {
    throw new Response(`No task found with id: ${taskId}`, {
      status: 404,
    });
  }

  const [{ stateId }] = taskData;

  if (!stateId) {
    throw new Response(`Board state id ${stateId}`, {
      status: 404,
    });
  }

  const { data: boardStateData, error: boardStateError } =
    await getBoardStatesByStateId(stateId);

  if (boardStateError) throw new Error(boardStateError);

  if (!boardStateData.length) {
    throw new Response(`No boardState found with id: ${stateId}`, {
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

  const params = useParams();

  return (
    <Container maxW={"7xl"}>
      <SimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 9, md: 18 }}
      >
        <Stack spacing={{ base: 6, md: 10 }}>
          <Box as={"header"}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "2xl", sm: "4xl", lg: "5xl" }}
            >
              {task.name}
            </Heading>
            <Text
              color={useColorModeValue("gray.900", "gray.400")}
              fontWeight={300}
              fontSize={"2xl"}
            >
              Status: {boardState.description}
            </Text>
          </Box>

          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={"column"}
            divider={
              <StackDivider
                borderColor={useColorModeValue("gray.200", "gray.600")}
              />
            }
          >
            <Text fontSize={"lg"}>{task.description}</Text>

            <Box>
              <Text
                fontSize={{ base: "16px", lg: "18px" }}
                color={useColorModeValue("decode.500", "decode.300")}
                fontWeight={"500"}
                textTransform={"uppercase"}
                mb={"4"}
              >
                Details
              </Text>

              <List spacing={2}>
                {task.created_at ? (
                  <ListItem>
                    <Text as={"span"} fontWeight={"bold"}>
                      Created at:
                    </Text>{" "}
                    {new Date(task.created_at).toLocaleString()}
                  </ListItem>
                ) : null}
                {task.dueDate ? (
                  <ListItem>
                    <Text as={"span"} fontWeight={"bold"}>
                      Due to:
                    </Text>{" "}
                    {new Date(task.dueDate).toLocaleString()}
                  </ListItem>
                ) : null}
                <ListItem>
                  <Text as={"span"} fontWeight={"bold"}>
                    Asignee:
                  </Text>{" "}
                  {task.asignee
                    ? `${task.asignee.firstName} ${task.asignee.lastName} `
                    : "Unassigned"}
                </ListItem>
              </List>
            </Box>
          </Stack>

          <Wrap spacing="3">
            <WrapItem>
              <Form method="delete">
                <input type="hidden" value={task.id} />
                <Button type="submit" colorScheme="red">
                  <HStack>
                    <DeleteIcon /> <Text>Delete</Text>
                  </HStack>
                </Button>
              </Form>
            </WrapItem>
            <WrapItem>
              <Link as={RemixLink} to="./edit">
                <Button>
                  <HStack>
                    <EditIcon /> <Text>Edit</Text>
                  </HStack>
                </Button>
              </Link>
            </WrapItem>
            <WrapItem>
              <Link as={RemixLink} to={`../${params.boardId}`}>
                <Button variant="outline">
                  <HStack>
                    <ArrowBackIcon /> <Text>Back to board</Text>
                  </HStack>
                </Button>
              </Link>
            </WrapItem>
          </Wrap>
        </Stack>
      </SimpleGrid>
    </Container>
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
