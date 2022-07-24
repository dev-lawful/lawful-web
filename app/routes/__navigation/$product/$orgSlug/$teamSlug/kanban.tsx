import { PlusSquareIcon } from "@chakra-ui/icons";
import {
  Button,
  HStack,
  Link,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link as RemixLink,
  NavLink,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { getBoardsByTeamId, getTeamBySlug } from "~/models";
import type { Board } from "~/_types";

interface LoaderData {
  data: {
    boards: Array<Board>;
  };
}

export const loader: LoaderFunction = async ({ params }) => {
  const { product } = params;

  if (product !== "decode") {
    throw new Response("Kanban feature doesn't belong to this product", {
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

  const { data: boards, error: boardsError } = await getBoardsByTeamId(teamId);

  if (boardsError) throw new Error(boardsError);

  return json<LoaderData>({
    data: {
      boards,
    },
  });
};

const KanbanLayoutRoute = () => {
  const {
    data: { boards },
  } = useLoaderData<LoaderData>();

  return (
    <HStack align={"start"} flex="1" minH="0" p="4">
      <VStack alignItems="stretch" w="20%" minW="200px" h="full">
        <Link as={RemixLink} to="./new">
          <Button rounded={"md"} colorScheme={"decode"}>
            <HStack>
              <PlusSquareIcon />
              <Text>New board</Text>
            </HStack>
          </Button>
        </Link>
        <UnorderedList
          listStyleType="none"
          display="flex"
          flexDir="column"
          h="full"
          overflowY="auto"
          overflowX="hidden"
        >
          {boards
            .sort(
              (a, b) =>
                new Date(a.created_at!).getTime() -
                new Date(b.created_at!).getTime()
            )
            .map(({ name, id, created_at }) => (
              <ListItem key={id} py="2" px="1" w="full" textOverflow="ellipsis">
                <HStack h="full">
                  <Link
                    as={NavLink}
                    to={`./${id}`}
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {name}
                  </Link>
                </HStack>
              </ListItem>
            ))}
        </UnorderedList>
      </VStack>
      <Outlet />
    </HStack>
  );
};

export default KanbanLayoutRoute;
