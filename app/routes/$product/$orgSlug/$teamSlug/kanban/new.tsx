import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useCatch } from "@remix-run/react";
import { BoardForm } from "~/components/modules/decode/Forms/BoardForm";
import { createBoard } from "~/models";

export const action: ActionFunction = async ({ request, context, params }) => {
  const formData = await request.formData();

  const name = (formData.get("name") as string) ?? "";
  const id = (formData.get("id") as string) ?? "";

  const { error } = await createBoard({
    boardData: {
      name,
      // TODO: Un-hardcode this teamId to get the user's current team id
      teamId: 1,
    },
    states: [
      {
        description: "To do",
        boardId: parseInt(id),
      },
      {
        description: "In progress",
        boardId: parseInt(id),
      },
      {
        description: "Done",
        boardId: parseInt(id),
      },
    ],
  });

  if (error) throw new Error(error);

  const { pathname, origin } = new URL(request.url);

  const taskBoardPath = pathname.split("/").slice(0, -2).join("/");

  return redirect(`${origin}${taskBoardPath}`);
};

const NewBoardRoute = () => {
  return <BoardForm />;
};

export default NewBoardRoute;

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
