import { WarningTwoIcon } from "@chakra-ui/icons";
import { Box, Heading, Text } from "@chakra-ui/react";
import { useCatch } from "@remix-run/react";
import type { CatchBoundaryComponent } from "@remix-run/react/routeModules";

export const CustomCatchBoundary: CatchBoundaryComponent = () => {
  const { data } = useCatch();
  return (
    <Box textAlign="center" py={10} px={6}>
      <WarningTwoIcon boxSize={"50px"} color={"orange.300"} />
      <Heading as="h2" size="xl" mt={6} mb={2}>
        Whoops! Seems like someone's lost here...
      </Heading>
      <Text color={"gray.500"}>{data}</Text>
    </Box>
  );
};
