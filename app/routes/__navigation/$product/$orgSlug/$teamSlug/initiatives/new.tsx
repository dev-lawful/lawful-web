import type { ActionFunction, LinksFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useCatch } from "@remix-run/react";
import { InitiativeForm } from "~/components/modules/lawful/Forms/InitiativeForm";
import { editorLinks } from "~/components/ui";
import { createInitiative } from "~/models";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const content = formData.get("content") ?? "";
  const title = formData.get("title") ?? "";
  const description = formData.get("description") ?? "";
  const dueDate = formData.get("dueDate") ?? "";

  if (
    typeof content !== "string" ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof dueDate !== "string"
  ) {
    throw new Response("Form not submitted correcty", { status: 400 });
  }

  const { error } = await createInitiative({
    content,
    title,
    description,
    dueDate,
  });

  if (error) {
    throw new Error(error);
  }

  const { pathname, origin } = new URL(request.url);

  const initiativesPath = pathname.split("/").slice(0, -1).join("/");

  return redirect(`${origin}${initiativesPath}`);
};

export const links: LinksFunction = () => {
  return [...editorLinks()];
};

const InitiativesNewRoute = () => {
  return <InitiativeForm />;
};

export default InitiativesNewRoute;

export const ErrorBoundary = ({ error }: { error: Error }) => {
  return (
    <div>
      <p>{error.message}</p>
    </div>
  );
};

export const CatchBoundary = () => {
  const error = useCatch();
  return (
    <div>
      <p>{error.status}</p>
      <p>{error.data}</p>
    </div>
  );
};
