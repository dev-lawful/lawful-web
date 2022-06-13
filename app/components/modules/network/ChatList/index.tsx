import { Box, VStack } from "@chakra-ui/react";
import type { VFC } from "react";
import type { Chat } from "~/_types";

interface Props {
  chats: Array<Chat>;
}
export const ChatList: VFC<Props> = ({ chats }) => {
  return (
    <VStack bg="gray.700" h="full">
      {chats.map(({ name, id }) => (
        <Box key={id} h="40px">
          {name}
        </Box>
      ))}
    </VStack>
  );
};
