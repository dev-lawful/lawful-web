import type { LoaderFunction, RouteComponent } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useContext, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SupabaseClientContext } from "~/db";
import { Board, StateTray, TaskCard } from "~/components/modules/decode";
import type { Task } from "~/_types";

/**
 * Steps
 * 1. Obtener los diferentes estados y mostrar un tray mas o menos estilado con el titulo.
 * 2. Popular dichos trays con las tareas que tengan su estado
 * 3. Lograr crear una tarea y que se sincronice la UI en tiempo real
 */

interface LoaderData {
  data: Array<Task> | null;
}

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

  return (
    <DndProvider backend={HTML5Backend}>
      <Board>
        <StateTray></StateTray>
        <StateTray></StateTray>
        <StateTray></StateTray>
      </Board>
    </DndProvider>
  );
};

export default BoardRoute;
