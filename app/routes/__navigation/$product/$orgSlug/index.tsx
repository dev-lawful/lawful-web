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
import { getOrganizationBySlug, getProfilesByOrganizationId } from "~/models";
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

const OrganizationRoute = () => {
  const { organization, profiles } = useLoaderData<LoaderData>();

  const product = useProduct();

  const organizationSubtitleColor = useColorModeValue(
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
      </SimpleGrid>
    </Container>
  );
};

export default OrganizationRoute;
