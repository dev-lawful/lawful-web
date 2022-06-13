import { Avatar, HStack, Text, VStack } from "@chakra-ui/react";
import type { VFC } from "react";
import type { Message as MessageType } from "~/_types";

const EMPTY_MSG_FALLBACK = "Empty message...";

export const Message: VFC<{ message: MessageType }> = ({
  message: { userId, text, createdAt, id },
}) => {
  const currentUserId = "1e1d419b-ee40-4a34-bfb8-bebf1c1a2f5f";
  const isSender = userId === currentUserId;

  return (
    <VStack
      maxW="60%"
      bgColor={isSender ? "green.600" : "blue.600"}
      ml={isSender ? "auto" : "unset"}
      mt="2"
      borderRadius="lg"
      alignItems="stretch"
      width="fit-content"
      p="2"
    >
      <HStack flexDir={isSender ? "row-reverse" : "row"}>
        <Avatar size="sm" ml={isSender ? "2" : "unset"} />
        <Text>{text || EMPTY_MSG_FALLBACK}</Text>
      </HStack>
      <Text
        align={isSender ? "left" : "right"}
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
