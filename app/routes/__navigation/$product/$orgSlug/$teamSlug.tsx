import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import {
  getOrganizationBySlug,
  getTeamBySlug,
  getTeamMembershipsByUserId,
} from "~/models";
import { getSession } from "~/sessions";
import type { UserSession } from "~/_types";

export const loader: LoaderFunction = async ({ params, request }) => {
  const { orgSlug, teamSlug } = params;
  if (!teamSlug || !orgSlug) {
    throw new Response("Team slug or Organization slug isn't defined", {
      status: 404,
    });
  }
  const { data: orgData, error: orgError } = await getOrganizationBySlug(
    orgSlug
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

  const teamBelongsToOrg = team.organizationId === organization.id;

  if (!teamBelongsToOrg) {
    throw new Response("This Team doesn't belong to this organization", {
      status: 400,
    });
  }

  const session = await getSession(request.headers.get("Cookie"));
  const { user } = (session.get("authenticated") as UserSession) || {};

  const { data: userTeams, error: userTeamsError } =
    await getTeamMembershipsByUserId(user.id);

  if (userTeamsError) {
    throw new Error("There has been an error fetching teams");
  }

  const userBelongsToTeam = userTeams.some(({ teamId }) => teamId === team.id);

  if (!userBelongsToTeam) {
    throw new Error("The signed in user doesn't belong to this team");
  }

  return json({});
};

const TeamLayoutRoute = () => {
  return <Outlet />;
};

export default TeamLayoutRoute;
