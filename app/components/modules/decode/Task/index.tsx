import { useDrag } from "react-dnd";

export const Task = () => {
  const data = {
    name: "Testing perro",
  };
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    // "type" is required. It is used by the "accept" specification of drop targets.
    type: "TASK",
    item: data,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={dragPreview} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {/* The drag ref marks this node as being the "pick-up" node */}
      <div ref={drag}>Task {data.name}</div>
    </div>
  );
};
