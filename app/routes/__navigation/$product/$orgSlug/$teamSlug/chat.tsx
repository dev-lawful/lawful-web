import { PlusSquareIcon } from "@chakra-ui/icons";
import { Button, HStack, Link, VStack } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link as RemixLink, Outlet, useLoaderData } from "@remix-run/react";
import { ChatList } from "~/components/modules/network";
import { CustomCatchBoundary, CustomErrorBoundary } from "~/components/ui";
import { getChats, getOrganizationBySlug, getTeamBySlug } from "~/models";
import type { Chat } from "~/_types";

interface LoaderData {
  data: Array<Chat>;
}

export const loader: LoaderFunction = async ({ params }) => {
  const { product, teamSlug, orgSlug } = params;

  if (product !== "network") {
    throw new Response("Chat feature doesn't belong to this product", {
      status: 400,
    });
  }

  if (!teamSlug) {
    throw new Response("No team slug", { status: 400 });
  }

  const { data: orgData, error: orgError } = await getOrganizationBySlug(
    orgSlug!
  );
  const [organization] = orgData;
  if (!organization || orgError) {
    throw new Response("Organization not found", {
      status: 404,
    });
  }

  const { data: teamData, error: teamError } = await getTeamBySlug({
    slug: teamSlug,
    organizationId: organization.id,
  });
  const [team] = teamData;
  if (!team || teamError) {
    throw new Response("Team not found", {
      status: 404,
    });
  }

  const { data, error } = await getChats({ teamId: team.id, limit: 20 });

  if (error) {
    throw new Error(error);
  }

  return json<LoaderData>({ data });
};

const ChatLayoutRoute = () => {
  const { data: chats } = useLoaderData<LoaderData>();
  return (
    // TODO: Well, it is hardcoded
    <HStack flex="1" minH="0" height="calc(100vh - 64px)">
      <VStack alignItems="stretch" w="20%" minW="200px" h="full" bg="gray.700">
        <Link as={RemixLink} to="./new" mx="auto" my="3">
          <Button rounded={"md"} rightIcon={<PlusSquareIcon />}>
            New Chat
          </Button>
        </Link>
        <ChatList chats={chats} />
      </VStack>
      <Outlet />
    </HStack>
  );
};

export default ChatLayoutRoute;

export const ErrorBoundary = CustomErrorBoundary;

export const CatchBoundary = CustomCatchBoundary;
