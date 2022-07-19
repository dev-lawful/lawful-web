import { supabase } from "~/db";
import type { CustomResponse, Option, Vote } from "~/_types";

export const getOptionsByInitiativeId = async (
  initiativeId: string
): Promise<
  CustomResponse<
    Option & {
      votes: Array<Vote>;
    }
  >
> => {
  try {
    const { data } = await supabase
      .from<
        Option & {
          votes: Array<Vote>;
        }
      >("options")
      .select(
        `
        *,
        votes (
          *
        )
      `
      )
      .eq("initiativeId", initiativeId);

    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error:
        "There has been an error trying to fetch board states by board id.",
    };
  }
};
