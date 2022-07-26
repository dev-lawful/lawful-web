import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type { Chat, CustomResponse, Message } from "~/_types";

// TODO: what if I want to get all messages? should i include a limit?.... select with count maybe teamId and chatId are of type int8, change from string to number maybe?

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
  teamId,
  limit,
}: {
  teamId: number;
  limit: number;
}): Promise<CustomResponse<Chat>> => {
  try {
    const { data }: PostgrestResponse<Chat> = await supabase
      .from("chats")
      .select("*,teams!inner(*)")
      .eq("teams.id", teamId)
      .limit(limit);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch chats.",
    };
  }
};

export const getChatById = async ({
  chatId,
  teamId,
}: {
  chatId: string;
  teamId: number;
}): Promise<CustomResponse<Chat>> => {
  try {
    //TODO: Update type
    const { data, error }: PostgrestResponse<Chat> = await supabase
      .from("chats")
      .select("*,teams!inner(*)")
      .eq("teams.id", teamId)
      .eq("id", chatId);

    return { data: data ?? [], error: error?.message ?? null };
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
    //TODO: this does not throw when there is a invalid message
    const { data, error }: PostgrestResponse<Message> = await supabase
      .from("messages")
      .insert(messageData);
    return {
      data: data ?? [],
      error: error?.message ?? null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to send this message.",
    };
  }
};

export const createChat = async (
  chatData: Omit<Chat, "id" | "createdAt">
): Promise<CustomResponse<Chat>> => {
  try {
    const { data }: PostgrestResponse<Chat> = await supabase
      .from("chats")
      .insert(chatData);
    return {
      data: data ?? [],
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to create this chat.",
    };
  }
};
