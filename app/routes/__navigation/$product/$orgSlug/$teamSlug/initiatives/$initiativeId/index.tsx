import { ArrowBackIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Link,
  List,
  ListItem,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  StackDivider,
  Text,
  useColorModeValue,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link as RemixLink, useLoaderData } from "@remix-run/react";
import type { Status } from "~/components/modules/lawful";
import { InitiativeStatus } from "~/components/modules/lawful";
import {
  CustomCatchBoundary,
  CustomErrorBoundary,
  MarkdownViewer,
} from "~/components/ui";
import { useSupabaseClient } from "~/db";
import {
  createVote,
  getInitiativeById,
  getOptionsByInitiativeId,
  updateInitiative,
} from "~/models";
import type { Initiative, Option, Vote } from "~/_types";

const getInitiativeStatus = ({
  date,
  draft,
}: {
  date: Date;
  draft: boolean;
}): Status =>
  draft ? "draft" : date.getTime() > new Date().getTime() ? "active" : "closed";

interface LoaderData {
  data: {
    initiatives: Array<Initiative>;
    options: Array<
      Option & {
        votes: Array<Vote>;
      }
    >;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  switch (request.method) {
    case "POST": {
      const optionId = parseInt(formData.get("optionId")! as string);
      const userId = formData.get("userId")! as string;

      await createVote({
        optionId,
        userId,
      });
    }

    case "PATCH": {
      const status = formData.get("status") as string;
      const id = formData.get("id") as string;

      await updateInitiative({ initiativeData: { status }, initiativeId: id });
    }
  }
  return json<{}>({});
};

export const loader: LoaderFunction = async ({ params }) => {
  const { initiativeId } = params;
  if (!initiativeId) {
    throw new Response("No initiative id", { status: 400 });
  }

  const { data: initiativeData, error: initiativeError } =
    await getInitiativeById({ id: initiativeId });

  if (initiativeError) {
    throw new Error(initiativeError);
  }

  const { data: optionsData, error: optionsError } =
    await getOptionsByInitiativeId(initiativeId);

  if (optionsError) {
    throw new Error(optionsError);
  }

  return json<LoaderData>({
    data: {
      initiatives: initiativeData,
      options: optionsData,
    },
  });
};

const InitiativeRoute = () => {
  const {
    data: {
      initiatives: { 0: initiative },
      options,
    },
  } = useLoaderData<LoaderData>();

  const initiativeSubtitleColor = useColorModeValue("lawful.500", "lawful.300");

  const supabase = useSupabaseClient();

  const hasUserAlreadyVoted =
    options
      .map((i) => i.votes)
      .flat()
      .filter((item) => item.userId === supabase?.user?.id).length > 0;

  const initiativeStatus: Status = getInitiativeStatus({
    date: new Date(initiative?.dueDate!),
    draft: initiative?.status === "draft",
  });

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
                <InitiativeStatus status={initiativeStatus} />
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
            {initiative.owner === supabase?.user?.id ? (
              <WrapItem>
                <Link as={RemixLink} to="./edit">
                  <Button>
                    <HStack>
                      <EditIcon /> <Text>Edit</Text>
                    </HStack>
                  </Button>
                </Link>
              </WrapItem>
            ) : null}
            <WrapItem>
              <Link as={RemixLink} to={`./../../initiatives`}>
                <Button variant="outline">
                  <HStack>
                    <ArrowBackIcon /> <Text>Back to list</Text>
                  </HStack>
                </Button>
              </Link>
            </WrapItem>
          </Wrap>
        </Stack>
        <Stack spacing={{ base: 6, md: 10 }}>
          <Heading>
            {initiativeStatus === "closed" ? "Voting has ended" : "Voting area"}
          </Heading>
          <Form method="post">
            <Input type="hidden" value={supabase?.user?.id} name="userId" />
            <RadioGroup defaultChecked={true} name="option">
              <VStack align="start" spacing={3}>
                {options.map(({ votes, content, id }) => {
                  return (
                    <Radio
                      name="optionId"
                      key={id}
                      colorScheme="lawful"
                      value={`${id}`}
                    >
                      {content} (Votes count: {votes.length})
                    </Radio>
                  );
                })}
                <Button
                  disabled={
                    hasUserAlreadyVoted || initiativeStatus === "closed"
                  }
                  type="submit"
                >
                  {hasUserAlreadyVoted ? "You already voted!" : "Submit vote"}
                </Button>
              </VStack>
            </RadioGroup>
          </Form>
          {initiative.owner === supabase?.user?.id ? (
            <Form method="patch">
              <Input
                type="hidden"
                name="status"
                value={initiative.status === "draft" ? "published" : "draft"}
              />
              <Input type="hidden" name="id" value={initiative.id} />
              <Button type="submit" variant="outline">
                {initiative.status === "draft" ? "Publish" : "Unpublish"}
              </Button>
            </Form>
          ) : null}
        </Stack>
      </SimpleGrid>
    </Container>
  );
};

export default InitiativeRoute;

export const ErrorBoundary = CustomErrorBoundary;

export const CatchBoundary = CustomCatchBoundary;
