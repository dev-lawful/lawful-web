import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import { BoardForm } from "~/components/modules/decode";
import { getBoardById, updateBoard } from "~/models";
import type { Board } from "~/_types";

interface LoaderData {
  data: {
    boardData: Array<Board>;
  };
}

export const loader: LoaderFunction = async ({ params }) => {
  const parsedBoardId = parseInt(params.boardId!);

  if (typeof parsedBoardId !== "number")
    throw new Error("Parameter boardId should be parseable to number");

  const { data: boardData, error: boardError } = await getBoardById(
    parseInt(params.boardId!)
  );

  if (boardError) throw new Error(boardError);

  return json<LoaderData>({
    data: {
      boardData,
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const id = (formData.get("id") as string) ?? "";
  const name = (formData.get("name") as string) ?? "";

  const { error } = await updateBoard({
    boardData: {
      name,
    },
    boardId: id,
  });

  if (error) throw new Error(error);

  const { pathname, origin } = new URL(request.url);

  const boardPath = pathname.split("/").slice(0, -1).join("/");

  return redirect(`${origin}${boardPath}`);
};

const EditBoardRoute = () => {
  const {
    data: {
      boardData: { 0: board },
    },
  } = useLoaderData<LoaderData>();

  const { created_at, ...boardData } = board;

  return <BoardForm defaultValues={boardData} />;
};

export default EditBoardRoute;

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
