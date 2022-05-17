import type { LoaderFunction, RouteComponent } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useContext, useEffect } from "react";
import { SupabaseClientContext } from "~/db";

export const loader: LoaderFunction = async () => {
  return json({});
};

const BoardRoute: RouteComponent = () => {
  const supabase = useContext(SupabaseClientContext);

  useEffect(() => {
    if (!supabase) return;

    const subscription = supabase
      .from("tasks")
      .on("INSERT", (payload) => {
        console.log("Change received!", payload);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>BoardRoute</div>;
};

export default BoardRoute;
