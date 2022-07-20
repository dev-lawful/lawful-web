import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type { Team } from "~/_types";

interface LoaderData {
  data: Array<Team> | null;
}

// TODO: Check if the team belongs to selected organization and if user belongs to thi team
export const loader: LoaderFunction = async () => {
  const { data }: PostgrestResponse<Team> = await supabase
    .from("teams")
    .select("*")
    .limit(1);

  return json<LoaderData>({
    data,
  });
};

const TeamLayoutRoute = () => {
  const { data } = useLoaderData<LoaderData>();

  return <Outlet />;
};

export default TeamLayoutRoute;
