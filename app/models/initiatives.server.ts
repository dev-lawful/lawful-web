import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type { CustomResponse, Initiative, Option, Vote } from "~/_types";

export const getInitiativesByTeamId = async ({
  teamId,
}: {
  teamId: number;
}): Promise<CustomResponse<Initiative>> => {
  try {
    const { data }: PostgrestResponse<Initiative> = await supabase
      .from("initiatives")
      .select("*")
      .eq("teamId", teamId);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch initiatives.",
    };
  }
};

export const getInitiativeById = async ({
  id,
}: {
  id: string;
}): Promise<CustomResponse<Initiative>> => {
  try {
    const { data }: PostgrestResponse<Initiative> = await supabase
      .from("initiatives")
      .select("*")
      .eq("id", id);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to fetch this initiative.",
    };
  }
};

export const createInitiative = async ({
  initiativeData,
  options,
}: {
  initiativeData: Omit<Initiative, "id" | "created_at">;
  options: Array<Omit<Option, "id" | "created_at">>;
}): Promise<CustomResponse<Initiative>> => {
  try {
    const {
      data: initiative,
      error: initiativeError,
    }: PostgrestResponse<Initiative> = await supabase
      .from("initiatives")
      .insert({ ...initiativeData });

    if (initiativeError) throw new Error(initiativeError.message);

    if (initiative) {
      const {
        0: { id: initiativeId },
      } = initiative;

      await supabase.from<Option>("options").insert(
        options.map((option) => ({
          ...option,
          initiativeId: initiativeId,
        }))
      );
    }

    return {
      data: initiative ?? [],
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to create this initiative.",
    };
  }
};

export const updateInitiative = async ({
  initiativeData: { created_at, ...initiative },
  initiativeId,
}: {
  initiativeData: Partial<Initiative>;
  initiativeId: string;
}): Promise<CustomResponse<Initiative>> => {
  try {
    const { data }: PostgrestResponse<Initiative> = await supabase
      .from("initiatives")
      .update({ ...initiative })
      .eq("id", initiativeId);

    return {
      data: data ?? [],
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to create this initiative.",
    };
  }
};

export const createVote = async ({
  optionId,
  userId,
}: {
  optionId: number;
  userId: string;
}): Promise<CustomResponse<Vote>> => {
  try {
    const { data }: PostgrestResponse<Vote> = await supabase
      .from<Vote>("votes")
      .insert({
        optionId,
        userId,
      });

    return {
      data: data ?? [],
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      error: "There has been an error trying to create this initiative.",
    };
  }
};
