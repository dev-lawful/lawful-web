import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Board, StateTray, Task } from "~/components/modules/decode";

export const loader: LoaderFunction = async () => {
  return json({});
};

const BoardRoute = () => {
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
