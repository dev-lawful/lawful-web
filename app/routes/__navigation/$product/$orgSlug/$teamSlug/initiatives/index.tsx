import { InfoIcon } from "@chakra-ui/icons";
import { Box, Heading, Text } from "@chakra-ui/react";

const InitiativesIndexRoute = () => {
  return (
    <Box textAlign="center" py={10} px={6}>
      <InfoIcon boxSize={"50px"} color={"blue.500"} />
      <Heading as="h2" size="xl" mt={6} mb={2}>
        Welcome to the Initiatives main page!
      </Heading>
      <Text color={"gray.500"}>
        Click on one of the initiatives listed in the sidebar on the left side
        of the screen and start working!
      </Text>
    </Box>
  );
};

export default InitiativesIndexRoute;
