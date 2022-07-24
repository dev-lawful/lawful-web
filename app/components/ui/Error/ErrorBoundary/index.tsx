import { CloseIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import type { ErrorBoundaryComponent } from "@remix-run/node";

export const CustomErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  return (
    <Box textAlign="center" py={10} px={6}>
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
        Something went wrong! 😿
      </Heading>
      <Text color={"gray.500"}>{error.message}</Text>
    </Box>
  );
};
