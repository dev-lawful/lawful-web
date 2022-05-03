import { json, redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export const loader: LoaderFunction = ({ params }) => {
  if (!["decode", "network"].includes(params.product || "")) {
    return redirect("/");
  }
  return json({});
};

const ProductLayoutRoute = () => {
  return (
    <>
      <div>ProductLayoutRoute</div>
      <div>Custon Theme</div>
      <div>Navbar and footer</div>
      <Outlet />
    </>
  );
};

export default ProductLayoutRoute;
