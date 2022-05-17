import { Box, Heading } from "@chakra-ui/react";
import { useDrag } from "react-dnd";
import type { Task } from "~/_types";

interface Props {
  task: Task;
}

export const TaskCard: React.FC<Props> = () => {
  const data = {
    name: "Testing perro",
  };
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: "TASK",
    item: data,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Box ref={dragPreview} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {/* The drag ref marks this node as being the "pick-up" node */}
      <Heading ref={drag}>Task {data.name}</Heading>
    </Box>
  );
};
