import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { useSupabaseClient } from "~/db";

export const loader: LoaderFunction = ({ params }) => {
  if (!["decode", "network"].includes(params.product || "")) {
    return redirect("/");
  }
  return json({});
};

const ProductLayoutRoute = () => {
  //TODO: In a perfect world, this auth check is done server side
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase.auth.user()) navigate("/signin");
  }, [supabase, navigate]);

  return <Outlet />;
};

export default ProductLayoutRoute;
