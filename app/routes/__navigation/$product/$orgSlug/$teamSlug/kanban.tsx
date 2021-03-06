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
import {
  getBoardsByTeamId,
  getOrganizationBySlug,
  getTeamBySlug,
} from "~/models";
import type { Board } from "~/_types";

interface LoaderData {
  data: {
    boards: Array<Board>;
  };
}

export const loader: LoaderFunction = async ({ params }) => {
  const { product, orgSlug } = params;

  if (product !== "decode") {
    throw new Response("Kanban feature doesn't belong to this product", {
      status: 400,
    });
  }

  if (!orgSlug) {
    throw new Response("Organization not found", {
      status: 400,
    });
  }
  const { data: orgData, error: orgError } = await getOrganizationBySlug(
    orgSlug
  );
  const [organization] = orgData;
  if (!organization || orgError) {
    throw new Response("Organization not found", {
      status: 404,
    });
  }

  const {
    data: {
      0: { id: teamId },
    },
    error: teamError,
  } = await getTeamBySlug({
    slug: params.teamSlug!,
    organizationId: organization.id,
  });

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
    <HStack align={"start"} p="4" height="calc(100vh - 4rem)">
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
            .map(({ name, id }) => (
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
