import { InfoIcon } from "@chakra-ui/icons";
import { Box, Heading, Text } from "@chakra-ui/react";

const ChatIndexRoute = () => {
  return (
    <Box textAlign="center" flex={1}>
      <InfoIcon boxSize={"50px"} color={"blue.500"} />
      <Heading as="h2" size="xl" mt={6} mb={2}>
        Welcome to the Chat main page!
      </Heading>
      <Text color={"gray.500"}>
        Click on one of the chats listed in the sidebar on the left side of the
        screen and start messaging!
      </Text>
    </Box>
  );
};

export default ChatIndexRoute;
