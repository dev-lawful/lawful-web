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
import { useCallback, useEffect, useRef, useState } from "react";
import type { VFC } from "react";
import { useSupabaseClient } from "~/db";
import type { Message } from "~/_types";
import { Message as MessageBox } from "./Message";
import { flushSync } from "react-dom";

export const Chat: VFC<{ chatId: string; initialMessages: Array<Message> }> = ({
  chatId,
  initialMessages,
}) => {
  const supabase = useSupabaseClient();
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

  const handleReceivedMessage = useCallback(
    (message: SupabaseRealtimePayload<Message>) => {
      const { new: newMessage } = message;
      flushSync(() => {
        setMessages((messages) => [...messages, newMessage]);
      });
      scrollToLastMessage();
    },
    []
  );

  useEffect(() => {
    if (!supabase || !chatId) return;

    const subscription = supabase
      .from(`messages:chatId=eq.${chatId}`)
      .on("INSERT", handleReceivedMessage)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, supabase, handleReceivedMessage]);

  useEffect(() => {
    //TODO: repeated and also I don't like this approach
    setMessages(initialMessages);
  }, [chatId]);

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
            <MessageBox message={message} />
          </ListItem>
        ))}
      </UnorderedList>
      <Form method="post" ref={formRef}>
        <HStack>
          <Input name="message" type="text" />
          <Button type="submit">Send 💥</Button>
        </HStack>
      </Form>
    </VStack>
  );
};
