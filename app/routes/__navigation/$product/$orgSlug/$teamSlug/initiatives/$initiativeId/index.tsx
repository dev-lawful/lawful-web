import { ArrowBackIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Alert,
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Link,
  List,
  ListItem,
  SimpleGrid,
  Stack,
  StackDivider,
  Text,
  useColorModeValue,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link as RemixLink,
  useCatch,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { InitiativeStatus } from "~/components/modules/lawful";
import { MarkdownViewer } from "~/components/ui";
import { getInitiativeById } from "~/models";
import type { Initiative } from "~/_types";

interface LoaderData {
  data: Array<Initiative>;
}

export const loader: LoaderFunction = async ({ params }) => {
  const { initiativeId } = params;
  if (!initiativeId) {
    throw new Response("No initiative id", { status: 400 });
  }

  const { data, error } = await getInitiativeById({ id: initiativeId });
  if (error) {
    throw new Error(error);
  }
  return json<LoaderData>({ data });
};

const InitiativeRoute = () => {
  const {
    data: { 0: initiative },
  } = useLoaderData<LoaderData>();

  const initiativeSubtitleColor = useColorModeValue("lawful.500", "lawful.300");

  return (
    <Container maxW={"7xl"}>
      <SimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 9, md: 18 }}
      >
        <Stack spacing={{ base: 6, md: 10 }}>
          <Box as={"header"}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "2xl", sm: "4xl", lg: "5xl" }}
            >
              {initiative.title}
            </Heading>
            <Text
              color={useColorModeValue("gray.900", "gray.400")}
              fontWeight={300}
              fontSize={"2xl"}
            >
              {initiative.description}
            </Text>
          </Box>

          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={"column"}
            divider={
              <StackDivider
                borderColor={useColorModeValue("gray.200", "gray.600")}
              />
            }
          >
            {initiative.dueDate ? (
              <Box>
                <Text
                  fontSize={{ base: "16px", lg: "18px" }}
                  color={initiativeSubtitleColor}
                  fontWeight={"500"}
                  textTransform={"uppercase"}
                  mb={"4"}
                >
                  Status
                </Text>
                <InitiativeStatus dateString={initiative.dueDate} />
              </Box>
            ) : null}
            <Box>
              <Text
                fontSize={{ base: "16px", lg: "18px" }}
                color={initiativeSubtitleColor}
                fontWeight={"500"}
                textTransform={"uppercase"}
                mb={"4"}
              >
                Content
              </Text>
              <MarkdownViewer markdown={initiative.content || ""} />
            </Box>
            <Box>
              <Text
                fontSize={{ base: "16px", lg: "18px" }}
                color={initiativeSubtitleColor}
                fontWeight={"500"}
                textTransform={"uppercase"}
                mb={"4"}
              >
                Details
              </Text>

              <List spacing={2}>
                {initiative.created_at ? (
                  <ListItem>
                    <Text as={"span"} fontWeight={"bold"}>
                      Created at:
                    </Text>{" "}
                    {new Date(initiative.created_at).toLocaleString()}
                  </ListItem>
                ) : null}
                {initiative.dueDate ? (
                  <ListItem>
                    <Text as={"span"} fontWeight={"bold"}>
                      Due date:
                    </Text>{" "}
                    {new Date(initiative.dueDate).toLocaleString()}
                  </ListItem>
                ) : null}
              </List>
            </Box>
          </Stack>

          <Wrap spacing="3">
            <WrapItem>
              <Link as={RemixLink} to="./edit">
                <Button>
                  <HStack>
                    <EditIcon /> <Text>Edit</Text>
                  </HStack>
                </Button>
              </Link>
            </WrapItem>
            <WrapItem>
              <Link as={RemixLink} to={`../`}>
                <Button variant="outline">
                  <HStack>
                    <ArrowBackIcon /> <Text>Back to list</Text>
                  </HStack>
                </Button>
              </Link>
            </WrapItem>
          </Wrap>
        </Stack>
      </SimpleGrid>
    </Container>
  );
};

export default InitiativeRoute;

export const CatchBoundary = () => {
  const error = useCatch();
  return (
    <div>
      <Alert>{error.data}</Alert>
    </div>
  );
};

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div>
      <Alert variant="solid">{error.message}</Alert>
    </div>
  );
}
