import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { PostgrestResponse } from "@supabase/supabase-js";
import { supabase } from "~/db";
import type { definitions } from "~/_types/supabase";

type LoaderData = PostgrestResponse<Array<definitions["notes"]>>;

export const loader: LoaderFunction = async () => {
  const data = await supabase.from("notes").select("*");
  return json<LoaderData>(data);
};

const NotesIndexPage: React.VFC = () => {
  const { data, count, error } = useLoaderData<LoaderData>();
  return (
    <div>
      <h1>Hola</h1>
      <h2>Notes</h2>
      <p>Count: {count}</p>
      <p>Error: {JSON.stringify(error)}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default NotesIndexPage;
