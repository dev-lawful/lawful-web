import { Heading, Text } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData, useParams } from "@remix-run/react";
import type { SupabaseRealtimePayload } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useSupabaseClient } from "~/db";
import { getLastMessages } from "~/models/chats.server";
import type { Message } from "~/_types";

interface LoaderData {
  data: Array<Message>;
}

export const loader: LoaderFunction = async ({ params }) => {
  const { chatId } = params;

  if (!chatId) {
    throw new Response("No chat id", { status: 400 });
  }

  const { error, data } = await getLastMessages({ chatId, limit: 20 });
  if (error) {
    throw new Error(error);
  }

  return json<LoaderData>({ data });
};

const ChatIndexRoute = () => {
  const { data: initialMessages } = useLoaderData<LoaderData>();
  const { chatId } = useParams();
  const supabase = useSupabaseClient();
  const [messages, setMessages] = useState<Array<String>>([]);

  const handleReceivedMessage = (message: SupabaseRealtimePayload<Message>) => {
    const { text = "Empty message .. Oops" } = message.new;
    setMessages((messages) => [...messages, text]);
  };

  useEffect(() => {
    if (!supabase || !chatId) return;

    const subscription = supabase
      .from(`messages:chatId=eq.${chatId}`)
      .on("INSERT", handleReceivedMessage)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, chatId]);

  return (
    <div>
      <Heading size="lg" as="h1">
        Chat {chatId}
      </Heading>
      <Heading size="md">Previous messages</Heading>
      {initialMessages.map(({ id, text }) => (
        <Text key={id}>{text}</Text>
      ))}
      <Heading size="md">New messages</Heading>

      {messages.map((text, i) => (
        <Text key={i}>{text}</Text>
      ))}
    </div>
  );
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
