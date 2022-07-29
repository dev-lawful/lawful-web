import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  List,
  ListItem,
  SimpleGrid,
  Stack,
  StackDivider,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import { MarkdownViewer } from "~/components/ui";
import { supabase, useSupabaseClient } from "~/db";
import {
  getOrganizationBySlug,
  getProfilesByOrganizationId,
  inviteToOrganization,
} from "~/models";
import { useProduct } from "~/utils";
import type { Organization, Profile } from "~/_types";

interface LoaderData {
  organization: Organization;
  profiles: Array<Profile>;
}

export const loader: LoaderFunction = async ({ params }) => {
  if (!params.orgSlug)
    throw new Response("The organization slug should be present in the URL.", {
      status: 400,
    });

  const {
    data: { 0: organization },
    error: organizationError,
  } = await getOrganizationBySlug(params.orgSlug!);

  if (organizationError) throw new Error(organizationError);

  const { data: profiles } = await getProfilesByOrganizationId({
    id: `${organization.id}`,
  });

  return json<LoaderData>({ organization, profiles });
};

interface ActionData {
  formResult?: {
    status: "error" | "success";
    message: string;
  };
}

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const organizationId = formData.get("organizationId");

  if (!email || typeof email !== "string") {
    return badRequest({
      formResult: { message: "Invalid email", status: "error" },
    });
  }

  if (!organizationId || typeof email !== "string") {
    return badRequest({
      formResult: { message: "Invalid organization", status: "error" },
    });
  }

  const { error } = await supabase.auth.api.inviteUserByEmail(email);

  if (error && error.status !== 422) {
    return badRequest({
      formResult: {
        status: "error",
        message: error.message,
      },
    });
  }

  const { error: inviteError } = await inviteToOrganization({
    userEmail: email,
    organizationId: Number(organizationId),
  });

  if (inviteError) {
    return badRequest({
      formResult: {
        status: "error",
        message: inviteError,
      },
    });
  }

  if (error && error.status === 422) {
    return json<ActionData>({
      formResult: {
        status: "success",
        message:
          "Great, this user already has an account, so we won't send any emails",
      },
    });
  }

  return json<ActionData>({
    formResult: {
      status: "success",
      message: "Great, the user's been invited. Check your email inbox.",
    },
  });
};

const OrganizationRoute = () => {
  const transition = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { organization, profiles } = useLoaderData<LoaderData>();

  const product = useProduct();

  const organizationSubtitleColor = useColorModeValue(
    `${product}.500`,
    `${product}.300`
  );

  const { user } = useSupabaseClient();

  const actionData = useActionData<ActionData>();

  const alert = actionData?.formResult;

  const isSending = transition.state === "submitting";

  useEffect(() => {
    if (!isSending) {
      formRef.current?.reset();
    }
  }, [isSending]);

  return (
    <Container maxW={"7xl"}>
      <SimpleGrid
        columns={1}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 18, md: 24 }}
      >
        <Stack spacing={{ base: 6, md: 10 }}>
          <Box as={"header"}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "2xl", sm: "4xl", lg: "5xl" }}
            >
              {organization.name}
            </Heading>
            {organization.createdAt ? (
              <Text
                color={organizationSubtitleColor}
                fontWeight={300}
                fontSize={"lg"}
              >
                Active since {new Date(organization.createdAt).toUTCString()}
              </Text>
            ) : null}
          </Box>

          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={"column"}
            divider={<StackDivider borderColor={organizationSubtitleColor} />}
          >
            {organization.description ? (
              <VStack align="start" spacing={{ base: 4, sm: 6 }}>
                <Text
                  color={organizationSubtitleColor}
                  fontSize={"2xl"}
                  fontWeight={"300"}
                >
                  Description
                </Text>
                <MarkdownViewer markdown={organization.description} />
              </VStack>
            ) : null}
            <Box>
              <Text
                fontSize={{ base: "16px", lg: "18px" }}
                color={organizationSubtitleColor}
                fontWeight={"500"}
                textTransform={"uppercase"}
                mb={"4"}
              >
                Active members
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                <List spacing={2}>
                  {profiles.map((item) => {
                    return (
                      <ListItem key={item.id}>
                        {item.firstName} {item.lastName}{" "}
                        {user?.id === item.id ? " | you" : null}
                        {item?.id === organization.ownerId ? " | 👑" : null}
                      </ListItem>
                    );
                  })}
                </List>
              </SimpleGrid>
            </Box>
          </Stack>
        </Stack>
        <Flex flexDir="column" gap={3}>
          <Heading as="h2">Invite someone to this organization</Heading>
          {alert ? (
            <Alert status={alert.status} borderRadius={5}>
              <AlertIcon />
              {alert.message}
            </Alert>
          ) : null}
          <Form ref={formRef} method="post">
            <Input
              type="hidden"
              name="organizationId"
              value={organization.id}
            />
            <FormControl isRequired>
              <FormLabel htmlFor="title">Email</FormLabel>
              <Input name="email" id="email" type="text" mb={3} />
            </FormControl>
            <Button type="submit">Invite</Button>
          </Form>
        </Flex>
      </SimpleGrid>
    </Container>
  );
};

export default OrganizationRoute;
