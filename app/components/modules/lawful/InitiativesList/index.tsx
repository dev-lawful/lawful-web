import { HStack, Link, ListItem, UnorderedList } from "@chakra-ui/react";
import { NavLink } from "@remix-run/react";
import type { VFC } from "react";
import type { Initiative } from "~/_types";

interface Props {
  initiatives: Array<Initiative>;
}

export const InitiativesList: VFC<Props> = ({ initiatives }) => {
  return (
    <UnorderedList
      listStyleType="none"
      display="flex"
      flexDir="column"
      h="full"
      overflowY="auto"
      overflowX="hidden"
    >
      {initiatives
        .sort(
          (a, b) =>
            new Date(a?.created_at!).getTime() -
            new Date(b?.created_at!).getTime()
        )
        .map(({ title, id }) => (
          <ListItem key={id} py="2" px="1" w="full" textOverflow="ellipsis">
            <HStack h="full">
              <Link
                as={NavLink}
                to={`./${id}`}
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {title}
              </Link>
            </HStack>
          </ListItem>
        ))}
    </UnorderedList>
  );
};
