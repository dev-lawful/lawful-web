import { PlusSquareIcon } from "@chakra-ui/icons";
import { Button, HStack, Link, VStack, Text, Box } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link as RemixLink, Outlet, useLoaderData } from "@remix-run/react";
import { InitiativesList } from "~/components/modules/lawful";
import { CustomErrorBoundary, CustomCatchBoundary } from "~/components/ui";
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

const EditorRoute = () => {
  const { data: initiatives } = useLoaderData();
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
        <InitiativesList initiatives={initiatives} />
      </VStack>
      <Box>
        <Outlet />
      </Box>
    </HStack>
  );
};

export default EditorRoute;

export const ErrorBoundary = CustomErrorBoundary;

export const CatchBoundary = CustomCatchBoundary;
