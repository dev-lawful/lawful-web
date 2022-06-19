import { Button, Heading, Stack, Text } from "@chakra-ui/react";
import { Link, useMatches } from "@remix-run/react";
import { useDrag } from "react-dnd";
import type { Task } from "~/_types";

interface Props {
  task: Task;
}

export const TaskCard: React.FC<Props> = ({ task }) => {
  const matches = useMatches();

  const { pathname } = matches[matches.length - 1];

  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: "TASK",
    item: task,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Stack
      as="article"
      spacing="2"
      key={task.id}
      ref={dragPreview}
      borderRadius={5}
      bgColor={isDragging ? "decode.800" : "decode.600"}
      _hover={{
        cursor: "pointer",
      }}
      p={3}
      border={isDragging ? "0.3125rem dashed white" : "none"}
    >
      <Heading as="h3" size={"lg"} ref={drag}>
        {task.name}
      </Heading>
      <Text>{task.description}</Text>
      <Stack direction="row">
        <Link to={`${pathname}/tasks/${task.id}/edit`}>
          <Button>Edit 🖋️</Button>
        </Link>
        <Link to={`${pathname}/tasks/${task.id}`}>
          <Button>Details 📎</Button>
        </Link>
      </Stack>
    </Stack>
  );
};