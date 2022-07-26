import { WarningTwoIcon } from "@chakra-ui/icons";
import { Heading, Link, Text, VStack } from "@chakra-ui/react";
import { Link as RemixLink, useCatch } from "@remix-run/react";
import type { CatchBoundaryComponent } from "@remix-run/react/routeModules";

export const CustomCatchBoundary: CatchBoundaryComponent = () => {
  const { data } = useCatch();
  return (
    <VStack justify="center" align="center" py={10} px={6} flex={1}>
      <WarningTwoIcon boxSize={"50px"} color={"orange.300"} />
      <Heading as="h2" size="xl" mt={6} mb={2}>
        Whoops! Seems like someone's lost here...
      </Heading>
      <Text color={"gray.500"}>{data}</Text>
      <Link as={RemixLink} to=".." color="blue.300">
        Try navigating back and starting again!
      </Link>
    </VStack>
  );
};
