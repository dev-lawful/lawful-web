import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type { Organization } from "~/_types";

interface LoaderData {
  data: Array<Organization> | null;
}

export const loader: LoaderFunction = async () => {
  const { data }: PostgrestResponse<Organization> = await supabase
    .from("organizations")
    .select("*")
    .limit(1);

  return json<LoaderData>({
    data,
  });
};

const OrganizationRoute = () => {
  const { data } = useLoaderData<LoaderData>();

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default OrganizationRoute;
