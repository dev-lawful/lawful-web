import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { deleteInvitation, addUserToOrganization } from "~/models";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const invitationId = formData.get("invitationId");
  const userId = formData.get("userId");

  if (typeof userId !== "string") {
    throw new Response("Bad request");
  }

  const {
    data: { 0: inviteData },
    error: inviteError,
  } = await deleteInvitation(Number(invitationId));
  if (inviteError || !inviteData) {
    throw new Error("An error occurred accepting the invitation");
  }

  const { data, error } = await addUserToOrganization({
    organizationId: inviteData.organizationId,
    userId,
  });

  if (error) {
    throw new Error("An error occurred accepting the invitation");
  }

  return json({ data });
};
