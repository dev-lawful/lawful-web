import type {
  LoaderFunction,
  LinksFunction,
  ActionFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Editor, links as editorLinks } from "~/components/ui/Editor";

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();

  console.log({ data: data.get("data") });
  return json({});
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
      <Editor initialState={data} />
    </div>
  );
};

export default EditorRoute;
