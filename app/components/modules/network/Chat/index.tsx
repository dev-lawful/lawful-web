import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  ListItem,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import { Form, useTransition } from "@remix-run/react";
import type { SupabaseRealtimePayload } from "@supabase/supabase-js";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useSupabaseClient } from "~/db";
import type { Message } from "~/_types";
import { Message as MessageBox } from "./Message";

export const Chat: FC<{ chatId: string; initialMessages: Array<Message> }> = ({
  chatId,
  initialMessages,
}) => {
  const { supabase, user } = useSupabaseClient();

  const currentUserId = user?.id;
  // TODO: to be honest, I'm not sure about this approach (using props as initialState)
  // but I didn't find another way to achieve the same result (all of them broke the exhaustive-deps rule)
  const [messages, setMessages] = useState<Array<Message>>(initialMessages);
  const transition = useTransition();
  const isSending = transition.state === "submitting";

  const listRef = useRef<HTMLUListElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const scrollToLastMessage = () => {
    const lastMessage = listRef.current?.lastElementChild;
    if (lastMessage) {
      lastMessage.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    const handleReceivedMessage = (
      message: SupabaseRealtimePayload<Message>
    ) => {
      const { new: newMessage } = message;
      flushSync(() => {
        setMessages((messages) => [...messages, newMessage]);
      });
      scrollToLastMessage();
    };

    const subscription = supabase
      .from(`messages:chatId=eq.${chatId}`)
      .on("INSERT", handleReceivedMessage)
      .subscribe();
    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [chatId, supabase]);

  useEffect(() => {
    if (!isSending) {
      formRef.current?.reset();
    }
  }, [isSending]);

  return (
    <VStack h="full" alignItems="stretch" flex="1">
      <Heading size="lg" as="h1">
        Chat {chatId}
      </Heading>
      <UnorderedList
        ref={listRef}
        p="2"
        listStyleType="none"
        flexGrow={1}
        overflowY="auto"
      >
        {messages.map((message) => (
          <ListItem key={message.id}>
            <MessageBox message={message} currentUserId={currentUserId} />
          </ListItem>
        ))}
      </UnorderedList>
      <Box p="2" m="0">
        <Form method="post" ref={formRef}>
          <HStack>
            <Input type="hidden" name="userId" value={currentUserId} />
            <Input name="message" type="text" />
            <Button type="submit">Send 💥</Button>
          </HStack>
        </Form>
      </Box>
    </VStack>
  );
};
