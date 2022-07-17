import { Alert } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import { MarkdownViewer } from "~/components/ui";
import { getInitiativeById } from "~/models";
import type { Initiative } from "~/_types";

interface LoaderData {
  data: Array<Initiative>;
}

export const loader: LoaderFunction = async ({ params }) => {
  const { initiativeId } = params;
  if (!initiativeId) {
    throw new Response("No initiative id", { status: 400 });
  }

  const { data, error } = await getInitiativeById({ id: initiativeId });
  if (error) {
    throw new Error(error);
  }
  return json<LoaderData>({ data });
};

const InitiativeRoute = () => {
  const {
    data: { 0: initiative },
  } = useLoaderData<LoaderData>();

  return <MarkdownViewer markdown={initiative.content || ""} />;
};

export default InitiativeRoute;

export const CatchBoundary = () => {
  const error = useCatch();
  return (
    <div>
      <Alert>{error.data}</Alert>
    </div>
  );
};

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div>
      <Alert variant="solid">{error.message}</Alert>
    </div>
  );
}
