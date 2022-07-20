import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getInitiatives } from "~/models";
import type { Initiative } from "~/_types";

interface LoaderData {
  data: Array<Initiative>;
}

// TODO: Check if initiatives belongs to this prod
export const loader: LoaderFunction = async ({ request }) => {
  const { data, error } = await getInitiatives();
  if (error) {
    throw new Error(error);
  }
  return json<LoaderData>({ data });
};

const EditorRoute = () => {
  const { data } = useLoaderData();
  return (
    <>
      <pre>Initiatives list</pre>
      <Outlet />
    </>
  );
  // return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default EditorRoute;

export const ErrorBoundary = ({ error }: { error: Error }) => {
  return (
    <div>
      <p>{error.message}</p>
    </div>
  );
};
