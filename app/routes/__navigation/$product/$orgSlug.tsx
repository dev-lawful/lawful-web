import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useCatch } from "@remix-run/react";
import {
  checkActiveSubscription,
  getOrganizationBySlug,
  getOrganizationsByUserId,
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
    await getOrganizationsByUserId(user.id);
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
      "Organization doesn't have an active subscription to this product",
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

export const ErrorBoundary = ({ error }: { error: Error }) => {
  return (
    <div>
      <p>{error.message}</p>
    </div>
  );
};

export const CatchBoundary = () => {
  const error = useCatch();
  return (
    <div>
      <p>{error.status}</p>
      <p>{error.data}</p>
    </div>
  );
};
