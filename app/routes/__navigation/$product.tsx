import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { supabase } from "~/db";
import { getSession } from "~/sessions";

export const loader: LoaderFunction = async ({ params, request }) => {
  if (!["decode", "network"].includes(params.product || "")) {
    return redirect("/");
  }
  const session = await getSession(request.headers.get("Cookie"));
  const accessToken = session.get("access_token");
  const { user } = await supabase.auth.api.getUser(accessToken);
  if (!user) {
    return redirect("/signin");
  }
  return json({});
};

const ProductLayoutRoute = () => {
  return <Outlet />;
};

export default ProductLayoutRoute;
