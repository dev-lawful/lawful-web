import { CloseIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, Link, Text, VStack } from "@chakra-ui/react";
import type { ErrorBoundaryComponent } from "@remix-run/node";
import { Link as RemixLink } from "@remix-run/react";

export const CustomErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  return (
    <VStack
      align="center"
      justify="center"
      textAlign="center"
      py={10}
      px={6}
      flex={1}
    >
      <Box display="inline-block">
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          bg={"red.500"}
          rounded={"50px"}
          w={"55px"}
          h={"55px"}
          textAlign="center"
        >
          <CloseIcon boxSize={"20px"} color={"white"} />
        </Flex>
      </Box>
      <Heading as="h2" size="xl" mt={6} mb={2}>
        Something went wrong on our end.
      </Heading>
      <Text color={"gray.500"}>{error.message}</Text>
      <Link as={RemixLink} to=".." color="blue.300">
        Try navigating back and starting again!
      </Link>
    </VStack>
  );
};
