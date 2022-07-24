import { Avatar, HStack, Text, VStack } from "@chakra-ui/react";
import type { Message as MessageType } from "~/_types";

const EMPTY_MSG_FALLBACK = "Empty message...";

interface Props {
  message: MessageType;
  currentUserId: string | undefined;
}

export const Message = ({
  message: { userId, text, createdAt },
  currentUserId,
}: Props) => {
  const fromCurrentUser = currentUserId === userId;

  return (
    <VStack
      maxW="60%"
      bgColor={fromCurrentUser ? "green.600" : "blue.600"}
      ml={fromCurrentUser ? "auto" : "unset"}
      mt="2"
      borderRadius="lg"
      alignItems="stretch"
      width="fit-content"
      p="2"
    >
      <HStack flexDir={fromCurrentUser ? "row-reverse" : "row"}>
        <Avatar size="sm" ml={fromCurrentUser ? "2" : "unset"} />
        <Text>{text || EMPTY_MSG_FALLBACK}</Text>
      </HStack>
      <Text
        align={fromCurrentUser ? "left" : "right"}
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
