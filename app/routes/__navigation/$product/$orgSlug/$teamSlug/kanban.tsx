import { PlusSquareIcon } from "@chakra-ui/icons";
import { Button, HStack, Link, Text, VStack } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link as RemixLink, Outlet, useLoaderData } from "@remix-run/react";
import { BoardsList } from "~/components/modules/decode";
import { getBoardsByTeamId } from "~/models";
import type { Board } from "~/_types";

interface LoaderData {
  data: {
    boards: Array<Board>;
  };
}

export const loader: LoaderFunction = async ({ request, params }) => {
  // TODO: make teamId dynamic given the current team
  const { data: boards, error } = await getBoardsByTeamId(1);

  if (error) throw new Error(error);

  if (params.product === "decode")
    return json<LoaderData>({
      data: {
        boards,
      },
    });

  return redirect("/");
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
