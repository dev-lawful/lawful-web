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
