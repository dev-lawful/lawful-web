import {
  Avatar,
  HStack,
  Link,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { NavLink } from "@remix-run/react";
import type { Chat } from "~/_types";

interface Props {
  chats: Array<Chat>;
}

export const ChatList = ({ chats }: Props) => {
  return (
    <UnorderedList
      listStyleType="none"
      display="flex"
      flexDir="column"
      margin="0"
      h="full"
      overflowY="auto"
      overflowX="hidden"
    >
      {chats.map(({ name, id }) => (
        <ListItem key={id} py="2" px="1" textOverflow="ellipsis">
          <HStack h="full">
            <Avatar size="md" mr="2" />
            <Link
              as={NavLink}
              to={`${id}`}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {name}
            </Link>
          </HStack>
        </ListItem>
      ))}
    </UnorderedList>
  );
};
