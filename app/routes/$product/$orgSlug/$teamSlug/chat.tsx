import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export const loader: LoaderFunction = ({ params }) => {
  if (params.product === "network") return json({});
  return redirect("/");
};

const ChatLayoutRoute = () => {
  return (
    <>
      <div>ChatLayoutRoute</div>
      <Outlet />
    </>
  );
};

export default ChatLayoutRoute;
