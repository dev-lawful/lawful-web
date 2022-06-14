import { Avatar, HStack, ListItem, UnorderedList } from "@chakra-ui/react";
import { NavLink } from "@remix-run/react";
import type { VFC } from "react";
import type { Chat } from "~/_types";

interface Props {
  chats: Array<Chat>;
}
export const ChatList: VFC<Props> = ({ chats }) => {
  return (
    <UnorderedList
      listStyleType="none"
      display="flex"
      flexDir="column"
      margin="0"
      h="full"
      overflowY="auto"
    >
      {chats.map(({ name, id }) => (
        <ListItem key={id} h="60px">
          <HStack h="full">
            <Avatar size="md" mr="2" />
            <NavLink to={`${id}`}>{name}</NavLink>
          </HStack>
        </ListItem>
      ))}
    </UnorderedList>
  );
};
