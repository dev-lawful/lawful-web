import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useCatch } from "@remix-run/react";
import { checkActiveSubscription, getOrganizationBySlug } from "~/models";

// TODO: Check if the org belongs to selected product and if user belongs to this org
export const loader: LoaderFunction = async ({ params }) => {
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
