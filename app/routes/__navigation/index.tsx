import { Box, Container, Heading, Stack, Text } from "@chakra-ui/react";

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
        </Stack>
      </Container>
    </>
  );
}
