import { Avatar, HStack, Text, VStack } from "@chakra-ui/react";
import type { FC } from "react";
import { useSupabaseClient } from "~/db";
import type { Message as MessageType } from "~/_types";

const EMPTY_MSG_FALLBACK = "Empty message...";

export const Message: FC<{
  message: MessageType;
  currentUserId: string | undefined;
}> = ({ message: { userId, text, createdAt, id }, currentUserId }) => {
  const fromCurrentUser = currentUserId === userId;
  const supabase = useSupabaseClient();

  return (
    <VStack
      maxW="60%"
      bgColor={
        currentUserId === supabase.auth.user()?.id ? "green.600" : "blue.600"
      }
      ml={currentUserId === supabase.auth.user()?.id ? "auto" : "unset"}
      mt="2"
      borderRadius="lg"
      alignItems="stretch"
      width="fit-content"
      p="2"
    >
      <HStack
        flexDir={
          currentUserId === supabase.auth.user()?.id ? "row-reverse" : "row"
        }
      >
        <Avatar
          size="sm"
          ml={currentUserId === supabase.auth.user()?.id ? "2" : "unset"}
        />
        <Text>{text || EMPTY_MSG_FALLBACK}</Text>
      </HStack>
      <Text
        align={currentUserId === supabase.auth.user()?.id ? "left" : "right"}
        fontSize="small"
        color="gray.200"
        textOverflow="clip"
      >
        {/* TODO: backend sends this data in a different format */}
        {new Date(createdAt || "").toLocaleString()}
      </Text>
    </VStack>
  );
};
