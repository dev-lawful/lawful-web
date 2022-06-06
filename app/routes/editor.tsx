import { Button, Input } from "@chakra-ui/react";
import type {
  LoaderFunction,
  LinksFunction,
  ActionFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import { Editor, editorLinks } from "~/components/ui";
import { createInitiative } from "~/models";
import type { Initiative } from "~/_types";

interface ActionData {
  data: Array<Initiative>;
}

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

  const { data, error } = await createInitiative({
    content,
    title,
    description,
    dueDate,
  });

  if (error) {
    throw new Error(error);
  }
  
  return json<ActionData>({ data });
};

export const loader: LoaderFunction = async ({ request }) => {
  return json({
    data: '{"_nodeMap":[["root",{"__children":["4","5"],"__dir":"ltr","__format":0,"__indent":0,"__key":"root","__parent":null,"__type":"root"}],["3",{"__type":"text","__parent":"4","__key":"3","__text":"se lleno la vecindadd","__format":0,"__style":"","__mode":0,"__detail":0}],["4",{"__type":"heading","__parent":"root","__key":"4","__children":["3"],"__format":0,"__indent":0,"__dir":"ltr","__tag":"h1"}],["5",{"__type":"paragraph","__parent":"root","__key":"5","__children":["6"],"__format":0,"__indent":0,"__dir":"ltr"}],["6",{"__type":"text","__parent":"5","__key":"6","__text":"asdas","__format":0,"__style":"","__mode":0,"__detail":0}]],"_selection":{"anchor":{"key":"3","offset":0,"type":"text"},"focus":{"key":"6","offset":5,"type":"text"},"type":"range"}}',
  });
};

export const links: LinksFunction = () => {
  return [...editorLinks()];
};

const EditorRoute = () => {
  const { data } = useLoaderData();
  return (
    <div>
      <Form method="post">
        <Input type="text" name="title" id="title" />
        <Input type="text" name="description" id="description" />
        <Input type="date" name="dueDate" id="dueDate" />
        {/* @ts-ignore */}
        <Editor initialState={data} />
        <Button type="submit">Submit</Button>
      </Form>
    </div>
  );
};

export default EditorRoute;

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
