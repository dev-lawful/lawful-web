import {
  Button,
  Heading,
  HStack,
  Input,
  ListItem,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import { Form } from "@remix-run/react";
import type { SupabaseRealtimePayload } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VFC } from "react";
import { useSupabaseClient } from "~/db";
import type { Message } from "~/_types";
import { Message as MessageBox } from "./Message";
import { flushSync } from "react-dom";

const EMPTY_MSG_FALLBACK = "Empty message...";

export const Chat: VFC<{ chatId: string; initialMessages: Array<Message> }> = ({
  chatId,
  initialMessages,
}) => {
  const supabase = useSupabaseClient();
  const [messages, setMessages] = useState<Array<string>>(() =>
    initialMessages.map(({ text }) => text || EMPTY_MSG_FALLBACK)
  );
  const listRef = useRef<HTMLUListElement>(null);

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
      const text = message.new.text || EMPTY_MSG_FALLBACK;
      flushSync(() => {
        setMessages((messages) => [...messages, text]);
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
    setMessages(initialMessages.map(({ text }) => text || EMPTY_MSG_FALLBACK));
  }, [chatId]);

  return (
    <VStack h="full" alignItems="stretch" w="full">
      <VStack flexGrow={1} alignItems="stretch" overflowY="scroll">
        <Heading size="lg" as="h1">
          Chat {chatId}
        </Heading>
        <UnorderedList ref={listRef}>
          {messages.map((text, i) => (
            <ListItem key={i}>
              <MessageBox text={text} />
            </ListItem>
          ))}
        </UnorderedList>
      </VStack>
      <Form method="post">
        <HStack>
          <Input name="message" type="text" />
          <Button type="submit">Send 💥</Button>
        </HStack>
      </Form>
    </VStack>
  );
};
