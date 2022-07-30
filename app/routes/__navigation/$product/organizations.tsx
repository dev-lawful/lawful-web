import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import { LinkIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link as RemixLink, useLoaderData } from "@remix-run/react";
import { MarkdownViewer } from "~/components/ui";
import { supabase } from "~/db";
import { checkActiveSubscription, getOrganizationsByUserId } from "~/models";
import { getSession } from "~/sessions";
import { asyncFilter } from "~/utils";
import type { Organization, Team, UserSession } from "~/_types";

interface LoaderData {
  organizations: Array<
    Organization & {
      teams: Array<Team>;
    }
  >;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));

  const { accessToken } = (session.get("authenticated") as UserSession) || {};

  const { user } = await supabase.auth.api.getUser(accessToken);

  if (!user)
    throw new Response("Unauthorized", {
      status: 401,
    });

  const { data: organizations, error } = await getOrganizationsByUserId({
    id: user.id,
  });

  const data: LoaderData["organizations"] = await asyncFilter<
    Organization & {
      teams: Array<Team>;
    }
  >(
    organizations,
    async (
      org: Organization & {
        teams: Array<Team>;
      }
    ) => {
      return await checkActiveSubscription({
        organizationId: org.id,
        product: params.product,
      });
    }
  );

  if (error) throw new Error(error);

  return json<LoaderData>({
    organizations: data,
  });
};

const SwitchOrganizationRoute = () => {
  const { organizations } = useLoaderData<LoaderData>();

  const links = organizations.map((org) => ({
    ...org,
    slug: `${org.slug}/`,
    label: org.name,
    teams: org.teams.map((team) => ({
      ...team,
      slug: `${org.slug}/${team.slug}`,
      label: team.name,
    })),
  }));

  return (
    <Flex align="start" justify="start" flexDir="column" p={10} gap={3}>
      <Heading>Organizations & Teams switch ♻️</Heading>
      <Grid
        w="full"
        gap={3}
        gridTemplateColumns={[
          "repeat(1, minmax(0, 1fr))",
          "repeat(2, minmax(0, 1fr))",
          "repeat(3, minmax(0, 1fr))",
        ]}
      >
        {links.map((org) => {
          return (
            <Flex
              key={org.slug}
              backgroundColor={"gray.700"}
              flexDir="column"
              align="start"
              justify="start"
              gap={3}
              as={GridItem}
              rounded={10}
              p={5}
            >
              <VStack spacing={3} align="start">
                <HStack>
                  <Avatar name={org.name} />
                  <Link as={RemixLink} to={`../${org.slug}`}>
                    <HStack>
                      <Heading as="h2">{org.label}</Heading>
                      <LinkIcon />
                    </HStack>
                  </Link>
                </HStack>
                {org.description ? (
                  <Text size="md" color="gray.500">
                    <MarkdownViewer markdown={org.description} />
                  </Text>
                ) : null}
              </VStack>
              <Heading as="h3" size="md">
                Teams
              </Heading>
              <Flex gap={3} ml="10">
                {org.teams.map((team) => {
                  return (
                    <Box key={team.slug}>
                      <HStack spacing={3}>
                        <LinkIcon />
                        <Link as={RemixLink} to={`../${team.slug}`}>
                          <Text>{team.label}</Text>
                        </Link>
                      </HStack>
                    </Box>
                  );
                })}
              </Flex>
            </Flex>
          );
        })}
      </Grid>
    </Flex>
  );
};

export default SwitchOrganizationRoute;
