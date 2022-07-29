import {
  Box,
  Container,
  Heading,
  List,
  ListItem,
  SimpleGrid,
  Stack,
  StackDivider,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MarkdownViewer } from "~/components/ui";
import { useSupabaseClient } from "~/db";
import {
  getOrganizationBySlug,
  getProfilesByTeamId,
  getTeamBySlug,
} from "~/models";
import { useProduct } from "~/utils";
import type { Profile, Team } from "~/_types";

interface LoaderData {
  team: Team;
  profiles: Array<Profile>;
}

export const loader: LoaderFunction = async ({ params }) => {
  if (!params.teamSlug)
    throw new Response("The team slug should be present in the URL.", {
      status: 400,
    });

  const {
    data: { 0: organization },
    error: organizationError,
  } = await getOrganizationBySlug(params.orgSlug!);

  if (organizationError) throw new Error(organizationError);

  const {
    data: { 0: team },
    error: teamError,
  } = await getTeamBySlug({
    slug: params.teamSlug!,
    organizationId: organization.id,
  });

  if (teamError) throw new Error(teamError);

  const { data: profiles } = await getProfilesByTeamId({
    id: `${team.id}`,
  });

  return json<LoaderData>({ team: team, profiles });
};

const TeamRoute = () => {
  const { team, profiles } = useLoaderData<LoaderData>();

  const product = useProduct();

  const teamSubtitleColor = useColorModeValue(
    `${product}.500`,
    `${product}.300`
  );

  const { user } = useSupabaseClient();

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
              {team.name}
            </Heading>
            {team.createdAt ? (
              <Text color={teamSubtitleColor} fontWeight={300} fontSize={"lg"}>
                Active since {new Date(team.createdAt).toUTCString()}
              </Text>
            ) : null}
          </Box>

          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={"column"}
            divider={<StackDivider borderColor={teamSubtitleColor} />}
          >
            {team.description ? (
              <VStack align="start" spacing={{ base: 4, sm: 6 }}>
                <Text
                  color={teamSubtitleColor}
                  fontSize={"2xl"}
                  fontWeight={"300"}
                >
                  Description
                </Text>
                <MarkdownViewer markdown={team.description} />
              </VStack>
            ) : null}
            <Box>
              <Text
                fontSize={{ base: "16px", lg: "18px" }}
                color={teamSubtitleColor}
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
                      </ListItem>
                    );
                  })}
                </List>
              </SimpleGrid>
            </Box>
          </Stack>
        </Stack>
      </SimpleGrid>
    </Container>
  );
};

export default TeamRoute;
