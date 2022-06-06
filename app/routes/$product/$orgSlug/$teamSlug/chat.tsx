import { HStack, StackDivider } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useCatch, useLoaderData } from "@remix-run/react";
import { ChatList } from "~/components/modules/network";
import { getChats } from "~/models/chats.server";
import type { Chat } from "~/_types";

interface LoaderData {
  data: Array<Chat>;
}

export const loader: LoaderFunction = async ({ params }) => {
  const { product, teamSlug } = params;

  if (product !== "network") redirect("/");

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
    <HStack
      divider={<StackDivider borderColor="red.500" />}
      bg="gray.900"
      height="full"
    >
      <ChatList chats={chats} />
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
