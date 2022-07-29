import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { CustomCatchBoundary, CustomErrorBoundary } from "~/components/ui";
import {
  checkActiveSubscription,
  getOrganizationBySlug,
  getOrganizationMembershipsByUserId,
} from "~/models";
import { getSession } from "~/sessions";
import type { UserSession } from "~/_types";

export const loader: LoaderFunction = async ({ params, request }) => {
  const { product, orgSlug } = params;

  if (!product || !orgSlug) {
    throw new Response("Product or Organization slug isn't defined", {
      status: 400,
    });
  }

  const { data: orgData, error: orgError } = await getOrganizationBySlug(
    orgSlug
  );

  const [organization] = orgData;

  if (!organization || orgError) {
    throw new Response("Organization not found", {
      status: 400,
    });
  }

  const session = await getSession(request.headers.get("Cookie"));
  const { user } = (session.get("authenticated") as UserSession) || {};

  const { data: userOrgs, error: userOrgsError } =
    await getOrganizationMembershipsByUserId(user?.id);

  if (userOrgsError) {
    throw new Error("There has been an error fetching organizations");
  }

  const userBelongsToOrg = userOrgs.some(
    ({ organizationId }) => organizationId === organization.id
  );

  if (!userBelongsToOrg) {
    throw new Error("The signed in user doesn't belong to this organization");
  }

  const orgHasSubscription = await checkActiveSubscription({
    product,
    organizationId: organization.id,
  });

  if (!orgHasSubscription) {
    throw new Response(
      "Your organization doesn't seem have an active subscription to this product",
      {
        status: 401,
      }
    );
  }

  return json({});
};

const OrganizationLayoutRoute = () => {
  return <Outlet />;
};

export default OrganizationLayoutRoute;

export const ErrorBoundary = CustomErrorBoundary;

export const CatchBoundary = CustomCatchBoundary;
