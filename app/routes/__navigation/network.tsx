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

const NetworkAboutRoute = () => {
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
                bg: "network.400",
                zIndex: -1,
              }}
            >
              Network
            </Text>
            <br />{" "}
            <Text color={"network.400"} as={"span"}>
              Business made easy.
            </Text>{" "}
          </Heading>
          <Text fontSize={{ base: "md", lg: "lg" }} color={"gray.500"}>
            Communication in modern business is key. That's why{" "}
            <Text as="strong">Network</Text> brings top-notch messaging and
            decision-making features to the table.
          </Text>
          <Link as={RemixLink} to="./responsibility" >
            See Network's social responsibility initiative
          </Link>
        </Stack>
      </Flex>
      <Flex flex={1}>
        <Img
          alt={
            "Two women working staring at a laptop, probably working together."
          }
          objectFit={"cover"}
          src={`/images/illustrative/network-hero.avif`}
        />
      </Flex>
    </Stack>
  );
};

export default NetworkAboutRoute;
