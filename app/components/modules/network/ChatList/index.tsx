import { ListItem, UnorderedList } from "@chakra-ui/react";
import { NavLink } from "@remix-run/react";
import type { VFC } from "react";
import type { Chat } from "~/_types";

interface Props {
  chats: Array<Chat>;
}
export const ChatList: VFC<Props> = ({ chats }) => {
  return (
    <UnorderedList
      display="flex"
      flexDir="column"
      bg="gray.700"
      margin="0"
      h="full"
      w="30%"
    >
      {chats.map(({ name, id }) => (
        <ListItem key={id} h="60px">
          <NavLink to={`${id}`}>{name}</NavLink>
        </ListItem>
      ))}
    </UnorderedList>
  );
};
