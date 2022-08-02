import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, HStack, Text, VStack } from "@chakra-ui/react";
import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from "@remix-run/react";
import { InitiativeForm } from "~/components/modules/lawful";
import {
  CustomCatchBoundary,
  CustomErrorBoundary,
  editorLinks,
} from "~/components/ui";
import {
  getInitiativeById,
  getOrganizationBySlug,
  getTeamBySlug,
  updateInitiative,
} from "~/models";
import type { Initiative } from "~/_types";

interface LoaderData {
  data: Array<Initiative>;
}

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const content = formData.get("content") ?? "";
  const title = formData.get("title") ?? "";
  const description = formData.get("description") ?? "";
  const dueDate = formData.get("dueDate") ?? "";

  if (
    typeof content !== "string" ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof dueDate !== "string"
  ) {
    throw new Response("Form not submitted correcty", { status: 400 });
  }

  const {
    data: {
      0: { id: organizationId },
    },
    error: organizationError,
  } = await getOrganizationBySlug(params.orgSlug!);

  if (organizationError) throw new Error(organizationError);

  const {
    data: {
      0: { id: teamId },
    },
    error: teamError,
  } = await getTeamBySlug({
    slug: params.teamSlug!,
    organizationId,
  });

  if (teamError) throw new Error(teamError);

  const { error } = await updateInitiative({
    initiativeData: {
      content,
      title,
      description,
      dueDate: new Date(dueDate).toJSON(),
      teamId,
    },
    initiativeId: params.initiativeId!,
  });

  if (error) {
    throw new Error(error);
  }

  const { pathname, origin } = new URL(request.url);

  const initiativesPath = pathname.split("/").slice(0, -1).join("/");

  return redirect(`${origin}${initiativesPath}`);
};

export const loader: LoaderFunction = async ({ params }) => {
  const { initiativeId } = params;

  if (!initiativeId) {
    throw new Request("initiativeId should exist");
  }

  const { data, error } = await getInitiativeById({ id: params.initiativeId! });

  if (error) throw new Error(error);

  return json<LoaderData>({
    data,
  });
};

export const links: LinksFunction = () => {
  return [...editorLinks()];
};

const NewInitiativeRoute = () => {
  const {
    data: { 0: initiative },
  } = useLoaderData<LoaderData>();

  return (
    <VStack align="start">
      <InitiativeForm defaultValues={initiative} />
      <Button to={`../${initiative.id}`} as={RemixLink} variant="outline">
        <HStack>
          <ArrowBackIcon />
          <Text>Back</Text>
        </HStack>
      </Button>
    </VStack>
  );
};

export default NewInitiativeRoute;

export const ErrorBoundary = CustomErrorBoundary;

export const CatchBoundary = CustomCatchBoundary;
