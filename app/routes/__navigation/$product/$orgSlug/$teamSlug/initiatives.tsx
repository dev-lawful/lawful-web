import { PlusSquareIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  Link,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link as RemixLink,
  NavLink,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { CustomCatchBoundary, CustomErrorBoundary } from "~/components/ui";
import { useSupabaseClient } from "~/db";
import { getInitiatives } from "~/models";
import type { Initiative } from "~/_types";

interface LoaderData {
  data: Array<Initiative>;
}

export const loader: LoaderFunction = async () => {
  const { data, error } = await getInitiatives();
  if (error) {
    throw new Error(error);
  }
  return json<LoaderData>({ data });
};

const InitiativesLayoutRoute = () => {
  const { data: initiatives } = useLoaderData<LoaderData>();

  const supabase = useSupabaseClient();

  const filteredInitiatives = initiatives.filter((initiative) => {
    if (initiative.owner === supabase?.user?.id) {
      return true;
    }

    return initiative.status === "published";
  });

  return (
    <HStack align={"start"} flex="1" minH="0" p="4">
      <VStack alignItems="stretch" w="20%" minW="200px" h="full">
        <Link as={RemixLink} to="./new">
          <Button rounded={"md"} colorScheme={"decode"}>
            <HStack>
              <PlusSquareIcon />
              <Text>New initiative</Text>
            </HStack>
          </Button>
        </Link>
        <UnorderedList
          listStyleType="none"
          display="flex"
          flexDir="column"
          h="full"
          overflowY="auto"
          overflowX="hidden"
        >
          {filteredInitiatives
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
      </VStack>
      <Box>
        <Outlet />
      </Box>
    </HStack>
  );
};

export default InitiativesLayoutRoute;

export const ErrorBoundary = CustomErrorBoundary;

export const CatchBoundary = CustomCatchBoundary;
