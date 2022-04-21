import { Button, Heading, Text } from "@chakra-ui/react";
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
      <Heading as="h1">Hola</Heading>
      <Heading as="h2" size={"md"}>
        Notes
      </Heading>

      <Text>Count: {count}</Text>
      <Text>Error: {JSON.stringify(error)}</Text>
      <Text>{JSON.stringify(data, null, 2)}</Text>
      <Button>Click me</Button>
    </div>
  );
};

export default NotesIndexPage;
