import type { ReactNode } from "react";
import {
  Box,
  Stack,
  HStack,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
  Link,
} from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link as RemixLink } from "@remix-run/react";

interface LoaderData {
  hobby: string[];
  pro: string[];
}

const planChecks = {
  network: {
    hobby: ["Online Chat.", "Videocalls."],
    pro: ["Online Chat PRO.", "Videocalls PRO."],
  },
  decode: {
    hobby: ["Kanban board.", "Poker planning."],
    pro: ["Kanban board PRO.", "Poker planning PRO."],
  },
};

export const loader: LoaderFunction = ({ params }) => {
  if (!params.product) {
    return redirect("/");
  }

  if (params.product !== "decode" && params.product !== "network") {
    return redirect("/");
  }
  return json<LoaderData>(planChecks[params.product]);
};

function PriceWrapper({ children }: { children: ReactNode }) {
  return (
    <Box
      mb={4}
      shadow="base"
      borderWidth="1px"
      alignSelf={{ base: "center", lg: "flex-start" }}
      borderColor={useColorModeValue("gray.200", "gray.500")}
      borderRadius={"xl"}
    >
      {children}
    </Box>
  );
}

const PricingPage = () => {
  const planChecks = useLoaderData() as LoaderData;
  return (
    <Box py={12}>
      <VStack spacing={2} textAlign="center">
        <Heading as="h1" fontSize="4xl">
          Plans that fit your need
        </Heading>
        <Text fontSize="lg" color={"gray.500"}>
          Start building for free, collaborate with a team, then upgrate to Pro.
        </Text>
      </VStack>
      <Stack
        direction={{ base: "column", md: "row" }}
        textAlign="center"
        justify="center"
        spacing={{ base: 4, lg: 10 }}
        py={10}
      >
        <PriceWrapper>
          <Box py={4} px={12}>
            <Text fontWeight="500" fontSize="2xl">
              Hobby
            </Text>
            <HStack justifyContent="center">
              <Text fontSize="3xl" fontWeight="600">
                $
              </Text>
              <Text fontSize="5xl" fontWeight="900">
                0
              </Text>
              <Text fontSize="3xl" color="gray.500">
                per user/month
              </Text>
            </HStack>
          </Box>
          <VStack
            bg={useColorModeValue("gray.50", "gray.700")}
            py={4}
            borderBottomRadius={"xl"}
          >
            <List spacing={3} textAlign="start" px={12}>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />1 free
                organization.
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />1 free team.
              </ListItem>
              {planChecks.hobby.map((check, idx) => (
                <ListItem key={idx}>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  {check}
                </ListItem>
              ))}
            </List>
            <Box w="80%" pt={7}>
              <Link
                as={RemixLink}
                to="/signup"
                w="full"
                variant="outline"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px solid"
                borderColor="red.200"
                borderRadius="md"
                h="10"
                fontWeight="semibold"
                color="red.200"
                _hover={{
                  textDecoration: "none",
                  backgroundColor: "rgba(254, 178, 178, 0.12)",
                }}
              >
                Start trial
              </Link>
            </Box>
          </VStack>
        </PriceWrapper>

        <PriceWrapper>
          <Box position="relative">
            <Box
              position="absolute"
              top="-16px"
              left="50%"
              style={{ transform: "translate(-50%)" }}
            >
              <Text
                textTransform="uppercase"
                bg={useColorModeValue("red.300", "red.700")}
                px={3}
                py={1}
                color={useColorModeValue("gray.900", "gray.300")}
                fontSize="sm"
                fontWeight="600"
                rounded="xl"
              >
                Most Popular
              </Text>
            </Box>
            <Box py={4} px={12}>
              <Text fontWeight="500" fontSize="2xl">
                Pro
              </Text>
              <HStack justifyContent="center">
                <Text fontSize="3xl" fontWeight="600">
                  $
                </Text>
                <Text fontSize="5xl" fontWeight="900">
                  4,5
                </Text>
                <Text fontSize="3xl" color="gray.500">
                  per user/month
                </Text>
              </HStack>
            </Box>
            <VStack
              bg={useColorModeValue("gray.50", "gray.700")}
              py={4}
              borderBottomRadius={"xl"}
            >
              <List spacing={3} textAlign="start" px={12}>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Unlimited organizations.
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Unlimited teams.
                </ListItem>
                {planChecks.pro.map((check, idx) => (
                  <ListItem key={idx}>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    {check}
                  </ListItem>
                ))}
              </List>
              <Box w="80%" pt={7}>
                <Link
                  as={RemixLink}
                  to="/signup"
                  w="full"
                  color="gray.800"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bgColor="red.200"
                  borderRadius="md"
                  h="10"
                  fontWeight="semibold"
                  _hover={{
                    textDecoration: "none",
                    backgroundColor: "red.300",
                  }}
                >
                  Get started
                </Link>
              </Box>
            </VStack>
          </Box>
        </PriceWrapper>
      </Stack>
    </Box>
  );
};

export default PricingPage;
