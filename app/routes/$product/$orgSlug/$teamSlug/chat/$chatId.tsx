import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData, useParams } from "@remix-run/react";
import { Chat } from "~/components/modules/network";
import { getLastMessages, sendMessage } from "~/models/chats.server";
import type { Message } from "~/_types";

interface LoaderData {
  data: Array<Message>;
}

export const loader: LoaderFunction = async ({ params }) => {
  const { chatId } = params;

  if (!chatId) {
    throw new Response("No chat id", { status: 400 });
  }

  const { error, data } = await getLastMessages({ chatId, limit: 2000 });
  if (error) {
    throw new Error(error);
  }

  return json<LoaderData>({ data });
};

interface ActionData {
  data: Array<Message>;
}

export const action: ActionFunction = async ({ params, request }) => {
  const { chatId } = params;

  if (!chatId) {
    throw new Response("No chatId provided", { status: 400 });
  }
  const formData = await request.formData();
  const message = formData.get("message");
  // TODO: validate message properties
  const { data, error } = await sendMessage({
    chatId: parseInt(chatId),
    text: message as string,
  });

  // TODO: refactor maybe?
  if (error) {
    throw new Error(error);
  }

  return json<ActionData>({ data });
};

const ChatIndexRoute = () => {
  const { data: initialMessages } = useLoaderData<LoaderData>();
  const { chatId } = useParams();

  if (!chatId) {
    return <div>No chat id</div>;
  }

  return <Chat chatId={chatId} initialMessages={initialMessages} />;
};

export default ChatIndexRoute;

//TODO: Refactor ErrorBoundary and CatchBoundary
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
