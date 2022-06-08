import { Box, Button, Heading, Input, Text } from "@chakra-ui/react";
import type { SupabaseRealtimePayload } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { VFC } from "react";
import { useSupabaseClient } from "~/db";
import type { Message } from "~/_types";
import { Message as MessageBox } from "./Message";
import { Form } from "@remix-run/react";

const EMPTY_MSG_FALLBACK = "Empty message...";

export const Chat: VFC<{ chatId: string; initialMessages: Array<Message> }> = ({
  chatId,
  initialMessages,
}) => {
  const supabase = useSupabaseClient();
  const [messages, setMessages] = useState<Array<String>>(() =>
    initialMessages.map(({ text }) => text || EMPTY_MSG_FALLBACK)
  );

  const handleReceivedMessage = (message: SupabaseRealtimePayload<Message>) => {
    const text = message.new.text || EMPTY_MSG_FALLBACK;
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
  }, [chatId, supabase]);

  return (
    <Box>
      <Heading size="lg" as="h1">
        Chat {chatId}
      </Heading>
      <Heading size="md">Messages</Heading>
      {messages.map((text, i) => (
        <Text key={i}>{text}</Text>
      ))}
      <Form method="post">
        <Input name="message" type="text" />
        <Button type="submit">Send</Button>
      </Form>
    </Box>
  );
};
