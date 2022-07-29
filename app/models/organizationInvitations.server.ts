import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type {
  CustomResponse,
  Organization,
  OrganizationInvitation,
} from "~/_types";

export const inviteToOrganization = async (
  invitationData: Omit<OrganizationInvitation, "id" | "createdAt">
): Promise<CustomResponse<OrganizationInvitation>> => {
  try {
    const { data, error }: PostgrestResponse<OrganizationInvitation> =
      await supabase.from("organizationInvitations").insert(invitationData);
    return {
      data: data ?? [],
      error: error?.message ?? null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to invite this person.",
    };
  }
};

export const getPendingInvitations = async (
  email: string
): Promise<
  CustomResponse<
    OrganizationInvitation & {
      organization: Organization;
    }
  >
> => {
  try {
    const { data, error } = await supabase
      .from<
        OrganizationInvitation & {
          organization: Organization;
        }
      >("organizationInvitations")
      .select("*, organization:organizations (*)")
      .eq("userEmail", email);

    return { data: data ?? [], error: error?.message ?? null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch invitations.",
    };
  }
};

export const deleteInvitation = async (
  invitationId: number
): Promise<CustomResponse<OrganizationInvitation>> => {
  try {
    const { data, error }: PostgrestResponse<OrganizationInvitation> =
      await supabase
        .from<OrganizationInvitation>("organizationInvitations")
        .delete()
        .match({ id: invitationId });
    return {
      data: data ?? [],
      error: error?.message ?? null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to invite this person.",
    };
  }
};
