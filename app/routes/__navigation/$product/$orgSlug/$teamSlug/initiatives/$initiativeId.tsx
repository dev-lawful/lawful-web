import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { supabase } from "~/db";
import {
  getInitiativeById,
  getOrganizationBySlug,
  getTeamBySlug,
} from "~/models";
import { getSession } from "~/sessions";
import type { UserSession } from "~/_types";

export const loader: LoaderFunction = async ({ params, request }) => {
  const { initiativeId } = params;

  const { data: initiatives } = await getInitiativeById({ id: initiativeId! });

  const { 0: initiative } = initiatives;

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

  if (initiative.teamId !== teamId)
    throw new Response("You're not allowed to see this initiative", {
      status: 401,
    });

  if (initiatives.length === 0)
    throw new Response(
      `We couldn't find any initiative with the given id: ${initiativeId}`,
      {
        status: 404,
      }
    );

  const {
    0: { status, owner },
  } = initiatives;

  const session = await getSession(request.headers.get("Cookie"));

  const { accessToken } = (session.get("authenticated") as UserSession) || {};

  const { user } = await supabase.auth.api.getUser(accessToken);

  if (status === "draft" && owner !== user?.id)
    throw new Response(`You're not allowed to see this initiative`, {
      status: 401,
    });

  return json<{}>({});
};

const InitiativeLayoutRoute = () => {
  return <Outlet />;
};

export default InitiativeLayoutRoute;
