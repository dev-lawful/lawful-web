import {
  Flex,
  Heading,
  Img,
  Link,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Link as RemixLink } from "@remix-run/react";
const DecodeAboutRoute = () => {
  return (
    <Stack minH={"100vh"} direction={{ base: "column", md: "row" }}>
      <Flex p={8} flex={1} align={"center"} justify={"center"}>
        <Stack spacing={6} w={"full"} maxW={"lg"}>
          <Heading fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}>
            <Text
              as={"span"}
              position={"relative"}
              _after={{
                content: "''",
                width: "full",
                height: useBreakpointValue({ base: "20%", md: "30%" }),
                position: "absolute",
                bottom: 1,
                left: 0,
                bg: "decode.400",
                zIndex: -1,
              }}
            >
              Decode
            </Text>
            <br />{" "}
            <Text color={"decode.400"} as={"span"}>
              Agile software development made easy.
            </Text>{" "}
          </Heading>
          <Text fontSize={{ base: "md", lg: "lg" }} color={"gray.500"}>
            Communication in modern software development is key. That's why{" "}
            <Text as="strong">Decode</Text> brings top-notch task management and
            decision-making features to the table.
          </Text>
          <Link as={RemixLink} to="./responsibility">
            See Decode's social responsibility initiative
          </Link>
        </Stack>
      </Flex>
      <Flex flex={1}>
        <Img
          alt={
            "A group of people sitting together at a table, probably working together."
          }
          objectFit={"cover"}
          src={`/images/illustrative/decode-hero.avif`}
        />
      </Flex>
    </Stack>
  );
};

export default DecodeAboutRoute;
