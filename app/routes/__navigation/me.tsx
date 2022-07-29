import {
  Box,
  useColorModeValue,
  Flex,
  Avatar,
  Stack,
  Heading,
  Button,
  Text,
  Img,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Wrap,
  Input,
  HStack,
} from "@chakra-ui/react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { CustomCatchBoundary, CustomErrorBoundary } from "~/components/ui";
import { supabase, useSupabaseClient } from "~/db";
import {
  addUserToOrganization,
  addUserToTeam,
  deleteInvitation,
  findProfileByUserId,
  getOrganizationById,
  getOrganizationBySlug,
  getPendingInvitations,
} from "~/models";
import { getSession } from "~/sessions";
import type {
  Organization,
  OrganizationInvitation,
  Profile,
  UserSession,
} from "~/_types";

interface LoaderData {
  profile: Profile;
  invitations: Array<
    OrganizationInvitation & {
      organization: Organization;
    }
  >;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const invitationId = formData.get("invitationId");
  const userId = formData.get("userId");

  if (typeof userId !== "string") {
    throw new Response("Bad request");
  }

  const {
    data: { 0: inviteData },
    error: inviteError,
  } = await deleteInvitation(Number(invitationId));

  if (inviteError || !inviteData) {
    throw new Error("An error occurred accepting the invitation");
  }

  const {
    data: organizationMembershipData,
    error: organizationMembershipError,
  } = await addUserToOrganization({
    organizationId: inviteData.organizationId,
    userId,
  });

  if (organizationMembershipError) {
    throw new Error("An error occurred accepting the invitation");
  }

  const {
    data: { 0: organizationData },
    error: organizationError,
  } = await getOrganizationById(organizationMembershipData[0]?.organizationId!);

  if (organizationError) throw new Error(organizationError);

  organizationData.teams.forEach(async (team) => {
    const { error } = await addUserToTeam({ teamId: team.id, userId });

    if (error) throw new Error(error);
  });

  return json({});
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  const { accessToken, user: userCookie } =
    (session.get("authenticated") as UserSession) || {};

  const { user } = await supabase.auth.api.getUser(accessToken);

  if (!user || !userCookie) {
    return redirect("/signin");
  }

  const {
    data: { 0: profile },
    error,
  } = await findProfileByUserId({ userId: user?.id! });

  if (error) throw new Error(error);

  const { data: invitations, error: invitationError } =
    await getPendingInvitations(profile.email);

  if (invitationError) throw new Error(invitationError);

  return json<LoaderData>({
    invitations,
    profile,
  });
};

const MeRoute = () => {
  const { profile, invitations } = useLoaderData<LoaderData>();

  const { user } = useSupabaseClient();

  return (
    <Tabs m={[0, 10]} maxW="2xl">
      <TabList>
        <Tab>Details</Tab>
        <Tab>Invitations</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Heading>Profile details</Heading>
          <Box
            m={[0, 10]}
            mt={[5, 10]}
            maxW={"lg"}
            w={"full"}
            bg={useColorModeValue("white", "gray.800")}
            boxShadow={"2xl"}
            rounded={"md"}
            overflow={"hidden"}
          >
            <Img
              h={"120px"}
              w={"full"}
              objectFit={"cover"}
              src={`https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80`}
            />
            <Flex justify={"center"} mt={-12}>
              <Avatar
                size={"xl"}
                name={`${profile.firstName} ${profile.lastName}`}
                css={{
                  border: "2px solid white",
                }}
              />
            </Flex>

            <Box p={6}>
              <Stack spacing={0} align={"center"} mb={5}>
                <Heading fontSize={"2xl"} fontWeight={500} fontFamily={"body"}>
                  {`${profile.firstName} ${profile.lastName}`}
                </Heading>
                <Text color={"gray.500"}>Lawful user</Text>
              </Stack>

              <Wrap direction={"row"} justify={"center"} spacing={6}>
                <Stack spacing={0} align={"center"}>
                  <Text fontWeight={600}>{profile.email}</Text>
                  <Text fontSize={"sm"} color={"gray.500"}>
                    Email
                  </Text>
                </Stack>
                <Stack spacing={0} align={"center"}>
                  {profile.createdAt ? (
                    <Text fontWeight={600}>
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </Text>
                  ) : null}
                  <Text fontSize={"sm"} color={"gray.500"}>
                    Active since
                  </Text>
                </Stack>
              </Wrap>
            </Box>
          </Box>
        </TabPanel>
        <TabPanel>
          <Heading>Invitations</Heading>
          {invitations.map(({ id, organization: { name } }) => {
            return (
              <Flex gap={3} flexDir="row" key={id} align="center">
                <HStack>
                  <Avatar name={name} />
                  <Text as="strong">{name}</Text>
                </HStack>
                <Form method="post">
                  <Input type="hidden" name="invitationId" value={id} />
                  <Input type="hidden" name="userId" value={user?.id} />
                  <Button type="submit" variant={"ghost"}>
                    Accept
                  </Button>
                </Form>
              </Flex>
            );
          })}
        </TabPanel>
        <TabPanel>
          <p>three!</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default MeRoute;

export const ErrorBoundary = CustomErrorBoundary;
export const CatchBoundary = CustomCatchBoundary;
