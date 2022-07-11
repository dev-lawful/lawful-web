import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export const loader: LoaderFunction = ({ params }) => {
  if (params.product === "decode") return json({});
  return redirect("/");
};

const KanbanLayoutRoute = () => {
  return (
    <>
      <div>KanbanLayoutRoute</div>
      <Outlet />
    </>
  );
};

export default KanbanLayoutRoute;
