import { HStack, Link, ListItem, UnorderedList } from "@chakra-ui/react";
import { NavLink } from "@remix-run/react";
import { Item } from "framer-motion/types/components/Reorder/Item";
import type { VFC } from "react";
import type { Board } from "~/_types";

interface Props {
  boards: Array<Board>;
}

export const BoardsList: VFC<Props> = ({ boards }) => {
  return (
    <UnorderedList
      listStyleType="none"
      display="flex"
      flexDir="column"
      h="full"
      overflowY="auto"
      overflowX="hidden"
    >
      {boards
        .sort(
          (a, b) =>
            new Date(a.created_at!).getTime() -
            new Date(b.created_at!).getTime()
        )
        .map(({ name, id, created_at }) => (
          <ListItem key={id} py="2" px="1" w="full" textOverflow="ellipsis">
            <HStack h="full">
              <Link
                as={NavLink}
                to={`./${id}`}
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
