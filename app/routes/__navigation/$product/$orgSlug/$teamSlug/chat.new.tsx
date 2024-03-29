import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useParams } from "@remix-run/react";
import { createChat, getOrganizationBySlug, getTeamBySlug } from "~/models";
import type { Chat } from "~/_types";

type ActionData = {
  formError?: string;
  fieldErrors?: Pick<Chat, "name" | "description">;
  //TODO use Chat type
  fields?: {
    name: string;
    description: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request, params }) => {
  const { product } = params;
  if (product !== "network") {
    throw new Response("Chat feature doesn't belong to this product", {
      status: 400,
    });
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const description = formData.get("description");
  const teamSlug = formData.get("teamSlug");

  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof teamSlug !== "string"
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }
  const fieldErrors = {
    name: !name ? "Name is required" : undefined,
    description: !description ? "Description is required" : undefined,
  };
  const fields = { name, description };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const {
    data: {
      0: { id: organizationId },
    },
    error: organizationError,
  } = await getOrganizationBySlug(params.orgSlug!);

  if (organizationError) throw new Error(organizationError);

  const { data: teamData, error: teamError } = await getTeamBySlug({
    slug: teamSlug,
    organizationId,
  });
  const teamId = teamData[0]?.id;
  if (teamError || !teamId) {
    throw new Response(teamError);
  }
  const { data, error } = await createChat({ ...fields, teamId });
  const newChatId = data[0]?.id;
  if (error || !newChatId) {
    throw new Response(error);
  }

  return redirect(`${request.url}/../${newChatId}`);
};
const NewChatRoute = () => {
  const actionData = useActionData<ActionData>();
  const { teamSlug } = useParams();

  return (
    <Form method="post">
      <Input type="hidden" id="teamSlug" name="teamSlug" value={teamSlug} />
      <FormControl isInvalid={Boolean(actionData?.fieldErrors?.name)}>
        <FormLabel htmlFor="name">Chat name</FormLabel>
        <Input id="name" name="name" defaultValue={actionData?.fields?.name} />
        <FormErrorMessage>{actionData?.fieldErrors?.name}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={Boolean(actionData?.fieldErrors?.description)}>
        <FormLabel htmlFor="description">Description</FormLabel>
        <Input
          id="description"
          name="description"
          defaultValue={actionData?.fields?.description}
        />
        <FormErrorMessage>
          {actionData?.fieldErrors?.description}
        </FormErrorMessage>
      </FormControl>
      <Button type="submit">Create chat</Button>
    </Form>
  );
};

export default NewChatRoute;
