import { Box, Button, Container, Heading, Stack, Text } from "@chakra-ui/react";

import { Link as RemixLink } from "@remix-run/react";

export default function IndexRoute() {
  return (
    <>
      <Container maxW={"3xl"}>
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            One app. <br />
            <Text as={"span"} color={"lawful.400"}>
              Many collaboration tools.
            </Text>
          </Heading>
          <Text color={"gray.500"}>
            Lawful re-invents collaboration tooling allowing your organization
            to move <strong>fast</strong>, spend <strong>less</strong> and get
            more things <strong>done</strong>.
          </Text>
          <Stack
            direction={"column"}
            spacing={3}
            align={"center"}
            alignSelf={"center"}
            position={"relative"}
          >
            <Button
              as={RemixLink}
              to="/signup"
              colorScheme={"lawful"}
              bg={"lawful.400"}
              rounded={"full"}
              px={6}
              _hover={{
                bg: "lawful.500",
              }}
            >
              Sign up
            </Button>
            <Button
              as={RemixLink}
              to="/signin"
              variant={"link"}
              colorScheme={"blue"}
              size={"sm"}
            >
              Already an user? Sign in
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}
