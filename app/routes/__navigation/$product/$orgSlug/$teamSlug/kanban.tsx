import { PlusSquareIcon } from "@chakra-ui/icons";
import { Button, HStack, Link, Text, VStack } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link as RemixLink, Outlet, useLoaderData } from "@remix-run/react";
import { BoardsList } from "~/components/modules/decode";
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
        <BoardsList boards={boards} />
      </VStack>
      <Outlet />
    </HStack>
  );
};

export default KanbanLayoutRoute;
