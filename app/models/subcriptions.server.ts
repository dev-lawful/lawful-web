import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type { Subscription, CustomResponse } from "~/_types";

export const suscribeToProduct = async (
  subscriptionData: Omit<Subscription, "id" | "createdAt">
): Promise<CustomResponse<Subscription>> => {
  try {
    const { data, error }: PostgrestResponse<Subscription> = await supabase
      .from("subscriptions")
      .insert(subscriptionData);
    return {
      data: data ?? [],
      error: error?.message ?? null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to create this subscription.",
    };
  }
};

export const checkActiveSubscription = async (
  subscriptionData: Omit<Subscription, "id" | "createdAt">
): Promise<boolean> => {
  const { organizationId, product } = subscriptionData;
  try {
    const { data, error } = await supabase
      .from<Subscription>("subscriptions")
      .select("*")
      .eq("organizationId", organizationId)
      .eq("product", product)
      .limit(1);

    return error || data?.length < 1 ? false : true;
  } catch (err) {
    return false;
  }
};
