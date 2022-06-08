import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type { Chat, Message } from "~/_types";

// TODO: This interface is repeated, refactor is necessary
// TODO: what if I want to get all messages? should i include a limit?.... select with count maybe
// TODO: teamId and chatId are of type int8, change from string to number maybe?
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
    const { data } = await supabase
      .from<Message>("messages")
      .select("*")
      .eq("chatId", chatId)
      .order("createdAt", { ascending: false })
      .limit(limit);

    return { data: data?.reverse() ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch messages.",
    };
  }
};

export const getChats = async ({
  teamSlug,
  limit,
}: {
  teamSlug: string;
  limit: number;
}): Promise<CustomResponse<Chat>> => {
  try {
    const { data }: PostgrestResponse<Chat> = await supabase
      .from("chats")
      .select("*,teams!inner(*)")
      .eq("teams.slug", teamSlug)
      .limit(limit);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch chats.",
    };
  }
};

export const sendMessage = async (
  messageData: Omit<Message, "id" | "createdAt">
): Promise<CustomResponse<Message>> => {
  try {
    const { data }: PostgrestResponse<Message> = await supabase
      .from("messages")
      .insert(messageData);
    return {
      data: data ?? [],
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to send this message.",
    };
  }
};
