import { useDrop } from "react-dnd";

export const StateTray: React.FC = ({ children }) => {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item) => {
      console.log(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div ref={drop} style={{ backgroundColor: isOver ? "red" : "white" }}>
      {canDrop ? "Release to drop" : "Drag a box here"}
    </div>
  );
};
