import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { CustomCatchBoundary, CustomErrorBoundary } from "~/components/ui";
import { supabase } from "~/db";
import {
  checkActiveSubscription,
  getOrganizationBySlug,
  getOrganizationMembershipsByUserId,
  inviteToOrganization,
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

interface ActionData {
  formResult?: {
    status: "error" | "success";
    message: string;
  };
}

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const organizationId = formData.get("organizationId");

  if (!email || typeof email !== "string") {
    return badRequest({
      formResult: { message: "Invalid email", status: "error" },
    });
  }

  if (!organizationId || typeof email !== "string") {
    return badRequest({
      formResult: { message: "Invalid organization", status: "error" },
    });
  }

  const { error: inviteError } = await inviteToOrganization({
    userEmail: email,
    organizationId: Number(organizationId),
  });

  if (inviteError) {
    return badRequest({
      formResult: {
        status: "error",
        message: inviteError,
      },
    });
  }

  const { error } = await supabase.auth.api.inviteUserByEmail(email);

  if (error) {
    if (error.status === 422) {
      return json<ActionData>({
        formResult: {
          status: "success",
          message:
            "Great, this user already has an account, so we won't send any emails",
        },
      });
    }

    return badRequest({
      formResult: {
        status: "error",
        message: error.message,
      },
    });
  }

  return badRequest({
    formResult: { status: "error", message: "An unexpected error occurred" },
  });
};

const OrganizationLayoutRoute = () => {
  return <Outlet />;
};

export default OrganizationLayoutRoute;

export const ErrorBoundary = CustomErrorBoundary;

export const CatchBoundary = CustomCatchBoundary;
