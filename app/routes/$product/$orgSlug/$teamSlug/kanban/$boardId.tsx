import type { LoaderFunction, RouteComponent } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useContext, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Board, StateTray } from "~/components/modules/decode";
import { SupabaseClientContext } from "~/db";
import { Board, StateTray, Task } from "~/components/modules/decode";
import type { Task } from "~/_types";

interface LoaderData {
  data: Array<Task> | null;
}

export const loader: LoaderFunction = async () => {
  const { data } = await getTasksByStateId({ stateId: 1 });

  return json<LoaderData>({
    data,
  });
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

  return (
    <DndProvider backend={HTML5Backend}>
      <Board>
        <StateTray></StateTray>
        <StateTray></StateTray>
        <StateTray></StateTray>
        <Task></Task>
        <Task></Task>
        <Task></Task>
      </Board>
    </DndProvider>
  );
};

export default BoardRoute;
