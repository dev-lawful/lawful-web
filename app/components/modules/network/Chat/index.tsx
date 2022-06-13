import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Form } from "@remix-run/react";
import type { SupabaseRealtimePayload } from "@supabase/supabase-js";
import type { VFC } from "react";
import { useEffect, useState } from "react";
import { useSupabaseClient } from "~/db";
import type { Message } from "~/_types";

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
    <VStack flexGrow={1} h="full" alignItems="stretch">
      <Heading size="lg" as="h1">
        Chat {chatId}
      </Heading>
      <Box flexGrow={1}>
        {messages.map((text, i) => (
          <Text key={i}>{text}</Text>
        ))}
      </Box>
      <Form method="post">
        <HStack>
          <Input name="message" type="text" defaultValue="" />
          <Button type="submit">Send 💥</Button>
        </HStack>
      </Form>
    </VStack>
  );
};
