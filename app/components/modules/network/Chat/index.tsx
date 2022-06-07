import { Box, Button, Heading, Input, Text } from "@chakra-ui/react";
import type { SupabaseRealtimePayload } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { VFC } from "react";
import { useSupabaseClient } from "~/db";
import type { Message } from "~/_types";
import { Message as MessageBox } from "./Message";
import { Form, useActionData } from "@remix-run/react";

export const Chat: VFC<{ chatId: string; initialMessages: Array<Message> }> = ({
  chatId,
  initialMessages,
}) => {
  const data = useActionData();
  console.log(data);
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
    <Box>
      <Heading size="lg" as="h1">
        Chat {chatId}
      </Heading>
      <Heading size="md">Messages</Heading>
      {initialMessages.map(({ id, text }) => (
        <Text key={id}>{text}</Text>
      ))}
      {messages.map((text, i) => (
        <Text key={i}>{text}</Text>
      ))}
      <Form method="post" onSubmit={() => setMessages([])}>
        <Input name="message" type="text" />
        <Button type="submit">Send</Button>
      </Form>
    </Box>
  );
};
