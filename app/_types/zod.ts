import type { z } from "zod";

export type inferSafeParseErrors<
  T extends z.ZodType<any, any, any>,
  U = string
> = {
  formErrors: U[];
  //TODO: should this be optional??
  fieldErrors: {
    [P in keyof z.infer<T>]?: U[];
  };
};
