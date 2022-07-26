import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { Chat } from "~/components/modules/network";
import { CustomCatchBoundary, CustomErrorBoundary } from "~/components/ui";
import { setAuthToken } from "~/db";
import {
  getChatById,
  getLastMessages,
  getOrganizationBySlug,
  getTeamBySlug,
  sendMessage,
} from "~/models";
import type { Message } from "~/_types";

interface LoaderData {
  data: Array<Message>;
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const { chatId, teamSlug, orgSlug } = params;

  if (!chatId || !teamSlug || !orgSlug) {
    throw new Response("No chatId or teamSlug provided", { status: 400 });
  }
  const { data: orgData, error: orgError } = await getOrganizationBySlug(
    orgSlug!
  );
  const [organization] = orgData;
  if (!organization || orgError) {
    throw new Response("Organization not found", {
      status: 404,
    });
  }

  const { data: teamData, error: teamError } = await getTeamBySlug({
    slug: teamSlug,
    organizationId: organization.id,
  });
  const [team] = teamData;
  if (!team || teamError) {
    throw new Response("Team not found", {
      status: 404,
    });
  }

  const {
    data: { 0: chatData },
    error: chatError,
  } = await getChatById({
    chatId,
    teamId: team.id,
  });

  if (!chatData || chatError) {
    throw new Response("Chat not found", { status: 404 });
  }

  await setAuthToken(request);
  const { error, data } = await getLastMessages({ chatId, limit: 30 });
  if (error) {
    throw new Error(error);
  }

  return json<LoaderData>({ data });
};

interface ActionData {
  data: Array<Message>;
}

export const action: ActionFunction = async ({ params, request }) => {
  const { chatId } = params;
  if (!chatId) {
    throw new Response("No chat id", { status: 400 });
  }

  const formData = await request.formData();
  const message = formData.get("message");
  const userId = formData.get("userId");

  await setAuthToken(request);
  // TODO: validate message properties
  const { data, error } = await sendMessage({
    chatId: parseInt(chatId),
    text: message as string,
    userId: (userId as string) ?? undefined,
  });

  // TODO: refactor maybe?
  if (error) {
    throw new Error(error);
  }

  return json<ActionData>({ data });
};

const ChatIndexRoute = () => {
  const { data: lastMessages } = useLoaderData<LoaderData>();
  const { chatId } = useParams();

  if (!chatId) {
    return <div>No chat id</div>;
  }

  return <Chat key={chatId} chatId={chatId} initialMessages={lastMessages} />;
};

export default ChatIndexRoute;

export const ErrorBoundary = CustomErrorBoundary;

export const CatchBoundary = CustomCatchBoundary;
