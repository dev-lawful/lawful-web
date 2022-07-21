import { HStack, VStack } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useCatch, useLoaderData } from "@remix-run/react";
import { ChatList } from "~/components/modules/network";
import { getChats } from "~/models";
import type { Chat } from "~/_types";

interface LoaderData {
  data: Array<Chat>;
}

export const loader: LoaderFunction = async ({ params }) => {
  const { product, teamSlug } = params;

  if (product !== "network") {
    throw new Response("Chat feature doesn't belong to this product", {
      status: 400,
    });
  }

  if (!teamSlug) {
    throw new Response("No team slug", { status: 400 });
  }

  const { data, error } = await getChats({ teamSlug, limit: 20 });

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
        <Link to="./new">Create chat</Link>
        <ChatList chats={chats} />
      </VStack>
      <Outlet />
    </HStack>
  );
};

export default ChatLayoutRoute;

// TODO: repeated code
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
