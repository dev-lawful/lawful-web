import { Button, Input } from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";

export const action: ActionFunction = async ({ request }) => {
  console.log("Hols");
  const formData = await request.formData();
  const name = formData.get("name");
  const description = formData.get("description");
  throw new Error("Not implemented");
};
const NewChatRoute = () => {
  return (
    <Form method="post">
      <Input name="name" placeholder="Chat name" />
      <Input name="description" placeholder="Description" />
      <Button type="submit">Create chat</Button>
    </Form>
  );
};

export default NewChatRoute;

export const ErrorBoundary = () => {
  return <div>Not implemented</div>;
};
