import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type { Message } from "~/_types";

//TODO: This interface is repeated, refactor is necessary
interface CustomResponse<T> {
  data: Array<T>;
  error: string | null;
}

export const getLastMessages = async ({
  chatId,
  limit,
}: {
  chatId: string;
  limit: number;
}): Promise<CustomResponse<Message>> => {
  try {
    const { data }: PostgrestResponse<Message> = await supabase
      .from("messages")
      .select("*")
      .eq("chatId", chatId)
      .limit(limit);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch messages.",
    };
  }
};
